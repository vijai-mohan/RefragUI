import React, { useState, useEffect, useRef } from 'react'
import Panel from './components/Panel.jsx'
import Config from './components/Config.jsx'
import ComparePanel from './components/ComparePanel.jsx'
import ChatHistory from './components/ChatHistory.jsx'
import SuggestedPrompts from './components/SuggestedPrompts.jsx'
import axios from 'axios'
import { API_BASE_URL, WORKER_POLL_INTERVAL, devLog } from './config.js'

export default function App(){
  const [leftModel, setLeftModel] = useState(localStorage.getItem('leftModel') || '')
  const [rightModel, setRightModel] = useState(localStorage.getItem('rightModel') || '')

  const [models, setModels] = useState([])

  // config defaults
  const defaultConfig = {
    max_new_tokens: parseInt(localStorage.getItem('cfg_max_new_tokens') || '128', 10),
    temperature: parseFloat(localStorage.getItem('cfg_temperature') || '0.7'),
    top_p: parseFloat(localStorage.getItem('cfg_top_p') || '0.9'),
    include_history: (localStorage.getItem('cfg_include_history') || 'true') === 'true',
    do_sample: (localStorage.getItem('cfg_do_sample') || 'true') === 'true',
    api_base_url: localStorage.getItem('cfg_api_base_url') || API_BASE_URL
  }

  const [config, setConfig] = useState(defaultConfig)
  const [showConfig, setShowConfig] = useState(false)

  // shared prompt input
  const [prompt, setPrompt] = useState('')

  // per-panel state
  const [leftTurns, setLeftTurns] = useState([])
  const [rightTurns, setRightTurns] = useState([])
  const [leftStreaming, setLeftStreaming] = useState(false)
  const [rightStreaming, setRightStreaming] = useState(false)
  const [leftMetrics, setLeftMetrics] = useState({ttft:null, ttl:null, avg_speed:null})
  const [rightMetrics, setRightMetrics] = useState({ttft:null, ttl:null, avg_speed:null})

  // last request ids so we can cancel
  const [leftReqId, setLeftReqId] = useState(null)
  const [rightReqId, setRightReqId] = useState(null)

  // worker status fetched from server
  const [workerStatus, setWorkerStatus] = useState({})

  // conversation history management
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('conversations')
    return saved ? JSON.parse(saved) : []
  })
  const [currentConvId, setCurrentConvId] = useState(() => {
    const saved = localStorage.getItem('currentConvId')
    return saved || null
  })

  // persist conversations to localStorage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    if (currentConvId) {
      localStorage.setItem('currentConvId', currentConvId)
    }
  }, [currentConvId])

  // fetch available models
  useEffect(()=>{
    axios.get(`${getApiUrl()}/models`).then(r=>setModels(r.data.models)).catch(()=>setModels([]))
  },[])

  useEffect(()=>{
    // persist config when changed
    localStorage.setItem('cfg_max_new_tokens', String(config.max_new_tokens))
    localStorage.setItem('cfg_temperature', String(config.temperature))
    localStorage.setItem('cfg_top_p', String(config.top_p))
    localStorage.setItem('cfg_include_history', String(config.include_history))
    localStorage.setItem('cfg_do_sample', String(config.do_sample))
    localStorage.setItem('cfg_api_base_url', String(config.api_base_url))
  }, [config])

  // Helper to get current API base URL (uses config override if set)
  const getApiUrl = () => config.api_base_url || API_BASE_URL

  // poll worker status periodically
  useEffect(()=>{
    let mounted = true
    const poll = async ()=>{
      try{
        const r = await axios.get(`${getApiUrl()}/workers`)
        if(mounted) setWorkerStatus(r.data)
      }catch(e){ /* ignore */ }
    }
    poll()
    const it = setInterval(poll, WORKER_POLL_INTERVAL)
    return ()=>{ mounted=false; clearInterval(it) }
  },[])

  // helper to cancel a request id via server
  const cancelRequest = async (reqId)=>{
    if(!reqId) return false
    try{
      await axios.post(`${getApiUrl()}/cancel`, {req_id: reqId})
      return true
    }catch(e){
      console.error('cancel failed', e)
      return false
    }
  }

  const _appendTokenToLastAssistant = (turns, token)=>{
    const newTurns = [...turns]
    let lastIdx = -1
    for(let i=newTurns.length-1;i>=0;i--){ if(newTurns[i].role==='assistant'){ lastIdx=i; break } }
    if(lastIdx < 0) return newTurns
    const prev = newTurns[lastIdx].text || ''
    const needsSpace = prev && !/\s$/.test(prev) && token && !/^\s/.test(token)
    newTurns[lastIdx] = {...newTurns[lastIdx], text: prev + (needsSpace ? ' ' : '') + token}
    return newTurns
  }

  // helper to stream to a given model and update panel state
  // Accepts an optional promptText to send; if omitted uses shared `prompt` state
  const streamToPanel = async ({modelName, setTurns, setStreaming, setMetrics, setReqId, history=[], promptText=null})=>{
    const promptToSend = (promptText != null) ? promptText : prompt
    if(!promptToSend || !promptToSend.trim()) return
    setStreaming(true)
    // append user turn
    setTurns(prev=>[...prev, {role:'user', text:promptToSend}])
    // append assistant placeholder
    setTurns(prev=>[...prev, {role:'assistant', text:''}])

    // send history array to server; worker will format prompt using model-specific template
    const body = {prompt: promptToSend, model: modelName || 'sshleifer/tiny-gpt2'}
    if(config && config.include_history){ body.history = history }
    if(config){ body.max_new_tokens = config.max_new_tokens; body.temperature = config.temperature; body.top_p = config.top_p }
    // add do_sample
    if(config) { body.do_sample = !!config.do_sample; }

    try{
      const res = await fetch(`${getApiUrl()}/chat`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buf = ''
      let requestReceived = null
      let firstTokenTs = null
      let lastTokenTs = null
      let tokenCount = 0

      // local var to track the req id assigned by server
      let assignedReqId = null
      setReqId(null)

      while(true){
        const {value, done} = await reader.read()
        if(done) break
        buf += decoder.decode(value, {stream:true})
        let parts = buf.split('\n\n')
        buf = parts.pop()
        for(const part of parts){
          if(!part.startsWith('data:')) continue
          const jsonStr = part.replace(/^data:\s*/,'')
          try{
            const obj = JSON.parse(jsonStr)
            let eventType = null
            let payload = null
            if(obj && typeof obj === 'object' && obj.event){
              eventType = obj.event
              payload = obj.payload || {}
            } else {
              eventType = 'token'
              payload = obj
            }

            if(eventType === 'assigned'){
              assignedReqId = payload.req_id
              setReqId(assignedReqId)
            }

            if(eventType === 'request_received'){
              requestReceived = payload.request_received || payload.request_received_time || requestReceived
            }

            if(eventType === 'token' || eventType === 'done' || eventType === 'partial' || eventType === 'cancelled'){
              const token = payload.token || ''
              const ts = payload.token_ts || payload.timestamp || (Date.now()/1000.0)
              // prefer server-provided n_tokens when available
              const n_tokens = (payload && payload.n_tokens) ? payload.n_tokens : (token ? token.split(/\s+/).filter(Boolean).length : 0)
              tokenCount += n_tokens
              const now = ts
              if(firstTokenTs===null && token){ firstTokenTs = now }
              if(token) lastTokenTs = now

              if(token){
                // append token to last assistant preserving spacing
                setTurns(prev=>_appendTokenToLastAssistant(prev, token))
              }

              if(requestReceived && firstTokenTs){
                const ttft = firstTokenTs - requestReceived
                const ttl = (lastTokenTs || firstTokenTs) - requestReceived
                const elapsed = ((lastTokenTs || firstTokenTs) - firstTokenTs) || 1e-6
                const avg = tokenCount / elapsed
                // include total tokens
                const metricsData = {ttft, ttl, avg_speed:avg.toFixed(2), total_tokens: tokenCount}
                setMetrics(metricsData)

                // Also attach metrics to the last assistant turn
                setTurns(prev => {
                  const newTurns = [...prev]
                  for(let i = newTurns.length - 1; i >= 0; i--) {
                    if(newTurns[i].role === 'assistant') {
                      newTurns[i] = {...newTurns[i], metrics: metricsData}
                      break
                    }
                  }
                  return newTurns
                })
              }

              if(eventType === 'done' || eventType === 'cancelled'){
                // clear assigned req id
                setReqId(null)
                break
              }
             }

            // other events (model_ready, worker_error) may be emitted; we ignore here
          }catch(e){
            console.error('parse error', e, jsonStr)
          }
        }
      }
    }catch(e){
      console.error('streaming failed', e)
    }finally{
      setStreaming(false)
    }
  }

  // conversation management helpers
  const saveCurrentConversation = () => {
    if (!currentConvId) return
    setConversations(prev => prev.map(conv =>
      conv.id === currentConvId
        ? { ...conv, leftTurns, rightTurns, leftModel, rightModel, updatedAt: Date.now() }
        : conv
    ))
  }

  const loadConversation = (convId) => {
    const conv = conversations.find(c => c.id === convId)
    if (!conv) return

    setLeftTurns(conv.leftTurns || [])
    setRightTurns(conv.rightTurns || [])
    setLeftModel(conv.leftModel || leftModel)
    setRightModel(conv.rightModel || rightModel)
    setCurrentConvId(convId)
    // reset metrics and streaming state
    setLeftMetrics({ttft:null, ttl:null, avg_speed:null})
    setRightMetrics({ttft:null, ttl:null, avg_speed:null})
    setLeftReqId(null)
    setRightReqId(null)
  }

  const createNewConversation = () => {
    // save current conversation if it has content
    if (currentConvId && (leftTurns.length > 0 || rightTurns.length > 0)) {
      saveCurrentConversation()
    }

    const newConvId = `conv_${Date.now()}`
    const newConv = {
      id: newConvId,
      firstPrompt: '',
      leftTurns: [],
      rightTurns: [],
      leftModel,
      rightModel,
      timestamp: Date.now(),
      updatedAt: Date.now()
    }

    setConversations(prev => [newConv, ...prev])
    setCurrentConvId(newConvId)
    setLeftTurns([])
    setRightTurns([])
    setLeftMetrics({ttft:null, ttl:null, avg_speed:null})
    setRightMetrics({ttft:null, ttl:null, avg_speed:null})
    setLeftReqId(null)
    setRightReqId(null)
    setPrompt('')
  }

  const deleteConversation = (convId) => {
    if (!convId) return

    // if deleting current conversation, switch to another or create new
    if (convId === currentConvId) {
      const remaining = conversations.filter(c => c.id !== convId)
      if (remaining.length > 0) {
        loadConversation(remaining[0].id)
      } else {
        // no conversations left, create a new one
        setConversations([])
        createNewConversation()
        return
      }
    }

    // remove the conversation
    setConversations(prev => prev.filter(c => c.id !== convId))
  }

  const deleteAllConversations = () => {
    if (!window.confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
      return
    }

    // clear all conversations and create a fresh one
    setConversations([])
    setLeftTurns([])
    setRightTurns([])
    setLeftMetrics({ttft:null, ttl:null, avg_speed:null})
    setRightMetrics({ttft:null, ttl:null, avg_speed:null})
    setLeftReqId(null)
    setRightReqId(null)
    setPrompt('')

    // create new conversation
    const newConvId = `conv_${Date.now()}`
    const newConv = {
      id: newConvId,
      firstPrompt: '',
      leftTurns: [],
      rightTurns: [],
      leftModel,
      rightModel,
      timestamp: Date.now(),
      updatedAt: Date.now()
    }

    setConversations([newConv])
    setCurrentConvId(newConvId)
  }

  // auto-save conversation when turns change
  useEffect(() => {
    if (currentConvId && (leftTurns.length > 0 || rightTurns.length > 0)) {
      saveCurrentConversation()

      // update firstPrompt if not set
      const firstUserTurn = leftTurns.find(t => t.role === 'user') || rightTurns.find(t => t.role === 'user')
      if (firstUserTurn) {
        setConversations(prev => prev.map(conv =>
          conv.id === currentConvId && !conv.firstPrompt
            ? { ...conv, firstPrompt: firstUserTurn.text }
            : conv
        ))
      }
    }
  }, [leftTurns, rightTurns, currentConvId])

  // create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation()
    } else if (!currentConvId && conversations.length > 0) {
      setCurrentConvId(conversations[0].id)
      loadConversation(conversations[0].id)
    }
  }, [])

  const onSend = async ()=>{
    // send to both panels concurrently; pass history
    streamToPanel({modelName: leftModel, setTurns: setLeftTurns, setStreaming: setLeftStreaming, setMetrics: setLeftMetrics, setReqId: setLeftReqId, history: leftTurns})
    streamToPanel({modelName: rightModel, setTurns: setRightTurns, setStreaming: setRightStreaming, setMetrics: setRightMetrics, setReqId: setRightReqId, history: rightTurns})
    setPrompt('')
  }

  // handler for suggested prompt clicks: create new conversation and send
  const onSuggestedPromptClick = (promptText) => {
    if (!promptText || !promptText.trim()) return

    // create new conversation first
    createNewConversation()

    // send the prompt to both panels after a brief delay to ensure state is updated
    setTimeout(() => {
      streamToPanel({modelName: leftModel, setTurns: setLeftTurns, setStreaming: setLeftStreaming, setMetrics: setLeftMetrics, setReqId: setLeftReqId, history: [], promptText: promptText})
      streamToPanel({modelName: rightModel, setTurns: setRightTurns, setStreaming: setRightStreaming, setMetrics: setRightMetrics, setReqId: setRightReqId, history: [], promptText: promptText})
    }, 50)
  }

  // cancel per-panel
  const onCancelLeft = ()=>{ if(leftReqId){ cancelRequest(leftReqId); setLeftReqId(null) }}
  const onCancelRight = ()=>{ if(rightReqId){ cancelRequest(rightReqId); setRightReqId(null) }}

  const onReset = ()=>{
    // cancel any outstanding requests then clear turns
    if(leftReqId) cancelRequest(leftReqId)
    if(rightReqId) cancelRequest(rightReqId)
    setLeftReqId(null); setRightReqId(null)
    setLeftTurns([]); setRightTurns([])
    setLeftMetrics({ttft:null, ttl:null, avg_speed:null}); setRightMetrics({ttft:null, ttl:null, avg_speed:null})

    // update current conversation to be empty
    if (currentConvId) {
      setConversations(prev => prev.map(conv =>
        conv.id === currentConvId
          ? { ...conv, leftTurns: [], rightTurns: [], firstPrompt: '', updatedAt: Date.now() }
          : conv
      ))
    }
  }

  // keyboard shortcuts
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.ctrlKey && e.key.toLowerCase()==='l'){
        e.preventDefault(); onReset();
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[leftReqId, rightReqId, leftTurns, rightTurns])

  // extra shortcuts: Ctrl-K focus prompt, Ctrl-Shift-C cancel both
  const promptRef = useRef(null)
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.ctrlKey && !e.shiftKey && e.key.toLowerCase()==='k'){
        e.preventDefault(); promptRef.current && promptRef.current.focus()
      }
      if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='c'){
        e.preventDefault(); if(leftReqId) cancelRequest(leftReqId); if(rightReqId) cancelRequest(rightReqId)
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[leftReqId, rightReqId])

  return (
    <div className="app">
      <header className="banner">
        <span>Refrag Demo</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="gear" title="Configuration" onClick={()=>setShowConfig(s=>!s)}>⚙️</button>
          <button title="Workers" onClick={()=>window.open(`${getApiUrl()}/workers`,'_blank')}>🛠️</button>
        </div>
      </header>

      {showConfig && (
        <div style={{padding:12}}>
          <Config config={config} setConfig={setConfig} />
        </div>
      )}

      <div className="layout" style={{flex:1, display:'flex', gap:0, overflow:'hidden', height:'100%'}}>
        {/* Left sidebar - full height, fixed width */}
        <div style={{ width: 260, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', paddingRight: 0 }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ChatHistory
              conversations={conversations}
              currentConvId={currentConvId}
              onSelectConv={loadConversation}
              onNewConv={createNewConversation}
              onDeleteConv={deleteConversation}
              onDeleteAll={deleteAllConversations}
            />
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <SuggestedPrompts onPromptClick={onSuggestedPromptClick} />
          </div>
        </div>

        {/* Center panels (left and right) with floating prompt */}
        <div style={{flex:1, minWidth: 0, display:'flex', flexDirection:'column', position:'relative', height:'100%', overflow:'hidden'}}>
          {/* Panels container with bottom padding to prevent overlap with floating prompt */}
          <div style={{flex:1, display:'flex', gap:12, padding:'12px', paddingBottom: 140, overflow:'hidden'}}>
            <div style={{flex:1, minWidth: 0, display:'flex', flexDirection:'column', overflow:'hidden'}}>
              <Panel side="left" model={leftModel} setModel={(m)=>{setLeftModel(m); localStorage.setItem('leftModel', m)}} models={models} turns={leftTurns} streaming={leftStreaming} metrics={leftMetrics} workerStatus={workerStatus} currentModelStatus={workerStatus[leftModel]} lastReqId={leftReqId} onCancel={onCancelLeft} />
            </div>
            <div style={{flex:1, minWidth: 0, display:'flex', flexDirection:'column', overflow:'hidden'}}>
              <Panel side="right" model={rightModel} setModel={(m)=>{setRightModel(m); localStorage.setItem('rightModel', m)}} models={models} turns={rightTurns} streaming={rightStreaming} metrics={rightMetrics} workerStatus={workerStatus} currentModelStatus={workerStatus[rightModel]} lastReqId={rightReqId} onCancel={onCancelRight} />
            </div>
          </div>

          {/* Floating prompt input */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 800,
            display: 'flex',
            gap: 8,
            padding: 12,
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #e8e8e8',
            zIndex: 10
          }}>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e)=>setPrompt(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); onSend() } }}
              placeholder="Type your prompt here. Enter to send, Shift+Enter for newline."
              title="Enter to send; Shift+Enter newline; Ctrl+L clear; Ctrl-K focus"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 14,
                fontFamily: 'inherit',
                padding: 8,
                minHeight: 40,
                maxHeight: 120,
                borderRadius: 12
              }}
            />
            <div style={{display:'flex', flexDirection:'column', gap:4}}>
              <button onClick={onSend} title="Send" style={{
                padding: '8px 16px',
                cursor: 'pointer',
                border: '1px solid #2B6CB0',
                borderRadius: 12,
                background: '#E6F2FF',
                color: '#1A56DB',
                fontSize: 14,
                fontWeight: 600
              }}>→</button>
              <button onClick={onReset} title="Reset conversations (Ctrl+L)" style={{
                padding: '8px 16px',
                cursor: 'pointer',
                border: '1px solid #dc2626',
                borderRadius: 12,
                background: '#fee',
                color: '#dc2626',
                fontSize: 14,
                fontWeight: 600
              }}>⟲</button>
            </div>
          </div>
        </div>

        {/* Right compare panel - full height, fixed width */}
        <div style={{width:360, minWidth: 360, height:'100%', overflow:'hidden', padding: '12px', paddingLeft: 0}}>
          <ComparePanel leftTurns={leftTurns} rightTurns={rightTurns} apiUrl={getApiUrl()} />
        </div>
      </div>


    </div>
  )
}

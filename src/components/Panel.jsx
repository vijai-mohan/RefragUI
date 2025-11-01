import React, { useState } from 'react'
import UserPrompt from './UserPrompt.jsx'
import AIResponse from './AIResponse.jsx'
import { stringToColor, getContrastColor, stringToPanelBackground } from '../utils/colorUtils.js'

export default function Panel({ side, model, setModel, models=[], turns=[], streaming=false, metrics={}, workerStatus={}, currentModelStatus, lastReqId, onCancel }){
  const [editing, setEditing] = useState(false)
  const [tmpModel, setTmpModel] = useState(model)

  // Generate consistent color based on model name
  const headerBgColor = stringToColor(model)
  const headerTextColor = getContrastColor(headerBgColor)
  const panelBgColor = stringToPanelBackground(model)

  // when model prop changes from parent, sync local tmpModel
  React.useEffect(()=>{ setTmpModel(model) }, [model])

  const saveModel = ()=>{
    setEditing(false)
    setModel(tmpModel)
  }

  const cancelEdit = ()=>{
    setEditing(false)
    setTmpModel(model)
  }

  const getStatusColor = ()=>{
    // Look up status for the current model from workerStatus object
    const status = workerStatus[model] || currentModelStatus
    if(!status) return '#9ca3af' // gray - unknown
    if(status.state === 'starting') return '#f97316' // orange
    if(status.state === 'ready') return '#22c55e' // green
    if(status.state === 'error') return '#ef4444' // red
    return '#9ca3af' // gray - default
  }

  const getStatusText = ()=>{
    // Look up status for the current model from workerStatus object
    const status = workerStatus[model] || currentModelStatus
    if(!status) return 'Unknown'
    if(status.state === 'starting') return 'Starting'
    if(status.state === 'ready') return 'Ready'
    if(status.state === 'error') return 'Error'
    return 'Unknown'
  }

  // compute filtered models for the dropdown (case-insensitive substring match)
  const filteredModels = (models || []).filter(m => {
    if(!editing) return false
    if(!tmpModel || tmpModel.trim() === '') return true // show all when input empty
    try{
      return m.toLowerCase().includes((tmpModel || '').toLowerCase())
    }catch(e){ return false }
  })

  const onSelectModel = (m)=>{
    setTmpModel(m)
    setEditing(false)
    setModel(m)
  }

  const onInputKey = (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault()
      saveModel()
    } else if(e.key === 'Escape'){
      e.preventDefault()
      cancelEdit()
    }
  }

  // Check if conversation has started (has any turns)
  const hasConversation = turns.length > 0
  const canEditModel = !hasConversation

  return (
    <div className="panel" style={{
      display:'flex',
      flexDirection:'column',
      height:'100%',
      background: panelBgColor,
      transition: 'background-color 0.3s ease',
      borderRadius: 12,
      overflow: 'hidden'
    }}>
      <div className="panel-header" style={{
        background: headerBgColor,
        color: headerTextColor,
        transition: 'background-color 0.3s ease'
      }}>
        <div className="model-select" style={{flex:1, minWidth:0, display:'flex', width:'100%'}}>
          {editing && canEditModel ? (
            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:6,
              position:'relative',
              zIndex:1000,
              width:'100%',
              flex:1
            }}>
              <div style={{display:'flex',gap:6, alignItems:'center', width:'100%'}}>
                <input
                  value={tmpModel || ''}
                  onChange={(e)=>setTmpModel(e.target.value)}
                  onBlur={()=>saveModel()}
                  onKeyDown={onInputKey}
                  autoFocus
                  style={{
                    flex:1,
                    width:'100%',
                    minWidth:0,
                    boxSizing:'border-box',
                    padding:'8px 12px',
                    borderRadius:4,
                    color:'#333',
                    background:'#fff',
                    border:'1px solid #ccc',
                    fontSize:14
                  }}
                />
                <button
                  onClick={saveModel}
                  style={{
                    padding:'8px 16px',
                    borderRadius:4,
                    border:'1px solid #2B6CB0',
                    background:'#E6F2FF',
                    color:'#1A56DB',
                    cursor:'pointer',
                    fontSize:13,
                    fontWeight:600
                  }}
                >
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding:'8px 16px',
                    borderRadius:4,
                    border:'1px solid #ccc',
                    background:'#f5f5f5',
                    color:'#666',
                    cursor:'pointer',
                    fontSize:13,
                    fontWeight:600
                  }}
                >
                  ✕
                </button>
              </div>

              {filteredModels && filteredModels.length > 0 && (
                <div style={{
                  position:'absolute',
                  top:'100%',
                  left:0,
                  right:0,
                  border:'1px solid #ccc',
                  maxHeight:300,
                  overflow:'auto',
                  background:'#fff',
                  boxShadow:'0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius:4,
                  zIndex:1001,
                  marginTop:2
                }}>
                  {filteredModels.map(mv => {
                    // Get worker status for this specific model from the workerStatus object
                    const modelWorkerStatus = workerStatus[mv] || null
                    const modelStatusColor = (() => {
                      if(!modelWorkerStatus || !modelWorkerStatus.state) return '#9ca3af'
                      if(modelWorkerStatus.state === 'starting') return '#f97316'
                      if(modelWorkerStatus.state === 'ready') return '#22c55e'
                      if(modelWorkerStatus.state === 'error') return '#ef4444'
                      return '#9ca3af'
                    })()
                    const modelStatusText = (() => {
                      if(!modelWorkerStatus || !modelWorkerStatus.state) return 'Unknown'
                      if(modelWorkerStatus.state === 'starting') return 'Starting'
                      if(modelWorkerStatus.state === 'ready') return 'Ready'
                      if(modelWorkerStatus.state === 'error') return 'Error'
                      return 'Unknown'
                    })()

                    return (
                      <div
                        key={mv}
                        onMouseDown={(ev)=>{ ev.preventDefault(); onSelectModel(mv) }}
                        style={{
                          padding:'10px 12px',
                          cursor:'pointer',
                          borderBottom:'1px solid #f5f5f5',
                          fontSize:14,
                          color:'#333',
                          background:'#fff',
                          display:'flex',
                          alignItems:'center',
                          gap:8
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                        title={`${mv} - Status: ${modelStatusText}`}
                      >
                        <div
                          style={{
                            width:8,
                            height:8,
                            borderRadius:'50%',
                            background: modelStatusColor,
                            flexShrink:0
                          }}
                        />
                        <span style={{
                          whiteSpace:'nowrap',
                          overflow:'hidden',
                          textOverflow:'ellipsis'
                        }}>
                          {mv}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          ) : (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div
                style={{
                  width:10,
                  height:10,
                  borderRadius:'50%',
                  background: getStatusColor(),
                  flexShrink:0
                }}
                title={`Worker: ${getStatusText()}`}
              />
              <div
                style={{
                  fontWeight:700,
                  cursor: canEditModel ? 'pointer' : 'default',
                  color: headerTextColor,
                  opacity: canEditModel ? 1 : 0.9
                }}
                title={canEditModel ? `Click to change model (Status: ${getStatusText()})` : 'Model locked after conversation starts'}
                onClick={canEditModel ? ()=>setEditing(true) : undefined}
              >
                {model || 'select model'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* chat area takes full height */}
      <div className="chat-area" style={{
        flex:1,
        overflow:'auto',
        padding:'12px',
        paddingBottom: 140,
        background: panelBgColor,
        transition: 'background-color 0.3s ease'
      }}>
        {turns.map((t, i) => {
          const isUser = t.role === 'user'
          const isLastAssistant = !isUser && i === turns.length - 1

          if (isUser) {
            return <UserPrompt key={i} text={t.text} />
          } else {
            return (
              <AIResponse
                key={i}
                text={t.text}
                metrics={t.metrics}
                isLast={isLastAssistant}
                hasActiveRequest={!!lastReqId}
                onCancel={onCancel}
              />
            )
          }
        })}
        {streaming && <div style={{fontStyle:'italic',color:'#666', padding:'8px'}}>Streaming...</div>}
      </div>
    </div>
   )
 }

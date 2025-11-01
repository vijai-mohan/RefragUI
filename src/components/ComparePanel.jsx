import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function ComparePanel({leftTurns=[], rightTurns=[], apiUrl}){
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // helper to extract last assistant text
  const lastAssistant = (turns)=>{
    for(let i=turns.length-1;i>=0;i--){ if(turns[i].role==='assistant') return turns[i].text || '' }
    return ''
  }

  useEffect(()=>{
    const left = lastAssistant(leftTurns)
    const right = lastAssistant(rightTurns)
    // only compare when both sides have non-empty assistant output
    if(!left || !right) { setMetrics(null); return }

    setLoading(true); setError(null)
    axios.post(`${apiUrl}/compare`, {left: left, right: right}).then(r=>{
      setMetrics(r.data || null)
      setLoading(false)
    }).catch(e=>{
      setError(e.message || 'compare failed'); setLoading(false)
    })
  }, [leftTurns, rightTurns])

  if(!metrics && !loading && !error) return (
    <div style={{
      padding: 0,
      borderLeft:'1px solid #e8e8e8',
      height:'100%',
      overflow:'hidden',
      display:'flex',
      flexDirection:'column',
      background: '#f9f9f9'
    }}>
      <div style={{
        padding: '12px 12px 8px 12px',
        borderBottom: '1px solid #e8e8e8'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Compare</h3>
      </div>
      <div style={{padding: 12, color:'#666'}}>Waiting for outputs from both panels...</div>
    </div>
  )

  return (
    <div style={{
      padding: 0,
      borderLeft:'1px solid #e8e8e8',
      height:'100%',
      overflow:'hidden',
      display:'flex',
      flexDirection:'column',
      background: '#f9f9f9'
    }}>
      <div style={{
        padding: '12px 12px 8px 12px',
        borderBottom: '1px solid #e8e8e8'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Compare</h3>
      </div>
      <div style={{flex: 1, overflow: 'auto', padding: 12}}>
        {loading && <div>Computing...</div>}
        {error && <div style={{color:'red'}}>Error: {error}</div>}
        {metrics && (
          <div>
            <div><strong>Left tokens:</strong> {metrics.left_tokens}</div>
            <div><strong>Right tokens:</strong> {metrics.right_tokens}</div>
            <div><strong>Shared tokens:</strong> {metrics.shared_tokens}</div>
            <div><strong>Jaccard:</strong> {metrics.jaccard?.toFixed(3)}</div>
            <div><strong>Length diff:</strong> {metrics.length_diff}</div>
            <div style={{marginTop:8}}><strong>Notes:</strong>
              <div style={{color:'#666', fontSize:12}}>{metrics.note || 'Basic token-level overlap and length comparisons'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

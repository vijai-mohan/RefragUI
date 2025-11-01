import React from 'react'

export default function Config({config, setConfig}){
  const onChange = (k,v)=>{
    setConfig({...config, [k]: v})
  }

  return (
    <div style={{maxWidth:600}}>
      <h3>Server Configuration</h3>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:16}}>
        <label style={{width:160}}>API Base URL</label>
        <input
          type="text"
          value={config.api_base_url}
          onChange={(e)=>onChange('api_base_url', e.target.value)}
          placeholder="http://localhost:7860"
          style={{flex:1, padding:'4px 8px', fontSize:14}}
          title="Backend server URL. Use localhost for debugging even from production."
        />
      </div>
      <div style={{color:'#666',fontSize:12,marginBottom:16,marginLeft:168}}>
        Set custom backend URL (e.g., http://localhost:7860 for local debugging)
      </div>

      <h3>Generation Defaults</h3>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <label style={{width:160}}>Max new tokens</label>
        <input type="number" value={config.max_new_tokens} min={1} max={2048} onChange={(e)=>onChange('max_new_tokens', parseInt(e.target.value||'128',10))} />
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <label style={{width:160}}>Temperature</label>
        <input type="number" value={config.temperature} step={0.01} min={0} max={5} onChange={(e)=>onChange('temperature', parseFloat(e.target.value||'0.7'))} />
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <label style={{width:160}}>Top P</label>
        <input type="number" value={config.top_p} step={0.01} min={0} max={1} onChange={(e)=>onChange('top_p', parseFloat(e.target.value||'0.9'))} />
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <label style={{width:160}}>Do sample</label>
        <input type="checkbox" checked={!!config.do_sample} onChange={(e)=>onChange('do_sample', e.target.checked)} />
        <div style={{color:'#666',marginLeft:8}}>When unchecked, uses greedy decoding (do_sample=False).</div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <label style={{width:160}}>Include history</label>
        <input type="checkbox" checked={!!config.include_history} onChange={(e)=>onChange('include_history', e.target.checked)} />
        <div style={{color:'#666',marginLeft:8}}>When enabled, previous turns are prepended to the prompt sent to the model.</div>
      </div>
      <p>These defaults are applied to new generation requests. You can still override them per request in a future update.</p>
    </div>
  )
}

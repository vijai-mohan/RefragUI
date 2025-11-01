import React from 'react'

export default function ResponseMetrics({ metrics, showCancel, onCancel }) {
  return (
    <div style={{
      marginTop: 8,
      paddingTop: 6,
      borderTop: '1px solid #e0e0e0',
      fontSize: 10,
      color: '#888',
      textAlign: 'right',
      fontFamily: 'monospace'
    }}>
      TTFT: {metrics.ttft != null ? metrics.ttft.toFixed(3) : '-'}s |
      TTL: {metrics.ttl != null ? metrics.ttl.toFixed(3) : '-'}s |
      Avg: {metrics.avg_speed != null ? metrics.avg_speed : '-'} tok/s |
      Tokens: {metrics.total_tokens}
      {showCancel && (
        <span
          style={{marginLeft:8, cursor:'pointer', color:'#dc2626'}}
          onClick={onCancel}
          title="Cancel request"
        >
          ✖
        </span>
      )}
    </div>
  )
}


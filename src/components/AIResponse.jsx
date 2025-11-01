import React from 'react'
import ResponseMetrics from './ResponseMetrics.jsx'

export default function AIResponse({ text, metrics, isLast, hasActiveRequest, onCancel }) {
  const showMetrics = metrics && metrics.total_tokens > 0

  return (
    <div
      style={{
        marginBottom: 12,
        display: 'flex',
        justifyContent: 'flex-start'
      }}
    >
      <div style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 12,
        background: '#f5f5f5',
        color: '#333',
        wordBreak: 'break-word',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div>{text}</div>
        {showMetrics && (
          <ResponseMetrics
            metrics={metrics}
            showCancel={isLast && hasActiveRequest}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  )
}


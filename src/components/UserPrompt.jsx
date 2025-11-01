import React from 'react'

export default function UserPrompt({ text }) {
  return (
    <div
      style={{
        marginBottom: 12,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div style={{
        width: 'auto',
        maxWidth: '50%',
        padding: '10px 14px',
        borderRadius: 12,
        background: '#E6F2FF',
        color: '#1A56DB',
        wordBreak: 'break-word',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {text}
      </div>
    </div>
  )
}


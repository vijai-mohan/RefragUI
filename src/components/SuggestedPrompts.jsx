import React from 'react'

export default function SuggestedPrompts({ onPromptClick }) {

  const testPrompts = [
    { id: 'info', text: 'Explain the significance of the 2025 climate report in 3 bullet points.' },
    { id: 'news', text: 'Summarize the latest major technology acquisition announced this week.' },
    { id: 'code', text: 'Write a Python function that validates an email address using regex.' },
    { id: 'creative', text: 'Write a short sci-fi opening paragraph set on a floating city.' },
    { id: 'advice', text: 'Suggest five ways to improve focus while working from home.' }
  ]

  const truncateText = (text, maxLen = 45) => {
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
  }

  return (
    <div style={{
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f9f9f9',
      borderTop: '1px solid #e8e8e8'
    }}>
      <div style={{
        padding: '12px 12px 8px 12px',
        borderBottom: '1px solid #e8e8e8'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Suggested Prompts</h3>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 8
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {testPrompts.map(p => (
            <button
              key={p.id}
              onClick={() => onPromptClick(p.text)}
              title={p.text}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                border: '1px solid #2B6CB0',
                borderRadius: 4,
                background: '#E6F2FF',
                color: '#1A56DB',
                fontSize: 12,
                lineHeight: '18px',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#D1E7FF'
                e.currentTarget.style.borderColor = '#1A56DB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#E6F2FF'
                e.currentTarget.style.borderColor = '#2B6CB0'
              }}
            >
              {truncateText(p.text)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


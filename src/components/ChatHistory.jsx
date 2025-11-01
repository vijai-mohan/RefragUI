import React, { useState } from 'react'

export default function ChatHistory({ conversations = [], currentConvId, onSelectConv, onNewConv, onDeleteConv, onDeleteAll }) {
  const [hoveredConvId, setHoveredConvId] = useState(null)

  const truncateText = (text, maxLen = 40) => {
    if (!text) return 'New conversation'
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
  }

  return (
    <div style={{
      width: 260,
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f9f9f9'
    }}>
      <div style={{
        padding: '12px 12px 8px 12px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12
      }}>
        <h3 style={{ margin: 0, fontSize: 16, flex: 1, fontWeight: 600 }}>Conversations</h3>
        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          {conversations.length > 0 && (
            <button
              onClick={onDeleteAll}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{
                padding: 6,
                cursor: 'pointer',
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: '#dc2626',
                fontSize: 18,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="Delete all conversations"
            >
              🗑️
            </button>
          )}
          <button
            onClick={onNewConv}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E6F2FF'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            style={{
              padding: 6,
              cursor: 'pointer',
              border: 'none',
              borderRadius: 4,
              background: 'transparent',
              color: '#1A56DB',
              fontSize: 20,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            title="Start new conversation"
          >
            +
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 12
      }}>
        {conversations.length === 0 ? (
          <div style={{ padding: 12, color: '#666', fontSize: 14, textAlign: 'center' }}>
            No conversations yet
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              onMouseEnter={() => setHoveredConvId(conv.id)}
              onMouseLeave={() => setHoveredConvId(null)}
              title={conv.firstPrompt || 'Empty conversation'}
              style={{
                padding: '10px 12px',
                marginBottom: 6,
                cursor: 'pointer',
                borderRadius: 6,
                background: currentConvId === conv.id ? '#E6F2FF' : '#fff',
                border: currentConvId === conv.id ? '1px solid #2B6CB0' : '1px solid #e8e8e8',
                fontSize: 13,
                lineHeight: '18px',
                transition: 'all 0.2s',
                wordBreak: 'break-word',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 8
              }}
            >
              <div
                onClick={() => onSelectConv(conv.id)}
                style={{ flex: 1, minWidth: 0 }}
                onMouseEnter={(e) => {
                  if (currentConvId !== conv.id) {
                    e.currentTarget.parentElement.style.background = '#f5f5f5'
                    e.currentTarget.parentElement.style.borderColor = '#d0d0d0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentConvId !== conv.id) {
                    e.currentTarget.parentElement.style.background = '#fff'
                    e.currentTarget.parentElement.style.borderColor = '#e8e8e8'
                  }
                }}
              >
                <div style={{ fontWeight: currentConvId === conv.id ? 600 : 400, color: '#333' }}>
                  {truncateText(conv.firstPrompt)}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                  {conv.timestamp ? new Date(conv.timestamp).toLocaleDateString() : ''}
                </div>
              </div>
              {hoveredConvId === conv.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConv(conv.id)
                  }}
                  style={{
                    padding: '4px 6px',
                    cursor: 'pointer',
                    border: '1px solid #dc2626',
                    borderRadius: 4,
                    background: '#fee',
                    color: '#dc2626',
                    fontSize: 14,
                    lineHeight: 1,
                    flexShrink: 0
                  }}
                  title="Delete this conversation"
                >
                  🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}


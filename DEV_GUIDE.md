# Refrag Client - Developer Guide

This guide provides detailed information about the architecture, data flow, and implementation details of the Refrag client application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration](#configuration)
3. [Layout System](#layout-system)
4. [Data Storage & State Management](#data-storage--state-management)
5. [Event Handling](#event-handling)
6. [Component Communication](#component-communication)
7. [Styling & Theming](#styling--theming)
8. [API Integration](#api-integration)

---

## Architecture Overview

### Component Hierarchy

```
App.jsx (Root Component)
├── Config.jsx (Configuration Panel)
├── ChatHistory.jsx (Left Sidebar - Top)
├── SuggestedPrompts.jsx (Left Sidebar - Bottom)
├── Panel.jsx × 2 (Left & Right Comparison Panels)
│   ├── UserPrompt.jsx (User message bubbles)
│   ├── AIResponse.jsx (AI message bubbles)
│   │   └── ResponseMetrics.jsx (Performance metrics)
└── ComparePanel.jsx (Right Sidebar)
```

### Data Flow

```
User Input → App State → Panel Components → Server → Streaming Response → Update State → Re-render
                ↓
         localStorage (Persistence)
```

---

## Configuration

The application supports both **development** and **production** modes with configurable server locations.

### Configuration File (`src/config.js`)

All environment-specific settings are centralized in `src/config.js`:

```javascript
import { API_BASE_URL, WORKER_POLL_INTERVAL, DEBUG, IS_DEV, IS_PROD, devLog } from './config.js'
```

### Available Configuration Options

| Variable | Type | Description | Dev Default | Prod Default |
|----------|------|-------------|-------------|--------------|
| `API_BASE_URL` | string | Backend API base URL | `http://localhost:7860` | From env var or localhost |
| `WORKER_POLL_INTERVAL` | number | Worker status poll interval (ms) | `2000` | `5000` |
| `DEBUG` | boolean | Enable debug logging | `true` | `false` |
| `IS_DEV` | boolean | Is development mode | `true` | `false` |
| `IS_PROD` | boolean | Is production mode | `false` | `true` |

### Environment Variables

Create a `.env.local` file (not committed to git) for local development:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:7860
```

For production builds, set the environment variable:

```bash
# Production build with custom API URL
VITE_API_BASE_URL=https://api.your-domain.com npm run build
```

### Usage Examples

**In components:**
```javascript
import { API_BASE_URL, devLog } from '../config.js'

// Use configured API URL
axios.get(`${API_BASE_URL}/models`)

// Debug logging (only in dev mode)
devLog('Fetching models...')
```

**Development mode:**
- API calls go to `http://localhost:7860`
- Worker status polled every 2 seconds
- Debug logs enabled in console

**Production mode:**
- API calls go to configured URL (or localhost if not set)
- Worker status polled every 5 seconds
- Debug logs disabled
- Optimized build

### Build Commands

```bash
# Development mode (default)
npm run dev

# Production build with default settings
npm run build

# Production build with custom API URL
VITE_API_BASE_URL=https://api.example.com npm run build

# Preview production build locally
npm run preview
```

---

## Layout System

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Refrag Demo                                                          ⚙️  🛠️     │ ← Header (Banner)
├─────────────┬───────────────────────────────────────────────────────┬───────────┤
│             │                                                         │           │
│ Conversa-   │  ┌──────────────────┐  ┌──────────────────┐          │ Compare   │
│ tions   🗑️+ │  │ 🟢 Model Name    │  │ 🟠 Model Name    │          │           │
│─────────────│  ├──────────────────┤  ├──────────────────┤          │───────────│
│ • Chat 1    │  │                  │  │                  │          │ Waiting   │
│ • Chat 2    │  │ User: Hello   ←  │  │ User: Hello   ←  │          │ for out-  │
│ • Chat 3    │  │                  │  │                  │          │ puts...   │
│             │  │ AI: Hi there!    │  │ AI: Hello!       │          │           │
│             │  │ TTFT: 0.12s      │  │ TTFT: 0.15s      │          │           │
│             │  │                  │  │                  │          │           │
│─────────────│  │                  │  │                  │          │           │
│ Suggested   │  │                  │  │                  │          │           │
│ Prompts     │  │                  │  │                  │          │           │
│─────────────│  │                  │  │                  │          │           │
│ • Climate   │  │                  │  │                  │          │           │
│ • Tech news │  │                  │  │                  │          │           │
│ • Code func │  │                  │  │                  │          │           │
│ • Sci-fi    │  │                  │  │                  │          │           │
│ • Work tips │  │                  │  │                  │          │           │
│             │  └──────────────────┘  └──────────────────┘          │           │
│             │           ┌─────────────────────────┐                 │           │
│             │           │ Type your prompt... →  ⟲│ ← Floating      │           │
│             │           └─────────────────────────┘    Prompt Box   │           │
└─────────────┴───────────────────────────────────────────────────────┴───────────┘
    260px              Flexible (flex: 1)                    360px
   (fixed)            Left Panel | Right Panel              (fixed)
```

**Layout Regions:**
- **Left Sidebar (260px)**: Conversations (top 50%) + Suggested Prompts (bottom 50%)
- **Center Area (flexible)**: Two comparison panels side-by-side
- **Right Sidebar (360px)**: Comparison metrics panel
- **Floating Prompt**: Absolutely positioned at bottom center

### Main Layout Structure

The application uses a **flexbox-based layout** with fixed sidebars and flexible center panels:

```javascript
<div className="layout">
  {/* Left Sidebar (260px fixed) */}
  <div style={{width: 260, padding: '12px'}}>
    <ChatHistory />      {/* 50% height */}
    <SuggestedPrompts /> {/* 50% height */}
  </div>

  {/* Center Panels (flexible) */}
  <div style={{flex: 1, position: 'relative'}}>
    <Panel side="left" />   {/* 50% width */}
    <Panel side="right" />  {/* 50% width */}
    {/* Floating Prompt Box (absolute positioning) */}
  </div>

  {/* Right Sidebar (360px fixed) */}
  <div style={{width: 360, padding: '12px'}}>
    <ComparePanel />
  </div>
</div>
```

### Responsive Considerations

- **Fixed widths**: Left sidebar (260px), Right sidebar (360px)
- **Flexible width**: Center panels adapt to available space
- **Height**: All panels extend full viewport height
- **Overflow**: Each panel handles its own scrolling independently

### Floating Prompt Box

The prompt input is **absolutely positioned** at the bottom center of the screen:

```javascript
{
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: 800,
  zIndex: 10
}
```

The center panels have `paddingBottom: 140px` to prevent content from hiding behind the floating prompt.

---

## Data Storage & State Management

### State Architecture

All state is managed in **App.jsx** using React hooks. No external state management library is used.

### State Categories

#### 1. **Model State**
```javascript
const [leftModel, setLeftModel] = useState(localStorage.getItem('leftModel') || '')
const [rightModel, setRightModel] = useState(localStorage.getItem('rightModel') || '')
const [models, setModels] = useState([]) // Available models from server
```

- **Persistence**: Model selections persist in `localStorage`
- **Source**: Available models fetched from `/models` endpoint

#### 2. **Conversation State**
```javascript
const [leftTurns, setLeftTurns] = useState([])
const [rightTurns, setRightTurns] = useState([])
// Turn structure: { role: 'user' | 'assistant', text: string, metrics?: {...} }
```

- **Turn object**: Contains role, text, and optional metrics
- **Metrics**: Attached to assistant turns during streaming
- **History**: Passed to server for context-aware responses

#### 3. **Conversation History**
```javascript
const [conversations, setConversations] = useState([])
const [currentConvId, setCurrentConvId] = useState(null)
// Conversation structure: { id, firstPrompt, leftTurns, rightTurns, leftModel, rightModel, timestamp, updatedAt }
```

- **Persistence**: All conversations stored in `localStorage`
- **Auto-save**: Updates on every turn change
- **Structure**: Each conversation stores complete state (models, turns, timestamps)

#### 4. **Streaming State**
```javascript
const [leftStreaming, setLeftStreaming] = useState(false)
const [rightStreaming, setRightStreaming] = useState(false)
const [leftReqId, setLeftReqId] = useState(null)
const [rightReqId, setRightReqId] = useState(null)
```

- **Streaming flags**: Indicate active streaming per panel
- **Request IDs**: Track requests for cancellation

#### 5. **Metrics State**
```javascript
const [leftMetrics, setLeftMetrics] = useState({ttft: null, ttl: null, avg_speed: null})
const [rightMetrics, setRightMetrics] = useState({ttft: null, ttl: null, avg_speed: null})
```

- **TTFT**: Time to First Token (seconds)
- **TTL**: Time to Last Token (seconds)
- **avg_speed**: Average tokens per second
- **total_tokens**: Total token count

#### 6. **Configuration State**
```javascript
const [config, setConfig] = useState({
  max_new_tokens: 128,
  temperature: 0.7,
  top_p: 0.9,
  include_history: true,
  do_sample: true
})
```

- **Persistence**: All config values persist in `localStorage`
- **Usage**: Sent with each chat request to control generation

#### 7. **Worker Status**
```javascript
const [workerStatus, setWorkerStatus] = useState({})
// Structure: { [modelName]: { state: 'ready' | 'starting' | 'error' } }
```

- **Polling**: Updated every 2 seconds from `/workers` endpoint
- **Purpose**: Show model readiness in UI (colored status bubbles)

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `leftModel` | string | Selected left panel model |
| `rightModel` | string | Selected right panel model |
| `conversations` | JSON array | All saved conversations |
| `currentConvId` | string | ID of active conversation |
| `cfg_max_new_tokens` | string | Max tokens config |
| `cfg_temperature` | string | Temperature config |
| `cfg_top_p` | string | Top-p sampling config |
| `cfg_include_history` | string | Include history flag |
| `cfg_do_sample` | string | Sampling flag |

---

## Event Handling

### User Input Events

#### 1. **Prompt Submission**
```javascript
// Triggered by: Enter key, Send button click, or Suggested prompt click
const onSend = async () => {
  // Send to both panels concurrently
  streamToPanel({...leftPanelConfig})
  streamToPanel({...rightPanelConfig})
  setPrompt('') // Clear input
}
```

**Flow:**
1. User enters text or clicks send button
2. `onSend()` called
3. Prompt sent to both panels via `streamToPanel()`
4. User and assistant turns added to state
5. Server-sent events stream tokens back
6. UI updates in real-time

#### 2. **Suggested Prompt Click**
```javascript
const onSuggestedPromptClick = (promptText) => {
  createNewConversation() // Start fresh conversation
  setTimeout(() => {
    streamToPanel({...config, promptText}) // Send prompt
  }, 50)
}
```

**Flow:**
1. User clicks suggested prompt pill
2. New conversation created automatically
3. Prompt sent to both panels
4. Response streaming begins

#### 3. **Model Selection**
```javascript
const onSelectModel = (modelName) => {
  setTmpModel(modelName)
  setEditing(false)
  setModel(modelName) // Updates parent state
}
```

**Restrictions:**
- Model selection **disabled** after first prompt in conversation
- Enforced by checking `turns.length > 0`
- Prevents model switching mid-conversation

#### 4. **Conversation Management**

**Load Conversation:**
```javascript
const loadConversation = (convId) => {
  const conv = conversations.find(c => c.id === convId)
  setLeftTurns(conv.leftTurns)
  setRightTurns(conv.rightTurns)
  setLeftModel(conv.leftModel)
  setRightModel(conv.rightModel)
  setCurrentConvId(convId)
}
```

**Delete Conversation:**
```javascript
const deleteConversation = (convId) => {
  // If deleting current, switch to another or create new
  setConversations(prev => prev.filter(c => c.id !== convId))
}
```

**Delete All (with confirmation):**
```javascript
const deleteAllConversations = () => {
  if (!confirm('Are you sure...')) return
  setConversations([])
  createNewConversation()
}
```

### Streaming Events

#### Server-Sent Events (SSE) Protocol

The client uses **Fetch API with ReadableStream** to handle streaming:

```javascript
const res = await fetch('http://localhost:7860/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({prompt, model, history, ...config})
})

const reader = res.body.getReader()
const decoder = new TextDecoder('utf-8')

while (true) {
  const {value, done} = await reader.read()
  if (done) break
  
  // Parse SSE format: "data: {json}\n\n"
  const jsonStr = chunk.replace(/^data:\s*/, '')
  const obj = JSON.parse(jsonStr)
  
  // Handle different event types
  switch (obj.event) {
    case 'assigned': // Request ID received
    case 'request_received': // Server received request
    case 'token': // New token received
    case 'done': // Generation complete
    case 'cancelled': // Request cancelled
  }
}
```

#### Event Types

| Event | Payload | Action |
|-------|---------|--------|
| `assigned` | `{req_id}` | Store request ID for cancellation |
| `request_received` | `{request_received}` | Record start timestamp |
| `token` | `{token, token_ts, n_tokens}` | Append token to assistant turn |
| `done` | `{token}` | Finalize metrics, clear request ID |
| `cancelled` | `{token}` | Clear streaming state |

#### Metrics Calculation

```javascript
// Computed during streaming:
const ttft = firstTokenTs - requestReceived       // Time to first token
const ttl = lastTokenTs - requestReceived         // Time to last token
const elapsed = lastTokenTs - firstTokenTs        // Generation time
const avg_speed = tokenCount / elapsed            // Tokens per second

// Attached to turn:
turns[lastIndex].metrics = {ttft, ttl, avg_speed, total_tokens}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send prompt (from textarea) |
| `Shift+Enter` | New line in textarea |
| `Ctrl+L` | Reset/clear conversations |
| `Ctrl+K` | Focus prompt input |
| `Ctrl+Shift+C` | Cancel both streaming requests |
| `Escape` | Cancel model editing |

---

## Component Communication

### Props Flow

```
App.jsx
  ├─> Panel (left)
  │     Props: {model, setModel, models, turns, streaming, metrics, 
  │             workerStatus, currentModelStatus, lastReqId, onCancel}
  │
  ├─> Panel (right)
  │     Props: {model, setModel, models, turns, streaming, metrics,
  │             workerStatus, currentModelStatus, lastReqId, onCancel}
  │
  ├─> ChatHistory
  │     Props: {conversations, currentConvId, onSelectConv, onNewConv,
  │             onDeleteConv, onDeleteAll}
  │
  ├─> SuggestedPrompts
  │     Props: {onPromptClick}
  │
  └─> ComparePanel
        Props: {leftTurns, rightTurns}
```

### Callback Pattern

All user actions flow **upward** to App.jsx via callbacks:

```javascript
// Child component
<button onClick={() => onDeleteConv(convId)}>Delete</button>

// Parent (App.jsx)
const deleteConversation = (convId) => {
  // Update state
  setConversations(prev => prev.filter(c => c.id !== convId))
}

// Passed down
<ChatHistory onDeleteConv={deleteConversation} />
```

### Data Flow Down, Events Flow Up

- **State lives in App.jsx**
- **Props flow down** to child components
- **Callbacks flow up** to modify state
- **Re-render cascade** propagates changes

---

## Styling & Theming

### Color System

#### Status Colors
```javascript
const STATUS_COLORS = {
  ready: '#22c55e',    // Green
  starting: '#f97316', // Orange
  error: '#ef4444',    // Red
  unknown: '#9ca3af'   // Gray
}
```

#### Theme Colors
```javascript
const THEME_COLORS = {
  primary: '#1A56DB',      // Blue
  primaryBg: '#E6F2FF',    // Light blue
  danger: '#dc2626',       // Red
  dangerBg: '#fee2e2',     // Light red
  text: '#333',            // Dark gray
  border: '#e8e8e8',       // Very light gray
  background: '#f9f9f9'    // Off-white
}
```

### Model-Based Theming

Each model gets a **unique color** based on its name:

```javascript
// Hash model name to hue (0-360)
const hue = Math.abs(hash(modelName) % 360)

// Generate colors:
const headerBg = `hsl(${hue}, 65%, 55%)`        // Vibrant header
const panelBg = `hsl(${hue}, 20%, 97%)`         // Subtle background
const textColor = getContrastColor(headerBg)    // Auto-contrast text
```

### Message Styling

**User messages:**
- Right-aligned
- Blue background (`#E6F2FF`)
- Blue text (`#1A56DB`)
- Max width 50%
- Rounded corners (12px)

**AI messages:**
- Left-aligned
- Gray background (`#f5f5f5`)
- Dark text (`#333`)
- Full width (100%)
- Rounded corners (12px)
- Metrics at bottom (right-aligned, 10px font)

---

## API Integration

### Endpoints

#### GET `/models`
**Purpose:** Fetch available models
```javascript
axios.get('http://localhost:7860/models')
  .then(r => setModels(r.data.models))
```

**Response:**
```json
{
  "models": ["model1", "model2", ...]
}
```

#### POST `/chat` (SSE)
**Purpose:** Stream chat responses
```javascript
fetch('http://localhost:7860/chat', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "...",
    model: "model-name",
    history: [{role: 'user', text: '...'}, ...],
    max_new_tokens: 128,
    temperature: 0.7,
    top_p: 0.9,
    do_sample: true
  })
})
```

**Response:** Server-Sent Events stream
```
data: {"event": "assigned", "payload": {"req_id": "..."}}

data: {"event": "request_received", "payload": {"request_received": 1234567890.123}}

data: {"event": "token", "payload": {"token": "hello", "token_ts": 1234567890.456, "n_tokens": 1}}

data: {"event": "done", "payload": {}}
```

#### GET `/workers`
**Purpose:** Get worker status for all models
```javascript
axios.get('http://localhost:7860/workers')
  .then(r => setWorkerStatus(r.data))
```

**Response:**
```json
{
  "model1": {"state": "ready"},
  "model2": {"state": "starting"},
  "model3": {"state": "error"}
}
```

#### POST `/cancel`
**Purpose:** Cancel a streaming request
```javascript
axios.post('http://localhost:7860/cancel', {
  req_id: "request-id-here"
})
```

#### POST `/compare`
**Purpose:** Compare two responses
```javascript
axios.post('http://localhost:7860/compare', {
  left: "response text 1",
  right: "response text 2"
})
```

**Response:**
```json
{
  "left_tokens": 50,
  "right_tokens": 48,
  "shared_tokens": 30,
  "jaccard": 0.625,
  "length_diff": 2,
  "note": "..."
}
```

### Error Handling

```javascript
try {
  // API call
} catch (e) {
  console.error('API error:', e)
  // Show error in UI
  setError(e.message)
}
```

Errors are logged but don't crash the app. Users see error messages in the relevant panel.

---

## Development Tips

### Adding a New Component

1. Create component file in `src/components/`
2. Define props interface (JSDoc or TypeScript)
3. Import in parent component
4. Pass necessary state and callbacks
5. Handle events and update state via callbacks

### Adding New State

1. Define state in App.jsx
2. Create setter function
3. Add localStorage persistence if needed
4. Pass state down as props
5. Create callback to update state
6. Pass callback down to children

### Debugging Streaming

Enable console logs in `streamToPanel()`:
```javascript
console.log('SSE Event:', eventType, payload)
```

Check Network tab for SSE connection details.

### Testing Locally

1. Start backend: `python webapp/server.py`
2. Start frontend: `cd client && npm run dev`
3. Open browser: `http://localhost:5173`
4. Check console for errors
5. Verify API calls in Network tab

---

## Common Patterns

### Conditional Rendering
```javascript
{loading && <div>Loading...</div>}
{error && <div style={{color:'red'}}>{error}</div>}
{data && <DisplayComponent data={data} />}
```

### Event Handler with Prevent Default
```javascript
onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSend()
  }
}}
```

### State Update from Callback
```javascript
// Update specific item in array
setConversations(prev => prev.map(c => 
  c.id === targetId ? {...c, updated: true} : c
))

// Filter out item
setConversations(prev => prev.filter(c => c.id !== targetId))

// Append to array
setTurns(prev => [...prev, newTurn])
```

### Cleanup in useEffect
```javascript
useEffect(() => {
  const interval = setInterval(pollWorkers, 2000)
  return () => clearInterval(interval) // Cleanup
}, [])
```

---

## Performance Considerations

- **Memoization**: Not heavily used; React's reconciliation is sufficient
- **Virtual scrolling**: Not implemented; conversation history assumed reasonable size
- **Debouncing**: Not implemented; user actions are intentional
- **Code splitting**: Not implemented; bundle size is small

### Future Optimizations

- Implement `React.memo` for Panel components
- Add virtual scrolling for long conversations
- Debounce model search input
- Code-split routes if app grows

---

## File Conventions

- **Components**: PascalCase (e.g., `ChatHistory.jsx`)
- **Utils**: camelCase (e.g., `colorUtils.js`)
- **Props**: camelCase
- **Event handlers**: `onXxx` prefix (e.g., `onSend`, `onClick`)
- **State setters**: `setXxx` prefix (e.g., `setModel`)

---

This guide should help you understand how the Refrag client works and how to extend it!


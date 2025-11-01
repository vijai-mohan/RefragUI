# Refrag UI

React-based frontend for the Refrag model comparison demo. Compare multiple language models side-by-side with real-time streaming responses.

## Features

- 🔄 **Side-by-side model comparison** - Test two models simultaneously
- 💬 **Real-time streaming** - See responses as they generate
- 📊 **Performance metrics** - Track tokens/sec, latency, and total tokens
- 💾 **Chat history** - Save and load conversation sessions
- 🎨 **Dynamic UI** - Color-coded panels per model
- ⚙️ **Configurable parameters** - Adjust temperature, top_p, max tokens, and more

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

Production files will be in `dist/` directory.

## Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
VITE_API_BASE_URL=http://localhost:7860
```

**Available Variables:**
- `VITE_API_BASE_URL` - Backend API endpoint (default: `http://localhost:7860`)

See `.env.example` for reference.

### Backend Connection

The UI expects a backend with these endpoints:

- `GET /models` - List available models
- `POST /chat-stream` - Streaming chat endpoint
- `POST /compare` - Compare model responses
- `GET /metrics` - Performance metrics

## Deployment

### GitHub Pages

#### 1. Enable GitHub Pages
- Go to **Settings** → **Pages**
- Set **Source** to: **GitHub Actions**

#### 2. Configure Backend (Optional)
- Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
- Add `VITE_API_BASE_URL` with your backend URL

#### 3. Deploy
```bash
git push origin main
```

Deployment is automatic via GitHub Actions.

**Deployed URL:** `https://vijai-mohan.github.io/RefragUI/`

### Custom Deployment

Build and deploy the `dist/` folder to any static hosting:

```bash
npm run build
# Deploy dist/ to your hosting provider
```

**Note:** Update `base` in `vite.config.js` if deploying to a different path.

## Project Structure

```
RefragUI/
├── src/
│   ├── components/       # React components
│   │   ├── Panel.jsx            # Model panel container
│   │   ├── ComparePanel.jsx     # Comparison view
│   │   ├── ChatHistory.jsx      # Session management
│   │   ├── Config.jsx           # Settings panel
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   └── colorUtils.js        # Color generation
│   ├── App.jsx           # Main application
│   ├── config.js         # Environment config
│   ├── main.jsx          # Entry point
│   └── styles.css        # Global styles
├── .github/workflows/    # CI/CD
├── index.html            # HTML template
├── package.json          # Dependencies
└── vite.config.js        # Build configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- ES6+ JavaScript
- React functional components with hooks
- Axios for HTTP requests
- CSS for styling (no framework)

## Troubleshooting

### Build Errors

**Module not found errors:**
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**API connection fails:**
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is running and accessible
- Ensure backend has CORS enabled for your origin

**Assets not loading after deployment:**
- Verify `base` path in `vite.config.js` matches your deployment path
- Check browser console for 404 errors
- Clear browser cache

### Development Issues

**Hot reload not working:**
- Check file is saved
- Restart dev server: Ctrl+C then `npm run dev`

**Port already in use:**
- Change port in `vite.config.js` or kill process using port 5173

## Documentation

- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Detailed architecture and implementation guide
- **[.env.example](./.env.example)** - Environment variables reference

## Tech Stack

- **React 18.2** - UI framework
- **Vite 7.1** - Build tool
- **Axios 1.13** - HTTP client

## License

See main Refrag project for license information.

## Prerequisites

- Node.js 18+ and npm

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

## Building for Production

Build the production bundle:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/       # React components
│   │   ├── AIResponse.jsx
│   │   ├── ChatHistory.jsx
│   │   ├── ComparePanel.jsx
│   │   ├── Config.jsx
│   │   ├── Panel.jsx
│   │   ├── ResponseMetrics.jsx
│   │   ├── SuggestedPrompts.jsx
│   │   └── UserPrompt.jsx
│   ├── utils/           # Utility functions
│   │   └── colorUtils.js
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── styles.css       # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── package-lock.json    # Locked dependency versions
```

## Features

- **Side-by-side model comparison**: Compare responses from two different models
- **Conversation history**: Save and reload previous conversations
- **Suggested prompts**: Quick-start prompts for testing
- **Real-time streaming**: See responses as they're generated
- **Performance metrics**: View TTFT, TTL, and tokens/sec for each response
- **Model-specific theming**: Visual distinction between different models

## Configuration

The frontend connects to the backend server at `http://localhost:7860` by default. 

### Environment Variables

For custom API endpoints, create a `.env.local` file:

```bash
VITE_API_BASE_URL=http://your-server:port
```

Or set the environment variable when building:

```bash
VITE_API_BASE_URL=https://api.your-domain.com npm run build
```

### Configuration Options

The app automatically detects the environment:
- **Development**: `npm run dev` - Uses localhost, enables debug logging
- **Production**: `npm run build` - Uses env var or localhost, optimized build

See `src/config.js` for all configuration options.

## Tech Stack

- **React 18.2**: UI framework
- **Vite**: Build tool and dev server
- **Axios**: HTTP client for API calls
- **Fetch API**: Server-sent events for streaming responses


# Refrag UI

React-based frontend for the Refrag model comparison demo. Compare multiple language models side-by-side with real-time streaming responses.

## Features

- 🔄 **Side-by-side model comparison** - Test two models simultaneously
- 💬 **Real-time streaming** - See responses as they generate
- 📊 **Performance metrics** - Track tokens/sec, latency, and total tokens
- 💾 **Chat history** - Save and load conversation sessions
- 🎨 **Dynamic UI** - Color-coded panels per model
- ⚙️ **Configurable parameters** - Adjust temperature, top_p, max tokens, and more
- 🔧 **Custom backend URL** - Point to any backend (including localhost from production)

## Quick Start

### Prerequisites

- Node.js 20+ (required by Vite 7)
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

### Change the server at runtime (UI)

You can point the UI to any server (including localhost) without rebuilding:

- Click the ⚙️ gear icon (top-right)
- In "Server Configuration", set "API Base URL" (e.g., `http://localhost:7860`)
- Changes take effect immediately and persist in your browser

Tip: This lets you debug the production UI against a local server.

### Backend Connection

The UI expects a backend with these endpoints:

- `GET /models` - List available models
- `POST /chat` - Streaming chat endpoint (SSE-style chunked JSON lines with `data: ...\n\n`)
- `POST /compare` - Compare model responses
- `GET /workers` - Worker/health status page (optional but linked from UI)
- `POST /cancel` - Cancel an in-flight request by `req_id`

## Server requirements (to allow UI access)

For the UI to reach your server (especially from GitHub Pages), ensure:

- CORS enabled for your UI origin
  - From GitHub Pages: `https://vijai-mohan.github.io`
  - During local dev: `http://localhost:5173`
- Supports chunked streaming for `/chat` (server-sent events style)
  - Send lines prefixed with `data:` and separated by blank lines
  - Example events the UI understands:
    - `{ "event": "assigned", "payload": { "req_id": "..." } }`
    - `{ "event": "request_received", "payload": { "request_received": <epoch_seconds> } }`
    - `{ "event": "token", "payload": { "token": "...", "token_ts": <epoch_seconds>, "n_tokens": <int> } }`
    - `{ "event": "done", "payload": {} }`
- JSON APIs at listed endpoints, `Content-Type: application/json`
- Optional: `/workers` HTML/JSON for the UI shortcut button

Example CORS snippets:

- FastAPI
  
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=[
          "https://vijai-mohan.github.io",
          "http://localhost:5173",
      ],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

- Flask
  
  ```python
  from flask_cors import CORS
  CORS(app, origins=[
      "https://vijai-mohan.github.io",
      "http://localhost:5173",
  ])
  ```

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

If deploying under a subpath, update `base` in `vite.config.js`.

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

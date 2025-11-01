# Refrag Client

React-based frontend for the Refrag model comparison demo.

## Quick Start

### Local Development

```bash
cd client
npm install
npm run dev
```

Visit: http://localhost:5173

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Deployment to GitHub Pages

### Prerequisites
- GitHub repository with push access
- Node.js 18+ installed locally

### Setup Steps

#### 1. Enable GitHub Pages (One-time)

1. Go to your repository: **Settings** → **Pages**
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

#### 2. Configure Backend URL (Optional)

For production deployment with a backend:

1. Go to: **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable**
3. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.hf.space`)

**Note:** Defaults to `http://localhost:7860` if not set.

#### 3. Deploy

The client automatically deploys when you push changes to the `client/` directory:

```bash
git add client/
git commit -m "Update client"
git push origin main
```

Or trigger manually from **Actions** tab → **Deploy Client to GitHub Pages** → **Run workflow**

#### 4. Access Your App

After deployment (2-3 minutes), visit:
```
https://vijai-mohan.github.io/Refrag/UI/
```

### Environment Variables

For local development with a custom backend:

```bash
# Create .env.local
echo VITE_API_BASE_URL=http://localhost:7860 > .env.local

# Or set inline
VITE_API_BASE_URL=http://your-backend:port npm run dev
```

### Troubleshooting Deployment

**Build fails in GitHub Actions:**
- Check **Actions** tab for error logs
- Ensure `package-lock.json` is committed
- Verify Node.js version compatibility

**Site shows 404:**
- Confirm GitHub Pages is enabled with "GitHub Actions" source
- Wait 2-3 minutes for first deployment
- Check **Actions** tab for deployment status

**Assets not loading:**
- Check browser console for 404s
- Verify base path in `vite.config.js` is `/Refrag/UI/`
- Clear browser cache (Ctrl+Shift+R)

**API calls fail (CORS):**
- Verify `VITE_API_BASE_URL` is set in GitHub variables
- Check backend CORS configuration allows `https://vijai-mohan.github.io`
- Check browser console for specific error messages

### Monitoring

- **GitHub Actions**: Check deployment status in Actions tab
- **GitHub Pages**: View deployment logs in Settings → Pages
- **Browser Console**: Press F12 to check for errors

## Development

> 📖 **For developers**: See [DEV_GUIDE.md](./DEV_GUIDE.md) for detailed architecture, data flow, and implementation details.

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


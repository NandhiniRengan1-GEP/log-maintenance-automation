# Log Maintenance Automation - Angular UI

Modern Angular web interface for the Log-Based Code Maintenance Automation System.

## Features

### 🎯 Dashboard
- Real-time system status monitoring
- Service health indicators
- Recent errors and PRs overview
- Quick statistics

### 🐛 Error Management
- Browse all errors from New Relic
- Filter by category and search
- View detailed error information
- Launch diagnostics directly

### 🔍 Diagnostic Analysis
- View LLM1 diagnostic results
- Error categorization and severity
- Source code location and context
- Repository information

### 🛠️ Fix Viewer
- Side-by-side code comparison
- Original vs fixed code display
- One-click PR creation
- Success confirmation

### 📋 Pull Request Management
- View all created PRs
- PR status and metadata
- Direct links to GitHub

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- All backend services running (see main README)

### Installation

1. **Navigate to UI directory:**
```powershell
cd ui-angular
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Start the development server:**
```powershell
npm start
```

4. **Open in browser:**
```
http://localhost:4200
```

## Project Structure

```
ui-angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── error-list/         # Error browsing
│   │   │   ├── diagnostic-viewer/  # Diagnostic results
│   │   │   ├── fix-viewer/         # Code fix display
│   │   │   ├── pr-list/            # PR management
│   │   │   └── header/             # Navigation header
│   │   ├── services/
│   │   │   ├── newrelic.service.ts    # New Relic API
│   │   │   ├── diagnostic.service.ts  # LLM1 API
│   │   │   ├── solution.service.ts    # LLM2 API
│   │   │   └── github.service.ts      # GitHub API
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── styles.css                  # Global styles
│   └── index.html
├── proxy.conf.json                 # API proxy config
├── angular.json
├── package.json
└── tsconfig.json
```

## API Proxy Configuration

The UI uses Angular's proxy to communicate with backend services:

| Route | Target | Service |
|-------|--------|---------|
| `/api` | `http://localhost:3000` | Orchestrator |
| `/newrelic` | `http://localhost:3002` | New Relic Mock |
| `/llm1` | `http://localhost:5001` | LLM1 Diagnostics |
| `/llm2` | `http://localhost:5002` | LLM2 Solution |
| `/github` | `http://localhost:3005` | GitHub Service |

## Usage Workflow

### 1. View Dashboard
- Check system status
- See active errors count
- View recent activity

### 2. Browse Errors
- Navigate to "Errors" tab
- Use search and filters
- Select an error to diagnose

### 3. Run Diagnostics
- Click "Run Diagnostics" on any error
- View categorization and source location
- Generate solution

### 4. Review Fix
- View original vs fixed code comparison
- Read fix explanation
- Create pull request

### 5. Manage PRs
- Navigate to "Pull Requests" tab
- View all created PRs
- Click to open in GitHub

## Development

### Build for production:
```powershell
npm run build
```

### Watch mode:
```powershell
npm run watch
```

### Run tests:
```powershell
npm test
```

## Technology Stack

- **Angular 16**: Modern web framework
- **TypeScript 5**: Type-safe development
- **RxJS 7**: Reactive programming
- **CSS Variables**: Theming system

## Styling

The UI uses a custom design system with:
- Consistent color palette
- Responsive grid layouts
- Smooth animations
- Material-inspired components

### Color Scheme
- Primary: `#2563eb` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)
- Dark: `#1f2937` (Charcoal)

## Features Highlight

### 🎨 Modern UI/UX
- Clean, professional design
- Responsive layout
- Smooth transitions
- Intuitive navigation

### ⚡ Real-time Updates
- Live service status
- Auto-refresh capabilities
- Instant feedback

### 🔍 Advanced Search
- Full-text search
- Category filtering
- Sorting options

### 📊 Data Visualization
- Error statistics
- Status indicators
- Code comparison view

## Troubleshooting

### Backend not responding
1. Ensure all backend services are running
2. Check proxy configuration in `proxy.conf.json`
3. Verify ports 3000, 3002, 5001, 5002, 3005 are accessible

### Compilation errors
1. Delete `node_modules` and run `npm install` again
2. Clear Angular cache: `npm run ng cache clean`
3. Check Node.js version (should be 16+)

### CORS issues
The proxy configuration should handle CORS automatically. If issues persist:
1. Check proxy.conf.json settings
2. Restart Angular dev server
3. Verify backend CORS headers

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Part of the Log Maintenance Automation System

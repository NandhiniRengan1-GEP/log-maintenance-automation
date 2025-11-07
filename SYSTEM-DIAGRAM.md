# System Architecture with Angular UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ANGULAR UI (Port 4200)                          │
│                         http://localhost:4200                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Dashboard   │  │  Error List  │  │  Diagnostic  │  │  Fix View  │ │
│  │  Component   │  │  Component   │  │   Viewer     │  │ Component  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │                 │        │
│         └─────────────────┴─────────────────┴─────────────────┘        │
│                                   │                                     │
│                    ┌──────────────┴──────────────┐                     │
│                    │      Angular Services       │                     │
│                    │  - NewRelicService          │                     │
│                    │  - DiagnosticService        │                     │
│                    │  - SolutionService          │                     │
│                    │  - GithubService            │                     │
│                    └──────────────┬──────────────┘                     │
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │   Proxy Layer         │
                        │  (proxy.conf.json)    │
                        └───────────┬───────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌────────────────┐         ┌────────────────┐
│  New Relic    │          │   LLM1         │         │    LLM2        │
│  Mock         │          │   Diagnostics  │         │    Solution    │
│  Port 3002    │          │   Port 5001    │         │    Port 5002   │
│               │          │                │         │                │
│  • Store      │          │  • Fetch error │         │  • Generate    │
│    errors     │          │  • Categorize  │         │    code fix    │
│  • Query by   │          │  • Extract     │         │  • Create      │
│    txn ID     │          │    location    │         │    alerts      │
└───────────────┘          └────────────────┘         └────────────────┘
        │                                                      │
        │                                                      │
        │                  ┌───────────────┐                  │
        │                  │   GitHub      │                  │
        └──────────────────│   Service     │──────────────────┘
                           │   Port 3005   │
                           │               │
                           │  • Create PRs │
                           │  • Manage PRs │
                           └───────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │  GitHub API      │
                        │  (Simulated)     │
                        └──────────────────┘


USER WORKFLOW:
═════════════

1. Browser → http://localhost:4200/dashboard
   ↓
2. View system status and errors
   ↓
3. Click "Run Diagnostics" on error
   ↓
4. DiagnosticService → POST /llm1/diagnose
   ↓
5. LLM1 analyzes error → Returns diagnostic
   ↓
6. UI displays diagnostic results
   ↓
7. Click "Generate Solution"
   ↓
8. SolutionService → POST /llm2/generate-solution
   ↓
9. LLM2 generates fix → Returns code changes
   ↓
10. UI shows before/after code comparison
    ↓
11. Click "Create Pull Request"
    ↓
12. GithubService → POST /github/create-pr
    ↓
13. GitHub Service creates PR
    ↓
14. UI shows PR details with link
    ↓
15. User clicks "View on GitHub" → Opens PR in browser


DATA FLOW EXAMPLE:
═════════════════

Error Detection:
NewRelic Mock → Error Object → UI Error List

Diagnostic Analysis:
UI → DiagnosticService → LLM1 → Diagnostic Result → UI

Solution Generation:
UI → SolutionService → LLM2 → Code Fix → UI

PR Creation:
UI → GithubService → GitHub Mock → PR Details → UI


SERVICE PORTS:
═════════════

4200  →  Angular UI (Frontend)
3002  →  New Relic Mock
3005  →  GitHub Service
5001  →  LLM1 Diagnostics (Python/Flask)
5002  →  LLM2 Solution (Python/Flask)


TECHNOLOGY STACK:
════════════════

Frontend:
- Angular 16
- TypeScript 5
- RxJS 7
- CSS3

Backend:
- Node.js/Express (3 services)
- Python/Flask (2 services)

Mock Data:
- In-memory storage
- Pre-seeded errors
- Simulated responses


FILES STRUCTURE:
═══════════════

log-maintenance-automation/
├── ui-angular/                    ← ANGULAR UI (NEW)
│   ├── src/app/
│   │   ├── components/           ← 6 UI Components
│   │   ├── services/             ← 4 API Services
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── proxy.conf.json           ← API Proxy Config
│   └── package.json
│
├── automation-system/
│   ├── llm1-diagnostics/         ← Port 5001
│   ├── llm2-solution/            ← Port 5002
│   └── integrations/
│       └── github-service/       ← Port 3005
│
├── mock-services/
│   └── newrelic-mock/            ← Port 3002
│
├── start-with-ui.ps1             ← Start All + UI (NEW)
├── UI-INTEGRATION-GUIDE.md       ← Complete Guide (NEW)
└── ANGULAR-UI-COMPLETE.md        ← Summary (NEW)
```

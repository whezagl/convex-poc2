# Root Cause Analysis (RCA)
## App Unable to View Data - January 15, 2026

---

## Executive Summary

**Issue:** The web application's "View" page was not displaying any data from the database.

**Impact:** Users could open the application but saw an empty list instead of the expected data records.

**Root Cause:** A missing configuration setting (environment variable) that tells the web application how to connect to the database.

**Resolution:** Added the missing configuration value and restarted the web server.

**Time to Resolution:** Approximately 10 minutes

---

## What Happened? (Timeline)

```mermaid
timeline
    title App Data View Issue - Timeline
    section Initial State
      User reported issue : App running, but no data visible
      Investigation started : Checked if services were running
    section Discovery
      Frontend server found : Running on port 5174 ✓
      Backend server missing : Not running on port 3212 ✗
      Backend started : Convex dev server launched
    section Second Issue Found
      Data seeded : 5 records added to database
      Data disappeared : Records not showing after restart
      Data re-seeded : 2 records successfully added
    section Root Cause Found
      App checked : Looking for wrong config name
      Env file inspected : "VITE_CONVEX_URL" found
      App needed : "VITE_CONVEX_DEPLOYMENT_URL"
    section Resolution
      Config fixed : Added correct variable name
      Server restarted : Vite reloaded with new config
      Issue resolved : App can now view data ✓
```

---

## The Problem Explained Simply

Think of your web application like a **restaurant**:

- **Frontend (Web Page)** = The dining room where customers sit
- **Backend (Database)** = The kitchen where food is prepared
- **Environment Variables** = The phone number that connects waiters to the kitchen

**The Issue:** The dining room was open, the kitchen was cooking, but the waiters didn't have the correct phone number to call the kitchen. So when customers asked for the menu (data), the waiters couldn't get it from the kitchen.

---

## Technical Details (Simplified)

### System Architecture

```mermaid
graph TB
    subgraph "User's Browser"
        A[User opens<br/>localhost:5174/view]
    end

    subgraph "Frontend Server"
        B[Vite Dev Server<br/>Port 5174]
        C[React Application]
    end

    subgraph "Configuration"
        D[.env.local file<br/>Stores connection settings]
    end

    subgraph "Backend Server"
        E[Convex Database<br/>Port 3212]
        F[(Data Storage)]
    end

    A --> B
    B --> C
    C -->|Needs config| D
    D -->|Should have| E
    E --> F

    style D fill:#ffcccc,stroke:#ff0000,stroke-width:2px
    style F fill:#ffffcc,stroke:#e6e600,stroke-width:2px
```

### What Was Wrong

| What We Needed | What We Had | Status |
|----------------|-------------|--------|
| `VITE_CONVEX_DEPLOYMENT_URL` | `VITE_CONVEX_URL` | ❌ Name mismatch |
| Value: `http://127.0.0.1:3212` | Value: `http://127.0.0.1:3212` | ✓ Value was correct |

**The Fix:** Added a line to `.env.local`:
```
VITE_CONVEX_DEPLOYMENT_URL=http://127.0.0.1:3212
```

---

## Root Cause Analysis

### Five Whys (A Problem-Solving Method)

```mermaid
graph TD
    A[Why is data not showing?] --> B[App can't connect to database]
    B --> C[Why can't it connect?]
    C --> D[Missing configuration variable]
    D --> E[Why is it missing?]
    E --> F[Different name used in setup vs code]
    F --> G[Why different names?]
    G --> H[Documentation mismatch between<br/>Convex setup script and React code]
```

### Classification

| Category | Answer |
|----------|--------|
| **Type** | Configuration Error |
| **Origin** | Environment Variable Naming |
| **Human Factor** | Automated setup used different naming convention than application code expected |
| **Detection** | Manual testing and code inspection |

---

## Data Flow (After Fix)

```mermaid
sequenceDiagram
    participant User as 👤 User Browser
    participant Vite as 🌐 Vite Server
    participant React as ⚛️ React App
    participant Convex as 🗄️ Convex Database

    User->>Vite: Request localhost:5174/view
    Vite->>React: Load ViewPage component
    React->>React: Read VITE_CONVEX_DEPLOYMENT_URL
    Note over React: ✅ Now has correct URL!
    React->>Convex: Query getMockData()
    Convex->>Convex: Fetch from mockData table
    Convex-->>React: Return 2 records
    React-->>User: Display data on screen
```

---

## Lessons Learned

### What Went Well
✓ Quick identification of the missing backend service
✓ Systematic checking of each component
✓ Used command-line tools to verify services

### What Could Be Improved
📝 **Add startup validation:** The app could check for required config on startup
📝 **Better documentation:** Clear naming conventions for environment variables
📝 **Pre-flight checklist:** Verify all services and config before testing

### Preventive Measures

| Action | Owner | Priority |
|--------|-------|----------|
| Document all required environment variables in README | Developer | High |
| Add config validation to app startup | Developer | Medium |
| Create startup script that verifies all services | DevOps | Low |

---

## Verification Steps (How We Know It's Fixed)

1. ✓ Backend server running on port 3212
2. ✓ Frontend server running on port 5174
3. ✓ Environment variable correctly set
4. ✓ Database contains test data (2 records)
5. ✓ Application can successfully query and display data

---

## Glossary

| Term | Simple Explanation |
|------|-------------------|
| **Backend** | The part of the application that stores and processes data (like the kitchen) |
| **Frontend** | The part of the application users see and interact with (like the dining room) |
| **Environment Variable** | A setting stored in a file that configures how the application runs |
| **Port** | Like a door number - helps different services communicate without confusion |
| **Vite** | A tool that runs the web application during development |
| **Convex** | The database service that stores and retrieves the application's data |

---

## Update #1: Vite Proxy Configuration Issue (January 15, 2026)

### Additional Issue Discovered

After fixing the environment variable issue, a **second issue** was discovered: `net::ERR_ABORTED 404 (Not Found)` when trying to load `/convex/_generated/api.js`.

### Root Cause

The Vite proxy configuration in `vite.config.js` was forwarding **all** `/convex` requests to the Convex backend at `http://localhost:3210`. This included the local `_generated` files which should have been served by Vite's module resolution from the filesystem.

### What Was Wrong

```javascript
// BEFORE (Incorrect)
proxy: {
  '/convex': {  // ← Too broad! Captures ALL /convex paths
    target: 'http://localhost:3210',
    changeOrigin: true,
    ws: true,
  }
}
```

**The problem:** When the browser tried to access the local file `convex/_generated/api.js`, the proxy intercepted the request and forwarded it to the backend, which doesn't serve these files.

### The Fix

Updated `vite.config.js` to only proxy API requests to the backend:

```javascript
// AFTER (Correct)
proxy: {
  '/convex/api': {  // ← Only proxy API calls
    target: 'http://localhost:3210',
    changeOrigin: true,
    ws: true,
    rewrite: (path) => path.replace(/^\/convex\/api/, '/api'),
  }
}
```

Also added path resolution alias for cleaner imports:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Verification

```bash
# After restart, the file should be accessible
curl http://localhost:5174/convex/_generated/api.js
# Returns 200 OK with the file contents
```

### Lessons Learned (Update)

| Issue | Prevention |
|-------|------------|
| Vite proxy too broad, catching local file requests | Be specific with proxy paths - only proxy what needs to go to backend |
| Local `_generated` files being forwarded to backend | Understand that local files should be resolved by Vite's module resolution, not HTTP requests |

**Updated Status:** ✅ FULLY RESOLVED

---

## Update History

| Date | Update | Author |
|------|--------|--------|
| Jan 15, 2026 | Initial RCA - Environment variable issue | Claude Code Assistant |
| Jan 15, 2026 | Update #1 - Vite proxy configuration issue | Claude Code Assistant |

---

**Report Generated:** January 15, 2026
**Author:** Claude Code Assistant
**Status:** ✅ FULLY RESOLVED

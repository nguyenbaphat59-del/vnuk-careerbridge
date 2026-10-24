# VNUK CareerBridge v3.3 — route, loading and navigation fixes

VNUK CareerBridge is a responsive internship-preparation planner. It guides students from registration to profile setup, a demo skill-gap review with a radar chart, a personalised learning plan, and progress tracking.

## v3.2 fixes

- **Blank workspace after navigation:** reset document and main-area scroll positions on each route change. This prevents a shorter page from opening at the scroll offset of the previous page.
- **No repeated full-page loading:** successful plan data is cached per account in memory. Overview and My Roadmap reuse the cached response when switching tabs; task actions refresh it, and saving profile/onboarding invalidates it.
- **Smoother transitions:** removed nested route-level opacity/blur transitions that compounded with each page's own animation. New pages use a short, low-cost motion transition; blur filters are not used on the full page content.
- **Clear loading/error states:** loading has a visible glass surface and status text. Dashboard and My Roadmap show an actionable retry state if the API is unavailable instead of silently rendering an empty area.
- **Radar chart safety:** each chart instance has a unique SVG gradient id, preventing fill collisions during route transitions.
- **Dates:** roadmap task dates use local calendar dates, avoiding off-by-one dates caused by converting local midnight to UTC.
- **Local device testing:** the API URL follows the current browser hostname by default, and the demo API allows localhost and private LAN development origins on local ports. `VITE_API_URL` and `CLIENT_ORIGIN` remain configurable.
- **Automated service tests:** `npm run test:server` tests role-based analysis, roadmap length, daily time boundaries, calendar date sequencing, and target-date shortening.

## v3.3 branding update

- Applied the **VNUK CareerBridge** identity across sign-in, registration, password recovery, onboarding, the AI assessment screen, dashboard, roadmap, profile/settings, error states, and footer.
- Updated the browser tab title and page description, API health response, server log messages, setup script, and package names.
- Styled the wordmark with **VNUK** in navy and **CareerBridge** in wine red to match the existing VNUK-inspired palette.
- Kept the existing localStorage key names for authentication and language preferences so this branding-only update does not unnecessarily invalidate saved demo sessions or language choice.

## Features

- Account creation and sign-in, forgot/reset password demo, password change, account switching, and account deletion.
- First-run flow: register → personal information → skill-gap/radar review → dashboard.
- Profile fields: name, age, study field, target role, interests, current skills, career goal, optional job description, plan length, daily focus time, and target application date.
- Six-dimension skill radar: technical skills, communication, English, problem-solving, practical projects, and career clarity.
- Roadmap strengths, gaps, JD keyword signals, and day/week/month task views.
- Task focus timer, start/reset/complete actions, progress tracking, and a compact dashboard.
- VN·UK-inspired wine red and navy Liquid Glass appearance, bottom dock navigation, responsive layouts, and Vietnamese/English selection.
- JSON file persistence for the demo.

## Requirements

- Node.js 20+ recommended
- npm

## Windows quick start

1. Extract this ZIP to a new folder.
2. Run `setup.bat`.
3. Run `start.bat`.
4. Open `http://localhost:5173`.
5. Check backend health at `http://localhost:4000/api/health`.

To run tests without installing Express or frontend packages, run:

```bash
npm --prefix server test
```

To install dependencies and build the frontend:

```bash
npm install
npm --prefix server install
npm --prefix client install
npm run build
```

If port 5173 is already used, Vite may select another port. The local demo CORS policy accepts localhost and private LAN development origins; for hosted deployment, configure the allowed `CLIENT_ORIGIN` and `VITE_API_URL` explicitly.

## Demo AI note

The current backend uses deterministic role-based rules and text matching. It does not call ChatGPT and does not need an API key. Radar scores are heuristic estimates, not validated skill assessments or hiring predictions. A real AI integration should remain server-side and validate structured output before storing it.

## Data and production caveats

Account and task data are stored in `server/data/db.json`. The password-reset token is shown in the UI only for demonstration; no email is sent. Before production deployment, replace JSON storage with a database, set a strong `JWT_SECRET`, configure explicit CORS origins, implement rate limiting and email-based recovery, and add further security controls.

## Troubleshooting a blank page

1. Stop both running processes with `Ctrl + C`.
2. Extract the updated ZIP into a new folder (do not mix it with an older `node_modules` tree).
3. Run `setup.bat`, then `start.bat`.
4. Navigate between Overview, My Roadmap, and Profile & Settings. The page should reset to the top and keep cached roadmap data while switching tabs.
5. If the API is unreachable, use the visible retry state and verify `/api/health`. If a React render error occurs, the route error boundary displays its message in the content region.

## Validation in this build environment

- Parsed all 15 frontend JS/JSX files with the TypeScript JSX parser: no syntax diagnostics.
- Checked all backend JavaScript files with `node --check`.
- Checked CSS brace balance and package JSON syntax.
- Ran service-level automated tests.
- A full Vite production build and real browser end-to-end run could not be performed here because the npm registry is not reachable and dependencies are not cached. Install dependencies on a machine with registry access to perform that final build.

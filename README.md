# 🧩 Business Central Apps Tracker

Discover what’s new on Microsoft AppSource — day by day — with a simple, friendly tracker you can run locally. Pick a date, see the newly published apps for that day, and jump straight to their AppSource pages.🎉

> TL;DR: Run the backend once to fetch new apps, then use the frontend to browse by Year/Month/Day. Week is handled automatically behind the scenes.

## 🌟 Highlights
- 🆕 New apps detected daily and stored in tidy folders
- 📅 Browse by Year/Month/Day (week is auto-calculated)
- 🃏 Clean, card-based UI with direct AppSource links
- 💾 Simple JSON storage — no database needed
- ⚡ Works offline with a basic static server

## 🗺️ Project Map

```
bc-marketplace-apps-tracker/
├── backend/
│   ├── script.js              # Fetch + diff new apps
│   ├── apps.json              # Master list (all known apps)
│   └── year_YYYY/month_MM/week_WW/
│       └── DD.json            # New apps on calendar day DD
├── app.js                     # Frontend logic
├── index.html                 # Frontend page
├── style.css                  # Frontend styles
└── README.md
```

## 🚀 Quick Start

1) Run the tracker (backend):

```bash
cd backend
npm i axios
node script.js
```

2) Open the viewer (frontend):
- Use a static server so fetch works:

```bash
# From repo root
npx http-server -p 8080 -c-1 .
# Then open http://localhost:8080/bc-marketplace-apps-tracker/
```

Or use VS Code “Live Server” extension from the repo root.

## 🖥️ Using the Frontend
- Set Year, Month, Day in the inputs
- Click “Load Apps”
- The app computes the ISO week internally and loads the file:
  - `backend/year_YYYY/month_MM/week_WW/DD.json`
- Example: 2026-01-05 → week_02 → loads `5.json`

## 🔧 Config & Behavior

Backend (`backend/script.js`):
- Pulls AppSource tiles via the `url` endpoint
- Compares to `apps.json` and saves only new apps under the current week/day
- Updates `apps.json` after every run

Frontend (`app.js`):
- Inputs for Year/Month/Day only
- Week is auto-calculated from the selected date
- Renders app cards with title, publisher, description, and link

## 📊 Data Shape

Daily files (e.g., `backend/year_2026/month_01/week_02/5.json`):
```json
[
  {
    "entityId": "PUBID...|AID...|PAPPID...",
    "title": "Contoso App",
    "publisher": "Contoso Ltd.",
    "detailPageUrl": "https://...",
    "ratingAverage": 0,
    "ratingCount": 0
  }
]
```

Master list (`backend/apps.json`) contains all known apps.

## 🧠 How It Works
1. Fetch AppSource listing pages (paginated)
2. Compare with the previous `apps.json`
3. Save only new apps into `year/month/week/day` by calendar day
4. Update the master `apps.json`
5. Frontend loads the single `DD.json` for the chosen date

## ⏰ Automate It (Optional)
Schedule a daily run:

Windows Task Scheduler
- Program: `node`
- Arguments: `C:\path\to\backend\script.js`
- Start in: `C:\path\to\backend`

Linux/Mac cron
```bash
0 9 * * * cd /path/to/backend && node script.js >> tracker.log 2>&1
```

## 🧩 Tips
- First run: everything looks “new” — expected!
- Serve via a static server (fetch requires http://)
- Folder names are zero-padded: `month_01`, `week_02`, etc.
- If a date shows “No new apps”, that day-file likely wasn’t created.

## 🤝 Contribute Ideas
- Add search and filters in the UI
- Export to CSV/Excel
- Notifications for new apps
- Trend charts by week/month

---

Happy tracking! ✨

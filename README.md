# 🧩 AppSource Business Central Tracker

Track and monitor new Microsoft Dynamics 365 Business Central apps published on AppSource. This application automatically fetches, compares, and stores newly published apps in an organized directory structure, with a beautiful web interface to browse and explore the apps.

## 📋 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Frontend Application](#-frontend-application)
- [Data Structure](#-data-structure)
- [How It Works](#-how-it-works)
- [Scheduling](#-scheduling)

## 🚀 Features

### Backend Tracker
* 🔍 **Automatic Fetching**: Retrieves all Business Central apps from Microsoft AppSource API
* 🆕 **Change Detection**: Identifies newly added apps since the last run
* 📁 **Organized Storage**: Saves apps in a hierarchical structure by year/month/week/day
* 💾 **Master List**: Maintains an updated `apps.json` file with all known apps
* 📊 **ISO Week Support**: Uses ISO 8601 week numbering for consistency
* ⚡ **Pagination Support**: Handles large datasets with automatic pagination

### Frontend Viewer
* 🎨 **Modern UI**: Beautiful gradient design with smooth animations
* 📅 **Date Navigation**: Easily browse apps by year, month, and week
* 🃏 **Card Layout**: Displays apps in an intuitive card-based interface
* 🔗 **Direct Links**: Quick access to AppSource pages for each app
* 📊 **Statistics**: Shows total apps and daily breakdown
* 📱 **Responsive Design**: Works on desktop and mobile devices
* ⭐ **App Details**: Displays ratings, categories, publishers, and descriptions

## 📂 Project Structure

```
bc-marketplace-apps-tracker/
│
├── backend/
│   ├── script.js              # Main tracking script
│   ├── apps.json              # Master list of all apps
│   │
│   └── year_2026/
│       └── month_01/
│           └── week_01/
│               ├── 01.json    # Apps found on day 1
│               ├── 02.json    # Apps found on day 2
│               └── ...
│
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── style.css              # Styling and layout
│   └── app.js                 # JavaScript for loading/displaying apps
│
└── README.md                  # This file
```

## 🔧 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Steps

1. **Clone or download the repository**
   ```bash
   cd bc-marketplace-apps-tracker
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install axios
   ```

3. **Verify installation**
   ```bash
   node script.js
   ```

## 💻 Usage

### Running the Tracker

Navigate to the backend folder and run the script:

```bash
cd backend
node script.js
```

**Expected Output:**
```
📅 Today: Wed Jan 01 2026 (Week 1)
🚀 Starting App Tracker...
✅ Fetching apps from page 1
✅ Fetching apps from page 2
...
🆕 15 new apps found today!
💾 New apps saved to: backend/year_2026/month_01/week_01/1.json
✅ apps.json updated.
```

### Viewing Apps in the Frontend

1. **Open the frontend**
   - Navigate to the `frontend` folder
   - Open `index.html` in your web browser
   - Or use a local server for better experience:
     ```bash
     cd frontend
     python -m http.server 8000
     # Then open http://localhost:8000
     ```

2. **Browse apps**
   - Select year, month, and week using the input fields
   - Click "Load Apps" to view new apps for that period
   - Scroll through the app cards to see details
   - Click "View on AppSource" to open the app's page

## ⚙️ Configuration

### Backend Settings

Edit `backend/script.js` to customize:

```javascript
// API endpoint configuration
const url = 'https://appsource.microsoft.com/view/tiledata?...';

// Maximum pages to fetch (set lower to speed up testing)
const pageCount = 999;
```

### Frontend Settings

Edit `frontend/app.js` to customize:

```javascript
// Default date values are automatically set to current date
// Modify the loadApps() function to change default behavior
```

## 🌐 Frontend Application

### Features in Detail

**Date Selector**
- Year input (2020-2030)
- Month input (1-12)
- Week input (1-53) using ISO 8601 standard
- Auto-loads current week on page load

**App Cards Display**
- App icon or placeholder with first letter
- App name and publisher
- Description/summary
- Rating and review count
- Categories
- Supported countries
- Direct link to AppSource

**User Experience**
- Smooth hover animations
- Loading states
- Error handling
- Empty state messages
- Grouped by day within the week

## 📊 Data Structure

### apps.json (Master List)
Contains all apps ever discovered:
```json
[
  {
    "entityId": "unique-app-id",
    "displayName": "App Name",
    "publisherName": "Publisher Name",
    "description": "App description...",
    "ratingAverage": 4.5,
    "ratingCount": 120,
    "categories": ["Sales", "Finance"],
    "detailPageUrl": "https://...",
    "imageUrl": "https://...",
    ...
  }
]
```

### Daily JSON Files (e.g., 01.json)
Contains only new apps discovered on that day:
```json
[
  {
    "entityId": "new-app-id",
    "displayName": "New App Name",
    ...
  }
]
```

## 🔄 How It Works

1. **Fetching**: Script queries the AppSource API page by page
2. **Comparison**: Compares fetched apps against the master `apps.json` list
3. **Detection**: Identifies apps that don't exist in the master list
4. **Storage**: Saves new apps in the current week/day folder
5. **Update**: Updates the master list with all current apps

### Week Calculation
Uses ISO 8601 week date system:
- Week starts on Monday
- Week 1 is the week with the year's first Thursday
- Ensures consistent week numbering globally

## ⏰ Scheduling

### Windows Task Scheduler

Run the tracker automatically every day:

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at your preferred time
4. Action: Start a program
   - Program: `node`
   - Arguments: `C:\path\to\backend\script.js`
   - Start in: `C:\path\to\backend`

### Linux/Mac Cron

Add to crontab (`crontab -e`):
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/backend && node script.js >> tracker.log 2>&1
```

### Alternative: Node Scheduler

Install `node-cron`:
```bash
npm install node-cron
```

Create a wrapper script:
```javascript
const cron = require('node-cron');
const { exec } = require('child_process');

// Run every day at 9 AM
cron.schedule('0 9 * * *', () => {
  exec('node script.js', (error, stdout, stderr) => {
    console.log(stdout);
  });
});
```

## 📝 Notes

- **First Run**: On the first execution, all apps will be considered "new"
- **Incremental**: Subsequent runs only detect truly new apps
- **API Limits**: Be mindful of API rate limits if running very frequently
- **Storage**: Each week creates a new folder; old data is preserved
- **No Database**: Uses simple JSON files for easy portability

## 🤝 Contributing

Suggestions and improvements are welcome! Common enhancements:
- Add filtering and search in frontend
- Export data to CSV/Excel
- Email notifications for new apps
- Trend analysis and charts
- App comparison features

## 📄 License

This project is open source and available for personal and commercial use.

---

**Happy Tracking! 🎉**

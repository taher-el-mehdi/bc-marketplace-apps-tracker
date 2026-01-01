const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Configuration
const url = 'https://appsource.microsoft.com/view/tiledata?ReviewsMyCommentsFilter=true&country=US&entityType=App&product=dynamics-365-business-central&region=ALL';
const pageCount = 999;

// ----------------------------
// 🧩 Utilities
// ----------------------------

// Compute ISO week number
function getWeekNumber(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNumber =
    1 +
    Math.round(
      ((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
    );
  return weekNumber;
}

// Ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
// ----------------------------
// 📦 Core logic
// ----------------------------

async function fetchAppData() {
  let apps = [];
  for (let page = 1; page <= pageCount; page++) {
    const query = `${url}&page=${page}`;
    console.log(`✅ Fetching apps from page ${page}`);
    try {
      const response = await axios.get(query);
      const data = response.data;
      apps = apps.concat(data.apps.dataList);
      if (data.apps.dataList.length === 0) {
        console.log(`ℹ️ No more apps found after page ${page}. Stopping fetch.`);
        return apps; // No more data
      }
    } catch (error) {
      console.log(`🔴 Error fetching page ${page}: ${error.message}`);
    }
  }
  return apps;
}

function compareAppLists(oldList, newList) {
  return newList.filter(app => !oldList.find(entity => entity.entityId === app.entityId));
}

async function trackNewApps() {
  console.log("🚀 Starting App Tracker...");

  const newApps = await fetchAppData();

  // Load previously saved apps
  let oldApps = [];
  const oldFilePath = path.join(__dirname, 'apps.json');
  if (fs.existsSync(oldFilePath)) {
    oldApps = JSON.parse(fs.readFileSync(oldFilePath, 'utf-8'));
  }

  const addedApps = compareAppLists(oldApps, newApps);
  const weekNumber = getWeekNumber(new Date());
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const formattedWeek = String(weekNumber).padStart(2, '0');
  const weekDir = path.join(__dirname, `year_${currentYear}`, `month_${currentMonth}`, `week_${formattedWeek}`);
  ensureDir(weekDir);

  if (addedApps.length > 0) {
    console.log(`🆕 ${addedApps.length} new apps found today!`);
    const filename = path.join(weekDir, `${(new Date()).getDate()}.json`);
    fs.writeFileSync(filename, JSON.stringify(addedApps, null, 2));
    console.log(`💾 New apps saved to: ${filename}`);
  } else {
    console.log('ℹ️ No new apps today.');
  }

  // Save latest app list
  fs.writeFileSync(oldFilePath, JSON.stringify(newApps, null, 2));
  console.log('✅ apps.json updated.');
}

// ----------------------------
// 🗓️ Run
// ----------------------------
(async () => {
  const today = new Date();
  const weekNumber = getWeekNumber(today);
  console.log(`📅 Today: ${today.toDateString()} (Week ${weekNumber})`);
  await trackNewApps();
})();
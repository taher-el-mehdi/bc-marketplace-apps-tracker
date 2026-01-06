// Get current date to set defaults
const today = new Date();
document.getElementById('year').value = today.getFullYear();
document.getElementById('month').value = today.getMonth() + 1;
document.getElementById('day').value = today.getDate();

// Load apps when button is clicked
document.getElementById('loadBtn').addEventListener('click', loadApps);

// Load on Enter key
['year', 'month', 'day'].forEach(id => {
    document.getElementById(id).addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadApps();
    });
});

async function loadApps() {
    const year = document.getElementById('year').value;
    const month = String(document.getElementById('month').value).padStart(2, '0');
    const day = parseInt(document.getElementById('day').value, 10);
    
    const appsList = document.getElementById('appsList');
    const stats = document.getElementById('stats');
    
    appsList.innerHTML = '<p class="loading">⏳ Loading apps...</p>';
    stats.innerHTML = '';
    
    try {
        // Compute ISO week from the selected Year/Month/Day
        const selectedDate = new Date(Number(year), Number(month) - 1, Number(day));
        const weekNumber = getISOWeekNumber(selectedDate);
        const week = String(weekNumber).padStart(2, '0');

        // Construct the path to the computed week folder
        const weekPath = `../bc-marketplace-apps-tracker/backend/year_${year}/month_${month}/week_${week}`;

        // Fetch apps for the selected calendar day (day-of-month)
        const response = await fetch(`${weekPath}/${day}.json`);

        if (!response.ok) {
            appsList.innerHTML = '<p class="empty-state">📭 No new apps found for the selected day</p>';
            stats.innerHTML = `📊 Year ${year}, Month ${month}, Day ${day}`;
            return;
        }

        const apps = await response.json();

        // Display stats (no week shown)
        stats.innerHTML = `📊 Found <strong>${apps.length}</strong> new apps on Year ${year}, Month ${month}, Day ${day}`;

        // Display apps for the day
        appsList.innerHTML = '';
        const daySection = document.createElement('div');
        daySection.className = 'day-section';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `<h2>Day ${day} <span class="day-count">(${apps.length} apps)</span></h2>`;
        daySection.appendChild(dayHeader);

        apps.forEach(app => {
            const appCard = createAppCard(app);
            daySection.appendChild(appCard);
        });

        appsList.appendChild(daySection);

    } catch (error) {
        console.error('Error loading apps:', error);
        appsList.innerHTML = '<p class="error-state">❌ Error loading apps. Make sure the folder structure exists.</p>';
    }
}

function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.style.cursor = 'pointer';
    card.onclick = () => {
        if (app.entityId) {
            window.open('https://marketplace.microsoft.com/en-us/product/dynamics-365-business-central/'+app.entityId, '_blank');
        }
    }
    const header = document.createElement('div');
    header.className = 'app-header';
    
    // App icon or placeholder
    if (app.iconURL) {
        const icon = document.createElement('img');
        icon.className = 'app-icon';
        icon.src = app.iconURL;
        icon.alt = app.displayName || app.name || 'App icon';
        icon.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'app-icon-placeholder';
            placeholder.textContent = (app.displayName || app.name || 'A')[0].toUpperCase();
            this.parentNode.insertBefore(placeholder, this);
        };
        header.appendChild(icon);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'app-icon-placeholder';
        placeholder.textContent = (app.displayName || app.name || 'A')[0].toUpperCase();
        header.appendChild(placeholder);
    }
    
    const info = document.createElement('div');
    info.className = 'app-info';
    
    const title = document.createElement('h3');
    title.className = 'app-title';
    title.textContent = app.title || 'Unknown App';
    info.appendChild(title);
    
    if (app.publisherName || app.publisher) {
        const publisher = document.createElement('div');
        publisher.className = 'app-publisher';
        publisher.textContent = `By ${app.publisherName || app.publisher}`;
        info.appendChild(publisher);
    }
    
    if (app.description || app.summary) {
        const description = document.createElement('p');
        description.className = 'app-description';
        description.textContent = app.description || app.summary;
        info.appendChild(description);
    }
    
    const meta = document.createElement('div');
    meta.className = 'app-meta';
    
    if (app.ratingAverage !== undefined) {
        const rating = document.createElement('div');
        rating.className = 'app-meta-item';
        rating.innerHTML = `⭐ <strong>Rating:</strong> ${app.ratingAverage} (${app.ratingCount || 0} reviews)`;
        meta.appendChild(rating);
    }
    
    if (app.categories && app.categories.length > 0) {
        const category = document.createElement('div');
        category.className = 'app-meta-item';
        category.innerHTML = `📁 <strong>Category:</strong> ${app.categories.join(', ')}`;
        meta.appendChild(category);
    }
    
    if (app.supportedCountries) {
        const countries = document.createElement('div');
        countries.className = 'app-meta-item';
        countries.innerHTML = `🌍 <strong>Countries:</strong> ${app.supportedCountries}`;
        meta.appendChild(countries);
    }
    
    info.appendChild(meta);
    
    if (app.detailPageUrl || app.url) {
        const link = document.createElement('a');
        link.className = 'app-link';
        link.href = app.detailPageUrl || app.url;
        link.target = '_blank';
        link.textContent = 'View on AppSource →';
        info.appendChild(link);
    }
    
    header.appendChild(info);
    card.appendChild(header);
    
    return card;
}

// Load initial data on page load
window.addEventListener('load', () => {
    document.getElementById('day').value = today.getDate();
    loadApps();
});

function getISOWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const weekNumber = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
    return weekNumber;
}

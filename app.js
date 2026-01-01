// Get current date to set defaults
const today = new Date();
document.getElementById('year').value = today.getFullYear();
document.getElementById('month').value = today.getMonth() + 1;

// Load apps when button is clicked
document.getElementById('loadBtn').addEventListener('click', loadApps);

// Load on Enter key
['year', 'month', 'week'].forEach(id => {
    document.getElementById(id).addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadApps();
    });
});

async function loadApps() {
    const year = document.getElementById('year').value;
    const month = String(document.getElementById('month').value).padStart(2, '0');
    const week = String(document.getElementById('week').value).padStart(2, '0');
    
    const appsList = document.getElementById('appsList');
    const stats = document.getElementById('stats');
    
    appsList.innerHTML = '<p class="loading">⏳ Loading apps...</p>';
    stats.innerHTML = '';
    
    try {
        // Construct the path to the week folder
        const weekPath = `../bc-marketplace-apps-tracker/backend/year_${year}/month_${month}/week_${week}`;
        
        // Try to fetch day files (1-7 for the week)
        const dayFiles = [];
        let totalApps = 0;
        
        for (let day = 1; day <= 7; day++) {
            try {
                const dayFile = `${day}.json`;
                const response = await fetch(`${weekPath}/${dayFile}`);
                
                if (response.ok) {
                    const apps = await response.json();
                    if (apps.length > 0) {
                        dayFiles.push({ day, apps });
                        totalApps += apps.length;
                    }
                }
            } catch (err) {
                // File doesn't exist, skip
            }
        }
        
        if (dayFiles.length === 0) {
            appsList.innerHTML = '<p class="empty-state">📭 No new apps found for this week</p>';
            return;
        }
        
        // Display stats
        stats.innerHTML = `📊 Found <strong>${totalApps}</strong> new apps across <strong>${dayFiles.length}</strong> days in Year ${year}, Month ${month}, Week ${week}`;
        
        // Display apps grouped by day
        appsList.innerHTML = '';
        dayFiles.forEach(({ day, apps }) => {
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
        });
        
    } catch (error) {
        console.error('Error loading apps:', error);
        appsList.innerHTML = '<p class="error-state">❌ Error loading apps. Make sure the folder structure exists.</p>';
    }
}

function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    
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
    // Calculate ISO week number
    const weekNumber = getISOWeekNumber(today);
    document.getElementById('week').value = weekNumber;
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

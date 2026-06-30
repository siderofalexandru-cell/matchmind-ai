// ============= GLOBAL STATE =============
let state = {
    currentPage: 'home',
    selectedMatch: null,
    matches: [],
    history: [],
    settings: {
        notifications: true
    }
};

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Initializing MatchMind AI');
    initializeApp();
    setupEventListeners();
    loadSettings();
    
    // Show home page by default
    console.log('Setting initial page to: home');
    navigateTo('home');
});

function initializeApp() {
    console.log('initializeApp() called');
    // Load API key if exists
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (apiKey) {
        console.log('API Key found in storage');
        api.setApiKey(apiKey);
    } else {
        console.log('No API Key found in storage');
    }
    loadHistory();
}

function setupEventListeners() {
    console.log('setupEventListeners() called');
    
    // Navigation buttons - Setup with data-page attribute
    const navBtns = document.querySelectorAll('.nav-btn');
    console.log(`Found ${navBtns.length} navigation buttons`);
    
    navBtns.forEach((btn, index) => {
        const pageId = btn.dataset.page;
        console.log(`Setting up nav button ${index}: page="${pageId}"`);
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`✓ Nav button clicked: "${pageId}"`);
            navigateTo(pageId);
        });
    });

    // Settings - API Key input
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('change', () => {
            console.log('API Key input changed');
            const key = document.getElementById('apiKey').value;
            if (key) {
                api.setApiKey(key);
                showToast('API Key saved', 'success');
                console.log('API Key saved successfully');
            }
        });
    }

    // Settings - Notifications toggle
    const notifToggle = document.getElementById('notifications');
    if (notifToggle) {
        notifToggle.addEventListener('change', (e) => {
            console.log('Notifications toggle changed:', e.target.checked);
            state.settings.notifications = e.target.checked;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
        });
    }
    
    console.log('Event listeners setup complete');
}

// ============= NAVIGATION =============
function navigateTo(pageId) {
    console.log(`\n=== NAVIGATING TO: "${pageId}" ===`);
    
    if (!pageId) {
        console.warn('pageId is empty or undefined');
        return;
    }

    // Hide all pages
    console.log('Hiding all pages...');
    const allPages = document.querySelectorAll('.page');
    console.log(`Found ${allPages.length} pages`);
    allPages.forEach(p => {
        p.classList.remove('active');
    });

    // Remove active from all nav buttons
    console.log('Removing active state from all nav buttons...');
    const allBtns = document.querySelectorAll('.nav-btn');
    allBtns.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected page
    console.log(`Showing page: #${pageId}`);
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        console.log(`✓ Page "${pageId}" is now active`);
    } else {
        console.warn(`Page "#${pageId}" not found in DOM`);
    }

    // Set active button
    console.log(`Setting active button for page: ${pageId}`);
    const activeBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log(`✓ Nav button for "${pageId}" is now active`);
    } else {
        console.warn(`Nav button with data-page="${pageId}" not found`);
    }

    state.currentPage = pageId;
    console.log(`State updated: currentPage = "${pageId}"`);

    // Page-specific actions
    console.log(`Running page-specific actions for: ${pageId}`);
    if (pageId === 'today') {
        console.log('Loading today\'s matches...');
        loadTodayMatches();
    } else if (pageId === 'history') {
        console.log('Displaying history...');
        displayHistory();
    } else if (pageId === 'settings') {
        console.log('Loading settings UI...');
        loadSettingsUI();
    } else if (pageId === 'search') {
        console.log('Focusing search input...');
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                console.log('✓ Search input focused');
            }
        }, 100);
    } else if (pageId === 'home') {
        console.log('Home page loaded');
    }
    
    console.log(`=== NAVIGATION COMPLETE ===\n`);
}

// ============= TODAY'S MATCHES =============
async function loadTodayMatches() {
    console.log('loadTodayMatches() called');
    const container = document.getElementById('matchesContainer');
    const statusEl = document.getElementById('apiStatus');

    if (!api.getApiKey()) {
        console.warn('No API Key configured');
        showApiStatus('API Key missing. Configure in Settings.', 'error');
        container.innerHTML = '<div class="no-history">Configure API Key in Settings</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Încarcă meciuri...</div>';
    console.log('Loading matches from API...');

    try {
        const fixtures = await api.getTodayFixtures();
        state.matches = fixtures;
        console.log(`Loaded ${fixtures.length} fixtures`);
        displayMatches(fixtures);
        showApiStatus('Matches loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading matches:', error);
        showApiStatus(`Error: ${error.message}`, 'error');
        container.innerHTML = `<div class="no-history">Error: ${error.message}</div>`;
    }
}

function displayMatches(fixtures) {
    console.log(`displayMatches() called with ${fixtures.length} fixtures`);
    const container = document.getElementById('matchesContainer');

    if (!fixtures || fixtures.length === 0) {
        console.log('No fixtures available');
        container.innerHTML = '<div class="no-history">No matches today</div>';
        return;
    }

    const html = fixtures.map(fixture => createMatchCard(fixture)).join('');
    container.innerHTML = html;
    console.log('Match cards rendered');

    // Add click listeners
    document.querySelectorAll('.match-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            console.log(`Match card clicked: ${fixtures[index].teams.home.name} vs ${fixtures[index].teams.away.name}`);
            showMatchDetails(fixtures[index]);
        });
    });
}

function createMatchCard(fixture) {
    const homeTeam = fixture.teams.home.name;
    const awayTeam = fixture.teams.away.name;
    const homeScore = fixture.score.fulltime.home;
    const awayScore = fixture.score.fulltime.away;
    const status = fixture.fixture.status.short;
    const time = fixture.fixture.time || 'TBD';
    const league = fixture.league.name;
    const round = fixture.league.round || '';

    let statusClass = 'scheduled';
    let statusText = 'Scheduled';

    if (status === 'LIVE') {
        statusClass = 'live';
        statusText = 'LIVE';
    } else if (status === 'FT' || status === 'AET' || status === 'PEN') {
        statusClass = 'finished';
        statusText = 'Finished';
    }

    const scoreDisplay = homeScore !== null && awayScore !== null ? `${homeScore}-${awayScore}` : '-';

    return `
        <div class="match-card">
            <div class="match-header">
                <div>
                    <div class="match-time">${time}</div>
                    <div class="match-league">${league} ${round}</div>
                </div>
                <span class="match-status ${statusClass}">${statusText}</span>
            </div>
            <div class="match-teams">
                <div class="match-team">
                    <div class="match-team-flag">⚽</div>
                    <div class="match-team-name">${homeTeam}</div>
                </div>
                <div class="match-score">
                    <div class="match-score-value">${scoreDisplay}</div>
                </div>
                <div class="match-team">
                    <div class="match-team-flag">⚽</div>
                    <div class="match-team-name">${awayTeam}</div>
                </div>
            </div>
            <div class="match-info">
                <div>${fixture.fixture.venue?.name || 'Stadium TBD'}</div>
            </div>
        </div>
    `;
}

// ============= MATCH DETAILS =============
async function showMatchDetails(fixture) {
    console.log('showMatchDetails() called');
    // Save to history
    addToHistory(fixture);

    // Navigate to details page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('match-details')?.classList.add('active');

    const container = document.getElementById('matchDetailsContainer');
    container.innerHTML = '<div class="loading">Analyzing match...</div>';

    try {
        // Get analysis
        const analysis = await analyzeMatch(fixture);

        const html = `
            <div class="match-details-container">
                <button class="btn btn-secondary" onclick="navigateTo('today')" style="margin-bottom: 2rem;">← Back to Matches</button>

                <div class="match-details-header">
                    <div class="match-details-match">
                        <div class="match-details-team">
                            <div class="match-details-team-flag">⚽</div>
                            <div class="match-details-team-name">${fixture.teams.home.name}</div>
                        </div>
                        <div class="match-details-score">
                            <div class="match-details-score-value">
                                ${fixture.score.fulltime.home !== null ? fixture.score.fulltime.home : '-'}
                                <span style="color: var(--text-secondary); font-size: 2rem;">-</span>
                                ${fixture.score.fulltime.away !== null ? fixture.score.fulltime.away : '-'}
                            </div>
                            <div class="match-details-date">${new Date(fixture.fixture.date).toLocaleDateString('ro-RO')}</div>
                            <div class="match-league">${fixture.league.name}</div>
                        </div>
                        <div class="match-details-team">
                            <div class="match-details-team-flag">⚽</div>
                            <div class="match-details-team-name">${fixture.teams.away.name}</div>
                        </div>
                    </div>
                </div>

                <div class="analysis-grid">
                    ${analysis ? `
                        <div class="analysis-section ai-prediction">
                            <h3 class="analysis-section-title">🧠 MatchMind AI Prediction</h3>
                            <div class="confidence-score">${analysis.confidence}%</div>
                            <div class="analysis-stat">
                                <span class="analysis-stat-label">Confidence Level</span>
                                <span class="analysis-stat-value">${analysis.confidence > 75 ? 'Very High' : analysis.confidence > 60 ? 'High' : 'Medium'}</span>
                            </div>
                            <div class="analysis-stat">
                                <span class="analysis-stat-label">Expected Result</span>
                                <span class="analysis-stat-value">${analysis.prediction === '1' ? 'Home Win' : analysis.prediction === '2' ? 'Away Win' : 'Draw'}</span>
                            </div>
                        </div>

                        <div class="analysis-section">
                            <h3 class="analysis-section-title">📊 Predictions</h3>
                            <div class="analysis-stat">
                                <span class="analysis-stat-label">Both Teams to Score</span>
                                <span class="analysis-stat-value">${analysis.btts}%</span>
                            </div>
                            <div class="analysis-stat">
                                <span class="analysis-stat-label">Over 2.5 Goals</span>
                                <span class="analysis-stat-value">${analysis.over25}%</span>
                            </div>
                            <div class="analysis-stat">
                                <span class="analysis-stat-label">Estimated Corners</span>
                                <span class="analysis-stat-value">${analysis.corners.min}-${analysis.corners.max}</span>
                            </div>
                            <div class="analysis-stat">
                                <span class="analysis-stat-label">Estimated Cards</span>
                                <span class="analysis-stat-value">${analysis.cards.min}-${analysis.cards.max}</span>
                            </div>
                        </div>

                        <div class="analysis-section">
                            <h3 class="analysis-section-title">✅ Pro Arguments</h3>
                            <ul style="list-style: none;">
                                ${analysis.proArguments.map(arg => `<li style="padding: 0.5rem 0; color: var(--text-secondary);">• ${arg}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="analysis-section">
                            <h3 class="analysis-section-title">⚠️ Contra Arguments</h3>
                            <ul style="list-style: none;">
                                ${analysis.contraArguments.map(arg => `<li style="padding: 0.5rem 0; color: var(--text-secondary);">• ${arg}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(26, 31, 58, 0.5) 100%); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 2rem; color: var(--text-secondary);">
                    <p><strong>Disclaimer:</strong> MatchMind AI provides informative analysis based on historical data. It does not guarantee match results.</p>
                </div>
            </div>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Error analyzing match:', error);
        container.innerHTML = `<div class="no-history">Error: ${error.message}</div>`;
    }
}

// ============= SEARCH =============
async function performSearch() {
    console.log('performSearch() called');
    const input = document.getElementById('searchInput')?.value || '';
    const resultsContainer = document.getElementById('searchResults');

    if (!input.trim()) {
        console.log('Search input is empty');
        resultsContainer.innerHTML = '';
        return;
    }

    console.log(`Searching for: "${input}"`);
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const teams = await api.searchTeams(input);
        
        if (!teams || teams.length === 0) {
            console.log('No teams found');
            resultsContainer.innerHTML = '<div class="no-history">No teams found</div>';
            return;
        }

        console.log(`Found ${teams.length} teams`);
        const html = teams.map(team => `
            <div class="match-card" style="cursor: pointer;" onclick="searchTeamMatches(${team.id}, '${team.name}')">
                <div class="match-team-name">${team.name}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">${team.country}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `<div class="no-history">Error: ${error.message}</div>`;
    }
}

async function searchTeamMatches(teamId, teamName) {
    console.log(`searchTeamMatches() called: teamId=${teamId}, teamName="${teamName}"`);
    showToast(`Searching matches for ${teamName}...`, 'success');
    // This could be extended to show team's upcoming matches
}

// ============= HISTORY =============
function addToHistory(match) {
    console.log(`addToHistory() called: ${match.teams.home.name} vs ${match.teams.away.name}`);
    state.history = state.history.filter(m => m.fixture.id !== match.fixture.id);
    state.history.unshift(match);
    state.history = state.history.slice(0, 50);
    saveHistory();
}

function saveHistory() {
    console.log('saveHistory() called');
    localStorage.setItem(STORAGE_KEYS.API_KEY + '_history', JSON.stringify(state.history));
}

function loadHistory() {
    console.log('loadHistory() called');
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY + '_history');
    if (stored) {
        state.history = JSON.parse(stored);
        console.log(`Loaded ${state.history.length} items from history`);
    }
}

function displayHistory() {
    console.log('displayHistory() called');
    const container = document.getElementById('historyContainer');

    if (!state.history || state.history.length === 0) {
        console.log('No history items');
        container.innerHTML = '<div class="no-history">No analyzed matches</div>';
        return;
    }

    console.log(`Displaying ${state.history.length} history items`);
    const html = state.history.map(match => `
        <div class="history-item" onclick="showMatchDetails(${JSON.stringify(match).replace(/'/g, '\\'')})">  
            <div class="history-item-match">${match.teams.home.name} vs ${match.teams.away.name}</div>
            <div class="history-item-date">${new Date(match.fixture.date).toLocaleDateString('ro-RO')}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ============= SETTINGS =============
function loadSettings() {
    console.log('loadSettings() called');
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
        state.settings = JSON.parse(stored);
        console.log('Settings loaded from storage');
    }
}

function loadSettingsUI() {
    console.log('loadSettingsUI() called');
    const apiKeyInput = document.getElementById('apiKey');
    const notificationsToggle = document.getElementById('notifications');

    if (apiKeyInput && api.getApiKey()) {
        apiKeyInput.value = api.getApiKey();
        console.log('API Key populated in settings form');
    }

    if (notificationsToggle) {
        notificationsToggle.checked = state.settings.notifications;
        console.log('Notifications toggle set to:', state.settings.notifications);
    }
}

function saveSettings() {
    console.log('saveSettings() called');
    const apiKey = document.getElementById('apiKey')?.value;
    if (apiKey) {
        api.setApiKey(apiKey);
        console.log('API Key saved');
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    showToast('Settings saved', 'success');
}

function clearAllData() {
    console.log('clearAllData() called');
    if (confirm('Clear all data? This cannot be undone.')) {
        console.log('Clearing all data...');
        localStorage.clear();
        state = { currentPage: 'home', selectedMatch: null, matches: [], history: [], settings: { notifications: true } };
        api.clearCache();
        showToast('All data cleared', 'success');
        navigateTo('home');
        console.log('All data cleared successfully');
    }
}

// ============= UTILITIES =============
function refreshMatches() {
    console.log('refreshMatches() called');
    api.clearCache();
    loadTodayMatches();
}

function showApiStatus(message, type) {
    console.log(`showApiStatus(): ${type} - ${message}`);
    const statusEl = document.getElementById('apiStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `api-status show ${type}`;

    if (type !== 'error') {
        setTimeout(() => statusEl.classList.remove('show'), 5000);
    }
}

function showToast(message, type = 'success') {
    console.log(`showToast(): ${type} - ${message}`);
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => toast.classList.remove('show'), 3000);
}

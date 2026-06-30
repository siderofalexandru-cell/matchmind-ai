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
    initializeApp();
    setupEventListeners();
    loadSettings();
});

function initializeApp() {
    // Load API key if exists
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (apiKey) {
        api.setApiKey(apiKey);
    }
    loadHistory();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            navigateTo(e.currentTarget.dataset.page);
        });
    });

    // Settings
    document.getElementById('apiKey')?.addEventListener('change', () => {
        const key = document.getElementById('apiKey').value;
        if (key) {
            api.setApiKey(key);
            showToast('API Key saved', 'success');
        }
    });

    document.getElementById('notifications')?.addEventListener('change', (e) => {
        state.settings.notifications = e.target.checked;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    });
}

// ============= NAVIGATION =============
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Remove active from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }

    // Set active button
    document.querySelector(`.nav-btn[data-page="${pageId}"]`)?.classList.add('active');

    state.currentPage = pageId;

    // Page-specific actions
    if (pageId === 'today') {
        loadTodayMatches();
    } else if (pageId === 'history') {
        displayHistory();
    } else if (pageId === 'settings') {
        loadSettingsUI();
    } else if (pageId === 'search') {
        document.getElementById('searchInput')?.focus();
    }
}

// ============= TODAY'S MATCHES =============
async function loadTodayMatches() {
    const container = document.getElementById('matchesContainer');
    const statusEl = document.getElementById('apiStatus');

    if (!api.getApiKey()) {
        showApiStatus('API Key missing. Configure in Settings.', 'error');
        container.innerHTML = '<div class="no-history">Configure API Key in Settings</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Loading today\'s matches...</div>';

    try {
        const fixtures = await api.getTodayFixtures();
        state.matches = fixtures;
        displayMatches(fixtures);
        showApiStatus('Matches loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading matches:', error);
        showApiStatus(`Error: ${error.message}`, 'error');
        container.innerHTML = `<div class="no-history">Error: ${error.message}</div>`;
    }
}

function displayMatches(fixtures) {
    const container = document.getElementById('matchesContainer');

    if (!fixtures || fixtures.length === 0) {
        container.innerHTML = '<div class="no-history">No matches today</div>';
        return;
    }

    const html = fixtures.map(fixture => createMatchCard(fixture)).join('');
    container.innerHTML = html;

    // Add click listeners
    document.querySelectorAll('.match-card').forEach((card, index) => {
        card.addEventListener('click', () => {
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
    const input = document.getElementById('searchInput')?.value || '';
    const resultsContainer = document.getElementById('searchResults');

    if (!input.trim()) {
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const teams = await api.searchTeams(input);
        
        if (!teams || teams.length === 0) {
            resultsContainer.innerHTML = '<div class="no-history">No teams found</div>';
            return;
        }

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
    showToast(`Searching matches for ${teamName}...`, 'success');
    // This could be extended to show team's upcoming matches
}

// ============= HISTORY =============
function addToHistory(match) {
    state.history = state.history.filter(m => m.fixture.id !== match.fixture.id);
    state.history.unshift(match);
    state.history = state.history.slice(0, 50);
    saveHistory();
}

function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.API_KEY + '_history', JSON.stringify(state.history));
}

function loadHistory() {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY + '_history');
    if (stored) {
        state.history = JSON.parse(stored);
    }
}

function displayHistory() {
    const container = document.getElementById('historyContainer');

    if (!state.history || state.history.length === 0) {
        container.innerHTML = '<div class="no-history">No analyzed matches</div>';
        return;
    }

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
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
        state.settings = JSON.parse(stored);
    }
}

function loadSettingsUI() {
    const apiKeyInput = document.getElementById('apiKey');
    const notificationsToggle = document.getElementById('notifications');

    if (apiKeyInput && api.getApiKey()) {
        apiKeyInput.value = api.getApiKey();
    }

    if (notificationsToggle) {
        notificationsToggle.checked = state.settings.notifications;
    }
}

function saveSettings() {
    const apiKey = document.getElementById('apiKey')?.value;
    if (apiKey) {
        api.setApiKey(apiKey);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    showToast('Settings saved', 'success');
}

function clearAllData() {
    if (confirm('Clear all data? This cannot be undone.')) {
        localStorage.clear();
        state = { currentPage: 'home', selectedMatch: null, matches: [], history: [], settings: { notifications: true } };
        api.clearCache();
        showToast('All data cleared', 'success');
        navigateTo('home');
    }
}

// ============= UTILITIES =============
function refreshMatches() {
    api.clearCache();
    loadTodayMatches();
}

function showApiStatus(message, type) {
    const statusEl = document.getElementById('apiStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `api-status show ${type}`;

    if (type !== 'error') {
        setTimeout(() => statusEl.classList.remove('show'), 5000);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============= API CONFIGURATION =============
const API_CONFIG = {
    BASE_URL: 'https://v3.football.api-sports.io',
    ENDPOINTS: {
        fixtures: '/fixtures',
        leagues: '/leagues',
        standings: '/standings',
        teams: '/teams',
        statistics: '/statistics',
        predictions: '/predictions',
        fixtures_rounds: '/fixtures/rounds',
        odds: '/odds'
    },
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
    RATE_LIMIT: 60 * 1000 // 1 minute
};

const STORAGE_KEYS = {
    API_KEY: 'matchmind_api_key',
    CACHE: 'matchmind_cache',
    LAST_REQUEST: 'matchmind_last_request',
    SETTINGS: 'matchmind_settings'
};

class MatchMindAPI {
    constructor() {
        this.apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        this.lastRequestTime = 0;
        this.cache = new Map();
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    }

    getApiKey() {
        return this.apiKey;
    }

    canMakeRequest() {
        const now = Date.now();
        return (now - this.lastRequestTime) >= API_CONFIG.RATE_LIMIT;
    }

    recordRequest() {
        this.lastRequestTime = Date.now();
    }

    getCacheKey(endpoint, params) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > API_CONFIG.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }

    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    async makeRequest(endpoint, params = {}) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        const cacheKey = this.getCacheKey(endpoint, params);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        if (!this.canMakeRequest()) {
            throw new Error('Rate limit exceeded');
        }

        try {
            const url = new URL(API_CONFIG.BASE_URL + endpoint);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            const response = await fetch(url.toString(), {
                headers: {
                    'x-apisports-key': this.apiKey
                }
            });

            if (response.status === 429) {
                throw new Error('API rate limit exceeded');
            }

            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid API key');
            }

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.errors && Object.keys(data.errors).length > 0) {
                throw new Error(`API error: ${Object.values(data.errors)[0]}`);
            }

            this.recordRequest();
            this.saveToCache(cacheKey, data.response || []);
            return data.response || [];
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get today's fixtures
    async getTodayFixtures() {
        const today = new Date().toISOString().split('T')[0];
        return this.getFixtures({ date: today });
    }

    // Get fixtures by date
    async getFixtures(params) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.fixtures, params);
    }

    // Search teams by name
    async searchTeams(name) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.teams, { name: name });
    }

    // Get team by ID
    async getTeam(teamId) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.teams, { id: teamId });
    }

    // Get league standings
    async getStandings(leagueId, season) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.standings, {
            league: leagueId,
            season: season
        });
    }

    // Get team statistics
    async getTeamStats(teamId, leagueId, season) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.statistics, {
            team: teamId,
            league: leagueId,
            season: season
        });
    }

    // Get head-to-head
    async getH2H(teamId1, teamId2, lastMatches = 10) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.fixtures, {
            h2h: `${teamId1}-${teamId2}`,
            last: lastMatches
        });
    }

    // Get team recent form
    async getTeamForm(teamId, lastMatches = 10) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.fixtures, {
            team: teamId,
            last: lastMatches,
            status: 'FT'
        });
    }

    // Get predictions
    async getPredictions(fixtureId) {
        return this.makeRequest(API_CONFIG.ENDPOINTS.predictions, {
            fixture: fixtureId
        });
    }

    clearCache() {
        this.cache.clear();
    }
}

// Global API instance
const api = new MatchMindAPI();

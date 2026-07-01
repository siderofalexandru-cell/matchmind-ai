console.log('✓ app.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ DOMContentLoaded');
    initializeApp();
});

function initializeApp() {
    console.log('✓ Initializing app');
    
    const homeBtn = document.getElementById('homeBtn');
    const todayBtn = document.getElementById('todayBtn');
    const searchBtn = document.getElementById('searchBtn');
    const historyBtn = document.getElementById('historyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (homeBtn) homeBtn.addEventListener('click', () => showPage('home'));
    if (todayBtn) todayBtn.addEventListener('click', () => showPage('today'));
    if (searchBtn) searchBtn.addEventListener('click', () => showPage('search'));
    if (historyBtn) historyBtn.addEventListener('click', () => showPage('history'));
    if (settingsBtn) settingsBtn.addEventListener('click', () => showPage('settings'));
    
    // Initialize settings
    initializeSettings();
    
    console.log('✓ App ready');
}

function initializeSettings() {
    console.log('✓ Initializing settings');
    
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('matchmind_api_key');
    if (savedApiKey && apiKeyInput) {
        apiKeyInput.value = savedApiKey;
        console.log('✓ Loaded API key from localStorage');
    }
    
    // Save API key when button is clicked
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            if (apiKeyInput) {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey) {
                    localStorage.setItem('matchmind_api_key', apiKey);
                    console.log('✓ API key saved to localStorage');
                    
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = '✓ Cheia API a fost salvată';
                        apiKeyStatus.style.color = '#2ed573';
                        
                        setTimeout(() => {
                            apiKeyStatus.textContent = '';
                        }, 3000);
                    }
                } else {
                    console.warn('✗ API key is empty');
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = '✗ Introdu o cheie valida';
                        apiKeyStatus.style.color = '#ff4757';
                    }
                }
            }
        });
    }
}

function showPage(page) {
    console.log('Showing page:', page);
    
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(p => p.classList.remove('active'));
    
    // Remove active from all buttons
    const allButtons = document.querySelectorAll('.nav-btn');
    allButtons.forEach(b => b.classList.remove('active'));
    
    // Show selected page
    const pageMap = {
        'home': 'homePage',
        'today': 'todayPage',
        'search': 'searchPage',
        'history': 'historyPage',
        'settings': 'settingsPage'
    };
    
    const selectedPage = document.getElementById(pageMap[page]);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Highlight button
    const buttonMap = {
        'home': 'homeBtn',
        'today': 'todayBtn',
        'search': 'searchBtn',
        'history': 'historyBtn',
        'settings': 'settingsBtn'
    };
    
    const button = document.getElementById(buttonMap[page]);
    if (button) {
        button.classList.add('active');
    }
}

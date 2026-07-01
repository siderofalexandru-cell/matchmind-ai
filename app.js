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
    
    console.log('✓ App ready');
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

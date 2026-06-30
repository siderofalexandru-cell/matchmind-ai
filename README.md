# MatchMind AI - Football Analysis PWA

⚽ Premium football match analysis application powered by AI and API-Sports data.

## Features

✨ **Core Features**
- 📅 Today's matches from API-Sports
- 🔍 Search teams and matches by name
- 🧠 AI-powered match analysis
- 📊 Detailed statistics and predictions
- 📱 Mobile-first PWA (installable)
- 🌙 Modern dark UI with electric blue accents
- 📈 Recent form, H2H, standings
- 🎯 BTTS, Over 2.5, corners, cards estimates
- 💾 Local storage for history and cache
- ⚡ Rate limiting (1 request per minute)
- 🔒 Secure API key management

## Requirements

- Modern browser with Service Worker support
- API-Sports API key (free tier available)
- Internet connection for initial load

## Installation

### Option 1: PWA Install (Recommended)
1. Open the app in your browser
2. Click "Install" or "Add to Home Screen"
3. Configure your API key in Settings

### Option 2: Manual Deploy
1. Clone or download this repository
2. Host files on a web server (HTTPS required for PWA)
3. Visit the URL in your browser

## Getting API Key

1. Visit [api-sports.io](https://www.api-sports.io/)
2. Create a free account
3. Get your API key from the dashboard
4. Paste it in MatchMind AI Settings

## Usage

### Pages

**Home** - Introduction and quick navigation

**Today** (📅) - View today's fixtures
- Shows match time, teams, league, status
- Click to view detailed analysis
- Auto-refresh capability

**Search** (🔍) - Find specific matches
- Search teams by name
- View team information

**History** (📊) - Analyzed matches
- Previously analyzed matches
- Quick access to recent analyses

**Settings** (⚙️) - Configuration
- API key input
- Notifications toggle
- Data management

### Analysis Panel

**MatchMind IQ** (🧠)
- Confidence score (0-100%)
- Expected result prediction
- Analysis quality indicator

**Predictions** (📊)
- Both Teams to Score probability
- Over 2.5 Goals probability
- Estimated corners range
- Estimated cards range

**Pro Arguments** (✅)
- Recent good form
- Strong defense
- Favorable H2H
- Home advantage

**Contra Arguments** (⚠️)
- Strong opponent
- Injury concerns
- Recent losses
- Away disadvantage

## Technical Stack

- **HTML5** - Progressive Web App structure
- **CSS3** - Modern dark theme, responsive design
- **Vanilla JavaScript** - No dependencies required
- **Service Worker** - Offline support, caching
- **API-Sports** - Live football data

## API Integration

### Endpoints Used

- `/fixtures?date=YYYY-MM-DD` - Today's matches
- `/fixtures?team=ID&last=10` - Team recent form
- `/fixtures?h2h=ID1-ID2` - Head-to-head
- `/teams?name=SEARCH` - Team search
- `/standings?league=ID&season=YEAR` - League standings

### Rate Limiting

- Maximum 1 API request per minute
- 10-minute cache for fixture data
- Smart caching prevents redundant calls
- Friendly error messages for limits

## File Structure

```
├── index.html       # Main HTML structure
├── style.css        # Responsive dark theme
├── app.js          # Main application logic
├── api.js          # API wrapper and caching
├── analysis.js     # AI analysis engine
├── sw.js           # Service Worker
├── manifest.json   # PWA configuration
└── README.md       # This file
```

## Browser Support

- Chrome/Chromium 50+
- Firefox 44+
- Safari 11.1+
- Edge 15+
- iOS Safari 11.3+
- Android Browser 50+

## Performance

- First load: ~2-3 seconds
- Cached load: <500ms
- Offline mode: Full functionality with cached data
- Responsive: Works on all screen sizes (480px - 2560px)

## Limitations

- API-Sports free tier: 10 requests per minute
- Historical data limited to available API coverage
- Predictions based on historical patterns only
- No real betting integration or guarantees

## Disclaimer

MatchMind AI provides informative analysis based on historical data and statistical patterns. Analysis is for educational purposes only. It does not guarantee match results or provide betting advice. Always do your own research before making decisions based on analysis.

## Privacy

- API key stored locally in browser storage
- No data sent to third parties except API-Sports
- Analysis computed locally
- No user tracking or analytics

## Future Enhancements

- [ ] Live match tracking
- [ ] Push notifications
- [ ] Multiple language support
- [ ] Advanced filtering
- [ ] Share analysis feature
- [ ] User accounts and bookmarks
- [ ] Enhanced AI model
- [ ] Betting odds integration

## License

MIT License - Free for personal and commercial use

## Support

For issues or questions:
1. Check API-Sports documentation
2. Verify API key is valid
3. Clear cache and reload
4. Check browser console for errors

---

**Made with ⚡ for football enthusiasts**

MatchMind AI © 2024

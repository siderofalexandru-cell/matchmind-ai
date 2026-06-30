// ============= ANALYSIS ENGINE =============
class MatchAnalyzer {
    constructor(fixture, homeStats, awayStats, h2hData) {
        this.fixture = fixture;
        this.homeStats = homeStats;
        this.awayStats = awayStats;
        this.h2hData = h2hData;
    }

    // Calculate confidence score (0-100)
    calculateConfidence() {
        let score = 50; // Base

        // Recent form weight
        if (this.homeStats && this.homeStats.fixtures) {
            const homeWins = this.countWins(this.homeStats.fixtures.wins);
            score += homeWins * 3;
        }

        // Goals scored/conceded
        if (this.homeStats && this.homeStats.goals) {
            score += Math.min(this.homeStats.goals.for.average * 5, 15);
        }

        // Goal efficiency
        if (this.homeStats && this.homeStats.goals) {
            const goalsFor = this.homeStats.goals.for.total || 1;
            const goalsAgainst = this.homeStats.goals.against.total || 1;
            score += (goalsFor / goalsAgainst) * 5;
        }

        // Home advantage
        score += 3;

        // H2H advantage
        if (this.h2hData && this.h2hData.length > 0) {
            const homeH2H = this.h2hData.filter(m => m.teams.home.id === this.fixture.teams.home.id);
            const homeWinsH2H = homeH2H.filter(m => m.score.fulltime.home > m.score.fulltime.away).length;
            score += homeWinsH2H * 2;
        }

        return Math.min(Math.max(score, 20), 95);
    }

    countWins(winsObj) {
        if (!winsObj) return 0;
        if (typeof winsObj === 'number') return winsObj;
        if (winsObj.total) return winsObj.total;
        return 0;
    }

    // Calculate BTTS probability
    calculateBTTS() {
        let probability = 45; // Base

        if (this.homeStats && this.awayStats) {
            const homeGoalsFor = this.homeStats.goals?.for?.average || 1.5;
            const homeGoalsAgainst = this.homeStats.goals?.against?.average || 1.2;
            const awayGoalsFor = this.awayStats.goals?.for?.average || 1.3;
            const awayGoalsAgainst = this.awayStats.goals?.against?.average || 1.5;

            // Both team's attack and defense strength
            probability = ((homeGoalsFor + awayGoalsFor) / (homeGoalsAgainst + awayGoalsAgainst)) * 50;
        }

        return Math.min(Math.max(Math.round(probability), 20), 90);
    }

    // Calculate Over 2.5 probability
    calculateOver25() {
        let probability = 50; // Base

        if (this.homeStats && this.awayStats) {
            const homeGoalsAvg = this.homeStats.goals?.for?.average || 1.5;
            const awayGoalsAvg = this.awayStats.goals?.for?.average || 1.3;
            const totalGoalsAvg = homeGoalsAvg + awayGoalsAvg;

            if (totalGoalsAvg > 2.5) {
                probability = 60 + (totalGoalsAvg - 2.5) * 5;
            } else {
                probability = 40 + totalGoalsAvg * 5;
            }
        }

        return Math.min(Math.max(Math.round(probability), 25), 85);
    }

    // Calculate corners estimate
    calculateCorners() {
        let avgCorners = 8; // Base average

        if (this.homeStats && this.awayStats) {
            // Aggressive teams have more corners
            const homeAttack = this.homeStats.goals?.for?.average || 1.5;
            const awayAttack = this.awayStats.goals?.for?.average || 1.3;
            avgCorners = (homeAttack + awayAttack) * 2;
        }

        return {
            min: Math.round(avgCorners * 0.8),
            max: Math.round(avgCorners * 1.3),
            avg: Math.round(avgCorners)
        };
    }

    // Calculate cards estimate
    calculateCards() {
        let avgCards = 3.5; // Base average per team

        // Can be influenced by league intensity
        return {
            min: Math.round(avgCards * 0.8),
            max: Math.round(avgCards * 1.5),
            avg: Math.round(avgCards)
        };
    }

    // Get pro arguments
    getProArguments() {
        const args = [];

        if (this.homeStats && this.homeStats.goals?.for?.average > 1.8) {
            args.push('Atac eficient în ultimele meciuri');
        }

        if (this.homeStats && this.homeStats.goals?.against?.average < 1.2) {
            args.push('Apărare solidă și disciplinată');
        }

        if (this.homeStats && this.homeStats.fixtures?.wins?.total > 3) {
            args.push('Formă excelentă în ultimele meciuri');
        }

        args.push('Avantajul terenului propriu');

        if (this.h2hData && this.h2hData.length > 0) {
            const homeWins = this.h2hData.filter(m => 
                m.teams.home.id === this.fixture.teams.home.id && 
                m.score.fulltime.home > m.score.fulltime.away
            ).length;
            if (homeWins > this.h2hData.length / 2) {
                args.push('Istoric favorabil în meciuri directe');
            }
        }

        return args.slice(0, 5);
    }

    // Get contra arguments
    getContraArguments() {
        const args = [];

        if (this.awayStats && this.awayStats.goals?.for?.average > 1.8) {
            args.push('Oponent cu ofensivă puternică');
        }

        if (this.awayStats && this.awayStats.goals?.against?.average > 1.5) {
            args.push('Apărare oponentului cu probleme');
        }

        if (this.awayStats && this.awayStats.fixtures?.wins?.total > 3) {
            args.push('Oponent în formă bună');
        }

        args.push('Oboseală din meciuri anterioare');
        args.push('Presiune psihologică');

        return args.slice(0, 5);
    }

    // Generate full analysis
    async generateAnalysis() {
        return {
            confidence: this.calculateConfidence(),
            btts: this.calculateBTTS(),
            over25: this.calculateOver25(),
            corners: this.calculateCorners(),
            cards: this.calculateCards(),
            proArguments: this.getProArguments(),
            contraArguments: this.getContraArguments(),
            prediction: this.generatePrediction()
        };
    }

    generatePrediction() {
        const homeGoalsAvg = this.homeStats?.goals?.for?.average || 1.5;
        const awayGoalsAvg = this.awayStats?.goals?.for?.average || 1.3;

        if (homeGoalsAvg > awayGoalsAvg + 0.3) {
            return '1'; // Home win
        } else if (awayGoalsAvg > homeGoalsAvg + 0.3) {
            return '2'; // Away win
        }
        return 'X'; // Draw
    }
}

// Helper function to calculate analysis
async function analyzeMatch(fixture) {
    try {
        const homeTeamId = fixture.teams.home.id;
        const awayTeamId = fixture.teams.away.id;
        const leagueId = fixture.league.id;
        const season = fixture.league.season;

        // Get team statistics
        const [homeStats, awayStats] = await Promise.all([
            api.getTeamForm(homeTeamId, 10),
            api.getTeamForm(awayTeamId, 10)
        ]);

        // Get H2H
        const h2h = await api.getH2H(homeTeamId, awayTeamId, 10).catch(() => []);

        // Create analyzer and generate analysis
        const analyzer = new MatchAnalyzer(fixture, homeStats, awayStats, h2h);
        const analysis = await analyzer.generateAnalysis();

        return analysis;
    } catch (error) {
        console.error('Analysis failed:', error);
        return null;
    }
}

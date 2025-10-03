const { useState, useEffect, useRef } = React;

function ScoreKeeper() {
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerColor, setNewPlayerColor] = useState('#ff6b6b');
    const [nextPlayerId, setNextPlayerId] = useState(1);
    const [nextGameId, setNextGameId] = useState(1);
    const [colorScheme, setColorScheme] = useState('light');

    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    function getRandomColor() {
        // Generate a random hue for bright/varied colors
        const hue = Math.floor(Math.random() * 360);
        // Use HSL for better vibrancy and contrast
        return `hsl(${hue}, 70%, 60%)`;
    }

    // Load persisted state on mount
    useEffect(() => {
        // Restore dark/light mode
        const savedScheme = localStorage.getItem('scorekeeper_color_scheme');
        if (savedScheme) setColorScheme(savedScheme);

        // Restore players/games state
        const savedPlayers = localStorage.getItem('scorekeeper_players');
        const savedGames = localStorage.getItem('scorekeeper_games');

        if (savedPlayers) {
            const playersArr = JSON.parse(savedPlayers);
            setPlayers(playersArr);
            const maxId = playersArr.reduce((max, p) => Math.max(max, p.id), 0);
            setNextPlayerId(maxId + 1);
        }

        if (savedGames) {
            const gamesArr = JSON.parse(savedGames);
            setGames(gamesArr);
            const maxGameId = gamesArr.reduce((max, g) => Math.max(max, g.id), 0);
            setNextGameId(maxGameId + 1);
        }
    }, []);

    // Update color scheme on <body> and persist
    useEffect(() => {
        document.body.setAttribute('data-color-scheme', colorScheme);
        localStorage.setItem('scorekeeper_color_scheme', colorScheme);
    }, [colorScheme]);

    // Persist players/games to localStorage
    useEffect(() => {
        localStorage.setItem('scorekeeper_players', JSON.stringify(players));
        localStorage.setItem('scorekeeper_games', JSON.stringify(games));
    }, [players, games]);

    const addPlayer = () => {
        if (newPlayerName.trim() === '') {
            alert('Please enter a player name');
            return;
        }
        if (players.some(player => player.name.toLowerCase() === newPlayerName.toLowerCase())) {
            alert('Player name already exists');
            return;
        }
        const newPlayer = {
            id: nextPlayerId,
            name: newPlayerName.trim(),
            color: newPlayerColor
        };
        setPlayers([...players, newPlayer]);
        setNextPlayerId(nextPlayerId + 1);
        setNewPlayerName('');
        setNewPlayerColor(getRandomColor());  // <-- Randomize color picker here
    
        const updatedGames = games.map(game => ({
            ...game,
            scores: {
                ...game.scores,
                [newPlayer.id]: 0
            }
        }));
        setGames(updatedGames);
    };

    const removePlayer = (playerId) => {
        setPlayers(players.filter(player => player.id !== playerId));
        const updatedGames = games.map(game => {
            const newScores = { ...game.scores };
            delete newScores[playerId];
            return {
                ...game,
                scores: newScores
            };
        });
        setGames(updatedGames);
    };

    const addGame = () => {
        const newGame = {
            id: nextGameId,
            scores: {}
        };
        players.forEach(player => {
            newGame.scores[player.id] = 0;
        });
        setGames([...games, newGame]);
        setNextGameId(nextGameId + 1);
    };

    const resetGame = () => {
        if (!window.confirm("Are you sure you want to reset all game scores? This will keep your players and start with one empty game.")) {
            return;
        }
        const initialGame = {
            id: 1,
            scores: {}
        };
        players.forEach(player => {
            initialGame.scores[player.id] = 0;
        });
        setGames([initialGame]);
        setNextGameId(2);
    };

    const updateScore = (gameId, playerId, inputValue) => {
        let numericScore = 0;
        if (inputValue !== '') {
            const parsed = parseFloat(inputValue);
            numericScore = isNaN(parsed) ? 0 : parsed;
        }
        const updatedGames = games.map(game => {
            if (game.id === gameId) {
                return {
                    ...game,
                    scores: {
                        ...game.scores,
                        [playerId]: numericScore
                    }
                };
            }
            return game;
        });
        setGames(updatedGames);
    };

    const getTotalScores = () => {
        const totals = {};
        players.forEach(player => {
            totals[player.id] = games.reduce((total, game) => {
                return total + (game.scores[player.id] || 0);
            }, 0);
        });
        return totals;
    };

    // Draw chart by descending total
    useEffect(() => {
        if (chartRef.current && players.length > 0) {
            const ctx = chartRef.current.getContext('2d');
            const totals = getTotalScores();
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            // Sort players descending by score for the chart
            const sortedPlayers = [...players].sort((a, b) => {
                const scoreA = totals[a.id] || 0;
                const scoreB = totals[b.id] || 0;
                return scoreB - scoreA;
            });
            chartInstanceRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedPlayers.map(player => player.name),
                    datasets: [{
                        label: 'Total Score',
                        data: sortedPlayers.map(player => totals[player.id] || 0),
                        backgroundColor: sortedPlayers.map(player => player.color),
                        borderColor: sortedPlayers.map(player => player.color),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Total Score'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Players'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Player Scores'
                        }
                    }
                }
            });
        }
    }, [players, games]);

    const totals = getTotalScores();

    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">🎯 ScoreKeeper</h1>
                <p className="app-subtitle">Keep track of game scores for any game!</p>
                {/* Dark/Light mode toggle */}
                <button className="btn btn--toggle" onClick={() => setColorScheme(c => c === 'light' ? 'dark' : 'light')}>
                    {colorScheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
            </header>
            {/* Player Management Section */}
            <section className="section">
                <h2 className="section-title">👥 Player Management</h2>
                <div className="player-form">
                    <div className="form-field">
                        <label className="form-label">Player Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Enter player name"
                            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                        />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Color</label>
                        <input
                            type="color"
                            className="color-input"
                            value={newPlayerColor}
                            onChange={(e) => setNewPlayerColor(e.target.value)}
                        />
                    </div>
                    <button className="btn btn--primary" onClick={addPlayer}>
                        Add Player
                    </button>
                </div>
                {players.length > 0 && (
                    <div className="players-list">
                        {players.map(player => (
                            <div key={player.id} className="player-item">
                                <div
                                    className="player-color-dot"
                                    style={{ backgroundColor: player.color }}
                                ></div>
                                <span>{player.name}</span>
                                <button
                                    className="remove-player-btn"
                                    onClick={() => removePlayer(player.id)}
                                    title="Remove player"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            {/* Score Table Section */}
            {players.length > 0 ? (
                <section className="section">
                    <h2 className="section-title">📊 Score Table</h2>
                    <div className="button-group">
                        <button className="btn btn--secondary" onClick={addGame}>
                            Add New Game
                        </button>
                        <button className="btn btn--danger" onClick={resetGame}>
                            Reset Game
                        </button>
                    </div>
                    <div className="table-container">
                        <table className="score-table">
                            <thead>
                                <tr>
                                    <th>Game</th>
                                    {players.map(player => (
                                        <th key={player.id}>
                                            <div className="player-header">
                                                <div
                                                    className="player-color-dot"
                                                    style={{ backgroundColor: player.color }}
                                                ></div>
                                                {player.name}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {games.map((game, index) => (
                                    <tr key={game.id}>
                                        <td className="game-label">Game {index + 1}</td>
                                        {players.map(player => (
                                            <td key={player.id}>
                                                <input
                                                    type="number"
                                                    className="score-input"
                                                    value={game.scores[player.id] || ''}
                                                    onChange={(e) => updateScore(game.id, player.id, e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {games.length > 0 && (
                                    <tr className="total-row">
                                        <td className="game-label">Total</td>
                                        {players.map(player => (
                                            <td key={player.id}>
                                                <span className="total-score">
                                                    {totals[player.id] || 0}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <section className="section">
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No Players Added Yet</h3>
                        <p>Add some players above to start tracking scores!</p>
                    </div>
                </section>
            )}
            {/* Chart Section */}
            {players.length > 0 && games.length > 0 && (
                <section className="section">
                    <h2 className="section-title">📈 Score Chart</h2>
                    <div className="chart-container">
                        <canvas ref={chartRef} className="chart-canvas"></canvas>
                    </div>
                </section>
            )}
        </div>
    );
}

ReactDOM.render(<ScoreKeeper />, document.getElementById('root'));

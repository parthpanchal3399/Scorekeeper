const { useState, useEffect, useRef } = React;

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function ScoreKeeper() {
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerColor, setNewPlayerColor] = useState(getRandomColor());
    const [nextPlayerId, setNextPlayerId] = useState(1);
    const [nextGameId, setNextGameId] = useState(1);
    const [colorScheme, setColorScheme] = useState('light');
    const [chartType, setChartType] = useState('bar');
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Load persisted state on mount
    useEffect(() => {
        const savedScheme = localStorage.getItem('scorekeeper_color_scheme');
        if (savedScheme) setColorScheme(savedScheme);

        const savedPlayers = localStorage.getItem('scorekeeper_players');
        const savedGames = localStorage.getItem('scorekeeper_games');
        
        if (savedPlayers) {
            const playersArr = JSON.parse(savedPlayers);
            setPlayers(playersArr);
            setNextPlayerId(playersArr.reduce((max, p) => Math.max(max, p.id), 0) + 1);
        }
        if (savedGames) {
            const gamesArr = JSON.parse(savedGames);
            setGames(gamesArr);
            setNextGameId(gamesArr.reduce((max, g) => Math.max(max, g.id), 0) + 1);
        }
    }, []);

    useEffect(() => {
        document.body.setAttribute('data-color-scheme', colorScheme);
        localStorage.setItem('scorekeeper_color_scheme', colorScheme);
    }, [colorScheme]);

    useEffect(() => {
        localStorage.setItem('scorekeeper_players', JSON.stringify(players));
        localStorage.setItem('scorekeeper_games', JSON.stringify(games));
    }, [players, games]);

    const startEditing = (player) => {
        setEditingPlayerId(player.id);
        setEditName(player.name);
        setEditColor(player.color);
    };

    const cancelEditing = () => {
        setEditingPlayerId(null);
    };

    const saveEdit = (playerId) => {
        if (editName.trim() === '') {
            alert('Player name cannot be empty');
            return;
        }
        // Check for duplicate names (excluding the current player)
        if (players.some(p => p.id !== playerId && p.name.toLowerCase() === editName.toLowerCase())) {
            alert('Player name already exists');
            return;
        }
        
        // Update the player in the array
        setPlayers(players.map(p => 
            p.id === playerId ? { ...p, name: editName.trim(), color: editColor } : p
        ));
        setEditingPlayerId(null); // Exit edit mode
    };

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
        setNewPlayerColor(getRandomColor());

        const updatedGames = games.map(game => ({
            ...game,
            scores: { ...game.scores, [newPlayer.id]: 0 }
        }));
        setGames(updatedGames);
    };

    const removePlayer = (playerId) => {
        setPlayers(players.filter(player => player.id !== playerId));
        setGames(games.map(game => {
            const newScores = { ...game.scores };
            delete newScores[playerId];
            return { ...game, scores: newScores };
        }));
    };

    const addGame = () => {
        const newGame = { id: nextGameId, scores: {} };
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
        const initialGame = { id: 1, scores: {} };
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
        setGames(games.map(game =>
            game.id === gameId
                ? { ...game, scores: { ...game.scores, [playerId]: numericScore } }
                : game
        ));
    };

    const getTotalScores = () => {
        const totals = {};
        players.forEach(player => {
            totals[player.id] = games.reduce((total, game) =>
                total + (game.scores[player.id] || 0), 0);
        });
        return totals;
    };

    const getCumulativeScores = () => {
        const cumulative = {};
        players.forEach(player => {
            cumulative[player.id] = [];
            let runningTotal = 0;
            games.forEach(game => {
                runningTotal += (game.scores[player.id] || 0);
                cumulative[player.id].push(runningTotal);
            });
        });
        return cumulative;
    };

    const getChartConfig = () => {
        const textColor = colorScheme === "dark" ? "#fff" : "#222";
        
        if (chartType === 'bar') {
            const totals = getTotalScores();
            const sortedPlayers = [...players].sort((a, b) =>
                (totals[b.id] || 0) - (totals[a.id] || 0));
            
            return {
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
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: { size: 14, weight: 'bold' },
                                color: textColor,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 15,
                                generateLabels: (chart) => {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => ({
                                        text: label,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].borderColor[i],
                                        lineWidth: 2,
                                        hidden: false,
                                        index: i,
                                        pointStyle: 'circle',
                                        fontColor: textColor
                                    }));
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Player Total Scores',
                            font: { size: 22, weight: 'bold' },
                            color: textColor
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Players',
                                font: { size: 18, weight: 'bold' },
                                color: textColor
                            },
                            ticks: {
                                font: { size: 16, weight: 'bold' },
                                color: textColor
                            }
                        },
                        y: {
                            beginAtZero: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Total Score',
                                font: { size: 18, weight: 'bold' },
                                color: textColor
                            },
                            ticks: {
                                font: { size: 16, weight: 'bold' },
                                color: textColor
                            }
                        }
                    }
                }
            };
        } else {
            // Line chart: X-axis = games, Y-axis = cumulative total scores (on right)
            const gameLabels = games.map((_, index) => `Game ${index + 1}`);
            const cumulativeScores = getCumulativeScores();
            const datasets = players.map(player => ({
                label: player.name,
                data: cumulativeScores[player.id],
                borderColor: player.color,
                backgroundColor: player.color,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 5,
                yAxisID: 'y'
            }));

            return {
                type: 'line',
                data: {
                    labels: gameLabels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: { size: 14, weight: 'bold' },
                                color: textColor,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 15
                            }
                        },
                        title: {
                            display: true,
                            text: 'Total Score Progress Over Games',
                            font: { size: 22, weight: 'bold' },
                            color: textColor
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Games',
                                font: { size: 18, weight: 'bold' },
                                color: textColor
                            },
                            ticks: {
                                font: { size: 16, weight: 'bold' },
                                color: textColor
                            }
                        },
                        y: {
                            beginAtZero: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Total Score',
                                font: { size: 18, weight: 'bold' },
                                color: textColor
                            },
                            ticks: {
                                font: { size: 16, weight: 'bold' },
                                color: textColor
                            }
                        }
                    }
                }
            };
        }
    };

    useEffect(() => {
        if (chartRef.current && players.length > 0 && games.length > 0) {
            const ctx = chartRef.current.getContext('2d');
            
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const config = getChartConfig();
            chartInstanceRef.current = new Chart(ctx, config);
        }
    }, [players, games, colorScheme, chartType]);

    const totals = getTotalScores();

    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">🎯 ScoreKeeper</h1>
                <p className="app-subtitle">Keep track of game scores for any game!</p>
                <button className="btn btn--toggle" onClick={() => setColorScheme(c => c === 'light' ? 'dark' : 'light')}>
                    {colorScheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
            </header>

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
                    <button className="btn btn--primary" onClick={addPlayer}>Add Player</button>
                </div>
                {players.length > 0 && (
                    <div className="players-list">
                        {players.map(player => (
                            <div key={player.id} className="player-item">
                                {editingPlayerId === player.id ? (
                                    /* Edit Mode UI */
                                    <div className="player-edit-mode">
                                        <input 
                                            type="color" 
                                            className="edit-color-input"
                                            value={editColor} 
                                            onChange={(e) => setEditColor(e.target.value)} 
                                        />
                                        <input 
                                            type="text" 
                                            className="form-control edit-name-input"
                                            value={editName} 
                                            onChange={(e) => setEditName(e.target.value)} 
                                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(player.id)}
                                            autoFocus
                                        />
                                        <button className="icon-btn save-btn" onClick={() => saveEdit(player.id)} title="Save">✓</button>
                                        <button className="icon-btn cancel-btn" onClick={cancelEditing} title="Cancel">✕</button>
                                    </div>
                                ) : (
                                    /* Standard View UI */
                                    <>
                                        <div className="player-color-dot" style={{ backgroundColor: player.color }}></div>
                                        <span onDoubleClick={() => startEditing(player)}>{player.name}</span>
                                        <button 
                                            className="icon-btn edit-player-btn"
                                            onClick={() => startEditing(player)}
                                            title="Edit player"
                                        >✎</button>
                                        <button
                                            className="icon-btn remove-player-btn"
                                            onClick={() => removePlayer(player.id)}
                                            title="Remove player"
                                        >×</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {players.length > 0 ? (
                <section className="section">
                    <h2 className="section-title">📊 Score Table</h2>
                    <div className="button-group">
                        <button className="btn btn--secondary" onClick={addGame}>Add New Game</button>
                        <button className="btn btn--danger" onClick={resetGame}>Reset Game</button>
                    </div>
                    <div className="table-container">
                        <table className="score-table">
                            <thead>
                                <tr>
                                    <th>Game</th>
                                    {players.map(player => (
                                        <th key={player.id}>
                                            <div className="player-header">
                                                <div className="player-color-dot" style={{ backgroundColor: player.color }}></div>
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
                                                <span className="total-score">{totals[player.id] || 0}</span>
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

            {players.length > 0 && games.length > 0 && (
                <section className="section">
                    <h2 className="section-title">📈 Score Chart</h2>
                    <button
                        className="btn btn--secondary"
                        onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
                        style={{ marginBottom: '16px' }}
                    >
                        {chartType === "bar" ? "📈 Switch to Line Chart" : "📊 Switch to Bar Chart"}
                    </button>
                    <div className="chart-container">
                        <canvas ref={chartRef} className="chart-canvas"></canvas>
                    </div>
                </section>
            )}
        </div>
    );
}

ReactDOM.render(<ScoreKeeper />, document.getElementById('root'));

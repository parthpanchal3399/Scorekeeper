// React ScoreKeeper Application
const { useState, useEffect, useRef } = React;

function ScoreKeeper() {
    // State management using React hooks
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerColor, setNewPlayerColor] = useState('#ff6b6b');
    const [nextPlayerId, setNextPlayerId] = useState(1);
    const [nextGameId, setNextGameId] = useState(1);
    
    // Reference for the chart canvas
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Initialize with sample data for demonstration
    useEffect(() => {
        const samplePlayers = [
            
        ];
        
        const sampleGames = [
            
        ];
        
        setPlayers(samplePlayers);
        setGames(sampleGames);
        setNextPlayerId(1);
        setNextGameId(1);
    }, []);

    // Add a new player
    const addPlayer = () => {
        if (newPlayerName.trim() === '') {
            alert('Please enter a player name');
            return;
        }
        
        // Check for duplicate names
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
        
        // Add this player to existing games with score 0
        const updatedGames = games.map(game => ({
            ...game,
            scores: {
                ...game.scores,
                [newPlayer.id]: 0
            }
        }));
        setGames(updatedGames);
    };

    // Remove a player
    const removePlayer = (playerId) => {
        setPlayers(players.filter(player => player.id !== playerId));
        
        // Remove player from all games
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

    // Add a new game
    const addGame = () => {
        if (players.length === 0) {
            alert('Please add players first');
            return;
        }

        const newGame = {
            id: nextGameId,
            scores: {}
        };

        // Initialize scores for all players
        players.forEach(player => {
            newGame.scores[player.id] = 0;
        });

        setGames([...games, newGame]);
        setNextGameId(nextGameId + 1);
    };

    // Reset game: Confirmation and reset logic
    const resetGame = () => {
        if (!window.confirm("Are you sure you want to reset all game scores?")) {
            return; // User cancelled, do nothing
        }
        const initialGame = {
            id: 1,
            scores: {}
        };
        players.forEach(player => {
            initialGame.scores[player.id] = 0; // Set all player scores to 0
        });
        setGames([initialGame]);
        setNextGameId(2); // Next game will be id 2
    };

    // Update a score - Fixed version
    const updateScore = (gameId, playerId, inputValue) => {
        // Handle empty string as 0, otherwise parse as number
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

    // Calculate total scores for each player
    const getTotalScores = () => {
        const totals = {};
        players.forEach(player => {
            totals[player.id] = games.reduce((total, game) => {
                return total + (game.scores[player.id] || 0);
            }, 0);
        });
        return totals;
    };

    // Update chart when data changes
    useEffect(() => {
        if (chartRef.current && players.length > 0) {
            const ctx = chartRef.current.getContext('2d');
            const totals = getTotalScores();

            // Destroy existing chart
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Create new chart
            chartInstanceRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: players.map(player => player.name),
                    datasets: [{
                        label: 'Total Score',
                        data: players.map(player => totals[player.id] || 0),
                        backgroundColor: players.map(player => player.color),
                        borderColor: players.map(player => player.color),
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
                                    style={{backgroundColor: player.color}}
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
                                                    style={{backgroundColor: player.color}}
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

// Render the application
ReactDOM.render(<ScoreKeeper />, document.getElementById('root'));
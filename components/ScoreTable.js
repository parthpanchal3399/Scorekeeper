// components/ScoreTable.js
function ScoreTable({ players, games, totals, addGame, removeGame, resetGames, updateScore }) {
    if (players.length === 0) return (
        <section className="section">
            <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No Players Added Yet</h3>
                <p>Add some players above to start tracking scores!</p>
            </div>
        </section>
    );

    return (
        <section className="section">
            <h2 className="section-title">📊 Score Table</h2>
            <div className="button-group">
                <button className="btn btn--secondary" onClick={addGame}>Add New Game</button>
                <button className="btn btn--danger" onClick={resetGames}>Reset Game</button>
                {games.length > 0 && (
                    <button className="btn btn--outline" onClick={() => exportToCSV(players, games, totals)}>
                        📥 Export CSV
                    </button>
                )}
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
                                <td className="game-label">
                                    <div className="game-row-header">
                                        Game {index + 1}
                                        <button className="icon-btn icon-btn--small" onClick={() => removeGame(game.id)} title="Delete Game">🗑️</button>
                                    </div>
                                </td>
                                {players.map(player => (
                                    <td key={player.id}>
                                        <input type="number" className="score-input"
                                            value={game.scores[player.id] || ''}
                                            onChange={(e) => updateScore(game.id, player.id, e.target.value)}
                                            placeholder="0" />
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
    );
}
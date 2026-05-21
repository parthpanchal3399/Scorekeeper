// components/FinishModals.js
function FinishModals({ players, totals, onClose, onReset }) {
    const [step, setStep] = React.useState('confirm');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [winners, setWinners] = React.useState([]);

    const handleConfirm = () => {
        // 1. Get unique scores and sort them
        const uniqueScores = [...new Set(players.map(p => totals[p.id] || 0))];
        uniqueScores.sort((a, b) => sortOrder === 'asc' ? b - a : a - b);
        
        // 2. Group players by these top 3 scores
        const groupedWinners = [
            players.filter(p => (totals[p.id] || 0) === uniqueScores[0]), // 1st Place (Everyone with top score)
            uniqueScores[1] !== undefined ? players.filter(p => (totals[p.id] || 0) === uniqueScores[1]) : [], // 2nd Place
            uniqueScores[2] !== undefined ? players.filter(p => (totals[p.id] || 0) === uniqueScores[2]) : []  // 3rd Place
        ];
        
        setWinners(groupedWinners);
        setStep('podium');
        
        if (window.confetti) {
            confetti({
                particleCount: 200,
                spread: 90,
                origin: { y: 0.6 },
                zIndex: 9999
            });
        }
    };

    const handleFinish = () => {
        onReset(true); 
        onClose();
    };

    // Helper component to render a single podium step handling multiple players
    const renderPodiumStep = (placePlayers, placeClass, placeLabel) => {
        if (!placePlayers || placePlayers.length === 0) return null;
        
        return (
            <div className={`podium-place ${placeClass}`}>
                <div className="podium-avatars-group">
                    {placePlayers.map(p => (
                        <div key={p.id} className="podium-player-info">
                            <div className="podium-avatar" style={{backgroundColor: p.color}}>
                                {p.avatar}
                            </div>
                            <div className="podium-name">{p.name}</div>
                        </div>
                    ))}
                </div>
                <div className="podium-score">{totals[placePlayers[0].id] || 0}</div>
                <div className="podium-step">{placeLabel}</div>
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {step === 'confirm' ? (
                    <>
                        <h2 style={{marginTop: 0}}>🏁 Finish Game</h2>
                        <p>Are you sure you want to finish the game and reveal the winners?</p>
                        
                        <div className="form-group" style={{textAlign: 'left', marginTop: '24px'}}>
                            <label className="form-label">Winning Criteria:</label>
                            <select className="form-control" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                                <option value="asc">Highest Score Wins (Ascending)</option>
                                <option value="desc">Lowest Score Wins (Descending)</option>
                            </select>
                        </div>

                        <div className="button-group" style={{ justifyContent: 'center', marginTop: '24px', marginBottom: 0 }}>
                            <button className="btn btn--outline" onClick={onClose}>Cancel</button>
                            <button className="btn btn--primary" onClick={handleConfirm}>Yes, Finish Game</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{marginTop: 0}}>🎉 Top Players 🎉</h2>
                        
                        <div className="podium-container">
                            {/* Render steps in order of 2nd, 1st, 3rd to keep 1st place in the middle graphically */}
                            {renderPodiumStep(winners[1], 'place-second', '2nd')}
                            {renderPodiumStep(winners[0], 'place-first', '1st')}
                            {renderPodiumStep(winners[2], 'place-third', '3rd')}
                        </div>

                        <div className="button-group" style={{ justifyContent: 'center', marginTop: '32px', marginBottom: 0 }}>
                            <button className="btn btn--primary btn--lg" onClick={handleFinish}>OK</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
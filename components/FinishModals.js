// components/FinishModals.js
function FinishModals({ players, totals, onClose, onReset }) {
    const [step, setStep] = React.useState('confirm');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [winners, setWinners] = React.useState([]);

    const handleConfirm = () => {
        // Sort players based on user selection
        const sortedPlayers = [...players].sort((a, b) => {
            const scoreA = totals[a.id] || 0;
            const scoreB = totals[b.id] || 0;
            // Ascending: Highest Score is #1. Descending: Lowest Score is #1.
            return sortOrder === 'asc' ? scoreB - scoreA : scoreA - scoreB;
        });
        
        setWinners(sortedPlayers.slice(0, 3)); // Get top 3
        setStep('podium');
        
        // Trigger Confetti Animation
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
        onReset(true); // pass true to skip the default confirm dialog
        onClose();
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
                            {/* 2nd Place */}
                            {winners[1] && (
                                <div className="podium-place place-second">
                                    <div className="podium-avatar" style={{backgroundColor: winners[1].color}}></div>
                                    <div className="podium-name">{winners[1].name}</div>
                                    <div className="podium-score">{totals[winners[1].id] || 0}</div>
                                    <div className="podium-step">2nd</div>
                                </div>
                            )}
                            
                            {/* 1st Place */}
                            {winners[0] && (
                                <div className="podium-place place-first">
                                    <div className="podium-avatar" style={{backgroundColor: winners[0].color}}></div>
                                    <div className="podium-name">{winners[0].name}</div>
                                    <div className="podium-score">{totals[winners[0].id] || 0}</div>
                                    <div className="podium-step">1st</div>
                                </div>
                            )}
                            
                            {/* 3rd Place */}
                            {winners[2] && (
                                <div className="podium-place place-third">
                                    <div className="podium-avatar" style={{backgroundColor: winners[2].color}}></div>
                                    <div className="podium-name">{winners[2].name}</div>
                                    <div className="podium-score">{totals[winners[2].id] || 0}</div>
                                    <div className="podium-step">3rd</div>
                                </div>
                            )}
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
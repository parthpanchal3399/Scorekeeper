// components/PlayerManager.js
function PlayerManager({ players, addPlayer, updatePlayer, removePlayer }) {
    const [newName, setNewName] = React.useState('');
    const [newPlayerColor, setNewPlayerColor] = React.useState(getRandomColor());
    const [newAvatar, setNewAvatar] = React.useState(getRandomAvatar()); // New state
    
    const [editingPlayerId, setEditingPlayerId] = React.useState(null);
    const [editName, setEditName] = React.useState('');
    const [editColor, setEditColor] = React.useState('');
    const [editAvatar, setEditAvatar] = React.useState(''); // New state

    const handleAddPlayer = () => {
        if (!newName.trim()) return alert('Please enter a player name');
        if (players.some(p => p.name.toLowerCase() === newName.toLowerCase())) return alert('Player name already exists');
        
        addPlayer(newName, newPlayerColor, newAvatar);
        setNewName('');
        setNewPlayerColor(getRandomColor());
        setNewAvatar(getRandomAvatar());
    };

    const startEditing = (player) => {
        setEditingPlayerId(player.id);
        setEditName(player.name);
        setEditColor(player.color);
        setEditAvatar(player.avatar || getRandomAvatar());
    };

    const saveEdit = (playerId) => {
        if (!editName.trim()) return alert('Player name cannot be empty');
        if (players.some(p => p.id !== playerId && p.name.toLowerCase() === editName.toLowerCase())) return alert('Player name already exists');
        
        updatePlayer(playerId, editName, editColor, editAvatar);
        setEditingPlayerId(null);
    };

    return (
        <section className="section">
            <h2 className="section-title">👥 Player Management</h2>
            <div className="player-form">
                {/* NEW AVATAR INPUT */}
                <div className="form-field" style={{flex: '0 0 auto'}}>
                    <label className="form-label">Avatar</label>
                    <button className="btn btn--outline avatar-btn" onClick={() => setNewAvatar(getRandomAvatar())} title="Click to randomize!">
                        {newAvatar} 🎲
                    </button>
                </div>
                <div className="form-field">
                    <label className="form-label">Player Name</label>
                    <input type="text" className="form-control" value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter player name"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                    />
                </div>
                <div className="form-field" style={{flex: '0 0 auto'}}>
                    <label className="form-label">Color</label>
                    <input type="color" className="color-input" value={newPlayerColor}
                        onChange={(e) => setNewPlayerColor(e.target.value)} />
                </div>
                <button className="btn btn--primary" onClick={handleAddPlayer}>Add Player</button>
            </div>
            
            {players.length > 0 && (
                <div className="players-list">
                    {players.map(player => (
                        <div key={player.id} className="player-item">
                            {editingPlayerId === player.id ? (
                                <div className="player-edit-mode">
                                    <button className="icon-btn edit-avatar-btn" onClick={() => setEditAvatar(getRandomAvatar())} title="Randomize">
                                        {editAvatar}
                                    </button>
                                    <input type="color" className="edit-color-input" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                                    <input type="text" className="form-control edit-name-input" value={editName} 
                                        onChange={(e) => setEditName(e.target.value)} 
                                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(player.id)} autoFocus />
                                    <button className="icon-btn save-btn" onClick={() => saveEdit(player.id)}>✓</button>
                                    <button className="icon-btn cancel-btn" onClick={() => setEditingPlayerId(null)}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <div className="player-color-dot" style={{ backgroundColor: player.color }}>
                                        {player.avatar}
                                    </div>
                                    <span onDoubleClick={() => startEditing(player)}>{player.name}</span>
                                    <button className="icon-btn edit-player-btn" onClick={() => startEditing(player)}>✎</button>
                                    <button className="icon-btn remove-player-btn" onClick={() => removePlayer(player.id)}>×</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
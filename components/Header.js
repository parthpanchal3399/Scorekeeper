// components/Header.js
function Header({ colorScheme, setColorScheme }) {
    return (
        <header className="app-header">
            <h1 className="app-title">🎯 ScoreKeeper</h1>
            <p className="app-subtitle">Keep track of game scores for any game!</p>
            <button className="btn btn--toggle" onClick={() => setColorScheme(c => c === 'light' ? 'dark' : 'light')}>
                {colorScheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
        </header>
    );
}
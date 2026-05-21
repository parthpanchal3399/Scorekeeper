// app.js
function ScoreKeeper() {
    const gameState = useGameState();
    const [colorScheme, setColorScheme] = React.useState('light');

    React.useEffect(() => {
        const savedScheme = localStorage.getItem('scorekeeper_color_scheme');
        if (savedScheme) setColorScheme(savedScheme);
    }, []);

    React.useEffect(() => {
        document.body.setAttribute('data-color-scheme', colorScheme);
        localStorage.setItem('scorekeeper_color_scheme', colorScheme);
    }, [colorScheme]);

    return (
        <div className="app">
            <Header colorScheme={colorScheme} setColorScheme={setColorScheme} />
            
            <PlayerManager 
                players={gameState.players} 
                addPlayer={gameState.addPlayer} 
                updatePlayer={gameState.updatePlayer} 
                removePlayer={gameState.removePlayer} 
            />

            <ScoreTable 
                players={gameState.players} 
                games={gameState.games} 
                totals={gameState.totals}
                addGame={gameState.addGame} 
                removeGame={gameState.removeGame} 
                resetGames={gameState.resetGames} 
                updateScore={gameState.updateScore} 
            />

            <ScoreChart 
                players={gameState.players} 
                games={gameState.games} 
                totals={gameState.totals} 
                colorScheme={colorScheme} 
            />
        </div>
    );
}

ReactDOM.render(<ScoreKeeper />, document.getElementById('root'));
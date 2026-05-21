// hooks/useGameState.js
const { useState, useEffect, useMemo } = React;

function useGameState() {
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [nextPlayerId, setNextPlayerId] = useState(1);
    const [nextGameId, setNextGameId] = useState(1);

    useEffect(() => {
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
        localStorage.setItem('scorekeeper_players', JSON.stringify(players));
        localStorage.setItem('scorekeeper_games', JSON.stringify(games));
    }, [players, games]);

    const addPlayer = (name, color) => {
        const newPlayer = { id: nextPlayerId, name: name.trim(), color };
        setPlayers([...players, newPlayer]);
        setNextPlayerId(nextPlayerId + 1);
        setGames(games.map(game => ({
            ...game,
            scores: { ...game.scores, [newPlayer.id]: 0 }
        })));
    };

    const updatePlayer = (id, newName, newColor) => {
        setPlayers(players.map(p => 
            p.id === id ? { ...p, name: newName.trim(), color: newColor } : p
        ));
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
        players.forEach(player => { newGame.scores[player.id] = 0; });
        setGames([...games, newGame]);
        setNextGameId(nextGameId + 1);
    };

    const removeGame = (gameId) => {
        if (window.confirm("Are you sure you want to delete this specific game round?")) {
            setGames(games.filter(game => game.id !== gameId));
        }
    };

    const resetGames = () => {
        if (!window.confirm("Are you sure you want to reset all game scores? This keeps players but clears scores.")) return;
        const initialGame = { id: 1, scores: {} };
        players.forEach(player => { initialGame.scores[player.id] = 0; });
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

    const totals = useMemo(() => {
        const t = {};
        players.forEach(player => {
            t[player.id] = games.reduce((total, game) => total + (game.scores[player.id] || 0), 0);
        });
        return t;
    }, [players, games]);

    return {
        players, games, totals,
        addPlayer, updatePlayer, removePlayer,
        addGame, removeGame, resetGames, updateScore
    };
}
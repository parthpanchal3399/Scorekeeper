// utils.js

const AVATARS = [
    // The Originals
    '🐶','🐱','🦊','🐻','🐼','🐯','🦁','🐸','🐵','🦄','🐉','🦖','🐙','👽','🤖','👻','👾','🚀','🛸','🎯','🎲','🎮','👑','🔥','😎','🤠','🤡','🎃',
    
    // Fun Animals & Creatures
    '🦋','🐢','🐧','🦥','🦦','🦝','🦍','🐘','🦩','🦚','🦉','🦇','🦈','🐊','🦕','🦧','🦔','🦄','🧜‍♀️','🧚‍♂️','🧙‍♂️','🧛‍♀️','🦸‍♂️','🦹‍♀️','🧟‍♂️',
    
    // Food & Drinks (Always highly requested!)
    '🌮','🍕','🍔','🍟','🌭','🥨','🥯','🥞','🧇','🥓','🍩','🍪','🎂','🧁','🍦','🍧','🍉','🥑','🍓','🍒','🥥','🍍','🥝','🍹','🧋','☕',
    
    // Nature & Magic
    '🍄','🌵','🌻','🌹','🌴','🍁','⚡','🌟','✨','☄️','🌈','❄️','🔥','💧','🔮','🧿','💎','🧿','🪩',
    
    // Hobbies, Sports & Vehicles
    '🎨','🎸','🥁','🎭','🧩','🎳','🛹','🛼','🥋','🥊','🏎️','🚜','🚁','🚀','🛸','⛵','⚓','⚽','🏀','🏈','⚾','🎾','🎱'
];

const getRandomAvatar = () => {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
};

const exportToCSV = (players, games, totals) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    const headers = ["Game", ...players.map(p => p.name)];
    csvContent += headers.join(",") + "\n";
    
    games.forEach((game, index) => {
        const row = [`Game ${index + 1}`];
        players.forEach(p => row.push(game.scores[p.id] || 0));
        csvContent += row.join(",") + "\n";
    });
    
    const totalRow = ["Total"];
    players.forEach(p => totalRow.push(totals[p.id] || 0));
    csvContent += totalRow.join(",") + "\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scorekeeper_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
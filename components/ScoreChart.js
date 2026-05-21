// components/ScoreChart.js
function ScoreChart({ players, games, totals, colorScheme }) {
    const [chartType, setChartType] = React.useState('bar');
    const chartRef = React.useRef(null);
    const chartInstanceRef = React.useRef(null);

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
            const sortedPlayers = [...players].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
            
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
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true, position: 'top',
                            labels: {
                                font: { size: 14, weight: 'bold' }, color: textColor,
                                usePointStyle: true, pointStyle: 'circle', padding: 15,
                                generateLabels: (chart) => chart.data.labels.map((label, i) => ({
                                    text: label, fillStyle: chart.data.datasets[0].backgroundColor[i],
                                    strokeStyle: chart.data.datasets[0].borderColor[i],
                                    lineWidth: 2, hidden: false, index: i, pointStyle: 'circle', fontColor: textColor
                                }))
                            }
                        },
                        title: { display: true, text: 'Player Total Scores', font: { size: 22, weight: 'bold' }, color: textColor }
                    },
                    scales: {
                        x: { ticks: { font: { size: 16, weight: 'bold' }, color: textColor } },
                        y: { beginAtZero: true, ticks: { font: { size: 16, weight: 'bold' }, color: textColor } }
                    }
                }
            };
        } else {
            const gameLabels = games.map((_, index) => `Game ${index + 1}`);
            const cumulativeScores = getCumulativeScores();
            const datasets = players.map(player => ({
                label: player.name, data: cumulativeScores[player.id],
                borderColor: player.color, backgroundColor: player.color,
                borderWidth: 3, pointRadius: 2, yAxisID: 'y'
            }));

            return {
                type: 'line', data: { labels: gameLabels, datasets: datasets },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: true, labels: { color: textColor } } },
                    scales: {
                        x: { ticks: { color: textColor } },
                        y: { position: 'right', beginAtZero: true, ticks: { color: textColor } }
                    }
                }
            };
        }
    };

    React.useEffect(() => {
        if (chartRef.current && players.length > 0 && games.length > 0) {
            if (chartInstanceRef.current) chartInstanceRef.current.destroy();
            chartInstanceRef.current = new Chart(chartRef.current.getContext('2d'), getChartConfig());
        }
    }, [players, games, colorScheme, chartType]);

    if (players.length === 0 || games.length === 0) return null;

    return (
        <section className="section">
            <h2 className="section-title">📈 Score Chart</h2>
            <button className="btn btn--secondary" onClick={() => setChartType(chartType === "bar" ? "line" : "bar")} style={{ marginBottom: '16px' }}>
                {chartType === "bar" ? "📈 Switch to Line Chart" : "📊 Switch to Bar Chart"}
            </button>
            <div className="chart-container">
                <canvas ref={chartRef} className="chart-canvas"></canvas>
            </div>
        </section>
    );
}
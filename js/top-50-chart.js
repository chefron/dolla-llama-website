// Terminal animation functions
function createTerminalLine(text, delay = 0, extraClass = '') {
    const line = document.createElement('div');
    line.className = `analysis-line ${extraClass}`.trim();
    line.style.animationDelay = `${delay}ms`;
    line.textContent = text;
    return line;
}

async function animateTerminal(dollaSongs, top50Songs) {
    const terminal = document.getElementById('terminal-output');
    if (!terminal) {
        console.error("Terminal element not found!");
        return;
    }
    
    terminal.innerHTML = '';
    let delay = 0;
    const delayIncrement = 100;

    function getProgressBar(value) {
        if (value == null) return '';
        const bars = Math.round(value / 10);
        return `[${'█'.repeat(bars)}${'.'.repeat(10-bars)}]`;
    }

    // Add intro lines
    const introLines = [
        "> INITIALIZING AUDIO ANALYSIS ALGORITHM...",
        "> PROCESSING WAVEFORM DATA...",
        "> BEGINNING ANALYSIS..."
    ];

    introLines.forEach(line => {
        terminal.appendChild(createTerminalLine(line, delay));
        delay += delayIncrement;
    });

    // Process Dolla Llama songs
    terminal.appendChild(createTerminalLine("\n> ANALYZING DOLLA LLAMA CATALOG...", delay, 'dolla-terminal-line'));
    delay += delayIncrement * 2;

    for (const song of dollaSongs) {
        if (!song || !song.Song) continue;
        
        // Add blank line before each track (except the first one)
        terminal.appendChild(createTerminalLine("\u00A0", delay, 'dolla-terminal-line'));
        delay += delayIncrement;
        
        terminal.appendChild(createTerminalLine(`> TRACK: "${song.Song}"`, delay, 'dolla-terminal-line'));
        delay += delayIncrement;
        
        const metrics = [
            { label: "ARTIST", value: song.Artist || '-' },
            { label: "GENRE", value: (song['Parent Genres'] || '-') },
            { label: "LENGTH", value: (song.Time || '-') },
            { label: "DANCEABLE", value: song.Dance != null ? `${song.Dance}% ${getProgressBar(song.Dance)}` : '-' },
            { label: "ENERGETIC", value: song.Energy != null ? `${song.Energy}% ${getProgressBar(song.Energy)}` : '-' },
            { label: "ACOUSTIC", value: song.Acoustic != null ? `${song.Acoustic}% ${getProgressBar(song.Acoustic)}` : '-' },
            { label: "INSTRUMENTAL", value: song.Instrumental != null ? `${song.Instrumental}% ${getProgressBar(song.Instrumental)}` : '-' },
            { label: "HAPPY", value: song.Happy != null ? `${song.Happy}% ${getProgressBar(song.Happy)}` : '-' },
            { label: "SPEECHY", value: song.Speech != null ? `${song.Speech}% ${getProgressBar(song.Speech)}` : '-' },
            { label: "LIVE", value: song.Live != null ? `${song.Live}% ${getProgressBar(song.Live)}` : '-' }
        ];

        metrics.forEach(metric => {
            if (metric && metric.value != null && metric.value !== undefined) {
                try {
                    const text = String(metric.value).includes('%')
                        ? `> ${metric.label.padEnd(12)}: ${metric.value}`
                        : `> ${metric.label.padEnd(12)}: ${metric.value}`;
                    terminal.appendChild(createTerminalLine(text, delay, 'dolla-terminal-line'));
                    delay += delayIncrement;
                } catch (e) {
                    console.error("Error processing metric:", metric, e);
                }
            }
        });
    }

        // After processing Dolla's songs...

    // Process Top 50 songs (but only show top 10)
    terminal.appendChild(createTerminalLine("\n\u00A0", delay));  // Extra blank line between sections
    terminal.appendChild(createTerminalLine("\n> ANALYZING SPOTIFY TOP 50 USA...", delay));
    delay += delayIncrement * 2;

    const topTenSongs = top50Songs.slice(0, 10);  // Get first 10 songs
    
    for (const song of topTenSongs) {
        if (!song || !song.Song) continue;
        
        // Add blank line before each track
        terminal.appendChild(createTerminalLine("\u00A0", delay));
        delay += delayIncrement;
        
        terminal.appendChild(createTerminalLine(`> TRACK: "${song.Song}"`, delay));
        delay += delayIncrement;
        
        const metrics = [
            { label: "ARTIST", value: song.Artist || '-' },
            { label: "GENRE", value: (song['Parent Genres'] || '-') },
            { label: "LENGTH", value: (song.Time || '-') },
            { label: "DANCEABLE", value: song.Dance != null ? `${song.Dance}% ${getProgressBar(song.Dance)}` : '-' },
            { label: "ENERGETIC", value: song.Energy != null ? `${song.Energy}% ${getProgressBar(song.Energy)}` : '-' },
            { label: "ACOUSTIC", value: song.Acoustic != null ? `${song.Acoustic}% ${getProgressBar(song.Acoustic)}` : '-' },
            { label: "INSTRUMENTAL", value: song.Instrumental != null ? `${song.Instrumental}% ${getProgressBar(song.Instrumental)}` : '-' },
            { label: "HAPPY", value: song.Happy != null ? `${song.Happy}% ${getProgressBar(song.Happy)}` : '-' },
            { label: "SPEECHY", value: song.Speech != null ? `${song.Speech}% ${getProgressBar(song.Speech)}` : '-' },
            { label: "LIVE", value: song.Live != null ? `${song.Live}% ${getProgressBar(song.Live)}` : '-' }
        ];

        metrics.forEach(metric => {
            if (metric && metric.value != null && metric.value !== undefined) {
                try {
                    const text = String(metric.value).includes('%')
                        ? `> ${metric.label.padEnd(12)}: ${metric.value}`
                        : `> ${metric.label.padEnd(12)}: ${metric.value}`;
                    terminal.appendChild(createTerminalLine(text, delay));
                    delay += delayIncrement;
                } catch (e) {
                    console.error("Error processing metric:", metric, e);
                }
            }
        });
    }

    // Add summary message for remaining songs
    terminal.appendChild(createTerminalLine("\u00A0", delay));
    delay += delayIncrement;
    terminal.appendChild(createTerminalLine("> ANALYSIS TRUNCATED...", delay));
    delay += delayIncrement;
    terminal.appendChild(createTerminalLine(`> ${top50Songs.length - 10} MORE TRACKS IN CURRENT TOP 50`, delay));
}
// Main chart code
window.onload = async function() {
    const { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } = Recharts;

    // Get container and clear it
    const chartContainer = document.getElementById('top-50-chart');
    chartContainer.innerHTML = '';
    
    // Create single wrapper with class
    const wrapper = document.createElement('div');
    wrapper.className = 'data-page-chart';
    chartContainer.appendChild(wrapper);

    // Default data in case loading fails
    let chartData = [
        { subject: 'Danceable', top50: 80, dolla: 70 },
        { subject: 'Energetic', top50: 70, dolla: 80 },
        { subject: 'Live', top50: 10, dolla: 15 },
        { subject: 'Acoustic', top50: 100, dolla: 20 },
        { subject: 'Happy', top50: 75, dolla: 65 },
        { subject: 'Speechy', top50: 20, dolla: 25 },
        { subject: 'Instrumental', top50: 10, dolla: 5 }
    ];

    try {
        // Load data for the radar chart
        const top50Response = await fetch('../../spotify-tracker/current_averages.csv');
        const top50Content = await top50Response.text();
        const top50Result = Papa.parse(top50Content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        const dollaResponse = await fetch('../../spotify-tracker/dolla_averages.csv');
        const dollaContent = await dollaResponse.text();
        const dollaResult = Papa.parse(dollaContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        if (top50Result.data.length > 0 && dollaResult.data.length > 0) {
            const top50Data = top50Result.data[top50Result.data.length - 1];
            const dollaData = dollaResult.data[0];
            
            chartData = [
                { subject: 'Danceable', top50: top50Data.Danceable, dolla: dollaData.Danceable },
                { subject: 'Energetic', top50: top50Data.Energetic, dolla: dollaData.Energetic },
                { subject: 'Live', top50: top50Data.Live, dolla: dollaData.Live },
                { subject: 'Acoustic', top50: top50Data.Acoustic, dolla: dollaData.Acoustic },
                { subject: 'Happy', top50: top50Data.Happy, dolla: dollaData.Happy },
                { subject: 'Speechy', top50: top50Data.Speechy, dolla: dollaData.Speechy },
                { subject: 'Instrumental', top50: top50Data.Instrumental, dolla: dollaData.Instrumental }
            ];
        }

        // Load the full catalogs for terminal display
        const dollaFullResponse = await fetch('../../spotify-tracker/dolla_catalog.csv');
        const top50FullResponse = await fetch('../../spotify-tracker/Top 50 - USA.csv');
        
        const dollaFullContent = await dollaFullResponse.text();
        const top50FullContent = await top50FullResponse.text();
        
        const dollaFullData = Papa.parse(dollaFullContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        const top50FullData = Papa.parse(top50FullContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        if (dollaFullData.data.length > 0 && top50FullData.data.length > 0) {
            // Start terminal animation with both catalogs
            animateTerminal(dollaFullData.data, top50FullData.data);
        }

    } catch (error) {
        console.error('Error loading data:', error);
        // Using default data if there's an error
    }

    const Chart = React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
        React.createElement(RadarChart, { 
            data: chartData,
            margin: { top: 50, right: 50, bottom: 50, left: 50 },
            style: { overflow: 'visible' }
        },
            React.createElement(PolarGrid, { 
                stroke: "#fff", 
                strokeOpacity: .9, 
                gridType: "circle", 
                strokeDasharray: "2 8" 
            }),
            React.createElement(PolarAngleAxis, { 
                dataKey: "subject",
                tick: { 
                    fill: '#fff',
                    fontSize: '1.2em',
                    fontFamily: 'VT323',
                    opacity: 0.9,
                    textAnchor: 'middle',
                    dy: 5
                }
            }),
            React.createElement(PolarRadiusAxis, { 
                angle: 30,
                domain: [0, 100],
                tick: false,
                axisLine: false
            }),
            React.createElement(Radar, {
                name: "Top 50",
                dataKey: "top50",
                stroke: "#00ff00",
                strokeWidth: 3,
                fill: "#00ff00",
                fillOpacity: 0.2
            }),
            React.createElement(Radar, {
                name: "Dolla Llama",
                dataKey: "dolla",
                stroke: "#ff0000",
                strokeWidth: 3,
                fill: "#ff0000",
                fillOpacity: 0.35
            })
        )
    );

    // Render the chart into the wrapper
    ReactDOM.render(Chart, wrapper);
};
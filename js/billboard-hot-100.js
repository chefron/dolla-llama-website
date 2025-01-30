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
    const delayIncrement = 300;

    function getProgressBar(value) {
        if (value == null) return '';
        const filled = Math.round(value / 10);
        return `[${'■'.repeat(filled)}${('·').repeat(10-filled)}]`; // Square blocks and dots
    }

    // Add intro lines
    const introLines = [
        "> INITIALIZING ALGORITHM...",
        "> PROCESSING WAVEFORM DATA...",
        "> BEGINNING ANALYSIS..."
    ];

    introLines.forEach(line => {
        terminal.appendChild(createTerminalLine(line, delay));
        delay += delayIncrement * 1.5;
    });

    // Process Dolla Llama songs
    terminal.appendChild(createTerminalLine("\u00A0", delay));
    terminal.appendChild(createTerminalLine("\n> ANALYZING DOLLA LLAMA CATALOG...", delay));
    delay += delayIncrement * 1;

    for (const song of dollaSongs) {
        if (!song || !song.Song) continue;
        
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

    terminal.appendChild(createTerminalLine("\n\u00A0", delay));
    terminal.appendChild(createTerminalLine("\n> ANALYZING BILLBOARD HOT 100...", delay));
    delay += delayIncrement * 2;

    const topTenSongs = top50Songs.slice(0, 10);
    
    for (const song of topTenSongs) {
        if (!song || !song.Song) continue;
        
        terminal.appendChild(createTerminalLine("\u00A0", delay));
        delay += delayIncrement;
        
        terminal.appendChild(createTerminalLine(`> TRACK: "${song.Song}"`, delay, 'billboard-terminal-line'));
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
                    terminal.appendChild(createTerminalLine(text, delay, 'billboard-terminal-line'));
                    delay += delayIncrement;
                } catch (e) {
                    console.error("Error processing metric:", metric, e);
                }
            }
        });
    }

    terminal.appendChild(createTerminalLine("\u00A0", delay));
    delay += delayIncrement;
    terminal.appendChild(createTerminalLine("> ANALYSIS TRUNCATED...", delay));
    delay += delayIncrement;
    terminal.appendChild(createTerminalLine(`> ${top50Songs.length - 10} MORE TRACKS IN CURRENT TOP 50`, delay));
}

// Main chart code
window.onload = async function() {
    const { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } = Recharts;
    
    // Get the container where the chart will be rendered
    const chartInner = document.querySelector('.chart-inner');
    
    // Default data in case loading fails
    let chartData = [
        { subject: 'Danceable', billboard: 80, dolla: 70 },
        { subject: 'Energetic', billboard: 70, dolla: 80 },
        { subject: 'Live', billboard: 10, dolla: 15 },
        { subject: 'Acoustic', billboard: 100, dolla: 20 },
        { subject: 'Happy', billboard: 75, dolla: 65 },
        { subject: 'Speechy', billboard: 20, dolla: 25 },
        { subject: 'Instrumental', billboard: 10, dolla: 5 }
    ];

    try {
        // Load data for the radar chart
        const billboardResponse = await fetch('../../spotify-tracker/current_averages.csv');
        const billboardContent = await billboardResponse.text();
        const billboardResult = Papa.parse(billboardContent, {
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

        if (billboardResult.data.length > 0 && dollaResult.data.length > 0) {
            const billboardData = billboardResult.data[billboardResult.data.length - 1];
            const dollaData = dollaResult.data[0];
            
            chartData = [
                { subject: 'DANCEABLE', billboard: billboardData.Danceable, dolla: dollaData.Danceable },
                { subject: 'ENERGETIC', billboard: billboardData.Energetic, dolla: dollaData.Energetic },
                { subject: 'LIVE', billboard: billboardData.Live, dolla: dollaData.Live },
                { subject: 'ACOUSTIC', billboard: billboardData.Acoustic, dolla: dollaData.Acoustic },
                { subject: 'HAPPY', billboard: billboardData.Happy, dolla: dollaData.Happy },
                { subject: 'SPEECHY', billboard: billboardData.Speechy, dolla: dollaData.Speechy },
                { subject: 'INSTRUMENTAL', billboard: billboardData.Instrumental, dolla: dollaData.Instrumental }
            ];
        }

        // Load the full catalogs for terminal display
        const dollaFullResponse = await fetch('../../spotify-tracker/dolla_catalog.csv', {
            cache: 'no-store'
        });
        const billboardFullResponse = await fetch('../../spotify-tracker/Billboard Hot 100.csv');
        
        const dollaFullContent = await dollaFullResponse.text();
        const billboardFullContent = await billboardFullResponse.text();
        
        const dollaFullData = Papa.parse(dollaFullContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        const billboardFullData = Papa.parse(billboardFullContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        if (dollaFullData.data.length > 0 && billboardFullData.data.length > 0) {
            animateTerminal(dollaFullData.data, billboardFullData.data);
        }

    } catch (error) {
        console.error('Error loading data:', error);
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
                    fontSize: '.8em',
                    fontFamily: 'JetBrains Mono',
                    opacity: 1,
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
                name: "Billboard Hot 100",
                dataKey: "billboard",
                stroke: "#a020f0",
                strokeWidth: 3,
                fill: "#a020f0",
                fillOpacity: 0.2
            }),
            React.createElement(Radar, {
                name: "Dolla Llama",
                dataKey: "dolla",
                stroke: "#edda1c",
                strokeWidth: 3,
                fill:"#edda1c",
                fillOpacity: 0.35
            })
        )
    );

    ReactDOM.render(Chart, chartInner);
};
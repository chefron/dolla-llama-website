// Terminal animation functions remain unchanged
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
        delay += delayIncrement * 2;
    });

    // Process Dolla Llama songs
    terminal.appendChild(createTerminalLine("\u00A0", delay));
    terminal.appendChild(createTerminalLine("\n> ANALYZING DOLLA LLAMA CATALOG...", delay, 'dolla-terminal-line'));
    delay += delayIncrement * 2;

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
    terminal.appendChild(createTerminalLine("\n> ANALYZING SPOTIFY TOP 50 USA...", delay));
    delay += delayIncrement * 2;

    const topTenSongs = top50Songs.slice(0, 10);
    
    for (const song of topTenSongs) {
        if (!song || !song.Song) continue;
        
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

    terminal.appendChild(createTerminalLine("\u00A0", delay));
    delay += delayIncrement;
    terminal.appendChild(createTerminalLine("> ANALYSIS TRUNCATED...", delay));
    delay += delayIncrement;
    terminal.appendChild(createTerminalLine(`> ${top50Songs.length - 10} MORE TRACKS IN CURRENT TOP 50`, delay));
}

// Main chart code
window.onload = async function() {
    const { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } = Recharts;

    const chartContainer = document.getElementById('top-50-chart');
    chartContainer.innerHTML = '';
    
    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full';
    wrapper.style.maxWidth = '100%';
    wrapper.style.margin = '0 auto';

    // Create image
    const img = document.createElement('img');
    img.src = '../../assets/chart_bg.png';
    img.alt = 'Dolla Llama';
    img.className = 'w-full h-auto';
    img.style.border = '2px solid #E4E4E4';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 0 20px #a020f04b';
    wrapper.appendChild(img);

    // Create outer chart div
    const outerChartDiv = document.createElement('div');
    outerChartDiv.style.position = 'absolute';
    outerChartDiv.style.left = '55%';
    outerChartDiv.style.top = '62%';
    outerChartDiv.style.transform = 'translate(-50%, -50%)';
    outerChartDiv.style.width = '75%';
    outerChartDiv.style.height = '75%';
    outerChartDiv.style.overflow = 'visible';

    // Create inner chart div
    const innerChartDiv = document.createElement('div');
    innerChartDiv.style.position = 'absolute';
    innerChartDiv.style.left = '50%';
    innerChartDiv.style.top = '50%';
    innerChartDiv.style.transform = 'translate(-50%, -50%)';
    innerChartDiv.style.width = '100%';
    innerChartDiv.style.height = '100%';

    outerChartDiv.appendChild(innerChartDiv);
    wrapper.appendChild(outerChartDiv);
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
                { subject: 'DANCEABLE', top50: top50Data.Danceable, dolla: dollaData.Danceable },
                { subject: 'ENERGETIC', top50: top50Data.Energetic, dolla: dollaData.Energetic },
                { subject: 'LIVE', top50: top50Data.Live, dolla: dollaData.Live },
                { subject: 'ACOUSTIC', top50: top50Data.Acoustic, dolla: dollaData.Acoustic },
                { subject: 'HAPPY', top50: top50Data.Happy, dolla: dollaData.Happy },
                { subject: 'SPEECHY', top50: top50Data.Speechy, dolla: dollaData.Speechy },
                { subject: 'INSTRUMENTAL', top50: top50Data.Instrumental, dolla: dollaData.Instrumental }
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
            animateTerminal(dollaFullData.data, top50FullData.data);
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
                name: "Top 50",
                dataKey: "top50",
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

    ReactDOM.render(Chart, innerChartDiv);
};
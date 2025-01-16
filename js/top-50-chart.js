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

    // Try to load both datasets
    try {
        // Load Top 50 data
        const top50Response = await fetch('../../spotify-tracker/current_averages.csv');
        const top50Content = await top50Response.text();
        const top50Result = Papa.parse(top50Content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        // Load Dolla Llama data
        const dollaResponse = await fetch('../../spotify-tracker/dolla_averages.csv');
        const dollaContent = await dollaResponse.text();
        const dollaResult = Papa.parse(dollaContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });

        console.log('Top 50 data:', top50Result.data);
        console.log('Dolla data:', dollaResult.data);

        if (top50Result.data.length > 0 && dollaResult.data.length > 0) {
            const top50Data = top50Result.data[top50Result.data.length - 1];
            const dollaData = dollaResult.data[0];  // Only one row of averages
            
            // Combine both datasets
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
                strokeOpacity: .8, 
                gridType: "circle", 
                strokeDasharray: "1 8" 
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
            }),
            React.createElement(Legend, {
                align: "center",
                verticalAlign: "bottom",
                payload: [
                    { value: 'Dolla Llama', color: '#ff0000', type: 'line' },
                    { value: 'Spotify Top 50', color: '#00ff00', type: 'line' } 
                ],
                wrapperStyle: { 
                    color: '#fff', 
                    opacity: 0.9,
                    fontFamily: 'VT323',
                    fontSize: '1.2em',
                    columnGap: '5em'
                }
            })
        )
    );

    // Render the chart into the wrapper
    ReactDOM.render(Chart, wrapper);
};
// Create radar chart using Recharts
window.onload = function() {
    const { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } = Recharts;

    // Add the wrapper div and image
    const chartContainer = document.getElementById('radar-chart');
    chartContainer.innerHTML = ''; // Clear loading message
    
    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full';
    wrapper.style.maxWidth = '50%'; // Constrain width within the container
    wrapper.style.margin = '0 auto'; // Center it
    
    // Create image
    const img = document.createElement('img');
    img.src = 'assets/chart_bg_with_text.png';
    img.alt = 'Dolla Llama';
    img.className = 'w-full h-auto';
    wrapper.appendChild(img);
    
    // Create an outer div for the padded area
    const outerChartDiv = document.createElement('div');
    outerChartDiv.style.position = 'absolute';
    outerChartDiv.style.left = '55%';
    outerChartDiv.style.top = '62%';
    outerChartDiv.style.transform = 'translate(-50%, -50%)';
    outerChartDiv.style.width = '80%';
    outerChartDiv.style.height = '80%';
    outerChartDiv.style.overflow = 'visible';
    
    // Create inner div for the visible chart area (with border)
    const innerChartDiv = document.createElement('div');
    innerChartDiv.style.position = 'absolute';
    innerChartDiv.style.left = '50%';
    innerChartDiv.style.top = '50%';
    innerChartDiv.style.transform = 'translate(-50%, -50%)';
    innerChartDiv.style.width = '55.5%';
    innerChartDiv.style.height = '55.5%';
    innerChartDiv.style.border = '2px solid red';
    
    outerChartDiv.appendChild(innerChartDiv);
    wrapper.appendChild(outerChartDiv);
    
    // Add wrapper to container
    chartContainer.appendChild(wrapper);

    const data = [
        { subject: 'danceable', value: 80 },
        { subject: 'energetic', value: 70 },
        { subject: 'live', value: 10 },
        { subject: 'acoustic', value: 10 },
        { subject: 'happy', value: 75 },
        { subject: 'speechy', value: 20 },
        { subject: 'instrumental', value: 10 }
    ];

    const Chart = React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
        React.createElement(RadarChart, { 
            data: data,
            margin: { top: 50, right: 50, bottom: 50, left: 50 },
            style: { overflow: 'visible' }
        },
            React.createElement(PolarGrid, { stroke: "#fff", strokeOpacity: 0.5, gridType: "circle", strokeDasharray: "1 8" }),
            React.createElement(PolarAngleAxis, { 
                dataKey: "subject",
                tick: { 
                    fill: '#fff',
                    fontSize: '.7rem',
                    fontFamily: 'Roboto',
                    opacity: 0.75,
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
                name: "Stats",
                dataKey: "value",
                stroke: "#ff0000",      // Bright red outline
                strokeWidth: 3,         // Make the outline thicker
                fill: "#ff0000",        // Red fill
                fillOpacity: 0.2        // Very transparent fill
            })
        )
    );

    // Render the chart into the outer div
    ReactDOM.render(Chart, outerChartDiv);
};
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = { min: 1, max:15};
  colors = {national: '#FF7F50', american: '#28A99E'}

/* LOAD DATA */
d3.csv('../data/mlbSeasonStats.csv', d3.autoType)
  .then(data => {
    console.log(data)

    /* SCALES */
    // xscale  - linear,count
    const xScale = d3.scaleLinear()
    .domain([d3.min(data.map(d => d.strikeouts)), d3.max(data.map(d => d.strikeouts))])
    .range([margin.left, width - margin.right])

    // yscale - linear,count
    const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.homeruns), d3.max(data, d => d.homeruns)])
    .range([height - margin.bottom, margin.top])

    // colorScale - ordinal, R vs. D
    const colorScale = d3.scaleOrdinal()
    .domain(["National", "American"])
    .range([colors.national, colors.american, "red"])

    // sizeScale - area, count
    const sizeScale = d3.scaleSqrt()
    .domain([d3.min(data, d => d.wins), d3.max(data, d => d.wins)])
    .range([radius.min, radius.max])
    console.log(sizeScale)

    /* HTML ELEMENTS */
    // svg
    const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

    // axis scales
    const xAxis = d3.axisBottom(xScale)
    svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);
    
    // circles
    const dot = svg
    .selectAll("circle")
    .data(data, d => d.team) // second argument is the unique key for that row
    .join("circle")
    .attr("cx", d => xScale(d.strikeouts))
    .attr("cy", d => yScale(d.homeruns))
    .attr("r", d => sizeScale(d.wins))
    .attr("fill", d => colorScale(d.league))
    .attr("class", "bubble")

    // team labels for circles
    const teamLabels = svg
    .selectAll(".team-labels")
    .data(data, d => d.teamAbbrev)
    .join("text")
    .attr("x", d => xScale(d.strikeouts))
    .attr("y", d => yScale(d.homeruns))
    .text(d => d.teamAbbrev)
    .attr("text-anchor", "middle")
    .attr("class", "team-labels")

  });
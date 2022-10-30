/* CONSTANTS AND GLOBALS */
//we need some room on the right for labels
var margin = {
  top: 15,
  right: 60,
  bottom: 15,
  left: 50
};

const width = 500 - margin.left-margin.right;
const height = window.innerHeight *.8 ;

/* LOAD DATA */
d3.csv('../data/squirrelActivities.csv', d3.autoType)
.then(data => {
  console.log("data", data)

  const sortedData = [...data].sort((a, b) => b.count - a.count)
  console.log('sortedData', sortedData)

  // yscale - categorical, activity
  const yScale = d3.scaleBand()
    .domain(sortedData.map(d => d.activity))
    .range([0, height])
    .paddingInner(.2)

  // xscale - linear, count
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d=> d.count)])
    .range([0, width]);

  // color scale
  const colorScale = d3.scaleOrdinal()
    .domain(sortedData.map(d => d.activity))
    .range(["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"])

  // /* HTML ELEMENTS */
  // // svg
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // bars
  const bars = svg.selectAll("rect.bars")
    .data(sortedData)
    .join("rect")
    .attr("class", "bars")
    .attr("width", d => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("y", d => yScale(d.activity))
    .attr("x", margin.left)
    .attr("fill", d => colorScale(d.activity))

  // x axis
  const xAxis = svg.append("g")
    .call(d3.axisBottom(xScale))
    .attr("transform", `translate(${margin.left},${height + (margin.bottom-2)})`);

  // y axis
  const yAxis = svg.append("g")
    .call(d3.axisLeft(yScale))
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

});
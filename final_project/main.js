/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 60 },
  radius = 3;

/*
this extrapolated function allows us to replace the "G" with "B" min the case of billions.
we cannot do this in the .tickFormat() because we need to pass a function as an argument,
and replace needs to act on the text (result of the function).
*/
// const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')
// const formatDate = d3.timeFormat("%Y")

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale; // maybe move this to const -- won't change by data
let yScale;
let yAxis;
let xAxisGroup; // maybe move this to const -- won't change by data
let yAxisGroup;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "All", // + YOUR FILTER SELECTION
  highlight: "None", // YOUR HIGHLIGHT SELECTION
};

/* LOAD DATA */
// Define a function to parse our date column when loading the csv
const parseDate = d3.timeParse("%Y-%m-%d")

// + SET YOUR DATA PATH
d3.csv('data/format_test.csv', d => {
  // use custom initializer to reformat the data the way we want it
  // ref: https://github.com/d3/d3-fetch#dsv
  return {
    // date: new Date(d.date),
    date: parseDate(d.date),
    category: d.category,
    series: d.series,
    value: +d.value
  }
})
  .then(data => {
    console.log("loaded data:", data);
    state.data = data;
    init();
  });

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3.scaleTime()
    .domain(d3.extent(state.data, d => d.date))
    .range([margin.right, width - margin.left])

  yScale = d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.value))
    .range([height - margin.bottom, margin.top])


  // + AXES
  const xAxis = d3.axisBottom(xScale)
    .ticks(6) // limit the number of tick marks showing -- note: this is approximate
  yAxis = d3.axisLeft(yScale)
    // .tickFormat(formatBillions)


  // + UI ELEMENT SETUP

  // Dropdown for category filter
  const selectElement = d3.select("#category-dropdown")

  // add in dropdown options from the unique values in the data
  selectElement.selectAll("option")
    .data([
      // manually add the first value
      "Select filter",
      // add in all the unique values from the dataset
      ...new Set(state.data.map(d => d.category))])
    .join("option")
    .attr("attr", d => d)
    .text(d => d)

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  selectElement.on("change", event => {
    state.selection = event.target.value
    console.log('state has been updated to: ', state)
    draw(); // re-draw the graph based on this new selection
  });

  // + CREATE SVG ELEMENT
  svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // + CALL AXES
  xAxisGroup = svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${0}, ${height - margin.bottom})`)
    .call(xAxis)

  xAxisGroup.append("text")
    .attr("class", 'xLabel')
    .attr("transform", `translate(${width / 2}, ${35})`)
    .text("Year")

  yAxisGroup = svg.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.right}, ${0})`)
    .call(yAxis)

  yAxisGroup.append("text")
    .attr("class", 'yLabel')
    .attr("transform", `translate(${-45}, ${height / 2})`)
    .attr("writing-mode", 'vertical-rl')
    .text("Population")

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
    .filter(d => d.category === state.selection)
  
  // GROUP DATA BY SERIES SO THAT WE CAN CHART INDIVIDUAL LINES
  const groupedData = d3.group(filteredData, d => d.series)

  // UPDATE SERIES HIGHLIGHT DROPDOWN
  const highlightElement = d3.select("#series-dropdown")

  // add in dropdown options from the unique values in the data
  highlightElement.selectAll("option")
    .data([
      // manually add the first value
      "Highlight series",
      // add in all the unique values from the dataset
      ...new Set(filteredData.map(d => d.series))])
    .join("option")
    .attr("attr", d => d)
    .text(d => d)

  // change line color based on selection
  highlightElement.on("change", event => {
    state.highlight = event.target.value
    console.log('highlight has been updated to: ', state)
    console.log(state.highlight)
    // applyLineClass()
    highlight(state.highlight);
    
    //append a class or otherwise change line's fill to red
    // could trigger another function that selects lines by class but we need to add unque classes to each line for this to work
    // draw(); // re-draw the graph based on this new selection
  });
    
  // + UPDATE SCALE(S), if needed
  yScale.domain([0, d3.max(filteredData, d => d.value)])
  // + UPDATE AXIS/AXES, if needed
  yAxisGroup
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale))// need to udpate the scale

  // specify line generator function
  const lineGen = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))  

// console.log(Array.from(groupedData)[0][0])
// console.log(Array.from(groupedData)[1][0])
  

  // + DRAW LINE AND/OR AREA
  svg.selectAll(".line")
    .data(groupedData)
    .join("path")
    .attr("class", 'line')
    .attr("data-name", d => d[0]) // give each line a data-name attribute of its series name
    .attr("fill", "none")
    // .attr("stroke", "black")
    .transition()
    .duration(1000)
    .attr("d", d => lineGen(d[1]))
    // .attr("class", d => d.series)

}

/* HIGHLIGHT FUNCTION */
function applyLineClass(){
  svg.selectAll(".line")
    .attr("class", "line")
}
// This applies a class based on state.highlight
function highlight(seriesName) {
  //select all lines and remove .highlight, then select the specific line and add .highlight

  svg.selectAll(".line")
    .attr("class", "line")

  svg.selectAll("[data-name=" + seriesName + "]")
    .attr("class", "highlight line")
};
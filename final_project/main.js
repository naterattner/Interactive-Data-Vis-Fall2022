/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 60 },
  innerChartWidth = width - margin.left - margin.right,
  innerChartHeight = height - margin.top - margin.bottom,
  radius = 3
  ;

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
let grid;
let dataPointLabel;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "overall", // + YOUR FILTER SELECTION -- start with overall loaded
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

  // // Dropdown for category filter
  // const selectElement = d3.select("#category-dropdown")

  // // add in dropdown options from the unique values in the data
  // selectElement.selectAll("option")
  //   .data([
  //     // manually add the first value
  //     "Select filter",
  //     // add in all the unique values from the dataset
  //     ...new Set(state.data.map(d => d.category))])
  //   .join("option")
  //   .attr("attr", d => d)
  //   .text(d => d)

  // // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  // selectElement.on("change", event => {
  //   state.selection = event.target.value
  //   console.log('state has been updated to: ', state)
  //   draw(); // re-draw the graph based on this new selection
  // });

  // + CREATE SVG ELEMENT
  svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // + CALL AXES
  xAxisGroup = svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${0}, ${height - margin.bottom})`)
    .call(xAxis)

  yAxisGroup = svg.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.right}, ${0})`)
    .call(yAxis
      .tickSizeInner(-width)
      .tickPadding(10)
      )

  d3.selectAll(".yAxis line")
      .style("stroke", "#E0E0E0")

  dataPointLabel = svg.append("g")
    .attr("display", "none")
    .attr("class", "data-point-label")

  dataPointLabel.append("circle")
    .attr("r", radius)
    .attr("stroke-width", 0)
    .attr("fill", "black")
  
  dataPointLabel.append("text")
    // .attr("y", -8)
    .text(null);

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
      "Use dropdown to highlight",
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
    .curve(d3.curveLinear)

// console.log(Array.from(groupedData)[0][0])
// console.log(Array.from(groupedData)[1][0])
  

  // + DRAW LINE AND/OR AREA
  const path = svg.selectAll(".line")
    .data(groupedData)
    .join("path")
    .attr("class", 'line')
    .attr("data-name", d => d[0]) // give each line a data-name attribute of its series name
    .attr("fill", "none")
    .attr("stroke", "#D3D3D3")
    // .attr("stroke", "#9380B6")
    .attr("stroke-width", "0")
    .attr("d", d => lineGen(d[1]))
    .transition()
      .duration(500)
      .attr("stroke-width", "2")
      
  // VORONOI AND TOOLTIPS
  // define constants and functions

  function onMouseEnter(d) {
    state.highlight = d.series
    highlight(state.highlight)

    updateDataPointLabel(d, d.date, d.value)
  }

  function onMouseLeave() {
    state.highlight = "None"
    highlight(state.highlight)

    // dataPointLabel.attr("display", "none")
  }

  function updateDataPointLabel(d, x, y) {
    dataPointLabel
      // .attr("cx", xScale(cx))
      // .attr("cy", yScale(cy))
      .attr("transform", `translate(${xScale(x)}, ${yScale(y)})`)
      .attr("display", null)

      .raise()
    
    // d3.select(".data-point-label")
    // .selectAll("text")
    //   .text(d.series)
    const formatDateLabel = d3.timeFormat("%b %Y")
    const formatNumberLabel = d3.format(".3s")

    let labelText = d3.select(".data-point-label")
    .selectAll("text")

    labelText.text(d.series)
      .attr("x", 0)
      .attr("y", -28)
      .classed("data-point-label-title", true)

    labelText.append("tspan")
      .text(`${formatDateLabel(d.date)}: ` + `${formatNumberLabel(d.value)}`)
      .attr("x", 0)
      .attr("y", -10)
      .classed("data-point-label-body", true)

 

  }

  // destroy existing voronoi
  d3.selectAll('.voronoi').remove()
  let voronoi = null
  let delaunay = null

  delaunay = d3.Delaunay.from(
    filteredData,
    d => xScale(d.date), 
    d => yScale(d.value)
  )

  // create voronoi
  voronoi = delaunay.voronoi([margin.left, margin.top, width - margin.right + 100, height-margin.bottom])

  svg.selectAll(".voronoi")
    .data(filteredData)
    .enter().append("path")
      .attr("class", "voronoi")
  
  svg.selectAll(".voronoi")
    .attr("d", (d,i) => voronoi.renderCell(i))
    // .attr("stroke", "salmon")
    .attr("stroke", "none")
    .attr("fill", "none")
    .attr("opacity", 0.2)
    .attr("pointer-events", "all")
  
  svg.selectAll(".voronoi")
    // .on("mouseenter", onMouseEnter)
    .on("mouseover",(event, d)=>{
      //check what we're passing to the m_over function
      // console.log('data:', d); 
      onMouseEnter(d);
    })
    .on("mouseleave", onMouseLeave)

      
      

    
}











// FUNCTION TO CHANGE CATEGORIES WITH BUTTONS
function changeCategory(buttonName) {
  // change state depending on button clicked and then re-draw with draw()
  state.selection = buttonName
  console.log('state has been updated to: ', state)
  draw();

  // remove the class "pressed" from all buttons
  d3.selectAll(".category-button")
    .classed("pressed", false)

  //give the clicked button a class for styling as "pressed"
  d3.select('#' + buttonName)
  .classed("pressed", true)

  // set highlight to the series with the highest value for the most recent month
  // const largestSeries = state.data
  //   .filter(d => d.category === state.selection)
    
  // groupedData = d3
  //   .group(largestSeries, d => d.series)
    
  //   console.log(groupedData)


  //give the clicked button a class for styling as "pressed"
}










// HIGHLIGHT FUNCTION
// function applyLineClass(){
//   svg.selectAll(".line")
//     // .attr("class", "line")
// }
// This applies a class based on state.highlight
function highlight(seriesName) {
  //select all lines and remove .highlight, then select the specific line and add .highlight
  // other things to do in this function:
  // - bring line to front
  // - reset filter to default when you change category?
  console.log("highlighting " + state.highlight)    

  svg.selectAll(".line")
    .classed("highlight", false) //remove/add a class for highlight, though for now we're styline with JS
    .attr("stroke", "#D3D3D3")
    .attr("stroke-width", 1.5)

  svg.selectAll("[data-name=" + seriesName + "]")
    .classed("highlight", true)
    .attr("class", "highlight line")
    .raise() // bring to front
    .transition()
      .attr("stroke", "#9380B6")
      .attr("stroke-width", 3)
};
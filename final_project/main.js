/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  heightStatic = window.innerHeight * 0.4,
  margin = { top: 20, bottom: 50, left: 60, right: 60 },
  innerChartWidth = width - margin.left - margin.right,
  innerChartHeight = height - margin.top - margin.bottom,
  radius = 3
  
  ;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale; // maybe move this to const -- won't change by data
let yScale;
let yAxis;
let xAxisGroup; // maybe move this to const -- won't change by data
let yAxisGroup;
let dataPointLabel;

let xScaleStatic;
let yScaleStatic;
let xAxisStatic;
let yAxisStatic;
let xAxisGroupStatic;
let yAxisGroupStatic;

/* APPLICATION STATE */
let state = {
  data: [],
  overallData : [],
  selection: "type", // + YOUR FILTER SELECTION -- start with type loaded
  highlight: "None", // YOUR HIGHLIGHT SELECTION
};

/* LOAD DATA */
// Define a function to parse our date column when loading the csv
const parseDate = d3.timeParse("%Y-%m-%d")

// + SET YOUR DATA PATH
Promise.all([
  d3.csv('data/overall_totals.csv', d => {
    // use custom initializer to reformat the data the way we want it
    // ref: https://github.com/d3/d3-fetch#dsv
    return {
      // date: new Date(d.date),
      date: parseDate(d.date),
      category: d.category,
      series: d.series,
      value: +d.value
    }
  }),
  d3.csv('data/change_from_2019_avg.csv', d => {
    // use custom initializer to reformat the data the way we want it
    // ref: https://github.com/d3/d3-fetch#dsv
    return {
      // date: new Date(d.date),
      date: parseDate(d.date),
      category: d.category,
      series: d.series,
      series_clean: d.series_clean,
      change_from_2019_avg: +d.change_from_2019_avg
    }
  }),
]).then(([overallData, changeData]) => {
    console.log("overall data:", overallData);
    console.log("change data:", changeData);
    state.data = changeData;
    state.overallData = overallData;
    init();
  });

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  
  // make the static, intro chart first. We only have to do this once

  const xAxisStaticStartDate = new Date("2004-02-01");

  xScaleStatic = d3.scaleTime()
    .domain(d3.extent(state.overallData, d => d.date))
    .domain([xAxisStaticStartDate, d3.max(state.overallData, d => d.date)])
    .range([margin.right, width - margin.left])
    

  yScaleStatic = d3.scaleLinear()
    .domain([0, d3.max(state.overallData, d => d.value)])
    .range([heightStatic - margin.bottom, margin.top])


  // + AXES
  const xAxisStatic = d3.axisBottom(xScaleStatic)
    // .ticks(3) // limit the number of tick marks showing -- note: this is approximate
    .tickPadding(5)
    .ticks(3)

  yAxisStatic = d3.axisLeft(yScaleStatic)
    .ticks(4)
  

  // + CREATE SVG ELEMENT
  svgStatic = d3.select("#static-chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", heightStatic)

  // + CALL AXES
  xAxisGroupStatic = svgStatic.append("g")
    .attr("class", "xAxisStatic")
    .attr("transform", `translate(${0}, ${heightStatic - margin.bottom})`)
    .call(xAxisStatic)

  yAxisGroupStatic = svgStatic.append("g")
    .attr("class", "yAxisStatic")
    .attr("transform", `translate(${margin.right}, ${0})`)
    .call(yAxisStatic
      .tickSizeInner(-width)
      .tickPadding(10)
      )

      svgStatic.selectAll('.yAxisStatic g line')
      .style("stroke", "#e0e0e0")

  // DRAW STATIC LINE CHART
  // specify line generator function
  const lineGenStatic = d3.line()
   .x(d => xScaleStatic(d.date))
   .y(d => yScaleStatic(d.value))
   .curve(d3.curveLinear) 

 // + DRAW LINE AND/OR AREA
 const path = svgStatic.selectAll(".static-line")
   .data([state.overallData])
   .join("path")
   .attr("class", 'static-line')
  //  .attr("data-name", d => d[0]) // give each line a data-name attribute of its series name
   .attr("fill", "none")
   .attr("stroke", "#005d88")
   .attr("stroke-width", 2.5)
   .attr("d", d => lineGenStatic(d))

  // DRAW VERTICAL LINE FOR START OF PANDEMIC
  const declaredPandemic = new Date("2020-03-11");

  const pandemicDateLine = svgStatic.append("line")
    .attr("x1", xScaleStatic(declaredPandemic))
    .attr("x2", xScaleStatic(declaredPandemic))
    .attr("y1", margin.top) // change this to the max tick value
    .attr("y2", heightStatic - margin.bottom)
    .attr("stroke", "#949494")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", 5,10,5)
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.5)

  const declaredPandemicTextLabelGroup = svgStatic.append("g")
    .attr("transform", `translate(${xScaleStatic(declaredPandemic)}, ${yScaleStatic(50000)})`)
    .attr("class", "pandemic-date-label")

  const declaredPandemicTextLabel = declaredPandemicTextLabelGroup.append("text")
      .text("WHO declares")
      .attr("x", 0)
      .attr("y", -28)
      // .classed("data-point-label-title", true)

  declaredPandemicTextLabel.append("tspan")
      .text("Covid-19 a pandemic")
      .attr("x", 0)
      .attr("y", -10)

  //DRAW STATIC ZERO LINE
   zeroLineStaticEnd = new Date("2027-03-01");
 
   const zeroLineStatic = svgStatic.append("line")
     .attr("x1", xScaleStatic(xAxisStaticStartDate))
     .attr("x2", xScaleStatic(zeroLineStaticEnd))
     .attr("y1", yScaleStatic(0)) // change this to the max tick value
     .attr("y2", yScaleStatic(0))
     .attr("stroke", "#171717")
     .attr("stroke-width", 1)
     .attr("class", "static-zero-line")
     .attr("mix-blend-mode", 'multiply')
      

  // + SCALES
  const xAxisStartDate = new Date("2019-12-01");

  xScale = d3.scaleTime()
    // .domain(d3.extent(state.data, d => d.date))
    .domain([xAxisStartDate, d3.max(state.data, d => d.date)])
    .range([margin.right, width - margin.left])

  yScale = d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.change_from_2019_avg))
    .range([height - margin.bottom, margin.top])

  // + AXES
  const xAxis = d3.axisBottom(xScale)
    .ticks(3) // limit the number of tick marks showing -- note: this is approximate
    .tickPadding(5)

  yAxis = d3.axisLeft(yScale)
    .tickFormat(d => d + "%")
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
  const groupedData = d3.group(filteredData, d => d.series_clean)

  // UPDATE SERIES HIGHLIGHT DROPDOWN
  const highlightElement = d3.select("#series-dropdown")

  // add in dropdown options from the unique values in the data
  highlightElement.selectAll("option")
    .data([
      // manually add the first value
      "Use dropdown to highlight",
      // add in all the unique values from the dataset
      ...new Set(filteredData.map(d => d.series_clean))])
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
  yScale.domain([d3.min(filteredData, d => d.change_from_2019_avg), d3.max(filteredData, d => d.change_from_2019_avg)]).nice()
  // + UPDATE AXIS/AXES, if needed
  yAxisGroup
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale))// need to udpate the scale

  // specify line generator function
  const lineGen = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.change_from_2019_avg))
    .curve(d3.curveLinear)

  // + DRAW LINE AND/OR AREA
  const path = svg.selectAll(".line")
    .data(groupedData)
    .join("path")
    .attr("class", 'line')
    .attr("data-name", d => d[0]) // give each line a data-name attribute of its series name
    .attr("fill", "none")
    // .attr("stroke", "#D3D3D3")
    .attr("stroke", "#e3e0c5")
    .attr("stroke-width", 0)
    .style("mix-blend-mode", "multiply")
    .attr("d", d => lineGen(d[1]))
    .transition()
      .duration(500)
      .attr("stroke-width", 2.5)
      // .attr("stroke", "#9380B6")

  // color us_total line black
  svg.selectAll("[data-name='U.S. Total']")
    .attr("stroke", "#005d88")
    .style("mix-blend-mode", "normal")
    .raise()
  
  // DRAW VERTICAL LINE FOR START OF PANDEMIC
  d3.selectAll(".dashboard-pandemic-line").remove();

  const declaredPandemicDash = new Date("2020-03-11");
 
  const pandemicDateLineDash = svg.append("line")
    .attr("x1", xScale(declaredPandemicDash))
    .attr("x2", xScale(declaredPandemicDash))
    .attr("y1", margin.top) 
    .attr("y2", height - margin.bottom)
    .attr("stroke", "#949494")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", 5,10,5)
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.5)
    .attr("class", "dashboard-pandemic-line")


  // STYLE GRIDLINES
  svg.selectAll('.yAxis g line')
    .style("stroke", "#e0e0e0")

  // DRAW ZERO LINE
  d3.selectAll(".dashboard-zero-line").remove();

  zeroLineStart = new Date("2019-12-01");
  // zeroLineEnd = d3.max(state.data, d => d.date)
  zeroLineEnd = new Date("2023-01-01");

  const zeroLine = svg.append("line")
    .attr("x1", xScale(zeroLineStart))
    .attr("x2", xScale(zeroLineEnd))
    .attr("y1", yScale(0)) // change this to the max tick value
    .attr("y2", yScale(0))
    .attr("stroke", "#171717")
    .attr("stroke-width", 1)
    .attr("class", "dashboard-zero-line")
    .attr("mix-blend-mode", 'multiply')
  
  // ADD U.S. TOTAL LABEL
  d3.selectAll(".us-total-label").remove();
  const usTotalLabelDate = new Date("2022-10-05");

  const usTotalLabelGroup = svg.append("g")
    .attr("transform", `translate(${xScale(usTotalLabelDate)}, ${yScale(47.6)})`)
    .attr("class", "us-total-label")
      // .attr("display", null)

  const usTotalTextLabel = usTotalLabelGroup.append("text")
      .text("Total")
      .attr("x", 0)
      .attr("y", 5)
      .attr("fill", "#005d88")
      // .classed("data-point-label-title", true)
      
  // VORONOI AND TOOLTIPS
  // define constants and functions

  function onMouseEnter(d) {
    console.log('MOUSE ENTER')

    console.log(d.series_clean)
  
    if (d.series_clean === "U.S. Total") {
      console.log('us total!!!')

      //remove static label at end of line
      d3.selectAll(".us-total-label")
        .attr("display", "none");

      //handle colors
      d3.selectAll(".line")
        .attr("stroke", "#e3e0c5")
        .style("mix-blend-mode", null)
        .attr("stroke-width", 2.5)

      d3.selectAll("[data-name='" + d.series_clean + "']")
        .attr("stroke", "#005d88")
        .style("mix-blend-mode", null)
        .attr("stroke-width", 3.5)
        .raise()

    } else {
      d3.selectAll("[data-name='" + d.series_clean + "']")
        .attr("stroke", "#ada665")
        .style("mix-blend-mode", null)
        .attr("stroke-width", 3.5)
        .raise()
      
      d3.selectAll(".line")
      .style("mix-blend-mode", null)
    }

    
    updateDataPointLabel(d, d.date, d.change_from_2019_avg)
  }

  function onMouseLeave(d) {
    console.log('MOUSE LEAVE')

    if (d.series_clean === "U.S. Total") {
      // replace static label at end of line
      d3.selectAll(".us-total-label")
        .attr("display", null);

      // handle colors
      d3.selectAll(".line")
        .attr("stroke", "#e3e0c5")
        .attr("stroke-width", 2.5)

      d3.selectAll("[data-name='" + d.series_clean + "']")
        .attr("stroke", "#005d88")
        .attr("stroke-width", 2.5)
        .raise()

    } else {
      d3.selectAll("[data-name='" + d.series_clean + "']")
        .attr("stroke", "#e3e0c5")
        .style("mix-blend-mode", "multiply")
        .attr("stroke-width", 2.5)
      
      d3.selectAll(".line")
      .style("mix-blend-mode", "multiply")
    }

    

    // dataPointLabel.attr("display", "none")
  
    
  }

  function updateDataPointLabel(d, x, y) {

    dataPointLabel
      .attr("transform", `translate(${xScale(x)}, ${yScale(y)})`)
      .attr("display", null)

      // .raise()
    
    const formatDateLabel = d3.timeFormat("%b %Y")
    const formatNumberLabel = d3.format(".3s")

    let labelText = d3.select(".data-point-label")
    .selectAll("text")

    labelText.text(d.series_clean)
      .attr("x", 0)
      .attr("y", -28)
      .classed("data-point-label-title", true)

    labelText.append("tspan")
      .text(`${formatDateLabel(d.date)}: ` + `${formatNumberLabel(d.change_from_2019_avg)}` +'%')
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
    d => yScale(d.change_from_2019_avg)
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
    .on("mouseleave",(event, d)=>{
      onMouseLeave(d);
    })
    .on("touchstart", event => event.preventDefault());
    
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

  if (seriesName === "U.S. Total") {
    console.log('us total!!!')

    //handle colors
    d3.selectAll(".line")
      .attr("stroke", "#e3e0c5")
      .style("mix-blend-mode", null)
      .attr("stroke-width", 2.5)

    d3.selectAll("[data-name='" + seriesName + "']")
      .attr("stroke", "#005d88")
      .style("mix-blend-mode", null)
      .attr("stroke-width", 3.5)
      .raise()

  } else {
    d3.selectAll(".line")
    .style("mix-blend-mode", null)
    .attr("stroke-width", 2.5)
    .attr("stroke", "#e3e0c5")

    d3.selectAll("[data-name='U.S. Total']")
      .attr("stroke", "#005d88")

    d3.selectAll("[data-name='" + seriesName + "']")
      .attr("stroke", "#ada665")
      .style("mix-blend-mode", null)
      .attr("stroke-width", 3.5)
      .raise()
    
    
  }




  // svg.selectAll(".line")
  //   .classed("highlight", false) //remove/add a class for highlight, though for now we're styline with JS
  //   .attr("stroke", "#D3D3D3")
  //   .attr("stroke-width", 2)

  // svg.selectAll("[data-name='" + seriesName + "']")
  //   .classed("highlight", true)
  //   .attr("class", "highlight line")
  //   .raise() // bring to front
  //   .transition()
  //     .attr("stroke", "#9380B6")
  //     .attr("stroke-width", 3)
};


// if (d.series_clean === "U.S. Total") {
//   console.log('us total!!!')

//   //remove static label at end of line
//   d3.selectAll(".us-total-label")
//     .attr("display", "none");

//   //handle colors
//   d3.selectAll(".line")
//     .attr("stroke", "#e3e0c5")
//     .style("mix-blend-mode", null)

//   d3.selectAll("[data-name='" + d.series_clean + "']")
//     .attr("stroke", "#683c8e")
//     .style("mix-blend-mode", null)
//     .raise()

// } else {
//   d3.selectAll("[data-name='" + d.series_clean + "']")
//     .attr("stroke", "#ada665")
//     .style("mix-blend-mode", null)
//     .raise()
// }
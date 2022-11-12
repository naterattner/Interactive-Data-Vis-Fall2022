/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 30, left: 60, right: 40 };

// // since we use our scales in multiple functions, they need global scope
let xScale, yScale, xAxis, yAxis;

/* APPLICATION STATE */
let state = {
  data: [],
};

/* LOAD DATA */
d3.csv('../data/mlbHomeRuns.csv', d =>{
  return {
    year: new Date(d.Year),
    // year: +d.Year,
    homeruns: +d.HR
  }
})
.then(raw_data => {
  console.log("data", raw_data);
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  /* SCALES */

  // xscale - year
  xScale = d3.scaleBand()
    .domain(state.data.map(d=> d.year))
    .range([0, width]) // visual variable
    .paddingInner(.2)

    // yscale - linear,count
  yScale = d3.scaleLinear()
    .domain([0, d3.max(state.data, d=> d.homeruns)])
    .range([height, 0])

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {
  /* HTML ELEMENTS */
  // svg
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
  
  // bars
  svg.selectAll("rect")
    .data(state.data)
    .join("rect")
    .attr("width", xScale.bandwidth())
    // .attr("height", d=> height - yScale(d.homeruns))
    .attr("height", d=> height - yScale(0))
    .attr("x", d=>xScale(d.year)+margin.left)
    // .attr("y", d=> yScale(d.homeruns)-margin.bottom)
    .attr("y", d=> yScale(0))
    ;
  
  // animation
  svg.selectAll("rect")
  .transition()
  // .delay(1000)
  // .duration(2000)
  // .delay(function(d,i){console.log(i) ; return(i*100)})
  .call(sel => sel
    .transition()
    .duration(1000)
    .attr("height", d=> height - yScale(d.homeruns))
    .attr("y", d=> yScale(d.homeruns)-margin.bottom)
  )

  // x axis
  xAxis = svg.append("g")
    .call(d3.axisBottom(xScale))
    .attr("transform", `translate(${margin.left},${height - (margin.bottom)})`);

  // y axis
  const yAxis = svg.append("g")
    .call(d3.axisLeft(yScale))
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    

}
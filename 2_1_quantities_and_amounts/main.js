
/* Note: Return to this and try to flip the bars to face the other way if time allows before due */
/* reference: https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3 */

/* CONSTANTS AND GLOBALS */
//we need some room on the right for labels
var margin = {
  top: 15,
  right: 60,
  bottom: 15,
  left: 0
};

const width = 500 - margin.left-margin.right;
const height = window.innerHeight *.8 ;



/* LOAD DATA */
d3.csv('../data/squirrelActivities.csv', d3.autoType)
.then(data => {
  console.log("data", data)
  
  // yscale - categorical, activity
  const yScale = d3.scaleBand()
    .domain(data.map(d=> d.activity))
    .range([0, height])
    .paddingInner(.2)

  //xscale - linear,count   
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d=> d.count)])
    .range([width, 0]) 

  /* HTML ELEMENTS */
  // svg
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // bars
  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("height", yScale.bandwidth())
    .attr("width", d=> width - xScale(d.count))
    .attr("y", d=>yScale(d.activity))
    .attr("x", d=> xScale(d.count))
    // .attr("x", 0)

    //y axis and show bar names
    // const yAxis = d3.axisLeft(yScale)
    // console.log(yAxis)
    // .scale(yScale)
    // //no tick marks
    // .tickSize(0)
    // .orient("left");

    //y axis and show bar names
    svg.append("g")
      .call(d3.axisRight(yScale))
      .attr("transform", `translate(${width + margin.right-50},0)`);

    svg.append("g")
    .call(d3.axisBottom(xScale))
    .attr("transform", `translate(0,${height + (margin.bottom-2)})`);
      

})
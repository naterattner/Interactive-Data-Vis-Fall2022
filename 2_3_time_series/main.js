 /*
 NOTE: If time, go back and make this a stacked area chart using servicesGoodsJobs.csv
 */
 
 /* CONSTANTS AND GLOBALS */
 const width = window.innerWidth * 0.7,
 height = window.innerHeight * 0.7,
 margin = { top: 20, bottom: 50, left: 60, right: 65 }

 /*
 this extrapolated function allows us to replace the "G" with "B" min the case of billions.
 we cannot do this in the .tickFormat() because we need to pass a function as an argument,
 and replace needs to act on the text (result of the function).
 */
//  const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')
 const formatDate = d3.timeFormat("%Y-%m-%d")

/* LOAD DATA */
d3.csv('../data/servicesJobs.csv', d => {
  // use custom initializer to reformat the data the way we want it
  // ref: https://github.com/d3/d3-fetch#dsv
  
  return {
    date: new Date(d.date),
    value: +d.value
  }
}).then(data => {
  console.log('data :>> ', data[0]);

  // + SCALES
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.right, width - margin.left])

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data.map(d => d.value))])
    .range([height - margin.bottom, margin.top])

  // console.log(yScale(0))

  // CREATE SVG ELEMENT
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // BUILD AND CALL AXES
  const xAxis = d3.axisBottom(xScale)
    .ticks(6) // limit the number of tick marks showing -- note: this is approximate

  const xAxisGroup = svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${0}, ${height - margin.bottom})`)
    .call(xAxis)

  xAxisGroup.append("text")
    .attr("class", 'xLabel')
    .attr("transform", `translate(${width / 2}, ${35})`)
    .text("Year")

  const yAxis = d3.axisLeft(yScale)
    // .tickFormat(formatBillions)

  const yAxisGroup = svg.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.right}, ${0})`)
    .call(yAxis)

  yAxisGroup.append("text")
    .attr("class", 'yLabel')
    .attr("transform", `translate(${-45}, ${height / 2})`)
    .attr("writing-mode", 'vertical-rl')
    .text("avg")

  // LINE GENERATOR FUNCTION
  const lineGen = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))

  // DRAW LINE
  svg.selectAll(".line")
    .data([data]) // data needs to take an []
    .join("path")
    .attr("class", 'line')
    .attr("d", d => lineGen(d))
  
  // AREA GENERATOR FUNCTION
  const areaGen = d3.area()
    .x(d => xScale(d.date))
    .y0(yScale(0))
    .y1(d => yScale(d.value))

  // DRAW AREA
  svg.append("path")
    .data([data])
    .join("path")
    .attr("class", "line-area")
    .attr("d", d => areaGen(d))

});
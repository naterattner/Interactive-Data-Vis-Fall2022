/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  legendWidth = 100,
  legendHeight = 10;

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
 Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/stateCapitals.csv", d3.autoType),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, capitals, usHeatExtremes]) => {
  
  //log data
  // console.log(geojson)
  // console.log(capitals)
  console.log(usHeatExtremes)

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // SPECIFY PROJECTION
  const projection = d3.geoAlbersUsa()
  .fitSize([
    width-margin.left-margin.right,
    height-margin.top-margin.bottom
  ], geojson);

  // DEFINE PATH FUNCTION
  const path = d3.geoPath(projection)

  // APPEND GEOJSON PATH  
  // draw base layer path - one path for each state
  const states = svg.selectAll("path.states")
    .data(geojson.features)
    .join("path")
    .attr("class", 'states')
    .attr("stroke", "black")
    .attr("fill", "transparent")
    .attr("d", path)

  // CREATE COLOR SCALE FOR CIRCLES
  const dataExtent = d3.extent(usHeatExtremes, d => d.Change)

  colorScale = d3.scaleDiverging()
    .domain([dataExtent[0], 0, dataExtent[1]])
    .interpolator(d3.interpolatePuOr)

  // // CREATE SIZE SCALE FOR CIRCLES
  // dataMin = d3.min(usHeatExtremes, d => d.Change)
  // dataMax = d3.max(usHeatExtremes, d => d.Change)
  // maxAbsCircleValue = Math.abs(d3.max([dataMin, dataMax]))
  // console.log(maxAbsCircleValue)

  // const radiusScale = d3.scaleSqrt()
  //   .domain([1, maxAbsCircleValue])

  // draw point for all lat/lons in the heatextremes csv
  svg.selectAll("circle.heat")
    .data(usHeatExtremes)
    .join("circle")
    .attr("r", 3.5)
    // .attr("r", d => Math.abs(radiusScale(d.Change))*8)
    .attr("class", "heat")
    .attr("fill", d => colorScale(d.Change)) // Apply color scale
    .attr("transform", d => {
      // use our projection to go from lat/long => x/y
      // ref: https://github.com/d3/d3-geo#_projection
      const [x, y] = projection([d.Long, d.Lat])
      return `translate(${x}, ${y})`

    })

  // // Add color legend
  // const legendGroup = svg.append("g")
  //   .attr("transform", `translate(${120}, ${120})`);
  
  // const legendTitle = legendGroup.append("text")
  // .attr("y", -100)
  // .attr("x", 300)
  // .attr("class", "legend-title")
  // .text("Change in 95 degree days")

  // const defs = svg.append("defs")

  // const legendGradientId = "legend-gradient"

  // const gradient = defs.append("linearGradient")
  //     .attr("id", legendGradientId)
  //   .selectAll("stop")
  //   .data(colorScale.range())
  //   .enter().append("stop")
  //     .attr("stop-color", d => d)
  //     .attr("offset", (d,i) => `${
  //       i * 100 / 2
  //     }%`)
  
  // constLegendGradient = legendGroup.append("rect")
  //     .attr("x", -legendWidth / 2)
  //     .attr("height", legendHeight)
  //     .attr("width", legendWidth)
  //     .style("fill", `url(#${legendGradientId})`)

});
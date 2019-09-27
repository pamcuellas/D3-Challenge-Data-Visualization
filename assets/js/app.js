/* jshint esversion: 6*/

/*******  Global variables ******/
// Define svg width and height
var svgW = 960;
var svgH = 500;
// Define Margins
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};
// Define width and height to scale
var width = svgW - margin.left - margin.right;
var height = svgH - margin.top - margin.bottom;

// Create the SVG object.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgW)
  .attr("height", svgH);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Get the Data
d3.csv("./assets/data/data.csv")
  .then(function(data) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.poverty) - 1, (d3.max(data, d => d.poverty) + 1)])
      .range([0, width ]);

    var yLinearScale = d3.scaleLinear()
      .domain([2, (d3.max(data, d => d.healthcare) + 2) ])
      .range([height , 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare) )
    .attr("r", "15")
    .attr("class", "stateCircle")
    .attr("opacity", ".8");

    // Step 6: Create the Text Circles (states)
    // ========================================
    chartGroup.append("g")
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .text(d => d.abbr ) 
    .attr('dx', d => xLinearScale(d.poverty))
    .attr('dy', d => yLinearScale(d.healthcare)+3)
    .attr("class","stateText") ;

    // Step 7: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>Poverty: ${d.poverty}%<br>healthcare: ${d.healthcare}%`);
      });

    // Step 8: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 9: Create event listeners to display and hide the tooltip
    // ==============================
    // on mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    // Step 10: Create Axes labels
    // ==============================      
    // Create the Poverty xAxis label
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");

    // Create the Healthcare yAxis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare(%)");

  });

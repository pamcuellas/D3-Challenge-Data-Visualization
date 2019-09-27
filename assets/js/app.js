/* jshint esversion: 6*/

/*******  Global variables ******/
// Define svg width and height
var svgW = 960;
var svgH = 550;
// Define Margins
var margin = {
  top: 20,
  right: 40,
  bottom: 110,
  left: 100
};
// Define width and height to scale
var width = svgW - margin.left - margin.right;
var height = svgH - margin.top - margin.bottom;

// Functions to toggle active / inactive
let toggle = (axisLabel, value) => { 
  if ((axisLabel.attr("value") != value) && (axisLabel.classed("active"))) {
    axisLabel.classed("active", false);
    axisLabel.classed("inactive", true);
  } else if (axisLabel.attr("value") === value) { 
    axisLabel.classed("active", true);
    axisLabel.classed("inactive", false);
  }
};

// Create the SVG object.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgW)
  .attr("height", svgH);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


/*********************************************************************************************************************************** */
// function used for updating x-scale var upon click on axis label
function xScale(hairData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8,
      d3.max(hairData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, textGroup) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    textGroup.transition()
    .duration(1000) 
    .attr('dx', d => newXScale(d[chosenXAxis]));
    
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  // if (chosenXAxis === "hair_length") {
  //   var label = "Hair Length:";
  // }
  // else {
  //   var label = "# of Albums:";
  // }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>Poverty: ${d.poverty}%<br>healthcare: ${d.healthcare}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;

}
/*********************************************************************************************************************************** */

// Get the Data and plot the graph
d3.csv("./assets/data/data.csv")
  .then(function(data) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
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
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
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
    var textGroup = chartGroup.append("g")
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .text(d => d.abbr ) 
    .attr('dx', d => xLinearScale(d.poverty))
    .attr('dy', d => yLinearScale(d.healthcare)+3)
    .attr("class","stateText") ;

    // updateToolTip function above csv import
    circlesGroup = updateToolTip("", circlesGroup);

    // Step 10: Create Axes labels
    // ==============================    
    // Create group for  3 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);  
    
    // Create the Poverty xAxis label
    let lPoverty = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") 
      .classed("aText active", true)
      .text("In Poverty (%)");

    // Create the Age xAxis label
    let lAge = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("aText inactive", true)
      .text("Age (Median)");

    // Create the Household (Median) xAxis label
    let lHousehold = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("aText inactive", true)
      .text("Household (Median)");

      // Create the Healthcare yAxis label
    let lHealthcare = chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("aText", true)
      .classed("active", true)
      .text("Lacks Healthcare(%)");

      // x axis labels event listener
      labelsGroup.selectAll("text")
      .on("click", function() {

        // console.log("Clicked", d3.select(this).attr("value"));
        // console.log("Clicked", d3.select(this).classed("inactive"));

        // get value of selection
        var value = d3.select(this).attr("value");
        var activate = d3.select(this).classed("inactive");
        if (activate) {

          // replaces chosenXAxis with value
          var chosenXAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, textGroup);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // Set active/inactive classes according to the selected axis
          toggle(lPoverty,   value);
          toggle(lAge,       value);
          toggle(lHousehold, value);
        }
      });

  });





/* jshint esversion: 6*/

/*******  Global variables ******/
// Define area for svg width and height
const svgW = 800;
const svgH = 550;
// Define Margins
const margin = {
  top: 20,
  right: 40,
  bottom: 110,
  left: 100
};
// Define width and height to scale subtracting the  margins
const width = svgW - margin.left - margin.right;
const height = svgH - margin.top - margin.bottom;



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
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([ d3.min(data, d => d[chosenXAxis]) * 0.8,
              d3.max(data, d => d[chosenXAxis]) * 1.2
            ])
    .range([0, width]);
  return xLinearScale;
}

 
const axesArray = {
  poverty:   { axis: "x", domain:[ 0, 0], range:[ 0, width], tooltip: "Poverty"  },
  age:       { axis: "x", domain:[ 0, 0], range:[ 0, width], tooltip: "Age"      },
  income:    { axis: "x", domain:[ 0, 0], range:[ 0, width], tooltip: "Household"},
  obesity:   { axis: "y", domain:[-2, 4], range:[ 0, width], tooltip: "Poverty"  },
  smokes:    { axis: "y", domain:[-1, 2], range:[ 0, width], tooltip: "Age"      },
  healthcare:{ axis: "y", domain:[-1, 2], range:[ 0, width], tooltip: "Household"},
};

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {

  console.log("Final test",axesArray[chosenYAxis].domain[0]);

  // create scales
  var yLinearScale = d3.scaleLinear()
      .domain([ d3.min(data, d => d[chosenYAxis] + axesArray[chosenYAxis].domain[0] ),
                d3.max(data, d => d[chosenYAxis] + axesArray[chosenYAxis].domain[1] )
              ])
      .range([height , 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function xRenderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function yRenderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating x axis circles group
function xRenderCircles(circlesGroup, newXScale, chosenXAxis, textGroup) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    textGroup.transition()
    .duration(1000) 
    .attr('dx', d => newXScale(d[chosenXAxis]));
    
  return circlesGroup;
}

// function used for updating y axis circles group
function yRenderCircles(circlesGroup, newYScale, chosenYAxis, textGroup) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

    textGroup.transition()
    .duration(1000) 
    .attr('dy', d => newYScale(d[chosenYAxis]));
    
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
// console.log("here", chosenXAxis, axesArray["porverty"].tooltip);

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>healthcare: ${d.healthcare}%`);
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
      data.healthcare = +data.healthcare;
      data.obesity    = +data.obesity;
      data.poverty    = +data.poverty;
      data.smokes     = +data.smokes;
      data.income     = +data.income;
      data.age        = +data.age;
    });

    console.log(data);

    // Step 2: Create scale functions
    // ==============================
    // Initial scale for X axis
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.poverty) - 1, (d3.max(data, d => d.poverty) + 1)])
      .range([0, width ]);
    // Initial scale for y axis
    var yLinearScale = d3.scaleLinear()
      .domain([ d3.min(data, d => d.healthcare + axesArray.healthcare.domain[0] ),
                d3.max(data, d => d.healthcare + axesArray.healthcare.domain[1] )])
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
    .attr("class","stateText")

    // updateToolTip function above csv import
    circlesGroup = updateToolTip("poverty", circlesGroup);

    // Step 10: Create Axes labels
    // ==============================    
    // Create group for  3 x- axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);  
    
    // Create the Poverty xAxis label
    let lPoverty = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") 
      .classed("aText active", true)
      .text("In Poverty (%)");

    // Create the Age xAxis label
    let lAge = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 45)
      .attr("value", "age") // value to grab for event listener
      .classed("aText inactive", true)
      .text("Age (Median)");

    // Create the Household (Median) xAxis label
    let lHousehold = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 70)
      .attr("value", "income") // value to grab for event listener
      .classed("aText inactive", true)
      .text("Household (Median)");

      // x axis labels event listener
      xLabelsGroup.selectAll("text")
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
          xAxis = xRenderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = xRenderCircles(circlesGroup, xLinearScale, chosenXAxis, textGroup);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // Set active/inactive classes according to the selected axis
          toggle(lPoverty,   value);
          toggle(lAge,       value);
          toggle(lHousehold, value);
        }
      });

    // Create group for  3 Y - axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)"); 

      // Create the Healthcare yAxis label
    let lHealthcare = yLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("aText", true)
      .classed("active", true)
      .text("Lacks Healthcare(%)");

      // Create the Healthcare yAxis label
      let lSmokes= yLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 25)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("aText", true)
      .classed("inactive", true)
      .text("Smokes (%)");

      let lObese = yLabelsGroup.append("text")
      .attr("y", 0 - margin.left )
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("aText", true)
      .classed("inactive", true)
      .text("Obese (%)");

     // Y axis labels event listener
     yLabelsGroup.selectAll("text")
     .on("click", function() {

       // get value of selection
       var value = d3.select(this).attr("value");
       var activate = d3.select(this).classed("inactive");

       if (activate) {

         // replaces chosenYAxis with value
         var chosenYAxis = value;

         // console.log(chosenYAxis)

         // functions here found above csv import
         // updates y scale for new data
         yLinearScale = yScale(data, chosenYAxis);

         // updates y axis with transition
         yAxis = yRenderAxes(yLinearScale, yAxis);

         // updates circles with new x values
         circlesGroup = yRenderCircles(circlesGroup, yLinearScale, chosenYAxis, textGroup);

         // updates tooltips with new info
         circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

         // Set active/inactive classes according to the selected axis
         toggle(lHealthcare,value);
         toggle(lSmokes,    value);
         toggle(lObese,     value);
       }
     });


  });





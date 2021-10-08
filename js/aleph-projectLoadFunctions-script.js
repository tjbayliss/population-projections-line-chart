/*





  NAME: onload 
  DESCRIPTION: function called when user loads window. Called on initial opening of visualsation.
                Calls functions necessary to set-up initial view
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: body tag in index.html
  CALLS:  alertSize()
          loadData()
          addLineSelectionLists()
          addDotSelectionLists()
          buildControls()
  */
function onload() {
  alertSize(); // function call to get current browser window dimensions
  loadData(); // function call to load initial CSV data file
  addLineSelectionLists(); // function call to add selection lists to line chart vis
  // addDotSelectionLists(); // function call to add selection lists to dots chart vis
  // buildControls(); // function call to add controls Div and buttons

  // aleph.pyramids.forEach(function (d, i) {
  //   // call function to add new selection lists

  //   addPyramidSelectionLists(d);
  // }); // end forEach

  setLineDefaultAllSelected(); // function to default all bootstrap selection lists across charts
  // setPyramidDefaultAllSelected(); // function to default all bootstrap selection lists across charts

  // addSVGtoSliders();

  aleph.lineOnload = false;
  // aleph.pyramidOnload = false;

  // store window dimensions as aleph object varaiables
  aleph.windowWidth = vis.width;
  aleph.windowHeight = vis.height;

  // update dimensions of base container SVG panel to size of browser window
  d3.selectAll(".aleph-chart.aleph-line-chart").attr(
    "width",
    aleph.windowWidth
  );

  return;
} // end function onload

/*
          
          
          
          

    NAME: addSVGtoSliders 
    DESCRIPTION: function called to  
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: onload
    CALLS:  
*/
function addSVGtoSliders() {
  d3.selectAll(".ui-slider-svg-cover").remove();

  // white-filled, grey bordered SVG rectangle covering for base slider DIV
  d3.selectAll(".ui-slider")
    .append("svg")
    .attr("class", "ui-slider-svg ui-slider-svg-cover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .append("rect")
    .attr("class", "ui-slider-svg-rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0);

  d3.selectAll(".ui-slider-range.ui-corner-all.ui-widget-header")
    .append("svg")
    .attr("class", "ui-slider-svg-cover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0);

  d3.selectAll(".ui-slider-handle")
    .append("svg")
    .attr("class", "ui-slider-svg-cover")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0)
    .append("circle")
    .attr("class", "ui-slider-svg-circle")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

  d3.select("#pyramid-slider")
    .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.left")
    .style("left", "0.33%");

  // var sliderHandles = ["left", "right", "top", "bottom"];

  // sliderHandles.forEach(function (d) {
  //   var handleType = d;

  //   d3.selectAll(".ui-slider-handle." + handleType)
  //     .append("svg")
  //     .attr("class", "ui-slider-handle-svg " + handleType)
  //     .attr("width", "150%")
  //     .attr("height", "150%")
  //     .style("background-color", "clear")
  //     .style("border-color", "clear");

  //   d3.selectAll(".ui-slider-handle-svg." + handleType)
  //     .append("svg:image")
  //     .attr("x", 0)
  //     .attr("y", 0)
  //     .attr("width", "100%")
  //     .attr("height", "100%")
  //     .attr("xlink:href", function () {
  //       if (handleType == "bottom" || handleType == "top") {
  //         return "image/sliderUpDown.svg";
  //       } else {
  //         return "image/sliderLeftRight.svg";
  //       }
  //     });
  // });

  return;
} // end function addSVGtoSliders

/*
          
          
          
          

    NAME: loadData 
    DESCRIPTION: function called to load CSV input data file(s).
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: none
    CALLS: drawLineChart()
*/
function loadData() {
  

  // line chart input files
  var inputLineDataFile = "data/data - line.csv";
  var inputLineChartFieldsFile = "data/inputFieldnames - line.csv";

  // pyramid chart input files
  // var inputPyramidDataFile = "data/data - pyramid.csv";
  // var inputPyramidChartFieldsFile = "data/inputFieldnames - pyramid.csv";

  // // pyramid chart input files
  // var inputDotDataFile = "data/data - dot.csv";
  // var inputDotChartFieldsFile = "data/inputFieldnames - dot.csv";

  // store all input files as a Promise
  Promise.all([
    d3.csv(inputLineDataFile),
    d3.csv(inputLineChartFieldsFile),

    // d3.csv(inputPyramidDataFile),
    // d3.csv(inputPyramidChartFieldsFile),

    // d3.csv(inputDotDataFile),
    // d3.csv(inputDotChartFieldsFile),
  ]).then(function (data) {
    // locally store data
    lineData = data[0];
    aleph.inputLineFieldnames_src = data[1];

    // pyramidData = data[2];
    // aleph.inputPyramidFieldnames_src = data[3];

    function loadData() {
  

      // line chart input files
      var inputLineDataFile = "data/data - line.csv";
      var inputLineChartFieldsFile = "data/inputFieldnames - line.csv";
    
      // pyramid chart input files
      // var inputPyramidDataFile = "data/data - pyramid.csv";
      // var inputPyramidChartFieldsFile = "data/inputFieldnames - pyramid.csv";
    
      // // pyramid chart input files
      // var inputDotDataFile = "data/data - dot.csv";
      // var inputDotChartFieldsFile = "data/inputFieldnames - dot.csv";
    
      // store all input files as a Promise
      Promise.all([
        d3.csv(inputLineDataFile),
        d3.csv(inputLineChartFieldsFile),
    
        // d3.csv(inputPyramidDataFile),
        // d3.csv(inputPyramidChartFieldsFile),
    
        // d3.csv(inputDotDataFile),
        // d3.csv(inputDotChartFieldsFile),
      ]).then(function (data) {
        // locally store data
        lineData = data[0];
        aleph.inputLineFieldnames_src = data[1];
    
        // pyramidData = data[2];
        // aleph.inputPyramidFieldnames_src = data[3];
    
        // dotData = data[4];
        // aleph.inputDotFieldnames_src = data[5];
    
        aleph.inputFieldnames = { line: {}/* , pyramid: {}, dot: {} */ };
    
        aleph.inputLineFieldnames_src.forEach(function (d) {
          aleph.inputFieldnames.line[d["codeFieldName"]] = d["dataFileFieldName"];
          aleph.LineNonYearFields.push(d["dataFileFieldName"]);
        }); // end forEach
    
        // aleph.inputPyramidFieldnames_src.forEach(function (d) {
        //   aleph.inputFieldnames.pyramid[d["codeFieldName"]] =
        //     d["dataFileFieldName"];
        //   aleph.PyramidNonYearFields.push(d["dataFileFieldName"]);
        // }); // end forEach
    
        // aleph.inputDotFieldnames_src.forEach(function (d) {
        //   aleph.inputFieldnames.dot[d["codeFieldName"]] = d["dataFileFieldName"];
        //   aleph.DotNonYearFields.push(d["dataFileFieldName"]);
        // }); // end forEach
    
        // stores all data ahas JSON element in global JSON object
        aleph.data = {
          line: lineData/* ,
          pyramid: pyramidData,
          dot: dotData, */
        };
    
        // console.log(aleph.data.pyramid);
    
        // call function to draw Line chart frame.
        drawLineChart();
        // addSVGtoSliders();
      });
    
      return;
    } // end function loadData();
    // dotData = data[4];
    // aleph.inputDotFieldnames_src = data[5];

    aleph.inputFieldnames = { line: {}/* , pyramid: {}, dot: {} */ };

    aleph.inputLineFieldnames_src.forEach(function (d) {
      aleph.inputFieldnames.line[d["codeFieldName"]] = d["dataFileFieldName"];
      aleph.LineNonYearFields.push(d["dataFileFieldName"]);
    }); // end forEach

    // aleph.inputPyramidFieldnames_src.forEach(function (d) {
    //   aleph.inputFieldnames.pyramid[d["codeFieldName"]] =
    //     d["dataFileFieldName"];
    //   aleph.PyramidNonYearFields.push(d["dataFileFieldName"]);
    // }); // end forEach

    // aleph.inputDotFieldnames_src.forEach(function (d) {
    //   aleph.inputFieldnames.dot[d["codeFieldName"]] = d["dataFileFieldName"];
    //   aleph.DotNonYearFields.push(d["dataFileFieldName"]);
    // }); // end forEach

    // stores all data ahas JSON element in global JSON object
    aleph.data = {
      line: lineData/* ,
      pyramid: pyramidData,
      dot: dotData, */
    };

    // console.log(aleph.data.pyramid);

    // call function to draw Line chart frame.
    drawLineChart();
    // addSVGtoSliders();
  });

  return;
} // end function loadData();

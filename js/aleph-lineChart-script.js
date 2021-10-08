/*
  Project: Future Forces Population Projections interactive dashboard
  Filename: aleph-futureForces-lineChart-script.js
  Date built: December 2020 to April 2021
  Written By: James Bayliss (Data Vis Developer)
  Tech Stack: HTML5, CSS3, JS ES5/6, D3 (v5), JQuery 
*/
console.log("aleph-futureForces-lineChart-script.js");

// initialisation of key global variables.
var mouseG;
var svgWidth;
var svgHeight;
var actionedToggleBtn;

// defintion onf D3 tooltip
aleph.sparkLineTooltip = d3
  .select("body")
  .append("div")
  .style("filter", "url(#drop-shadow)")
  .attr("class", "aleph-sparkLineTooltip-Div aleph-hide")
  .style("position", "absolute")
  .style("left", 50 + "px")
  .style("padding", "15px")
  .style("top", 50 + "px")
  /* .style("width", "auto") */
  .style("width", aleph.sparkLineToolTipDimensions.width + "px");

// append tooltip title label
d3.selectAll(".aleph-sparkLineTooltip-Div")
  .append("label")
  .attr("class", "aleph-sparkLineTooltipTitle-label")
  .style("position", "relative")
  .style("display", "block")
  .style("text-anchor", "middle")
  .text("");

// defintion onf D3 tooltip
aleph.tooltip = d3
  .select("body")
  .append("div")
  .style("filter", "url(#drop-shadow)")
  .attr("class", "aleph-toolTip-Div aleph-hide")
  .style("position", "absolute")
  .style("left", 50 + "px")
  .style("padding", "15px")
  .style("top", 50 + "px")
  /* .style("width", "auto") */
  .style("width", aleph.toolTipDimensions.width + "px");

// append tooltip title label
d3.selectAll(".aleph-toolTip-Div")
  .append("label")
  .attr("class", "aleph-toolTipTitle-label")
  .style("position", "relative")
  .style("display", "block")
  .style("text-anchor", "middle")
  .text("");

// filters go in defs element
var defs = d3.selectAll(".aleph-chart.aleph-line-chart").append("defs");

// create filter with id #drop-shadow
// height=130% so that the shadow is not clipped
var filter = defs
  .append("filter")
  .attr("id", "drop-shadow")
  .attr("height", "130%");

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
filter
  .append("feGaussianBlur")
  .attr("in", "SourceAlpha")
  .attr("stdDeviation", 2.5)
  .attr("result", "blur");

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
filter
  .append("feOffset")
  .attr("in", "blur")
  .attr("rx", 5)
  .attr("ry", 5)
  .attr("dx", 5)
  .attr("dy", 5)
  .attr("result", "offsetBlur");

// overlay original SourceGraphic over translated blurred opacity by using
// feMerge filter. Order of specifying inputs is important!
var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode").attr("in", "offsetBlur");
feMerge.append("feMergeNode").attr("in", "SourceGraphic");

/*





      NAME: clearChart 
      DESCRIPTION: function called to reeet line chart view, selction lists and related variables to allow user to shart over.
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM: index.html
      CALLS: none
*/
function clearChart() {
  d3.selectAll(
    ".alert.alert-danger.alert-dismissible.lineChart.clearChart"
  ).classed("aleph-hide", false);

  d3.selectAll(".aleph-alert-line-clearChart").html(
    "Are you sure you want to <span class='spanBold'>clear</span> the chart? This action cannot be undone."
  );

  return;
} // end function clearChart

/*





      NAME: submitLineSelection 
      DESCRIPTION: function called when a user submits a new data line definition to plot
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM: index.html
      CALLS: none
*/
function submitLineSelection() {
  var scenarioUIDCode = "";

  $("#vertical-line-slider-range").slider("option", "disabled", false);
  $("#horizontal-line-slider-range").slider("option", "disabled", false);

  // determine current number of lines drawn to this point ...
  aleph.currentNumberOfSavedScenarios = Object.keys(aleph.scenarios).length;

  if (aleph.currentNumberOfSavedScenarios == aleph.maxNumberOfLines) {
    d3.selectAll(
      ".alert.alert-danger.alert-dismissible.lineChart.lineLimitReached"
    ).classed("aleph-hide", false);

    d3.selectAll(".aleph-alert-line-lineLimitReached").html(
      "You have reached the maximum number of allowed scenarios."
    );

    return;
  } //end if ..

  var scenarioUIDCode = scenarioUIDCode
    .concat(
      aleph.selectionIndexes.genders,
      "-",
      aleph.selectionIndexes.ethnicities,
      "-",
      aleph.selectionIndexes.health,
      "-",
      aleph.selectionIndexes.ageBands,
      "-",
      aleph.selectionIndexes.religions,
      "-",
      aleph.selectionIndexes.qualifications,
      "-",
      aleph.selectionIndexes.nationalities
    )
    .toString()
    .split(",")
    .join("");

  for (var scenario in aleph.scenarios) {
    if (aleph.scenarios[scenario].scenarioUIDCode == scenarioUIDCode) {
      d3.selectAll(
        ".alert.alert-danger.alert-dismissible.lineChart.duplicateSelection"
      ).classed("aleph-hide", false);

      d3.selectAll(".aleph-alert-line-duplicateSelection").html(
        "This scenario has already been submitted and is displayed."
      );

      return;
    }
  }

  document.getElementById("line-clear").disabled = false;
  aleph.currentlySelectedScenario = {};

  // determine current number of lines drawn to this point ...
  aleph.currentScenarioNumber++;

  // define and update a new data line definition to draw
  aleph.currentlySelectedScenario = {
    /*  */
    scenarioUIDCode: scenarioUIDCode,
    scenarioSubmissionNumber: aleph.currentScenarioNumber,
    /*  */
    agebandString: aleph.selectionIndexes.ageBands.toString(),
    genderString: aleph.selectionIndexes.genders.toString(),
    ethnicityString: aleph.selectionIndexes.ethnicities.toString(),
    healthString: aleph.selectionIndexes.health.toString(),
    qualificationString: aleph.selectionIndexes.qualifications.toString(),
    nationalitiesString: aleph.selectionIndexes.nationalities.toString(),
    religionsString: aleph.selectionIndexes.religions.toString(),
    /*  */
    lineColour: aleph.coloursSubset[aleph.currentScenarioNumber],
    lineChartData: [],
    yearSummedValues: {},
    scenarioMaximum: -Infinity,
    /*  */
    data: aleph.data.line.filter(function (d) {
      return (
        /* Filter on age ethnicities */
        aleph.selectionIndexes.ethnicities.indexOf(
          +d[aleph.inputFieldnames.line.ethnicity]
        ) != -1 &&
        /* Filter on age bands */
        aleph.selectionIndexes.ageBands.indexOf(
          +d[aleph.inputFieldnames.line.age]
        ) != -1 &&
        /* Filter on age genders */
        aleph.selectionIndexes.genders.indexOf(
          +d[aleph.inputFieldnames.line.sex]
        ) != -1 &&
        /* Filter on age nationalities */
        aleph.selectionIndexes.nationalities.indexOf(
          +d[aleph.inputFieldnames.line.nationality]
        ) != -1 &&
        /* Filter on health  */
        aleph.selectionIndexes.health.indexOf(
          +d[aleph.inputFieldnames.line.health]
        ) != -1 &&
        /* Filter on age religions */
        aleph.selectionIndexes.religions.indexOf(
          +d[aleph.inputFieldnames.line.religion]
        ) != -1 &&
        /* Filter on age qualifications */
        aleph.selectionIndexes.qualifications.indexOf(
          +d[aleph.inputFieldnames.line.qualification]
        ) != -1
      );
    }),
  };

  // for each plotted year on chart ...
  aleph.years.forEach(function (d, i) {
    // locally store year value ...
    var year = d;

    // rollup nest data to count demographic per year
    var nested_data = d3
      .nest()
      .key(function (d) {
        return year;
      })
      .rollup(function (leaves) {
        return {
          d: d3.sum(leaves, function (d) {
            return parseFloat(d[year]);
          }),
        };
      })
      .entries(aleph.currentlySelectedScenario.data);

    // store rolled up summed year data into aleph data object.
    aleph.currentlySelectedScenario.yearSummedValues[year] =
      nested_data[0].value.d;

    if (
      nested_data[0].value.d > aleph.currentlySelectedScenario.scenarioMaximum
    ) {
      aleph.currentlySelectedScenario.scenarioMaximum = nested_data[0].value.d;
    }
  }); // end forEach year loop

  // storing scenario maximums as each scenario is requested, submitted and built.
  aleph.dataScenarioMaximums[aleph.currentNumberOfSavedScenarios] =
    aleph.currentlySelectedScenario.scenarioMaximum;

  // detemine scenario maximum value
  aleph.maxchartYAxisValue = d3.max(d3.values(aleph.dataScenarioMaximums));

  // store new scenario in JSON object.
  aleph.scenarios[aleph.currentlySelectedScenario.scenarioSubmissionNumber] =
    aleph.currentlySelectedScenario;

  // for each SYOA year reported in ingested data
  aleph.years.forEach(function (d, i) {
    // locally store year value
    var year = d;

    // aggregate summed count into temporary JSON object
    // http://bl.ocks.org/phoebebright/raw/3176159/
    var summedYearCount = d3
      .nest()
      .key(function (d) {
        return year;
      })
      .rollup(function (leaves) {
        return {
          sum: d3.sum(leaves, function (d) {
            return d[year];
          }),
        };
      })
      .entries(aleph.currentlySelectedScenario.data);

    // push summed year total onto data object.
    aleph.currentlySelectedScenario.lineChartData.push({
      year: year,
      value: summedYearCount[0].value.sum,
      counts: summedYearCount[0].value.sum,
      percents:
        (summedYearCount[0].value.sum / aleph.dataYearPopulations[i]) * 100,
    });
  });

  aleph.scenariosData[aleph.currentNumberOfSavedScenarios] = {
    scenarioUIDCode: aleph.currentlySelectedScenario.scenarioUIDCode,
    name: aleph.currentlySelectedScenario.scenarioSubmissionNumber,
    values: aleph.currentlySelectedScenario.lineChartData,
  };

  // call function to draw line chart
  drawPopulationLineOnChart();

  // clear aleph object of currentscenario setting selections.
  aleph.currentlySelectedScenario = {
    agebandString: null,
    genderString: null,
    ethnicityString: null,
    healthString: null,
    nationalitiesString: null,
    qualificationString: null,
    religionsString: null,
  };

  return;
} // end function submitLineSelection

/*





      NAME: setUpLineSliders 
      DESCRIPTION: function called to set-up definition of line chart y-axis slider... 
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM:  
      CALLS: none
// https://codepen.io/osublake/pen/jbRaMY/
*/

function setUpLineSliders() {
  //
  // set up vertical slider on line chart
  $("#vertical-line-slider-range").slider({
    orientation: "vertical",
    range: true,
    disabled: true,
    min: aleph.yMain.domain()[0],
    max: aleph.yMain.domain()[1],
    values: [aleph.yMain.domain()[0], aleph.yMain.domain()[1]],
    slide: function (event, ui) {
      // document.getElementById("line-reset-axes").disabled = false;
      d3.selectAll(".aleph-reset").classed("aleph-hide", false);

      d3.selectAll(".aleph-yAxisTitle").html(
        "Number of UK Population (between " +
        numberWithCommas(ui.values[0]) +
        " to " +
        numberWithCommas(ui.values[1]) +
        ")"
      );

      // update yMain domain
      aleph.yMain.domain([ui.values[0], ui.values[1]]);

      // update definition of y-axis domain after slider change ..
      d3.selectAll(".axis.axis--y.mainAxis").call(d3.axisLeft(aleph.yMain));
      d3.selectAll(".line.mainline").attr("d", aleph.mainline);
      d3.selectAll(".aleph-Line-Vertex-Marker-Circles").attr(
        "cy",
        function (d) {
          return (
            aleph.margin.line[aleph.windowSize].top +
            aleph.yMain(d[aleph.lineChartyAxisType])
          );
        }
      );

      d3.selectAll(".aleph-yAxisTicks").remove();

      // draw tick grid lines extending from y-axis ticks on axis across scatter graph
      var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
      yticks
        .append("svg:line")
        .attr("class", "aleph-yAxisTicks")
        .attr("y0", 0)
        .attr("y1", 0)
        .attr("x1", 0)
        .attr(
          "x2",
          svgWidth -
          aleph.margin.line[aleph.windowSize].left -
          aleph.margin.line[aleph.windowSize].right
        );

      var topBottom = d3
        .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.top")
        .style("bottom");

      var bottomBottom = d3
        .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.bottom")
        .style("bottom");

      d3.selectAll(".slider-label.slider-label-movable-top")
        .style("bottom", topBottom)
        .text(numberWithCommas(ui.values[1]) + " -");

      d3.selectAll(".slider-label.slider-label-movable-bottom")
        .style("bottom", bottomBottom)
        .text(numberWithCommas(ui.values[0]) + " -");
    },
  });

  // d3.selectAll(".slider-label.slider-label-fixed-top").text(
  //   numberWithCommas(numberWithCommas(aleph.yMain.domain()[1]))
  // );
  d3.selectAll(".slider-label.slider-label-fixed-top").text(function () {
    if (aleph.lineChartyAxisType == "counts") {
      return numberWithCommas(aleph.yMain.domain()[1]);
    } else {
      return aleph.yMain.domain()[1].toFixed(1);
    }
  });

  d3.selectAll(".slider-label.slider-label-fixed-bottom").text(
    numberWithCommas(numberWithCommas(aleph.yMain.domain()[0]))
  );

  //
  //
  //
  //
  // set up vertical slider on line chart
  $("#horizontal-line-slider-range").slider({
    orientation: "horizontal",
    range: true,
    disabled: true,
    min: Number(aleph.years[0]),
    max: Number(aleph.years[aleph.years.length - 1]),
    values: [aleph.years[0], aleph.years[aleph.years.length - 1]],
    slide: function (event, ui) {
      // document.getElementById("line-reset-axes").disabled = false;
      d3.selectAll(".aleph-reset").classed("aleph-hide", false);

      // update yMain domain
      aleph.xMain.domain([
        aleph.parseDate(ui.values[0]),
        aleph.parseDate(ui.values[1]),
      ]);

      // update definition of y-axis domain after slider change ..
      d3.selectAll(".axis.axis--x.mainAxis").call(d3.axisBottom(aleph.xMain));
      d3.selectAll(".line.mainline").attr("d", aleph.mainline);
      d3.selectAll(".aleph-Line-Vertex-Marker-Circles").attr(
        "cx",
        function (d) {
          return (
            aleph.margin.line[aleph.windowSize].left +
            aleph.xMain(aleph.parseDate(d.year))
          );
        }
      );

      setTimeout(function () {
        var rightLeft = d3
          .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.right")
          .style("left");

        var leftleft = d3
          .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.left")
          .style("left");

        d3.selectAll(".slider-label.slider-label-movable-left")
          .style("left", leftleft)
          .text(ui.values[0]);

        d3.selectAll(".slider-label.slider-label-movable-right")
          .style("left", rightLeft)
          .text(ui.values[1]);
      }, 5);
    },
  });

  // // call function to append ticks to slider bar.
  // setSliderTicks("#horizontal-line-slider-range");

  d3.select("#horizontal-line-slider-range").style(
    "width",
    svgWidth -
    aleph.margin.line[aleph.windowSize].left -
    aleph.margin.line[aleph.windowSize].right +
    "px"
  );

  d3.selectAll(".slider-label.slider-label-fixed-left").text(
    aleph.formatDate(aleph.xMain.domain()[0])
  );
  d3.selectAll(".slider-label.slider-label-fixed-right").text(
    aleph.formatDate(aleph.xMain.domain()[1])
  );

  d3.selectAll(".line-chart-slider-range-container").style(
    "width",
    function () {
      return aleph.margin.line[aleph.windowSize].left - 90 + "px";
    }
  );

  d3.selectAll("#horizontal-line-slider-range").style(
    "left",
    aleph.margin.line[aleph.windowSize].left + "px"
  );

  return;
} // end function setUpLineSliders()

/*





      NAME: drawLineChart 
      DESCRIPTION: function called to draw line chart ... 
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM:  loadData()
                    setUpPyramidSlider()
                    setUpDotsSlider()
      CALLS: none
*/
function drawLineChart() {
  // slicing subset of colours from main array to use for vis.
  aleph.coloursSubset = aleph.colours.slice(0, aleph.maxNumberOfLines);

  // dynamically determine year extent of x axis from ingested data file.
  aleph.years = d3.keys(aleph.data.line[0]).filter(function (d, i) {
    return aleph.LineNonYearFields.indexOf(d) == -1;
  });

  aleph.dataYearPopulations = [];
  aleph.years.forEach(function (d) {
    var yearToProcess = d;

    aleph.dataYearPopulation = 0;

    aleph.data.line.forEach(function (d) {
      aleph.dataYearPopulation =
        Number(aleph.dataYearPopulation) + Number(d[yearToProcess]);
    });

    aleph.dataYearPopulations.push(aleph.dataYearPopulation);
  });

  // update dimension values of container div
  svgWidth = $(".aleph-chart.aleph-line-chart").width();
  svgHeight = $(".aleph-chart.aleph-line-chart").height();

  checkWindowSize();

  // initialise y axis max variablew
  aleph.maxchartYAxisValue = -1;

  // for each SYOA ...
  aleph.years.forEach(function (d, i) {
    // locally store SYOA
    var checkyear = d;

    // detemine maximum of SYOA year
    var max = d3.max(aleph.data.line, function (d) {
      return +d[checkyear];
    });

    if (max >= aleph.maxchartYAxisValue) {
      aleph.maxchartYAxisValue = max;
    }
  });

  var newStartTime = d3.timeMonth.offset(
    aleph.parseDate(aleph.years[0]),
    -aleph.lineChartXAxisRounding
  );
  var newEndTime = d3.timeMonth.offset(
    aleph.parseDate(aleph.years[aleph.years.length - 1]),
    aleph.lineChartXAxisRounding
  );

  // initialise declaration of chart x-axis
  aleph.xMain = d3
    .scaleTime()
    .range([
      0,
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right,
    ])
    .domain([newStartTime, newEndTime]);

  d3.selectAll(".aleph-chart.aleph-line-chart")
    .on("dblclick", function () {
      resetLineChartAxes();
    })
    .append("g")
    .attr("class", "aleph-lineChart-axis-group");

  // append g element to hold x axis
  d3.selectAll(".aleph-lineChart-axis-group")
    .append("g")
    .attr("class", "axis axis--x mainAxis")
    .attr(
      "transform",
      "translate(" +
      aleph.margin.line[aleph.windowSize].left +
      "," +
      (svgHeight - aleph.margin.line[aleph.windowSize].bottom) +
      ")"
    )
    .call(d3.axisBottom(aleph.xMain).ticks(d3.timeYear.every(2)));

  if (aleph.lineChartyAxisType == "counts") {
    aleph.lineChartYAxisDomain = [
      0,
      Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
      aleph.lineChartYAxisRounding,
    ];
  } else {
    aleph.lineChartYAxisDomain = [0, 100];
  }

  // initialise declaration of chart y-axis
  aleph.yMain = d3
    .scaleLinear()
    .range([
      svgHeight -
      aleph.margin.line[aleph.windowSize].top -
      aleph.margin.line[aleph.windowSize].bottom,
      0,
    ])
    .domain(
      aleph.lineChartYAxisDomain /* [
      0,
      Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
        aleph.lineChartYAxisRounding,
    ] */
    );

  // append g element to hold x time axis
  d3.selectAll(".aleph-lineChart-axis-group")
    .append("g")
    .attr("class", "axis axis--y mainAxis")
    .attr(
      "transform",
      "translate(" +
      aleph.margin.line[aleph.windowSize].left +
      "," +
      aleph.margin.line[aleph.windowSize].top +
      ")"
    )
    .call(d3.axisLeft(aleph.yMain));

  // https://bl.ocks.org/35degrees/02e5fd2eade71c0a6ffc01d5282def23
  d3.selectAll(".aleph-chart.aleph-line-chart")
    .append("defs")
    .append("clipPath")
    .attr("class", "clip")
    .attr("id", "clip")
    .append("rect")
    .attr("class", "clip-Rect")
    .attr("id", "clip-Rect")
    .attr("x", aleph.margin.line[aleph.windowSize].left)
    .attr("y", aleph.margin.line[aleph.windowSize].top)
    .attr(
      "width",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    )
    .attr(
      "height",
      svgHeight -
      aleph.margin.line[aleph.windowSize].top -
      aleph.margin.line[aleph.windowSize].bottom
    );

  // initialise and append y-axis main title label
  d3.selectAll(".axis.axis--y.mainAxis")
    .append("text")
    .attr("class", "aleph-yAxisTitle")
    .attr("x", 0)
    .attr("y", -25)
    .text(aleph.axisMainTitles.lineChart.y);

  // initialise and append x-axis main title label
  d3.selectAll(".axis.axis--x.mainAxis")
    .append("text")
    .attr("class", "aleph-xAxisTitle")
    .attr(
      "x",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    )
    .attr("y", 50)
    .text(aleph.axisMainTitles.lineChart.x);

  // draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
  yticks
    .append("svg:line")
    .attr("class", "aleph-yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr(
      "x2",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    );

  // set up SVG slider for y-axis on line chart to allow user to expand/contract view ...
  setUpLineSliders();
  addSVGtoSliders();

  d3.selectAll(".aleph-chart.aleph-line-chart")
    .append("g")
    .attr("class", "aleph-lineChart-group");

  //declare g appending for mouseover recctangle
  mouseG = d3
    .select("#aleph-line-chart")
    .append("g")
    .attr("class", "mouse-over-effects");

  // append to 'g' the black vertical line to follow mouse
  mouseG
    .append("path")
    .attr("class", "mouse-line")
    .attr(
      "transform",
      "translate(" + 0 + "," + aleph.margin.line[aleph.windowSize].top + ")"
    );

  aleph.chartLines = document.getElementsByClassName("line mainline");

  getChartDimensions();

  var chartWidth = aleph.xMain.range()[1] - aleph.xMain.range()[0];
  var chartHeight = aleph.yMain.range()[0] - aleph.yMain.range()[1];

  d3.selectAll(".aleph-line-chart")
    .append("svg:image")
    .attr("class", "aleph-wasteBin")
    .attr("xlink:href", "image/wasteBin.svg")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", aleph.margin.line[aleph.windowSize].left + 10)
    .attr("y", aleph.margin.line[aleph.windowSize].top + chartHeight - 55)
    .on("mouseover", function () {
      aleph.lineCanBeBinned = true;
      d3.selectAll(".aleph-wasteBin").classed("aleph-mouseover", true);
    })
    .on("mouseout", function () {
      aleph.lineCanBeBinned = false;
      d3.selectAll(".aleph-wasteBin").classed("aleph-mouseover", false);
    })
    .classed("aleph-hide", true);

  d3.selectAll(".aleph-line-chart")
    .append("svg:image")
    .attr("class", "aleph-reset")
    .attr("xlink:href", "image/reset.svg")
    .attr("width", 40)
    .attr("height", 40)
    .attr("x", aleph.margin.line[aleph.windowSize].left - 125)
    .attr("y", aleph.margin.line[aleph.windowSize].top + chartHeight + 55)
    .classed("aleph-hide", true)
    .on("click", function () {
      resetLineChartAxes();
      return;
    });

  d3.selectAll(".aleph-line-chart")
    .append("svg:image")
    .attr("class", "aleph-countspercent counts")
    .attr("id", "aleph-countspercent")
    .attr("xlink:href", function () {
      if (aleph.lineChartyAxisType == "counts") {
        return "image/percents.svg";
      } else {
        return "image/counts.svg";
      }
    })
    .attr("width", 40)
    .attr("height", 40)
    .attr("x", aleph.margin.line[aleph.windowSize].left - 125)
    .attr("y", aleph.margin.line[aleph.windowSize].top + chartHeight + 25)
    .classed("aleph-hide", false)
    .on("click", function () {
      transitionLineChartBetweenCounts_and_Percents(this);
      return;
    });

  return;
} // end function drawLineChart

/*









*/
function transitionLineChartBetweenCounts_and_Percents(button) {
  if (aleph.lineChartyAxisType == "counts") {
    d3.select("#aleph-countspercent")
      .attr("xlink:href", "image/" + aleph.lineChartyAxisType + ".svg")
      .classed("percents", true)
      .classed("counts", false);
    aleph.lineChartyAxisType = "percents";

    aleph.lineChartYAxisDomain = [0, 100];

    d3.selectAll(".aleph-yAxisTitle").text("Percentage of UK Population");
  } else {
    d3.select("#aleph-countspercent")
      .attr("xlink:href", "image/" + aleph.lineChartyAxisType + ".svg")
      .classed("percents", false)
      .classed("counts", true);
    aleph.lineChartyAxisType = "counts";

    aleph.lineChartYAxisDomain = [
      0,
      Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
      aleph.lineChartYAxisRounding,
    ];
    d3.selectAll(".aleph-yAxisTitle").text("Number of UK Population");
  }

  aleph.yMain.domain(aleph.lineChartYAxisDomain);

  d3.selectAll(".axis.axis--y.mainAxis")
    .transition()
    .duration(1250)
    .ease(d3.easeLinear)
    .call(d3.axisLeft(aleph.yMain));

  d3.selectAll(".aleph-yAxisTicks").remove();
  var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
  yticks
    .append("svg:line")
    .attr("class", "aleph-yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr(
      "x2",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    );

  $("#vertical-line-slider-range")
    .slider("option", "values", [
      aleph.yMain.domain()[0],
      aleph.yMain.domain()[1],
    ])
    .slider("option", "max", aleph.yMain.domain()[1]);

  d3.selectAll(".slider-label.slider-label-fixed-top").text(function () {
    if (aleph.lineChartyAxisType == "counts") {
      return numberWithCommas(aleph.yMain.domain()[1]);
    } else {
      return aleph.yMain.domain()[1].toFixed(1);
    }
  });

  d3.selectAll(".slider-label.slider-label-movable-top")
    .style("bottom", "100%")
    .text(function () {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(aleph.yMain.domain()[1]) + " -";
      } else {
        return aleph.yMain.domain()[1].toFixed(1) + " -";
      }
    });

  d3.selectAll(".slider-label.slider-label-movable-bottom")
    .style("bottom", "0%")
    .text(function () {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(aleph.yMain.domain()[0]) + " -";
      } else {
        return aleph.yMain.domain()[0].toFixed(1) + " -";
      }
    });

  // Transition all coloured data lines
  d3.selectAll(".line.mainline")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("d", aleph.mainline);

  // Transition all data line vertex markers
  d3.selectAll(".aleph-Line-Vertex-Marker-Circles")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("cx", function (d) {
      return (
        aleph.margin.line[aleph.windowSize].left +
        aleph.xMain(aleph.parseDate(d.year))
      );
    })
    .attr("cy", function (d) {
      return (
        aleph.margin.line[aleph.windowSize].top +
        aleph.yMain(d[aleph.lineChartyAxisType])
      );
    });

  d3.selectAll(".aleph-Line-handleLine-Group")
    .selectAll(".aleph-marker-group")
    .selectAll(".aleph-marker-text")
    .style("text-anchor", function (d, i) {
      if (/* i == 0 */ d3.select(this).classed("start")) {
        return "start";
      } else {
        return "end";
      }
    })
    .text(function (d, i) {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(d[aleph.lineChartyAxisType]);
      } else {
        return d[aleph.lineChartyAxisType].toFixed(2);
      }
    });

  return;
} // end function transitionLineChartBetweenCounts_and_Percents

/*





      NAME: getChartDimensions 
      DESCRIPTION: function called to.. 
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM:  
      CALLS: 
*/
function getChartDimensions() {
  var chartWidth = aleph.xMain.range()[1] - aleph.xMain.range()[0];
  var chartHeight = aleph.yMain.range()[0] - aleph.yMain.range()[1];

  return;
} // end function getChartDimensions

/*





      NAME: drawPopulationLineOnChart 
      DESCRIPTION: function called to draw population line chart ... 
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM: submitLineSelection()
      CALLS:  cursorCoords
              transitionLineChart
*/
function drawPopulationLineOnChart() {
  // define line generator for main data lines plotted on chart.
  aleph.mainline = d3
    .line()
    .x(function (d) {
      return (
        aleph.margin.line[aleph.windowSize].left +
        aleph.xMain(aleph.parseDate(d.year))
      );
    })
    .y(function (d) {
      return (
        aleph.margin.line[aleph.windowSize].top +
        aleph.yMain(d[aleph.lineChartyAxisType] /* .counts */ /* value */)
      );
    });

  // Append a 'g' element to contain the plotted data line and all related DOM content
  d3.selectAll(".aleph-lineChart-group")
    .append("g")
    .attr(
      "class",
      "aleph-line-group aleph-line-group-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber +
      " scenarioNumber-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber +
      " scenarioUID-" +
      aleph.currentlySelectedScenario.scenarioUIDCode
    );

  // Append path for plotted data line
  d3.selectAll(
    ".aleph-line-group.aleph-line-group-" +
    aleph.currentlySelectedScenario.scenarioSubmissionNumber
  )
    .append("path")
    .datum(aleph.currentlySelectedScenario.lineChartData)
    .attr(
      "class",
      "line mainline changeMainlineStyle-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .style("stroke", function () {
      return aleph.currentlySelectedScenario.lineColour;
    })
    .attr("d", aleph.mainline);

  // call function to append and draw sparkline in righthand margin.
  drawSparkLine(aleph.currentlySelectedScenario);

  // appedn all vertex marker circles to plotted lines ...
  d3.selectAll(
    ".aleph-line-group-" +
    aleph.currentlySelectedScenario.scenarioSubmissionNumber
  )
    .selectAll("aleph-Line-Vertex-Marker-Circles")
    .data(aleph.currentlySelectedScenario.lineChartData)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return (
        "aleph-Line-Vertex-Marker-Circles scenario-" +
        aleph.currentlySelectedScenario.scenarioSubmissionNumber
      );
    })
    .attr("cx", function (d, i) {
      return (
        aleph.margin.line[aleph.windowSize].left +
        aleph.xMain(aleph.parseDate(d.year))
      );
    })
    .attr("cy", function (d, i) {
      return (
        aleph.margin.line[aleph.windowSize].top +
        aleph.yMain(d[aleph.lineChartyAxisType] /* .counts */ /* value */)
      );
    })
    .attr("r", 5)
    .style("stroke", aleph.currentlySelectedScenario.lineColour);

  // move chart mouseover interaction content to front of vis ...
  d3.selectAll(".mouse-over-effects").moveToFront();

  // append DOM items to allow user mouseover ability ..
  aleph.mousePerLine = mouseG
    .selectAll(".mouse-per-line")
    .data(aleph.scenariosData)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  // append DOM circle items to highlight user mouseover ability ..
  aleph.mousePerLine
    .append("circle")
    .attr("class", "aleph-marker-circle")
    .attr("r", 5)
    .style("stroke", function (d) {
      var colour = d3
        .selectAll(
          ".line.mainline.changeMainlineStyle-" +
          aleph.currentNumberOfSavedScenarios /* NEED TO FIX THIS COLOUR STYLING TO GET NEW COLOUR */
        )
        .style("stroke");
      return colour;
    });

  // append DOM text item to highlight user mouseover ability ..
  aleph.mousePerLine
    .append("text")
    .attr("class", "aleph-mouseover-textlabel")
    .style("stroke", aleph.currentlySelectedScenario.lineColour);
  /* .attr("transform", "translate(10,3)") */

  // if item has not been built yet, i.e. on drawing of first data line ...
  if (document.getElementById("aleph-mouseRectangle") == null) {
    // append an SVG rect to allow mouseover interaction to occur
    mouseG
      .append("svg:rect")
      .attr("class", "aleph-mouseRectangle")
      .attr("id", "aleph-mouseRectangle")
      .attr(
        "width",
        svgWidth -
        aleph.margin.line[aleph.windowSize].right -
        aleph.margin.line[aleph.windowSize].left
      )
      .attr(
        "height",
        svgHeight -
        aleph.margin.line[aleph.windowSize].top -
        aleph.margin.line[aleph.windowSize].bottom
      )
      .attr("x", aleph.margin.line[aleph.windowSize].left)
      .attr("y", aleph.margin.line[aleph.windowSize].top)
      .on("mouseover", function () {
        if (Object.keys(aleph.scenarios).length > 0) {
          aleph.chartLines = document.getElementsByClassName("line mainline");

          // on mouse in show line, circles and text
          d3.select(".mouse-line").style("opacity", "1");
          d3.selectAll(".mouse-per-line circle").style("opacity", "1");
          d3.selectAll(".mouse-per-line text").style("opacity", "1");

          // bring tootlitp to fron to page/DOM structure
          // d3.selectAll(".aleph-toolTip-g")
          //   .classed("aleph-hide", false)
          //   .moveToFront();

          // D3 v4
          // determine x and y coordinates of cursor pointer
          var x = d3.event.pageX;
          var y = d3.event.pageY;

          aleph.chartDragX = x;
          aleph.chartDragY = y;

          // function called to define and build tooltip structure and content
          cursorCoords(/* d,  */ x, y);
        } // end if ....
        return;
      })
      .on("mousemove", function () {
        // if one of more data line has been drawn already
        if (Object.keys(aleph.scenarios).length > 0) {
          aleph.chartLines = document.getElementsByClassName("line mainline");

          // mouse moving over canvas
          var mouse = d3.mouse(this);
          aleph.mouseoverRectangle = this;

          d3.select(".mouse-line").attr("d", function () {
            var d =
              "M" +
              mouse[0] +
              "," +
              (svgHeight -
                aleph.margin.line[aleph.windowSize].top -
                aleph.margin.line[aleph.windowSize].bottom);

            d += " " + mouse[0] + "," + 0;
            return d;
          });

          aleph.xYear;

          // move mouseover DOM content ...
          d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {
            if (aleph.chartLines[i]) {
              (aleph.xYear = aleph.xMain.invert(
                mouse[0] - aleph.margin.line[aleph.windowSize].left
              )),
                (bisect = d3.bisector(function (d) {
                  return d.date;
                }).right);
              idx = bisect(d.values, aleph.xYear);

              var beginning = 0,
                end = aleph.chartLines[i].getTotalLength(),
                target = null;

              while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = aleph.chartLines[i].getPointAtLength(target);
                if (
                  (target === end || target === beginning) &&
                  pos.x !== mouse[0]
                ) {
                  break;
                }
                if (pos.x > mouse[0]) end = target;
                else if (pos.x < mouse[0]) beginning = target;
                else break; //position found
              }

              aleph.currentLineData;

              // update mouseover text content
              // d3.select(this)
              //   .select("text")
              //   .attr("x", 10)
              //   .attr("y", -15)
              //   .text(function (d) {
              //     aleph.currentLineData = d;
              //     return numberWithCommas(
              //       aleph.yMain
              //         .invert(
              //           Number(pos.y - aleph.margin.line[aleph.windowSize].top)
              //         )
              //         .toFixed(0)
              //     );
              //   });

              return "translate(" + mouse[0] + "," + pos.y + ")";
            }
          });

          // call function to update coordinates and position of tooltip
          // D3 v4
          var x = d3.event.pageX;
          var y = d3.event.pageY;

          // function called to define and build tooltip structure and content
          cursorCoords(/* d,  */ x, y);
        } // end if ....
        return;
      })
      .on("mouseout", function () {
        // on mouse out hide line, circles and text
        d3.select(".mouse-line").style("opacity", "0");
        d3.selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.selectAll(".mouse-per-line text").style("opacity", "0");
        d3.selectAll(".aleph-toolTip-Div").classed("aleph-hide", true);

        return;
      })
      .on("mousedown", function () {
        d3.event.stopPropagation();
        d3.select(this).style("point-events", "none");
      })
      .call(
        d3
          .drag()
          .on("start", started)
          .on("drag", function () {
            dragging();
          })
          .on("end", function () {
            ended();
            return;
          })
      );
  } // end if ...

  transitionLineChart();

  d3.selectAll(".aleph-mouseRectangle").moveToFront();

  return;
} // end function drawPopulationLineOnChart

/*





  NAME: getCurrentAttributes 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: d3.drag implementation
  CALLS: none
*/
function getCurrentAttributes() {
  // use plus sign to convert string into number
  var x = d3.selectAll(".selection").attr("x");
  var y = d3.selectAll(".selection").attr("y");
  var width = d3.selectAll(".selection").attr("width");
  var height = d3.selectAll(".selection").attr("height");

  aleph.selectionRectangle.finalX = d3.selectAll(".selection").attr("x");
  aleph.selectionRectangle.finalY = d3.selectAll(".selection").attr("y");
  aleph.selectionRectangle.finalWidth = d3
    .selectAll(".selection")
    .attr("width");
  aleph.selectionRectangle.finalHeight = d3
    .selectAll(".selection")
    .attr("height");

  return {
    x1: x,
    y1: y,
    x2: x + width,
    y2: y + height,
  };
} // end function  getCurrentAttributes

/*





  NAME: getNewAttributes 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: d3.drag implementation
  CALLS: none
*/
function getNewAttributes() {
  var x =
    aleph.selectionRectangle.currentX < aleph.selectionRectangle.originX
      ? aleph.selectionRectangle.currentX
      : aleph.selectionRectangle.originX;
  var y =
    aleph.selectionRectangle.currentY < aleph.selectionRectangle.originY
      ? aleph.selectionRectangle.currentY
      : aleph.selectionRectangle.originY;
  var width = Math.abs(
    aleph.selectionRectangle.currentX - aleph.selectionRectangle.originX
  );
  var height = Math.abs(
    aleph.selectionRectangle.currentY - aleph.selectionRectangle.originY
  );

  if (width > 0 && height > 0) {
    updateDrawSelectionRectangle(x, y, width, height);
  }

  return;
} // end function getNewAttributes

/*





NAME: updateDrawSelectionRectangle 
DESCRIPTION: function called when user ENDS dragging timeline on vertical plane using mouse
ARGUMENTS TAKEN: x -
                  y -
                  w -
                  h - 
ARGUMENTS RETURNED: none
CALLED FROM: d3.drag implementation
CALLS: none

  http://bl.ocks.org/paradite/71869a0f30592ade5246
*/
function updateDrawSelectionRectangle(x, y, w, h) {
  d3.selectAll(".selection")
    .attr("x", x)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h);
  return;
} // end function

/*





NAME: ended 
DESCRIPTION: function called when user ENDS dragging timeline on vertical plane using mouse
ARGUMENTS TAKEN: dD - dragDynamics object
ARGUMENTS RETURNED: none
CALLED FROM: d3.drag implementation
CALLS: none

  http://bl.ocks.org/paradite/71869a0f30592ade5246
*/
function ended() {
  if (
    aleph.selectionRectangle.originX != aleph.selectionRectangle.currentX &&
    aleph.selectionRectangle.originY != aleph.selectionRectangle.currentY
    /* aleph.selectionRectangle.finalWidth != 0 &&
    aleph.selectionRectangle.finalHeight != 0 */
  ) {
    if (aleph.lineCanBeBinned == true) {
      d3.selectAll(".selection").remove();
      d3.selectAll(".aleph-wasteBin").classed("aleph-hide", true);
      aleph.selectionRectangle = {
        x: 0,
        y: 0,
        currentX: 0,
        currentY: 0,
        originX: 0,
        originY: 0,
        element: null,
        previousElement: null,
        width: 0,
        height: 0,
      };
      aleph.lineCanBeBinned = false;
    } else {
      d3.selectAll(".aleph-reset").classed("aleph-hide", false);
      d3.selectAll(".aleph-wasteBin").classed("aleph-hide", true);

      updateDrawSelectionRectangle(
        aleph.selectionRectangle.finalX,
        aleph.selectionRectangle.finalY,
        aleph.selectionRectangle.finalWidth,
        aleph.selectionRectangle.finalHeight
      );

      d3.selectAll(".mouse-line").classed("aleph-hide", false);
      d3.selectAll(".mouse-per-line").classed("aleph-hide", false);
      d3.selectAll(".aleph-toolTip-Div").classed("aleph-hide", false);

      aleph.xMain.domain([
        d3.min([
          aleph.chartDraggedCoordinates[0][0],
          aleph.chartDraggedCoordinates[1][0],
        ]),
        d3.max([
          aleph.chartDraggedCoordinates[0][0],
          aleph.chartDraggedCoordinates[1][0],
        ]),
      ]);

      d3.selectAll(".axis.axis--x.mainAxis")
        .transition()
        .duration(aleph.lineChartTransitionDuration)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(aleph.xMain));

      // update y-axis domain defintion
      aleph.yMain.domain([
        d3.min([
          aleph.chartDraggedCoordinates[0][1],
          aleph.chartDraggedCoordinates[1][1],
        ]),
        d3.max([
          aleph.chartDraggedCoordinates[0][1],
          aleph.chartDraggedCoordinates[1][1],
        ]),
      ]);

      // transition y axis to new domain extent
      d3.selectAll(".axis.axis--y.mainAxis")
        .transition()
        .duration(aleph.lineChartTransitionDuration)
        .ease(d3.easeLinear)
        .call(d3.axisLeft(aleph.yMain));

      // Transition all coloured data lines
      d3.selectAll(".line.mainline")
        .transition()
        .duration(aleph.lineChartTransitionDuration)
        .ease(d3.easeLinear)
        .attr("d", aleph.mainline);

      // Transition all data line vertex markers
      d3.selectAll(".aleph-Line-Vertex-Marker-Circles")
        .transition()
        .duration(aleph.lineChartTransitionDuration)
        .ease(d3.easeLinear)
        .attr("cx", function (d) {
          return (
            aleph.margin.line[aleph.windowSize].left +
            aleph.xMain(aleph.parseDate(d.year))
          );
        })
        .attr("cy", function (d) {
          return (
            aleph.margin.line[aleph.windowSize].top +
            aleph.yMain(d[aleph.lineChartyAxisType] /* .counts */ /* value */)
          );
        });

      // document.getElementById("line-reset-axes").disabled = false;
      d3.selectAll(".selection").remove();
      d3.selectAll(".aleph-wasteBin").classed("aleph-hide", true);
    }
  } else {
    d3.selectAll(".aleph-wasteBin").classed("aleph-hide", true);
  }

  return;
} // end function ended

/*





  NAME: dragging 
  DESCRIPTION: function called when user continues dragging tiemline on vertical plane using mouse
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: d3.drag implementation
  CALLS: none

  http://bl.ocks.org/paradite/71869a0f30592ade5246
  */
function dragging() {
  d3.selectAll(".mouse-line").classed("aleph-hide", true);
  d3.selectAll(".mouse-per-line").classed("aleph-hide", true);
  d3.selectAll(".aleph-toolTip-Div").classed("aleph-hide", true);

  var p = d3.mouse(aleph.mouseoverRectangle);

  aleph.selectionRectangle.currentX = p[0]; // x
  aleph.selectionRectangle.currentY = p[1]; // y

  var chartWidth = aleph.xMain.range()[1] - aleph.xMain.range()[0];
  var chartHeight = aleph.yMain.range()[0] - aleph.yMain.range()[1];

  if (
    aleph.selectionRectangle.currentX >=
    aleph.margin.line[aleph.windowSize].left &&
    aleph.selectionRectangle.currentX <=
    aleph.margin.line[aleph.windowSize].left + chartWidth &&
    aleph.selectionRectangle.currentY >=
    aleph.margin.line[aleph.windowSize].top &&
    aleph.selectionRectangle.currentY <=
    aleph.margin.line[aleph.windowSize].top + chartHeight
  ) {
    getNewAttributes();

    var chartContinueDraggingX = aleph.xMain.invert(
      p[0] - aleph.margin.line[aleph.windowSize].left
    );

    var chartContinueDraggingY = aleph.yMain.invert(
      p[1] - aleph.margin.line[aleph.windowSize].top
    );

    aleph.chartDraggedCoordinates = [
      [aleph.chartStartDragX, aleph.chartStartDragY],
      [chartContinueDraggingX, chartContinueDraggingY],
    ];
  }

  d3.selectAll(".aleph-wasteBin").classed("aleph-hide", false);

  return;
} // end function dragging

/*





  NAME: started 
  DESCRIPTION: function called when user starts a mouse drag process
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: d3.drag implementation
  CALLS: none

  http://bl.ocks.org/paradite/71869a0f30592ade5246
*/
function started() {
  d3.selectAll(".mouse-line").classed("aleph-hide", true);
  d3.selectAll(".mouse-per-line").classed("aleph-hide", true);
  d3.selectAll(".aleph-toolTip-Div").classed("aleph-hide", true);

  var p = d3.mouse(aleph.mouseoverRectangle);

  aleph.selectionRectangle.rectElement = d3
    .select("#aleph-line-chart")
    .append("rect")
    .attr("class", "selection")
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", 0);

  aleph.selectionRectangle.originX = p[0];
  aleph.selectionRectangle.originY = p[1];

  aleph.selectionRectangle.currentX = p[0];
  aleph.selectionRectangle.currentY = p[1];

  getNewAttributes();

  aleph.chartStartDragX = aleph.xMain.invert(
    p[0] - aleph.margin.line[aleph.windowSize].left
  );

  aleph.chartStartDragY = aleph.yMain.invert(
    p[1] - aleph.margin.line[aleph.windowSize].top
  );

  aleph.chartDraggedCoordinates = [
    [aleph.chartStartDragX, aleph.chartStartDragY],
    [0, 0],
  ];

  // var chartWidth = aleph.xMain.range()[1] - aleph.xMain.range()[0];
  // var chartHeight = aleph.yMain.range()[0] - aleph.yMain.range()[1];

  // d3.selectAll(".aleph-line-chart")
  //   .append("svg:image")
  //   .attr("class", "aleph-wasteBin")
  //   .attr("id", "aleph-wasteBin")
  //   .attr("xlink:href", "image/wasteBin.svg")
  //   .attr("width", 50)
  //   .attr("height", 50)
  //   .attr("x", aleph.margin.line[aleph.windowSize].left + 10)
  //   .attr("y", aleph.margin.line[aleph.windowSize].top + chartHeight - 55);

  // document.getElementById("line-reset-axes").disabled = false;

  return;
} // end function started

/*  




    NAME: cursorCoords 
    DESCRIPTION: function called determine dynamically by the current positioning of the cursor, and thus where to display toolip on event rectangle interaction
    ARGUMENTS TAKEN:  x - cursor x coordinate on browser
                      y - cursor y coordinate on browser
    ARGUMENTS RETURNED: none
    CALLED FROM: mouse move interaction in submitLineSelection
    CALLS: numberWithCommas
    USEFUL: // https://stackoverflow.com/questions/16770763/mouse-position-in-d3
*/
function cursorCoords(x, y) {
  // update global chart width and height dimensions
  aleph.chartWidth = svgWidth;
  aleph.chartHeight = svgHeight;
  var currentSelectedYear = aleph.formatDate(aleph.xYear);

  // modify class definiton of tooltip 'g' element and current offset position based on mouse cursor position
  d3.selectAll(".aleph-toolTip-Div")
    .moveToFront()
    .classed("aleph-hide", false)
    .style("left", function () {
      if (x < aleph.chartWidth / 2) {
        d3.selectAll(".aleph-mouseover-textlabel")
          .style("text-anchor", "end")
          .attr("transform", "translate(-20,3)");

        return x + 15 + "px"; // left half
      } else {
        d3.selectAll(".aleph-mouseover-textlabel")
          .style("text-anchor", "start")
          .attr("transform", "translate(10,3)");

        return x - aleph.toolTipDimensions.width - 15 + "px"; // right half
      }
    })
    .style("top", function () {
      if (y < aleph.chartHeight / 2) {
        return y + 15 + "px"; // top half
      } else {
        return (
          y -
          d3.selectAll(".aleph-toolTip-Div").style("height").replace("px", "") +
          "px"
        ); // bottom half
      }
    });

  // upate main tootlitp title.
  d3.selectAll(".aleph-toolTipTitle-label").html(currentSelectedYear);

  // initialise local array to help sort information content to display on tooltip
  var unsortedScenarioArray = [];
  var sortedScenarioArray = [];

  // cycle through all currently displayed scenarios, and push into a local array ...
  for (var scenario in aleph.scenarios) {
    unsortedScenarioArray.push(aleph.scenarios[scenario]);
  } // end for loop

  // sort local storage array based on summed values for each tiem series year.
  sortedScenarioArray = unsortedScenarioArray.sort(function (a, b) {
    return (
      +b.yearSummedValues[currentSelectedYear] -
      +a.yearSummedValues[currentSelectedYear]
    );
  });

  // remove the main tooltip div
  d3.selectAll(".aleph-tooltip-scenario-div").remove();

  d3.selectAll(".toolTip-content-to-Remove").remove();
  d3.selectAll(".aleph-toolTip-Div")
    .append("table")
    .attr("class", "tooltip-table toolTip-content-to-Remove")
    .style("width", "100%")
    .style("height", "100%");

  d3.selectAll(".tooltip-table").append("tr").attr("class", "table-header-row");

  var headers = [
    "Marker",
    "Population Size",
    "% Total Year UK Pop.",
    "Scenario Criteria*",
  ];

  headers.forEach(function (d, i) {
    d3.selectAll(".table-header-row")
      .append("td")
      .attr("class", "table-header-row-header-cell header-cell-" + i)
      .style("width", "auto");

    d3.selectAll(".table-header-row-header-cell.header-cell-" + i)
      .append("label")
      .attr(
        "class",
        "table-header-row-header-cell-label header-cell-label-" + i
      )
      .html(headers[i]);
  });

  sortedScenarioArray.forEach(function (d, i) {
    var rowNumber = i;
    d3.selectAll(".tooltip-table")
      .append("tr")
      .attr(
        "class",
        "tooltip-table-row toolTip-content-to-Remove tooltip-table-row-" +
        rowNumber
      )
      .style("width", "100%");

    for (var columnNumber = 0; columnNumber < headers.length; columnNumber++) {
      d3.selectAll(".tooltip-table-row-" + rowNumber)
        .append("td")
        .attr("class", function () {
          return "table-dataCell table-dataCell-" + columnNumber;
        });

      if (columnNumber == 0) {
        d3.selectAll(".tooltip-table-row-" + rowNumber)
          .selectAll(".table-dataCell-" + columnNumber)
          .append("div")
          .attr("class", "aleph-tooltip-marker-circle-div")
          .style("background-color", d.lineColour);
      } else {
        d3.selectAll(".tooltip-table-row-" + rowNumber)
          .selectAll(".table-dataCell-" + columnNumber)
          .append("label")
          .attr(
            "class",
            "table-cell-text-content table-cell-text-content-" + columnNumber
          )
          .html(function () {
            if (columnNumber == 1) {
              return numberWithCommas(d.yearSummedValues[currentSelectedYear]);
            } else if (columnNumber == 2) {
              return (
                (
                  (d.yearSummedValues[currentSelectedYear] /
                    aleph.dataYearPopulations[
                    aleph.years.indexOf(currentSelectedYear)
                    ]) *
                  100
                ).toFixed(2) + "%"
              );
            } else if (columnNumber == 3) {
              var string = "";

              if (
                d.genderString.split(",").length == 2 &&
                d.ethnicityString.split(",").length == 6 &&
                d.agebandString.split(",").length == 9 &&
                d.nationalitiesString.split(",").length == 2 &&
                d.religionsString.split(",").length == 4 &&
                d.healthString.split(",").length == 7 &&
                d.qualificationString.split(",").length == 4
              ) {
                string = "Full Population";
              } else {
                if (d.genderString.split(",").length != 2) {
                  d.genderString.split(",").forEach(function (d) {
                    string = string + aleph.codes.genders[d - 1] + ", ";
                  });
                  string =
                    "<span class='spanBold'>Genders:</span> " +
                    string.substr(0, string.length - 2) +
                    "</br>";
                }

                if (d.ethnicityString.split(",").length != 6) {
                  string =
                    string + "<span class='spanBold'> Ethnicities:</span> ";
                  d.ethnicityString.split(",").forEach(function (d) {
                    string = string + aleph.codes.ethnicities[d - 1] + ", ";
                  });
                  string = string.substr(0, string.length - 2) + "</br>";
                }

                if (d.agebandString.split(",").length != 9) {
                  string =
                    string + "<span class='spanBold'> Age Bands:</span> ";
                  d.agebandString.split(",").forEach(function (d) {
                    string = string + aleph.codes.ageBands[d - 1] + ", ";
                  });
                  string = string.substr(0, string.length - 2) + "</br>";
                }

                if (d.nationalitiesString.split(",").length != 2) {
                  string =
                    string + "<span class='spanBold'> Nationalities:</span> ";
                  d.nationalitiesString.split(",").forEach(function (d) {
                    string = string + aleph.codes.nationalities[d - 1] + ", ";
                  });
                  string = string.substr(0, string.length - 2) + "</br>";
                }

                if (d.religionsString.split(",").length != 4) {
                  string =
                    string + "<span class='spanBold'> Religions:</span> ";
                  d.religionsString.split(",").forEach(function (d) {
                    string = string + aleph.codes.religions[d - 1] + ", ";
                  });
                  string = string.substr(0, string.length - 2) + "</br>";
                }

                if (d.healthString.split(",").length != 7) {
                  string = string + "<span class='spanBold'> Health:</span> ";
                  d.healthString.split(",").forEach(function (d, i) {
                    string = string + aleph.codes.health[d - 1] + ", ";
                  });
                  string = string.substr(0, string.length - 2) + "</br>";
                }

                if (d.qualificationString.split(",").length != 4) {
                  string =
                    string + "<span class='spanBold'> Qualifications:</span> ";
                  d.qualificationString.split(",").forEach(function (d) {
                    string = string + aleph.codes.qualifications[d - 1] + ", ";
                  });
                  string = string.substr(0, string.length - 2) + "</br>";
                }
              }

              return string;
            }
          });
      }
    }
  });

  d3.selectAll(".aleph-toolTip-Div")
    .append("label")
    .attr("class", "aleph-tooltip-footer toolTip-content-to-Remove")
    .text(
      "* Only criteria are listed for those selections modified from 'Full Population'."
    );

  d3.selectAll(".aleph-toolTip-Div").moveToFront();

  return;
} // end function cursorCoords

/*





    NAME: transitionLineChart 
    DESCRIPTION: Transitions all chart coloured data lines and their respective vertex markers after addition of a new line
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: drawPopulationLineOnChart
    CALLS: none
    USEFULL LINKS: 
*/

function transitionLineChart() {
  if (aleph.lineChartyAxisType == "counts") {
    aleph.lineChartYAxisDomain = [
      0,
      Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
      aleph.lineChartYAxisRounding,
    ];
  } else {
    aleph.lineChartYAxisDomain = [0, 100];
  }

  /*
    transition chart data axis to accommodarte all lines;
    needed to handle new line plotting off .domain extent of current y-axis
  */
  // update y-axis domain defintion
  aleph.yMain.domain(
    aleph.lineChartYAxisDomain /* [
    0,
    Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
      aleph.lineChartYAxisRounding,
  ] */
  );

  $("#vertical-line-slider-range")
    .slider("option", "values", [
      aleph.yMain.domain()[0],
      aleph.yMain.domain()[1],
    ])
    .slider("option", "max", aleph.yMain.domain()[1]);

  // d3.selectAll(".slider-label.slider-label-fixed-top").text(
  //   numberWithCommas(aleph.yMain.domain()[1])
  // );
  d3.selectAll(".slider-label.slider-label-fixed-top").text(function () {
    if (aleph.lineChartyAxisType == "counts") {
      return numberWithCommas(aleph.yMain.domain()[1]);
    } else {
      return aleph.yMain.domain()[1].toFixed(1);
    }
  });

  d3.selectAll(".aleph-yAxisTitle").html(
    "Number of UK Population (between " +
    numberWithCommas(aleph.yMain.domain()[0]) +
    " to " +
    numberWithCommas(aleph.yMain.domain()[1]) +
    ")"
  );

  d3.selectAll(".slider-label.slider-label-movable-top")
    .style("bottom", "100%")
    .text(numberWithCommas(aleph.yMain.domain()[1]) + " -");

  d3.selectAll(".slider-label.slider-label-movable-bottom")
    .style("bottom", "0%")
    .text(numberWithCommas(aleph.yMain.domain()[0]) + " -");

  // transition y axis to new domain extent
  d3.selectAll(".axis.axis--y.mainAxis")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .call(d3.axisLeft(aleph.yMain));

  /*
    Remove from DOM and redraw tick grid lines extending from y-axis ticks on axis across scatter graph
  */
  d3.selectAll(".aleph-yAxisTicks").remove();
  var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
  yticks
    .append("svg:line")
    .attr("class", "aleph-yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr(
      "x2",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    );

  // Transition all coloured data lines
  d3.selectAll(".line.mainline")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("d", aleph.mainline);

  // Transition all data line vertex markers
  d3.selectAll(".aleph-Line-Vertex-Marker-Circles")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("cx", function (d) {
      return (
        aleph.margin.line[aleph.windowSize].left +
        aleph.xMain(aleph.parseDate(d.year))
      );
    })
    .attr("cy", function (d) {
      return (
        aleph.margin.line[aleph.windowSize].top +
        aleph.yMain(d[aleph.lineChartyAxisType] /* .counts */ /* value */)
      );
    });

  // Bring user interaction rectangle to front of chart, above all data lines and circles.
  d3.selectAll(".aleph-mouseRectangle").moveToFront();
  d3.selectAll(".aleph-wasteBin").moveToFront();

  return;
} // end function transitionLineChart

/*





  NAME: validateAllOptionsToAllowSubmit 
  DESCRIPTION: function called on each change of a chosen selection list, to validate secltion and deteine if submit and reset buttons should be active or disabled.
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: .chosen selection lists
  CALLS: none
*/
function validateAllOptionsToAllowSubmit() {
  // if suitable array and criteria conditions align ...

  /*
    selectionIndexes: {
    ethnicities: [],
    ageBands: [],
    genders: [],
    nationalities: [],
    religions: [],
    health: [],
    qualifications: [],
  },
  */

  if (
    aleph.selectionIndexes.ethnicities &&
    aleph.selectionIndexes.ethnicities.length > 0 &&
    aleph.selectionIndexes.ageBands &&
    aleph.selectionIndexes.ageBands.length > 0 &&
    aleph.selectionIndexes.genders &&
    aleph.selectionIndexes.genders.length > 0 &&
    aleph.selectionIndexes.nationalities &&
    aleph.selectionIndexes.nationalities.length > 0 &&
    aleph.selectionIndexes.religions &&
    aleph.selectionIndexes.religions.length > 0 &&
    aleph.selectionIndexes.health &&
    aleph.selectionIndexes.health.length > 0 &&
    aleph.selectionIndexes.qualifications &&
    aleph.selectionIndexes.qualifications.length > 0
  ) {
    // enable reset and submit buttons
    document.getElementById("line-submit").disabled = false;
    document.getElementById("line-clear").disabled = false;
  } else {
    // disable reset and submit buttons
    document.getElementById("line-submit").disabled = true;
    document.getElementById("line-clear").disabled = true;
  }

  return;
} // end function validateAllOptionsToAllowSubmit

/*





  NAME: addLineSelectionLists 
  DESCRIPTION: function to add all requried selection lists
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: onload
  CALLS: validateAllOptionsToAllowSubmit
*/
function addLineSelectionLists() {
  // for (var list in aleph.selectionIndexes) {
  for (var list in aleph.selectionListConfigurations.line) {
    var id = aleph.selectionListConfigurations.line[list].id;
    var value = aleph.selectionListConfigurations.line[list].value;
    var multiple = aleph.selectionListConfigurations.line[list].multiple;
    var title = aleph.selectionListConfigurations.line[list].title;
    var dataStyle = aleph.selectionListConfigurations.line[list]["data-style"];
    var dataActionsBox =
      aleph.selectionListConfigurations.line[list]["data-actions-box"];
    var dataWidth = aleph.selectionListConfigurations.line[list]["data-width"];
    var dataDropupAuto =
      aleph.selectionListConfigurations.line[list]["data-dropup-auto"];
    var defaults = aleph.selectionListConfigurations.line[list]["defaults"];
    var dataHeader =
      aleph.selectionListConfigurations.line[list]["data-header"];
    var container = aleph.selectionListConfigurations.line[list]["container"];
    var selectedTextFormat =
      aleph.selectionListConfigurations.line[list]["data-selected-text-format"];
    var showTick = aleph.selectionListConfigurations.line[list]["show-tick"];

    var valueIndexArray = [];
    var labelValues = [];

    for (var i = 1; i < aleph.selectionLists[list].length + 1; i++) {
      valueIndexArray.push(i);
      labelValues.push(
        aleph.selectionLists[list][i - 1]
          .replace(" to ", "-")
          .replace(" and over", "+")
      );
    }

    // build and manipulate data arrays to help populate array...
    var options = d3.zip(
      aleph.selectionLists[list],
      valueIndexArray,
      aleph.codes[list],
      labelValues
    );

    // sort list element array
    aleph.options = options.sort(function (b, a) {
      return d3.descending(a[1], b[1]);
    });

    d3.selectAll("." + container)
      .append("select")
      .attr("class", "selectpicker form-control")
      .attr("id", id)
      .attr("value", value)
      .attr("multiple", multiple)
      .attr("title", title)
      .attr("data-style", dataStyle)
      .attr("data-actions-box", dataActionsBox)
      .attr("data-width", dataWidth)
      .attr("data-dropup-auto", dataDropupAuto)
      .attr("data-header", dataHeader)
      .attr("show-tick", showTick)
      .attr("data-selected-text-format", selectedTextFormat);

    d3.select("#" + id)
      .selectAll(".selectOptions." + list)
      .data(aleph.options)
      .enter()
      .append("option")
      .attr("selected", function (d, i) {
        if (defaults.indexOf(d[1]) != -1 && list == "lines") {
          return true;
        }
      })
      .attr("class", "selectOptions " + list)
      .attr("value", function (d) {
        return d[1];
      })
      .text(function (d) {
        return d[2];
      });

    $("#" + id).selectpicker({
      style: "btn-primary",
    });

    $("#" + id).on(
      "changed.bs.select",
      function (e, clickedIndex, isSelected, previousValue) {
        if (this.id == "line-selectpicker-lines") {
          aleph.maxNumberOfLines = clickedIndex;
          // slicing subset of colours from main array to use for vis.
          // aleph.coloursSubset = aleph.colours.splice(0, aleph.maxNumberOfLines);
          aleph.coloursSubset = aleph.colours.slice(0, aleph.maxNumberOfLines);
        } else {
          var list = this.id.replace("line-selectpicker-", "");
          actionedToggleBtn = $("[data-id=" + this.id + "]");
          if (clickedIndex == null && aleph.lineOnload == false) {
            actionSelectDeselectAll(list, actionedToggleBtn);
            checkLineSelectionsDynamcially(aleph.selectionIndexes);
          } else if (clickedIndex != null) {
            var parameterIndex = Number(clickedIndex) + 1;

            if (isSelected) {
              aleph.selectionIndexes[list].push(parameterIndex);

              $(actionedToggleBtn)
                .removeClass("btn-danger")
                .addClass("btn-primary");
            } else {
              const index =
                aleph.selectionIndexes[list].indexOf(parameterIndex);
              if (index > -1) {
                aleph.selectionIndexes[list].splice(index, 1);

                if (aleph.selectionIndexes[list].length == 0) {
                  $(actionedToggleBtn)
                    .removeClass("btn-primary")
                    .addClass("btn-danger");
                } else {
                  $(actionedToggleBtn)
                    .removeClass("btn-danger")
                    .addClass("btn-primary");
                }
              }
            }
            checkLineSelectionsDynamcially(aleph.selectionIndexes);
          } // end else if ...

          // checkLineSelectionsDynamcially(aleph.selectionIndexes);
        }
      }
    ); // end .on...

    function actionSelectDeselectAll(l, b) {
      if (aleph.selectAll) {
        aleph.selectionIndexes[l] =
          aleph.selectionListConfigurations.line[l]["full-array"];
        $(b).removeClass("btn-danger").addClass("btn-primary");
      } else {
        aleph.selectionIndexes[l] = [];
        $(b).removeClass("btn-primary").addClass("btn-danger");
      }

      return;
    }
  } // end for loop ...

  $(".bs-select-all").on("click", function () {
    aleph.selectAll = true;
  });
  $(".bs-deselect-all").on("click", function () {
    aleph.selectAll = false;
  });

  return;
} // end function addLineSelectionLists

/*





  NAME: drawSparkLine 
  DESCRIPTION: function to add a new saparkline to chgarts righthand margin area on addition of a new data line
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: drawPopulationLineOnChart
  CALLS: numberWithCommas
*/
function drawSparkLine(scenario) {
  // select new data line group element created for main data line just plotted
  // append a new 'g' elements to contain spaerkline and all its related DOM elements
  // attach data to allow line and marker constrcution
  d3.selectAll(
    ".aleph-line-group-" +
    aleph.currentlySelectedScenario.scenarioSubmissionNumber
  )
    .append("g")
    .datum(aleph.currentlySelectedScenario.lineChartData)
    .attr(
      "class",
      "aleph-Line-handleLine-Group aleph-Line-handleLine-Group-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr(
      "id",
      "aleph-Line-handleLine-Group-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr("transform", function () {
      aleph.tickIconMarkerCounter++;

      return (
        "translate(" +
        (aleph.margin.line[aleph.windowSize].left +
          aleph.xMain(aleph.xMain.domain()[1]) +
          0) +
        "," +
        (aleph.margin.line[aleph.windowSize].top +
          aleph.yMain(aleph.yMain.domain()[1]) +
          Number(aleph.currentNumberOfSavedScenarios + 1) *
          aleph.tickIconMarkerSpacer) /* CHANGE */ +
        ")"
      );
    })
    .on("mouseover", function (d, i) {
      d3.selectAll(".aleph-sparkLineTooltip-Div").classed("aleph-hide", false);
      // call function to update coordinates and position of tooltip
      // D3 v4
      var x = d3.event.pageX;
      var y = d3.event.pageY;

      var lineIndex = this.id.replace("aleph-Line-handleLine-Group-", "");

      // function called to define and build tooltip structure and content
      sparkLineToolTip_CursorCoords(d, x, y, lineIndex);
      return;
    })
    .on("mousemove", function (d, i) {
      // call function to update coordinates and position of tooltip
      // D3 v4
      var x = d3.event.pageX;
      var y = d3.event.pageY;

      var lineIndex = this.id.replace("aleph-Line-handleLine-Group-", "");

      // function called to define and build tooltip structure and content
      sparkLineToolTip_CursorCoords(d, x, y, lineIndex);
      return;
    })
    .on("mouseout", function (d, i) {
      d3.selectAll(".aleph-sparkLineTooltip-Div").classed("aleph-hide", true);
      return;
    });

  var sparkLine = d3
    .selectAll(
      ".aleph-Line-handleLine-Group.aleph-Line-handleLine-Group-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .append("g")
    .attr("class", "sparkLine-G")
    .attr("transform", "translate(75,0)");

  // define sparkline x axis domain and range ...
  aleph.sparkLine_x = d3
    .scaleTime()
    .range([0, 100])
    .domain([
      aleph.parseDate(aleph.years[0]),
      aleph.parseDate(aleph.years[aleph.years.length - 1]),
    ]);

  // define sparkline y axis domain and range ...
  aleph.sparkLine_y = d3
    .scaleLinear()
    .range([aleph.tickIconMarkerSpacer, 0])
    .domain([
      0,
      Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
      aleph.lineChartYAxisRounding,
    ]);

  /*    d3.selectAll(
    ".aleph-Line-handleLine-Group.aleph-Line-handleLine-Group-" +
      aleph.currentNumberOfSavedScenarios
  )   */
  sparkLine
    .append("rect")
    .attr("class", "aleph-sparkline-rectBackground")
    .attr("x", -5)
    .attr("y", 10)
    .attr("width", aleph.sparkLine_x.range()[1] + 10)
    .attr("height", aleph.sparkLine_y.range()[0]);

  // append g element to hold x time axis
  /* d3.selectAll(
    ".aleph-Line-handleLine-Group-" + aleph.currentNumberOfSavedScenarios
  ) */ sparkLine
    .append("g")
    .attr(
      "class",
      "axis axis--x scenarioAxis scenarioAxis-" +
      aleph.currentNumberOfSavedScenarios
    )
    .attr(
      "transform",
      "translate(" +
      aleph.margin.line.sparklineAxis.left +
      "," +
      aleph.tickIconMarkerSpacer +
      ")"
    )
    .call(
      d3
        .axisBottom(aleph.sparkLine_x)
        .ticks(d3.timeYear.every(1))
        .tickFormat(function (d) {
          return aleph.formatDate(d);
        })
    );

  // append g element to hold y data axis
  /*   d3.selectAll(
    ".aleph-Line-handleLine-Group-" + aleph.currentNumberOfSavedScenarios
  ) */ sparkLine
    .append("g")
    .attr(
      "class",
      "axis axis--y scenarioAxis scenarioAxis-" +
      aleph.currentNumberOfSavedScenarios
    )
    .attr(
      "transform",
      "translate(" +
      aleph.margin.line.sparklineAxis.left +
      "," +
      aleph.margin.line.sparklineAxis.top +
      ")"
    )
    .call(d3.axisLeft(aleph.sparkLine_y));

  // define line generator for sparklines
  aleph.sparkline = d3
    .line()
    .x(function (d) {
      return (
        aleph.margin.line.sparklineAxis.left +
        aleph.sparkLine_x(aleph.parseDate(d.year))
      );
    })
    .y(function (d) {
      return (
        aleph.margin.line.sparklineAxis.top +
        aleph.sparkLine_y(
          d[aleph.lineChartyAxisType] /* .counts */ /* value */ -
          aleph.currentlySelectedScenario.lineChartData[0][
          aleph.lineChartyAxisType
          ] /* .counts */ /* value */
        )
      );
    });

  // Append the path, bind the data, and call the line generator
  /*   d3.selectAll(
    ".aleph-Line-handleLine-Group-" + aleph.currentNumberOfSavedScenarios
  ) */ sparkLine
    .append("path")
    .datum(aleph.currentlySelectedScenario.lineChartData)
    .attr(
      "class",
      "line aleph-sparkline changeSparklineStyle-" +
      aleph.currentNumberOfSavedScenarios
    )
    .style("stroke", aleph.currentlySelectedScenario.lineColour)
    .attr("d", aleph.sparkline);

  // append tick icon to allow user to show/hide main data line and push back sparkline to denote data line's current state.
  d3.selectAll(
    ".aleph-Line-handleLine-Group-" +
    aleph.currentlySelectedScenario.scenarioSubmissionNumber
  )
    .append("svg:image")
    .attr(
      "class",
      "aleph-hideIcon aleph-close add scenario-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr(
      "id",
      "aleph-close-scenario-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr("xlink:href", "image/add.svg")
    .attr("width", 35)
    .attr("height", 35)
    .attr("x", 35)
    .attr(
      "y",
      aleph.sparkLine_y(aleph.sparkLine_y(aleph.sparkLine_y.domain()[0])) - 17.5
    )
    .attr("title", function () {
      event.stopPropagation();
      return "Hide or Show Scenario Lines";
    })
    .on("click", function () {
      event.stopPropagation();

      var panelID = d3
        .select(this)
        .attr("id")
        .replace("aleph-close-scenario-", "");

      if (d3.select(this).classed("remove")) {
        d3.select(this)
          .classed("remove", false)
          .classed("add", true)
          .attr("xlink:href", "image/add.svg");

        d3.selectAll(".line.mainline.changeMainlineStyle-" + panelID)
          .classed("aleph-fullTransparent", false)
          .classed("aleph-opaque", true);

        d3.selectAll(".aleph-Line-Vertex-Marker-Circles.scenario-" + panelID)
          .classed("aleph-fullTransparent", false)
          .classed("aleph-opaque", true);

        d3.selectAll(".line.changeSparklineStyle-" + panelID)
          .classed("aleph-semi-transparent", false)
          .classed("aleph-opaque", true);

        d3.selectAll(".aleph-marker-group.changeSparklineStyle-" + panelID)
          .classed("aleph-semi-transparent", false)
          .classed("aleph-opaque", true);
      } else if (d3.select(this).classed("add")) {
        d3.select(this)
          .classed("remove", true)
          .classed("add", false)
          .attr("xlink:href", "image/remove.svg");

        d3.selectAll(".line.mainline.changeMainlineStyle-" + panelID)
          .classed("aleph-fullTransparent", true)
          .classed("aleph-opaque", false);

        d3.selectAll(".aleph-Line-Vertex-Marker-Circles.scenario-" + panelID)
          .classed("aleph-fullTransparent", true)
          .classed("aleph-opaque", false);

        d3.selectAll(".line.changeSparklineStyle-" + panelID)
          .classed("aleph-semi-transparent", true)
          .classed("aleph-opaque", false);

        d3.selectAll(".aleph-marker-group.changeSparklineStyle-" + panelID)
          .classed("aleph-semi-transparent", true)
          .classed("aleph-opaque", false);
      }

      return;
    });

  // append Delete Line icons to allow user to permanently delete an individual line.
  d3.selectAll(
    ".aleph-Line-handleLine-Group-" +
    aleph.currentlySelectedScenario.scenarioSubmissionNumber
  )
    .append("svg:image")
    .attr(
      "class",
      "aleph-deleteIcon aleph-delete delete scenario-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr(
      "id",
      "aleph-delete-scenario-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr("xlink:href", "image/delete.svg")
    .attr("width", 35)
    .attr("height", 35)
    .attr("x", 10)
    .attr(
      "y",
      aleph.sparkLine_y(aleph.sparkLine_y(aleph.sparkLine_y.domain()[0])) - 17.5
    )
    .on("click", function () {
      event.stopPropagation();

      d3.selectAll(".aleph-sparkLineTooltip-Div").classed("aleph-hide", true);

      d3.selectAll(
        ".alert.alert-danger.alert-dismissible.lineChart.lineDeletion"
      ).classed("aleph-hide", false);

      d3.selectAll(".aleph-alert-line-lineDeletion").html(
        "You want to delete <span class='spanBold'>Query " +
        Number(scenario.scenarioSubmissionNumber + 1) +
        "</span>: Are you sure? This action cannot be undone."
      );

      aleph.lineToDelete = scenario.scenarioSubmissionNumber;
      aleph.currentNumberOfSavedScenarios = Object.keys(aleph.scenarios).length;

      return;
    });

  // add marker 'g' elements at start and end of data sparrkline
  sparkLine
    .selectAll(".aleph-marker-group")
    .data(aleph.currentlySelectedScenario.lineChartData)
    .enter()
    .filter(function (d, i) {
      return (
        i == 0 || i == aleph.currentlySelectedScenario.lineChartData.length - 1
      );
    })
    .append("g")
    .attr(
      "class",
      "aleph-marker-group changeSparklineStyle-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .attr("transform", function (d) {
      return (
        "translate(" +
        (aleph.margin.line.sparklineAxis.left +
          aleph.sparkLine_x(aleph.parseDate(d.year))) +
        "," +
        (aleph.margin.line.sparklineAxis.top +
          aleph.sparkLine_y(
            d[aleph.lineChartyAxisType] /* .counts */ /* value */ -
            aleph.currentlySelectedScenario.lineChartData[0][
            aleph.lineChartyAxisType
            ] /* .counts */ /* value */
          )) +
        ")"
      );
    });

  // add marker dot circles at start and end of data sparrkline
  /*   d3.selectAll(
    ".aleph-Line-handleLine-Group-" + aleph.currentNumberOfSavedScenarios
  ) */ sparkLine
    .selectAll(".aleph-marker-group")
    .append("circle")
    .attr("class", "aleph-marker-dot")
    .style("fill", aleph.currentlySelectedScenario.lineColour)
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 5);

  // add marker dot labels at start and end of data sparrkline
  d3.selectAll(
    ".aleph-Line-handleLine-Group-" +
    aleph.currentlySelectedScenario.scenarioSubmissionNumber
  )
    .selectAll(".aleph-marker-group")
    .append("text")
    .attr("class", "aleph-marker-text")
    .attr("x", 0)
    .attr("y", function (d, i) {
      if (i == 0) {
        return -15;
      } else {
        return 20;
      }
    })
    .style("text-anchor", function (d, i) {
      if (i == 0) {
        d3.select(this).classed("start", true);
        return "start";
      } else {
        d3.select(this).classed("end", true);
        return "end";
      }
    })
    .text(function (d) {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(
          d[aleph.lineChartyAxisType]
        ); /* .counts */ /* value */
      } else {
        return d[aleph.lineChartyAxisType].toFixed(2); /* .counts */ /* value */
      }
    });

  var sparkLine = d3
    .selectAll(
      ".aleph-Line-handleLine-Group.aleph-Line-handleLine-Group-" +
      aleph.currentlySelectedScenario.scenarioSubmissionNumber
    )
    .append("circle")
    .attr("cx", 80)
    .attr("cy", 50)
    .attr("r", 12.5)
    .attr("class", "aleph-mobile-sparkline-dot")
    .style("fill", aleph.currentlySelectedScenario.lineColour);
} // end function drawSparkLine

/*  




    NAME: sparkLineToolTip_CursorCoords 
    DESCRIPTION: function called determine dynamically by the current positioning of the cursor, and thus where to display toolip on event rectangle interaction
    ARGUMENTS TAKEN:  x - cursor x coordinate on browser
                      y - cursor y coordinate on browser
    ARGUMENTS RETURNED: none
    CALLED FROM: mouse move interaction in submitLineSelection
    CALLS: numberWithCommas
    USEFUL: // https://stackoverflow.com/questions/16770763/mouse-position-in-d3
*/
function sparkLineToolTip_CursorCoords(d, x, y, lineIndex) {
  // update global chart width and height dimensions
  aleph.chartWidth = svgWidth;
  aleph.chartHeight = svgHeight;

  d3.selectAll(".aleph-sparkLineTooltip-Div-infoLabel").remove();

  // modify class definiton of tooltip 'g' element and current offset position based on mouse cursor position
  d3.selectAll(".aleph-sparkLineTooltip-Div")
    .moveToFront()
    .classed("aleph-hide", false)
    .style("left", function () {
      if (x < aleph.chartWidth / 2) {
        return x + 15 + "px"; // left half
      } else {
        return x - aleph.sparkLineToolTipDimensions.width - 15 + "px"; // right half
      }
    })
    .style("top", function () {
      if (y < aleph.chartHeight / 2) {
        return y + 15 + "px"; // top half
      } else {
        return (
          y -
          d3
            .selectAll(".aleph-sparkLineTooltip-Div")
            .style("height")
            .replace("px", "") +
          "px"
        ); // bottom half
      }
    });

  // upate main tootlitp MAIN TITLE.
  d3.selectAll(".aleph-sparkLineTooltipTitle-label")
    .html("Query " + (Number(lineIndex) + 1) + " Detail")
    .style("color", function (d) {
      return aleph.scenarios[lineIndex].lineColour;
    });

  d3.selectAll(".toolTip-content-to-Remove").remove();

  d3.selectAll(".aleph-sparkLineTooltip-Div")
    .append("table")
    .attr("class", "sparkline-tooltip-table toolTip-content-to-Remove")
    .style("width", "100%")
    .style("height", "100%");

  d3.selectAll(".sparkline-tooltip-table")
    .append("tr")
    .attr("class", "sparkline-table-header-row");

  var headers = ["Marker", "Scenario Criteria*"];

  headers.forEach(function (d, i) {
    d3.selectAll(".sparkline-table-header-row")
      .append("td")
      .attr("class", "sparkline-table-header-row-header-cell header-cell-" + i)
      .style("width", "auto");

    d3.selectAll(".sparkline-table-header-row-header-cell.header-cell-" + i)
      .append("label")
      .attr(
        "class",
        "sparkline-table-header-row-header-cell-label header-cell-label-" + i
      )
      .text(headers[i]);
  });

  d3.selectAll(".sparkline-tooltip-table")
    .append("tr")
    .attr(
      "class",
      "sparkline-tooltip-table-row toolTip-content-to-Remove sparkline-tooltip-table-row-" +
        /* rowNumber */ lineIndex
    )
    .style("width", "100%");

  for (var columnNumber = 0; columnNumber < headers.length; columnNumber++) {
    d3.selectAll(".sparkline-tooltip-table-row-" + /* rowNumber */ lineIndex)
      .append("td")
      .attr("class", function () {
        return (
          "sparkline-table-dataCell sparkline-table-dataCell-" + columnNumber
        );
      });

    if (columnNumber == 0) {
      d3.selectAll(".sparkline-tooltip-table-row-" + /* rowNumber */ lineIndex)
        .selectAll(".sparkline-table-dataCell-" + columnNumber)
        .append("div")
        .attr("class", "aleph-tooltip-marker-circle-div")
        .style("background-color", aleph.scenarios[lineIndex].lineColour);
    } else {
      d3.selectAll(".sparkline-tooltip-table-row-" + /* rowNumber */ lineIndex)
        .selectAll(".sparkline-table-dataCell-" + columnNumber)
        .append("label")
        .attr("class", "aleph-sparkLineTooltip-Div-infoLabel")
        .html(function () {
          var string = "";

          // upate sparkline tooltip  information.
          if (
            aleph.scenarios[lineIndex].genderString.split(",").length == 2 &&
            aleph.scenarios[lineIndex].ethnicityString.split(",").length == 6 &&
            aleph.scenarios[lineIndex].agebandString.split(",").length == 9 &&
            aleph.scenarios[lineIndex].nationalitiesString.split(",").length ==
            2 &&
            aleph.scenarios[lineIndex].religionsString.split(",").length == 4 &&
            aleph.scenarios[lineIndex].healthString.split(",").length == 7 &&
            aleph.scenarios[lineIndex].qualificationString.split(",").length ==
            4
          ) {
            string = "<li>Full Population,";
          } else {
            string = "<li>";
            // genderString
            var selectedLineString =
              aleph.scenarios[lineIndex].genderString.split(",");

            if (selectedLineString.length != 2) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.genders[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }

            // ethnicityString
            var selectedLineString =
              aleph.scenarios[lineIndex].ethnicityString.split(",");

            if (selectedLineString.length != 6) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.ethnicities[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }

            // agebandString
            var selectedLineString =
              aleph.scenarios[lineIndex].agebandString.split(",");

            if (selectedLineString.length != 9) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.ageBands[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }

            // nationalitiesString
            var selectedLineString =
              aleph.scenarios[lineIndex].nationalitiesString.split(",");

            if (selectedLineString.length != 2) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.nationalities[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }

            // religionsString
            var selectedLineString =
              aleph.scenarios[lineIndex].religionsString.split(",");

            if (selectedLineString.length != 4) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.religions[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }

            // healthString
            var selectedLineString =
              aleph.scenarios[lineIndex].healthString.split(",");

            if (selectedLineString.length != 7) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.health[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }

            // qualificationString
            var selectedLineString =
              aleph.scenarios[lineIndex].qualificationString.split(",");

            if (selectedLineString.length != 4) {
              selectedLineString.forEach(function (d) {
                string = string + aleph.codes.qualifications[d - 1] + ", ";
              });
              string = string.substr(0, string.length - 2) + "</br><li>";
            }
          }
          return string.substring(0, string.length - 1);
        });
    }
  }

  d3.selectAll(".aleph-sparkLineTooltip-Div")
    .append("label")
    .attr("class", "aleph-sparkLineTooltip-tooltip-footer toolTip-content-to-Remove")
    .text(
      "* Only criteria are listed for those selections modified from 'Full Population'"
    );

  d3.selectAll(".aleph-sparkLineTooltip-Div").moveToFront();

  return;
} // end function sparkLineToolTip_CursorCoords

/*





  NAME: yAxisScaleType toggle function call 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
    CALLS:

  USEFUL LINKS:
  https://bl.ocks.org/d3indepth/30d31098b607b669a7874bf4ab3c9595
  https://observablehq.com/@d3/axis-ticks

*/
$("#yAxisScaleType").change(function () {
  if ($(this).prop("checked") == false) {
    aleph.yMain = d3
      .scaleLog()
      .domain([10, 100000000])
      .range([
        svgHeight -
        aleph.margin.line[aleph.windowSize].top -
        aleph.margin.line[aleph.windowSize].bottom,
        0,
      ]);

    d3.selectAll(".axis.axis--y.mainAxis")
      .transition()
      .duration(aleph.lineChartTransitionDuration)
      .ease(d3.easeLinear)
      .call(
        d3
          .axisLeft(aleph.yMain)
          .ticks(10, "~d")
          .tickFormat(function (d, i) {
            if (i % 9 == 0) {
              return numberWithCommas(d);
            }
          })
      );
  } else {
    aleph.yMain = d3
      .scaleLinear()
      .domain([
        0,
        Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
        aleph.lineChartYAxisRounding,
      ])
      .range([
        svgHeight -
        aleph.margin.line[aleph.windowSize].top -
        aleph.margin.line[aleph.windowSize].bottom,
        0,
      ]);

    d3.selectAll(".axis.axis--y.mainAxis")
      .transition()
      .duration(aleph.lineChartTransitionDuration)
      .ease(d3.easeLinear)
      .call(d3.axisLeft(aleph.yMain));
  } // end else ...

  // remove and redraw tick grid lines extending from y-axis ticks on axis across scatter graph
  d3.selectAll(".aleph-yAxisTicks").remove();
  var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
  yticks
    .append("svg:line")
    .attr("class", "aleph-yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr(
      "x2",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    );

  // Transition all main data lines
  d3.selectAll(".line.mainline")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("d", aleph.mainline);

  // Transition all data line vertex markers
  d3.selectAll(".aleph-Line-Vertex-Marker-Circles")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("cx", function (d, i) {
      return (
        aleph.margin.line[aleph.windowSize].left +
        aleph.xMain(aleph.parseDate(d.year))
      );
    })
    .attr("cy", function (d, i) {
      return (
        aleph.margin.line[aleph.windowSize].top +
        aleph.yMain(d[aleph.lineChartyAxisType] /* .counts */ /* value */)
      );
    });
}); // end function for yAxisScaleType toggle.

/*





  NAME: SelectdeSelectAll toggle function call 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS:
*/
$("#SelectdeSelectAll").change(function () {
  if ($(this).prop("checked") == false) {
    document.getElementById("line-submit").disabled = true;

    $("#line-selectpicker-ethnicities").selectpicker("val", "");
    $("#line-selectpicker-ageBands").selectpicker("val", "");
    $("#line-selectpicker-genders").selectpicker("val", "");
    $("#line-selectpicker-nationalities").selectpicker("val", "");
    $("#line-selectpicker-health").selectpicker("val", "");
    $("#line-selectpicker-qualifications").selectpicker("val", "");
    $("#line-selectpicker-religions").selectpicker("val", "");

    aleph.selectionIndexes = {
      ethnicities: [],
      ageBands: [],
      genders: [],
      nationalities: [],
      religions: [],
      health: [],
      qualifications: [],
    };
  } else {
    document.getElementById("line-submit").disabled = false;

    $("#line-selectpicker-ethnicities").selectpicker("selectAll");
    $("#line-selectpicker-ageBands").selectpicker("selectAll");
    $("#line-selectpicker-genders").selectpicker("selectAll");
    $("#line-selectpicker-nationalities").selectpicker("selectAll");
    $("#line-selectpicker-health").selectpicker("selectAll");
    $("#line-selectpicker-qualifications").selectpicker("selectAll");
    $("#line-selectpicker-religions").selectpicker("selectAll");

    $(".btn.dropdown-toggle").removeClass("btn-danger").addClass("btn-primary");

    aleph.selectionIndexes = {
      ethnicities: [1, 2, 3, 4, 5, 6],
      ageBands: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      genders: [1, 2],
      nationalities: [1, 2],
      religions: [1, 2, 3, 4],
      health: [1, 2, 3, 4, 5, 6, 7],
      qualifications: [1, 2, 3, 4],
    };
  } // end else ...

  checkLineSelectionsDynamcially(aleph.selectionIndexes);
}); // end function for select/deselectAll toggle.

/*





  NAME: setLineDefaultAllSelected 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS:
*/
function setLineDefaultAllSelected() {
  $("#line-selectpicker-ethnicities").selectpicker("selectAll");
  $("#line-selectpicker-ageBands").selectpicker("selectAll");
  $("#line-selectpicker-genders").selectpicker("selectAll");
  $("#line-selectpicker-nationalities").selectpicker("selectAll");
  $("#line-selectpicker-health").selectpicker("selectAll");
  $("#line-selectpicker-qualifications").selectpicker("selectAll");
  $("#line-selectpicker-religions").selectpicker("selectAll");

  aleph.selectionIndexes = {
    ethnicities: [1, 2, 3, 4, 5, 6],
    ageBands: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    genders: [1, 2],
    nationalities: [1, 2],
    religions: [1, 2, 3, 4],
    health: [1, 2, 3, 4, 5, 6, 7],
    qualifications: [1, 2, 3, 4],
  };

  return;
} // end function setLineDefaultAllSelected

/*





  NAME: handleLineChartLineDeletionWarning 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS:
*/
function handleLineChartLineDeletionWarning(button) {
  var btn = button.id;

  d3.selectAll(
    ".alert.alert-danger.alert-dismissible.lineChart.lineDeletion"
  ).classed("aleph-hide", true);

  if (btn == "ok") {
    d3.selectAll(".scenarioNumber-" + aleph.lineToDelete).remove();
    d3.select("#aleph-Line-handleLine-Group-" + aleph.lineToDelete).remove();

    for (var scenario in aleph.scenarios) {
      if (scenario > aleph.lineToDelete) {
        var currentTranslate = d3
          .select("#aleph-Line-handleLine-Group-" + scenario)
          .attr("transform");

        var currenTranslateXY = currentTranslate
          .replace("translate(", "")
          .replace(")", "")
          .split(",");
        d3.select("#aleph-Line-handleLine-Group-" + scenario).attr(
          "transform",
          "translate(" +
          Number(currenTranslateXY[0]) +
          "," +
          (Number(currenTranslateXY[1]) - 50) +
          ")"
        );
      }
    }

    // handling use of deseleected colour ...
    // lineColour: aleph.coloursSubset[aleph.currentNumberOfSavedScenarios],
    aleph.coloursSubset.push(aleph.scenarios[aleph.lineToDelete].lineColour);

    // delete from aleph.scenariosData
    aleph.scenariosData.splice(aleph.lineToDelete, 1);

    //  delete from aleph.scenarios
    delete aleph.scenarios[aleph.lineToDelete];

    aleph.currentNumberOfSavedScenarios = Object.keys(aleph.scenarios).length;
  } // end if ...
  else {
    aleph.lineToDelete = -1;
  }

  return;
} // end function handleLineChartLineDeletionWarning

/*





  NAME: checkLineSelectionsDynamcially 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS:
*/
function checkLineSelectionsDynamcially(selections) {
  var incompleteSelectionLists = "";
  aleph.allValidArrays = true;

  for (var list in selections) {
    if (selections[list].length == 0) {
      aleph.allValidArrays = false;

      // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
      incompleteSelectionLists =
        incompleteSelectionLists + ", '" + toTitleCase(list) + "'";
    }
  }

  if (aleph.allValidArrays == true) {
    document.getElementById("line-clear").disabled = false;
    d3.selectAll(
      ".alert.alert-danger.alert-dismissible.lineChart.incompleteSelections"
    ).classed("aleph-hide", true);
    document.getElementById("line-submit").disabled = false;
  } else {
    d3.selectAll(
      ".alert.alert-danger.alert-dismissible.lineChart.incompleteSelections"
    ).classed("aleph-hide", false);
    d3.selectAll(".aleph-alert-line-incompleteSelections").html(
      "<span class='spanBold'>Please complete these selection lists:</span> " +
      incompleteSelectionLists.substring(1)
    );

    document.getElementById("line-submit").disabled = true;
    document.getElementById("line-clear").disabled = true;
    return;
  }

  return;
} // end function checkLineSelectionsDynamcially

/*





  NAME: handleLineChartClearWarning 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS:
  */
function handleLineChartClearWarning(button) {
  var btn = button.id;

  d3.selectAll(
    ".alert.alert-danger.alert-dismissible.lineChart.clearChart"
  ).classed("aleph-hide", true);

  if (btn == "ok") {
    // reset tick marker counter
    aleph.tickIconMarkerCounter = -1;

    // reset to default styling and state of submit and reset buttons
    // document.getElementById("line-submit").disabled = true;
    document.getElementById("line-clear").disabled = true;
    // document.getElementById("line-reset-axes").disabled = true;
    // document.getElementById("yAxisScaleType").disabled = true;

    $("#vertical-line-slider-range").slider("option", "disabled", true);
    $("#horizontal-line-slider-range").slider("option", "disabled", true);

    // remove all plotted data lines and related mouverover interaction line objects
    d3.selectAll(".aleph-line-group").remove();
    d3.selectAll(".mouse-per-line").remove();

    aleph.currentlySelectedScenario = {};
    aleph.scenarios = {};
    aleph.scenariosData = [];
    aleph.currentNumberOfSavedScenarios = Object.keys(aleph.scenarios).length;
    aleph.currentScenarioNumber = -1;

    /*

    CHART AXES RESET 

    */

    aleph.yMain.domain([0, 500000]);

    d3.selectAll(".axis.axis--y.mainAxis").call(d3.axisLeft(aleph.yMain));

    $("#vertical-line-slider-range")
      .slider("option", "values", [0, 500000])
      .slider("option", "max", aleph.yMain.domain()[1]);

    // d3.selectAll(".slider-label.slider-label-fixed-top").text(
    //   numberWithCommas(aleph.yMain.domain()[1])
    // );
    d3.selectAll(".slider-label.slider-label-fixed-top").text(function () {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(aleph.yMain.domain()[1]);
      } else {
        return aleph.yMain.domain()[1].toFixed(1);
      }
    });

    d3.selectAll(".slider-label.slider-label-movable-top")
      .style("bottom", "100%")
      .text(numberWithCommas(aleph.yMain.domain()[1]) + " -");

    d3.selectAll(".slider-label.slider-label-movable-bottom")
      .style("bottom", "0%")
      .text(numberWithCommas(aleph.yMain.domain()[0]) + " -");

    aleph.xMain.domain([
      aleph.parseDate(aleph.years[0]),
      aleph.parseDate(aleph.years[aleph.years.length - 1]),
    ]);

    d3.selectAll(".axis.axis--x.mainAxis").call(d3.axisBottom(aleph.xMain));
    $("#horizontal-line-slider-range").slider("option", "values", [
      aleph.years[0],
      aleph.years[aleph.years.length - 1],
    ]);

    d3.selectAll(".slider-label.slider-label-movable-left")
      .style("left", "0%")
      .text(aleph.years[0]);

    d3.selectAll(".slider-label.slider-label-movable-right")
      .style("left", "100%")
      .text(aleph.years[aleph.years.length - 1]);

    d3.selectAll(".aleph-yAxisTicks").remove();

    // draw tick grid lines extending from y-axis ticks on axis across scatter graph
    var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
    yticks
      .append("svg:line")
      .attr("class", "aleph-yAxisTicks")
      .attr("y0", 0)
      .attr("y1", 0)
      .attr("x1", 0)
      .attr(
        "x2",
        svgWidth -
        aleph.margin.line[aleph.windowSize].left -
        aleph.margin.line[aleph.windowSize].right
      );

    d3.selectAll(".aleph-yAxisTitle").html("Number");
  } // end if ...
  else {
  }

  return;
} // end function handleLineChartClearWarning

/*





  NAME: handleLineChartDuplicateWarning 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS: none
*/
function handleLineChartDuplicateWarning(button) {
  var btn = button.id;

  d3.selectAll(
    ".alert.alert-danger.alert-dismissible.lineChart.duplicateSelection"
  ).classed("aleph-hide", true);

  return;
} // end function  handleLineChartDuplicateWarning

/*





  NAME: handleLineChartLimitWarning 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS: none
*/
function handleLineChartLimitWarning(button) {
  var btn = button.id;

  d3.selectAll(
    ".alert.alert-danger.alert-dismissible.lineChart.lineLimitReached"
  ).classed("aleph-hide", true);

  return;
} // end function  handleLineChartLimitWarning

/*





  NAME: resetLineChartAxes 
  DESCRIPTION: function called  
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM 
  CALLS: none
*/
function resetLineChartAxes() {
  d3.selectAll(".aleph-reset").classed("aleph-hide", true);
  d3.selectAll(".aleph-wasteBin").classed("aleph-hide", true);

  var yAxisMax = -1;

  if (aleph.lineChartyAxisType == "counts") {
    yAxisMax =
      Math.ceil(aleph.maxchartYAxisValue / aleph.lineChartYAxisRounding) *
      aleph.lineChartYAxisRounding;
  } else {
    yAxisMax = 100;
  }

  aleph.yMain.domain([0, yAxisMax]);

  d3.selectAll(".axis.axis--y.mainAxis")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .call(d3.axisLeft(aleph.yMain));

  $("#vertical-line-slider-range")
    .slider("option", "values", [0, yAxisMax])
    .slider("option", "max", aleph.yMain.domain()[1]);

  d3.selectAll(".slider-label.slider-label-fixed-top").text(function () {
    if (aleph.lineChartyAxisType == "counts") {
      return numberWithCommas(aleph.yMain.domain()[1]);
    } else {
      return aleph.yMain.domain()[1].toFixed(1);
    }
  });

  // d3.selectAll(".slider-label.slider-label-movable-top")
  //   .style("bottom", "100%")
  //   .text(numberWithCommas(aleph.yMain.domain()[1]));

  d3.selectAll(".slider-label.slider-label-movable-top")
    .style("bottom", "100%")
    .text(function () {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(aleph.yMain.domain()[1]) + " -";
      } else {
        return aleph.yMain.domain()[1].toFixed(1) + " -";
      }
    });

  // d3.selectAll(".slider-label.slider-label-movable-bottom")
  //   .style("bottom", "0%")
  //   .text(numberWithCommas(aleph.yMain.domain()[0]));

  d3.selectAll(".slider-label.slider-label-movable-bottom")
    .style("bottom", "0%")
    .text(function () {
      if (aleph.lineChartyAxisType == "counts") {
        return numberWithCommas(aleph.yMain.domain()[0]) + " -";
      } else {
        return aleph.yMain.domain()[0].toFixed(1) + " -";
      }
    });

  aleph.xMain.domain([
    aleph.parseDate(aleph.years[0]),
    aleph.parseDate(aleph.years[aleph.years.length - 1]),
  ]);

  d3.selectAll(".axis.axis--x.mainAxis")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .call(d3.axisBottom(aleph.xMain));

  $("#horizontal-line-slider-range").slider("option", "values", [
    aleph.years[0],
    aleph.years[aleph.years.length - 1],
  ]);

  d3.selectAll(".slider-label.slider-label-movable-left")
    .style("left", "0%")
    .text(aleph.years[0]);

  d3.selectAll(".slider-label.slider-label-movable-right")
    .style("left", "100%")
    .text(aleph.years[aleph.years.length - 1]);

  d3.selectAll(".aleph-yAxisTicks").remove();

  // draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var yticks = d3.selectAll(".axis.axis--y.mainAxis").selectAll(".tick");
  yticks
    .append("svg:line")
    .attr("class", "aleph-yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr(
      "x2",
      svgWidth -
      aleph.margin.line[aleph.windowSize].left -
      aleph.margin.line[aleph.windowSize].right
    );

  d3.selectAll(".aleph-yAxisTitle").html("Number of UK Population");

  // Transition all coloured data lines
  d3.selectAll(".line.mainline")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("d", aleph.mainline);

  // Transition all data line vertex markers
  d3.selectAll(".aleph-Line-Vertex-Marker-Circles")
    .transition()
    .duration(aleph.lineChartTransitionDuration)
    .ease(d3.easeLinear)
    .attr("cx", function (d) {
      return (
        aleph.margin.line[aleph.windowSize].left +
        aleph.xMain(aleph.parseDate(d.year))
      );
    })
    .attr("cy", function (d) {
      return (
        aleph.margin.line[aleph.windowSize].top +
        aleph.yMain(d[aleph.lineChartyAxisType])
      );
    });

  return;
} // end function resetLineChartAxes

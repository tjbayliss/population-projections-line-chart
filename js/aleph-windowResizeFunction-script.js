// function call based on browser window resize.
window.onresize = windowResize;

/*





      NAME: windowResize 
      DESCRIPTION: function called when user resizes window. handles updating of content reliant on dimension of window
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM: none
      CALLS: alertSize()
  
      http://bl.ocks.org/johangithub/97a186c551e7f6587878
  */
function windowResize() {
  alertSize(); // function call to get current browser window dimensions

  // store window dimensions as aleph object varaiables
  aleph.windowWidth = vis.width;
  aleph.windowHeight = vis.height;

  // console.log("aleph.windowWidth:",aleph.windowWidth)
  var windowSize = "";
  aleph.windowSize = "";

  // console.log( aleph.windowWidth,aleph.margin,aleph.margin.line);

  checkWindowSize();

  // if (aleph.windowWidth < 575) {
  //   windowSize = "vs";
  //   aleph.windowSize = "vs";
  // } else if (aleph.windowWidth < 568) {
  //   windowSize = "sm";
  //   aleph.windowSize = "sm";
  // } else if (aleph.windowWidth < 768) {
  //   windowSize = "md";
  //   aleph.windowSize = "md";
  // } else if (aleph.windowWidth < 992) {
  //   windowSize = "lg";
  //   aleph.windowSize = "lg";
  // } else if (aleph.windowWidth < 1200) {
  //   windowSize = "xl";
  //   aleph.windowSize = "xl";
  // } else {
  //   windowSize = "xl";
  //   aleph.windowSize = "xl";
  // } // end else ...

  // update dimensions of base container SVG panel to size of browser window
  d3.selectAll(".aleph-chart.aleph-line-chart")
    .attr("width", aleph.windowWidth)
    .attr("height", aleph.windowHeight);

  // recalculate chat width and height
  aleph.chartWidth =
    d3.selectAll(".aleph-container").style("width").replace("px", "") -
    aleph.margin.line[aleph.windowSize].left -
    aleph.margin.line[aleph.windowSize].right;
  aleph.chartHeight =
    aleph.windowHeight -aleph.margin.line[aleph.windowSize].top -
    aleph.margin.line[aleph.windowSize].bottom;

  // update Div container dimension vars based on window resizing

  svgWidth = $(".aleph-chart.aleph-line-chart").width();
  svgHeight = $(".aleph-chart.aleph-line-chart").height();

  // CHART SPECIFIC RESPONSES TO RESIZING ...

  if (aleph.currentChart == "line") {
    // LINE CHART

    if (
      aleph.windowSize == "md" ||
      aleph.windowSize == "sm" ||
      aleph.windowSize == "vs"
    ) {
      d3.selectAll(".aleph-yAxisTitle").text("Number");
      d3.selectAll(".aleph-Line-Vertex-Marker-Circles").attr("r", 2.5);
    } else {
      d3.selectAll(".aleph-yAxisTitle").html(
        "Number (between " +
          numberWithCommas(
            $("#vertical-line-slider-range").slider("option", "values")[0]
          ) +
          " to " +
          numberWithCommas(
            $("#vertical-line-slider-range").slider("option", "values")[1]
          ) +
          ")"
      );
      d3.selectAll(".aleph-Line-Vertex-Marker-Circles").attr("r", 5);
    }

    d3.selectAll("#clip-Rect")
      .attr("x", aleph.margin.line[aleph.windowSize].left)
      .attr(
        "width",
        svgWidth -
          aleph.margin.line[aleph.windowSize].left -
          aleph.margin.line[aleph.windowSize].right
      );

    // update line chart x axis dmomain and range declaration
    aleph.xMain
      .domain([
        aleph.parseDate(aleph.dateDomain.start),
        aleph.parseDate(aleph.dateDomain.end),
      ])
      .range([
        0,
        svgWidth -
          aleph.margin.line[aleph.windowSize].left -
          aleph.margin.line[aleph.windowSize].right,
      ]);

    // update width of mouse interaction rect.
    d3.select("#aleph-mouseRectangle")
      .attr("x", aleph.margin.line[aleph.windowSize].left)
      .attr(
        "width",
        svgWidth -
          aleph.margin.line[aleph.windowSize].right -
          aleph.margin.line[aleph.windowSize].left
      );

    // append g element to hold x time axis
    d3.selectAll(".aleph-chart.aleph-line-chart")
      .selectAll(".axis.axis--x.mainAxis")
      .attr(
        "transform",
        "translate(" +
          aleph.margin.line[aleph.windowSize].left +
          "," +
          (svgHeight - aleph.margin.line[aleph.windowSize].bottom) +
          ")"
      )
      .call(d3.axisBottom(aleph.xMain).ticks(d3.timeYear.every(2)));

    d3.selectAll(".axis.axis--y.mainAxis").attr(
      "transform",
      "translate(" +
        aleph.margin.line[aleph.windowSize].left +
        "," +
        aleph.margin.line[aleph.windowSize].top +
        ")"
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

    // update width and x2 for tick grid lines extending from y-axis ticks on axis across line  graph
    d3.selectAll(".axis.axis--y.mainAxis")
      .selectAll(".tick")
      .selectAll(".aleph-yAxisTicks")
      .attr(
        "x2",
        svgWidth -
          aleph.margin.line[aleph.windowSize].left -
          aleph.margin.line[aleph.windowSize].right
      );

    // update x position  of x-axis title on line chart
    d3.selectAll(".axis.axis--x.mainAxis")
      .selectAll(".aleph-xAxisTitle")
      .attr(
        "x",
        svgWidth -
          aleph.margin.line[aleph.windowSize].left -
          aleph.margin.line[aleph.windowSize].right
      );

    d3.select("#horizontal-line-slider-range").style(
      "width",
      svgWidth -
        aleph.margin.line[aleph.windowSize].left -
        aleph.margin.line[aleph.windowSize].right +
        "px"
    );

    // update all currently drawn chart data lines.
    d3.selectAll(".line.mainline").attr("d", aleph.mainline);

    // update all currently drawn chart data lines marker circles
    d3.selectAll(".aleph-Line-Vertex-Marker-Circles")
      .attr("cx", function (d) {
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

    // localise and reset tick counter ...
    var tickIconMarkerCounter = -1;

    // update transofrm of handle lin groups.
    d3.selectAll(".aleph-Line-handleLine-Group").attr(
      "transform",
      function (d) {
        tickIconMarkerCounter++;

        return (
          "translate(" +
          (aleph.margin.line[aleph.windowSize].left +
            aleph.xMain(aleph.xMain.domain()[1]) +
            0) +
          "," +
          (aleph.margin.line[aleph.windowSize].top +
            aleph.yMain(aleph.yMain.domain()[1]) +
            tickIconMarkerCounter * aleph.tickIconMarkerSpacer) +
          ")"
        );
      }
    );
  } else if (aleph.currentChart == "pyramid") {
    /*
        
          PYRAMID CHART
        
          */

    aleph.pyramids.forEach(function (d, i) {
      var chartSide = d;

      d3.selectAll(
        ".aleph-pyramid-group.aleph-pyramid-group-" + chartSide
      ).attr("transform", function () {
        if (chartSide == "left") {
          lateralPosition =
            d3
              .selectAll(".aleph-pyramid-chart")
              .style("width")
              .replace("px", "") * aleph.pyramidLateralPosition.left;
          return (
            "translate(" +
            lateralPosition +
            "," +
            /* svgHeight */ (aleph.pyramidVerticalOffset -
              aleph.pyramidMargin.bottom) +
            ")"
          );
        } else {
          lateralPosition =
            d3
              .selectAll(".aleph-pyramid-chart")
              .style("width")
              .replace("px", "") * aleph.pyramidLateralPosition.right;
          return (
            "translate(" +
            lateralPosition +
            "," +
            /* svgHeight */ (aleph.pyramidVerticalOffset -
              aleph.pyramidMargin.bottom) +
            ")"
          );
        }
      });

      aleph.left_Pyramid_xAxis_Left = d3
        .scaleLinear()
        .range([
          -aleph.pyramidXAxisWidth +
            aleph.pyramidMargin.left +
            aleph.pyramidMargin.right,
          0,
        ]);

      d3.selectAll(
        ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left"
      ).call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left));

      // d3.selectAll(".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left").style("display", "none");

      aleph.left_Pyramid_xAxis_Left_FALSE = d3
        .scaleLinear()
        .range([
          0,
          -aleph.pyramidXAxisWidth +
            aleph.pyramidMargin.left +
            aleph.pyramidMargin.right,
        ]);

      d3.selectAll(
        ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Left_FALSE"
      ).call(d3.axisBottom(aleph.left_Pyramid_xAxis_Left_FALSE));

      aleph.left_Pyramid_xAxis_Right = d3
        .scaleLinear()

        .range([
          0,
          aleph.pyramidXAxisWidth -
            aleph.pyramidMargin.left -
            aleph.pyramidMargin.right,
        ]);

      d3.selectAll(
        ".axis.axis--x.pyramid-xAxis." + chartSide + "_Pyramid_xAxis_Right"
      ).call(d3.axisBottom(aleph.left_Pyramid_xAxis_Right));

      d3.selectAll(".aleph-maleBar-group-" + chartSide)
        .selectAll(".bar.leftBars." + chartSide)
        .attr("x", function (d) {
          var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];
          return (
            aleph.left_Pyramid_xAxis_Left(
              aleph.left_Pyramid_xAxis_Left.domain()[0]
            ) +
            (1 - aleph.left_Pyramid_xAxis_Left(value)) -
            aleph.pyramidOffset
          );
        })
        .attr("width", function (d) {
          var value = d.male[aleph.pyramidYearIndex][aleph.countsPercents];

          var rectWidth =
            aleph.left_Pyramid_xAxis_Left(
              aleph.left_Pyramid_xAxis_Left.domain()[0]
            ) - aleph.left_Pyramid_xAxis_Left(value);

          return Math.abs(rectWidth);
        });

      d3.selectAll(".aleph-chart.aleph-pyramid-chart")
        .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
        .append("g")
        .attr("class", "aleph-femaleBar-group-" + chartSide)
        .attr("transform", "translate(0,0)");

      // attach FEMALE specific data to DOM rect objects
      // d3.selectAll(".aleph-chart.aleph-pyramid-chart")
      //   .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
      d3.selectAll(".aleph-femaleBar-group-" + chartSide)
        .selectAll(".bar.rightBars." + chartSide)
        .attr(
          "x",
          aleph.left_Pyramid_xAxis_Right(
            aleph.left_Pyramid_xAxis_Right.domain()[0]
          ) + aleph.pyramidOffset
        )
        .attr("width", function (d, i) {
          var value = d.female[aleph.pyramidYearIndex][aleph.countsPercents];
          return aleph.left_Pyramid_xAxis_Right(value);
        });

      d3.selectAll(".aleph-chart.aleph-pyramid-chart")
        .selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide)
        .append("g")
        .attr("class", "aleph-maskingBar-group-" + chartSide)
        .attr("transform", "translate(0,0)");

      d3.selectAll(".aleph-maskingBar-group-" + chartSide)
        .selectAll(".bar.maskingBars." + chartSide)
        .attr(
          "x",
          aleph.left_Pyramid_xAxis_Left(
            aleph.left_Pyramid_xAxis_Left.domain()[0]
          ) - aleph.pyramidOffset
        )
        .attr("width", function () {
          var maskingBarWidth =
            aleph.barChartScaleFactor * aleph.pyramidOffset +
            (aleph.left_Pyramid_xAxis_Right(
              aleph.left_Pyramid_xAxis_Right.domain()[1]
            ) -
              aleph.left_Pyramid_xAxis_Left(
                aleph.left_Pyramid_xAxis_Left.domain()[0]
              ));
          return maskingBarWidth;
        });

      // print solid path outlines to each pyramid halves..
      for (var gender in aleph.pyramidFullOutlineData[aleph.pyramidYear][
        chartSide
      ]) {
        aleph.pyramidGenderLineCurrentlyProcessing = gender;

        // localiss intialisation of json object for storing line data
        var pyramidHalfOutlineData = {};

        // if suer has locked pyrmaid outlines.
        if (aleph.freezeOutlines == "lock") {
          pyramidHalfOutlineData =
            aleph.pyramidFullOutlineData[aleph.lockedYear][chartSide][gender];
        }
        // otherwise if user has not locked pyramid outlines ...
        else {
          pyramidHalfOutlineData =
            aleph.pyramidFullOutlineData[aleph.pyramidYear][chartSide][gender];
        }

        // call function to draw line pth for outline of pyramid
        /*  d3.selectAll(".aleph-pyramid-group.aleph-pyramid-group-" + chartSide) */
        d3.selectAll("." + chartSide + ".aleph-pyramid-outline." + gender).attr(
          "d",
          pyramidOutlinePath(pyramidHalfOutlineData)
        );
      } // end for loop ...
    }); // end forEach loop
  } else if (aleph.currentChart == "dots") {
    /*
        
        DOT CHART
        
        */

    // update horizontal position of legend on dots chart
    d3.selectAll(".aleph-dots-legendBase-Group").attr(
      "transform",
      "translate(" +
        (svgWidth -
          aleph.dotMargin.right -
          Number(aleph.dot_legend_labels.length * aleph.swatchWidth)) +
        "," +
        (aleph.dotMargin.top - 2 * aleph.swatchHeight) +
        ")"
    );

    // update domain and range definition
    aleph.dots_xAxis
      .domain([0, 100])
      .range([0, svgWidth - aleph.dotMargin.left - aleph.dotMargin.right]);

    // update x-axis delcation of dots chart x axis
    d3.selectAll(".axis.axis--x.dot-xAxis").call(
      d3.axisBottom(aleph.dots_xAxis)
    );

    // update tick grid lines extending from y-axis ticks on axis across graph
    d3.selectAll(".axis.axis--y.dot-yAxis")
      .selectAll(".tick")
      .selectAll(".aleph-yAxisTicks")
      .attr("x2", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right);

    // update positioning x-axis title on dots chart
    d3.selectAll(".axis.axis--x.dot-xAxis")
      .selectAll(".aleph-xAxisTitle")
      .attr("x", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right);
  } // end else if ...
  else {
  }

  return;
} // end function windowResize

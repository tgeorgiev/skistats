/**
 * D3 Gantt chart implementation based on Dimitry Kudrayvtsev's Gantt chart https://github.com/dk8996/Gantt-Chart
 */


/* jshint ignore:start */
d3.gantt = function() {

  var margin = {
    top: 0,
    right: 0,
    bottom: 25,
    left: 0
  };
  var viewport = {
    width: 1200,
    height: 150
  };
  
  var containerD3;
  
  var timeDomainStart;
  var timeDomainEnd;
  var taskTypes = [];
  var taskStatusColor = [];

  var tickFormat = "%d/%m/%Y %H:%M";
  var yTickFormatMapper;

  var keyFunction = function(d) {
    return d.startDate + d.taskName + d.endDate;
  };

  var rectTransform = function(d) {
    return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
  };
  
  var rectWidth = function(d) {
    return (x(d.endDate) - x(d.startDate));
  };

  var x = d3.time.scale().clamp(true);
  var y = d3.scale.ordinal();

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
    .tickSize(8).tickPadding(4).ticks(6);

  var yAxis = d3.svg.axis().scale(y).orient("right").tickSize(0);

  function gantt(container) {
    containerD3 = d3.select(container);

    var containerDom = containerD3[0][0];
    
    var width = viewport.width - margin.right - margin.left-5;
    var height = viewport.height - margin.bottom - margin.top-5;
    
    var svg = containerD3
      .append("svg")
      .attr("class", "chart")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0 0 " + viewport.width + " " + viewport.height)
      .attr("preserveAspectRatio", "xMidYMid")
      .append("g")
      .attr("class", "gantt-chart")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    svg.append("g").attr("class", "x axis");
    svg.append("g").attr("class", "y axis");

    x.range([0, width]);
      y.rangeRoundBands([0, height], .1);
      
      gantt.getChartGroup().select(".x.axis")
        .attr("transform", "translate(0, " + height + ")")
        .transition()
        .call(xAxis);
       gantt.getChartGroup().select(".y.axis")
        .transition()
        .call(yAxis);
    return gantt;

  };

  gantt.getContainer = function() {
    return containerD3;
  }

  gantt.getChart = function() {
    return containerD3.select(".chart");
  }
  
  gantt.getChartGroup = function() {
    return gantt.getChart().select(".gantt-chart");
  }

  gantt.getX = function() {
    return x;
  }

  gantt.getXAxis = function() {
    return xAxis;
  }

  gantt.redraw = function(tasks, transition) {
    var rect = gantt.getChartGroup().selectAll("rect").data(tasks, keyFunction);

    rect.enter()
    .insert ("rect", '.axis')
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("stroke", function(d) {
      if (!taskStatusColor[d.status]) {
        return "";
      }
      return taskStatusColor[d.status];
    })
    .attr("fill", function(d) {
      if (!taskStatusColor[d.status]) {
        return "";
      }
      return taskStatusColor[d.status];
    })
    .transition()
    .attr("y", 0)
    .attr("transform", rectTransform)
    .attr("height", function(d) { return y.rangeBand(); })
    .attr("width", rectWidth);
    rect.exit().remove();
    
    gantt.updateXAxis(transition); 
    gantt.updateYAxis(transition);

    return gantt;
  };
  
  gantt.zoomed = function() {
    gantt.getChartGroup().select(".x.axis").call(xAxis);
    gantt.getChartGroup().select(".y.axis").call(yAxis);
    gantt.getChartGroup().selectAll('rect')
      .attr("transform", rectTransform)
      .attr("width", rectWidth);
  };

  gantt.margin = function(value) {
    if (!arguments.length)
      return margin;
    margin = value;
    return gantt;
  };
  
  gantt.viewport = function(value) {
    if (!arguments.length)
      return viewport;
    viewport = value;
    return gantt;
  };

  gantt.timeDomain = function(value) {
    if (!arguments.length)
      return [timeDomainStart, timeDomainEnd];
    timeDomainStart = +value[0], timeDomainEnd = +value[1];
    x.domain([timeDomainStart, timeDomainEnd]);
    
    return gantt;
  };

  gantt.taskTypes = function(value) {
    if (!arguments.length)
      return taskTypes;
    taskTypes = value;
    y.domain(taskTypes);
    return gantt;
  };

  gantt.taskStatusColor = function(value) {
    if (!arguments.length)
      return taskStatusColor;
    taskStatusColor = value;
    return gantt;
  };

  gantt.tickFormat = function(value) {
    if (!arguments.length)
      return tickFormat;
    tickFormat = value;
    
    xAxis.tickFormat(d3.time.format(tickFormat));
    
    gantt.updateXAxis();  
    
    return gantt;
  };
  
  gantt.yTickFormatMapper = function(value) {
    if (!arguments.length)
      return yTickFormatMapper;
    yTickFormatMapper = value;
    
    yAxis.tickFormat(yTickFormatMapper);
    gantt.updateYAxis();
    
    return gantt;
  };
  
  gantt.updateXAxis = function(transition) {
    var select = gantt.getChartGroup().select(".x.axis");
    if (transition) {
      select.transition();
    }
    select.call(xAxis);  
  }
  
  gantt.updateYAxis = function(transition) {
    var select = gantt.getChartGroup().select(".y.axis");
    if (transition) {
      select.transition();
    }
    select.call(yAxis); 
  };

  return gantt;
};

/* jshint ignore:end */

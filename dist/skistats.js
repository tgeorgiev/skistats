(function(root, undefined) {

  "use strict";


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

  gantt.redraw = function(tasks) {
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
    
    gantt.updateXAxis(false); 
    gantt.updateYAxis(false);

    return gantt;
  };
  
  gantt.zoomed = function(transition) {
    gantt.updateXAxis(transition);
    gantt.updateYAxis(transition);
    
    var rect = gantt.getChartGroup().selectAll('rect');
    
    if (transition) {
      rect = rect.transition();
    }
    
    rect.attr("transform", rectTransform).attr("width", rectWidth);
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
      select = select.transition();
    }
    select.call(xAxis);  
  }
  
  gantt.updateYAxis = function(transition) {
    var select = gantt.getChartGroup().select(".y.axis");
    if (transition) {
      select = select.transition();
    }
    select.call(yAxis); 
  };

  return gantt;
};

/* jshint ignore:end */


/* skistats main */

var dateFormat = "%d/%m/%Y %H:%M";
var dateFormatInstance = d3.time.format(dateFormat);
var passColors = d3.scale.category10();
var strategyBaseUrl = "";

var allStatsById = {};

var strategies = [];
var selectedSkiStrategy;

var map;
var liftLegend;
var passLegend;
var timeline;

var dispatcher = d3.dispatch("zoom");

var CIRCLE_HEIGHT = 10;
var CIRCLE_RADIUS = CIRCLE_HEIGHT / 2;
var TOOLTIP_PADDING = 4;

var CSV_STAT_MODE = "CSV_STAT_MODE";
var JSON_STAT_MODE = "JSON_STAT_MODE";


function Map(container) {
  this.mapObj = d3.select(container).append('div');
  this.tooltip = d3.select(container).append('div').attr('class', 'mapTooltip');
  
  this.mapPasses = {};
  this.raphaelLifts = {};
  this.raphaelPaper = new Raphael(this.mapObj[0][0], '100%', '100%');
  this.rootPoint = this.raphaelPaper.canvas.createSVGPoint();

  if (selectedSkiStrategy) {
    this.updateStrategy();
  }

  this.updatePasses();
}

Map.prototype.updateStrategy = function() {
  var mapUrl = selectedSkiStrategy.mapUrl;
  if (mapUrl.indexOf('http://') == -1 && mapUrl.indexOf('https://') == -1) {
    mapUrl = strategyBaseUrl + mapUrl;
  }
  
  this.mapObj.style('background-image', 'url(' + mapUrl + ')')
    .style('background-size', 'contain')
    .style('height', '100%')
    .style('background-repeat', 'no-repeat')
    .style('background-position', '50% 0%');

  this.raphaelPaper.setViewBox(0, 0, selectedSkiStrategy.viewport.width, selectedSkiStrategy.viewport.height, false);
  this.raphaelPaper.canvas.setAttribute('preserveAspectRatio', 'xMidYMin');
  
  var mouseOverHandler = function () {
    this.attr('stroke-width', '8px').attr('stroke-opacity', '0.8');
    
    var rect = this[0].getBoundingClientRect();
    var lift = this.data('lift');
    map.tooltip.style('display', 'block').html(lift.displayName).style('left', rect.left + "px").style('top', rect.top + "px");
  };
  
  var mouseOutHandler = function () {
    this.attr('stroke-width', '6px').attr('stroke-opacity', '0.8');
    map.tooltip.style('display', 'none');
  };

  for (var liftId in selectedSkiStrategy.liftPaths) {
    var lift = selectedSkiStrategy.liftPaths[liftId];
    var liftPath = lift.path;

    var raphaelPath = this.raphaelPaper.path(liftPath);
    raphaelPath.attr('stroke', lift.color).attr('stroke-width', '6px').attr('stroke-opacity', '0.8');
    raphaelPath.data('lift', lift);
    raphaelPath.mouseover(mouseOverHandler);
    raphaelPath.mouseout(mouseOutHandler);

    this.raphaelLifts[liftId] = raphaelPath;
  }
};

Map.prototype.updatePosition = function(date) {  
  var circlesWithPositions = [];
  
  for (var passId in allStatsById) {
    var circle = this.mapPasses[passId];
    var entry = getLiftEntry(passId, date);
    if (!entry) {
      circle.hide();
    } else {
      circle.show();
      var position = (date - entry.startDate) / (entry.endDate - entry.startDate);
      var path = this.raphaelLifts[entry.lift];

      var len = path.getTotalLength();
      var point = path.getPointAtLength(position * len);
      
      var centerPoint, nextPoint;
      if (position + 0.01 > 1) {
        centerPoint = path.getPointAtLength((position - 0.01) * len);
        nextPoint = point;
      } else {
        centerPoint = point;
        nextPoint = path.getPointAtLength((position + 0.01) * len);
      }
      
      var angle = Raphael.angle(centerPoint.x, centerPoint.y, nextPoint.x, nextPoint.y);
      circlesWithPositions.push({circle: circle, point: point, angle: angle});
    }
  }
  
  var overlappingInfo = calculateOverlappingInfo(circlesWithPositions);
  applyTransformationWithOverlapping(overlappingInfo);
};

var calculateOverlappingInfo = function(circlesWithPositions) {
  var overlappingInfo = [];
  
  circlesWithPositions.sort(function(a, b){return lineDistance(a.point, b.point) - CIRCLE_RADIUS;});
  
  for (var ci = 0; ci < circlesWithPositions.length; ci++) {
    var cwp = circlesWithPositions[ci];
    var overlapping = false;

    for (var i = 0; i < overlappingInfo.length; i++) {
      var oi = overlappingInfo[i];

      if (!overlapping && Math.pow(cwp.point.x - oi.area.center.x, 2) + Math.pow(cwp.point.y - oi.area.center.y, 2) < Math.pow(oi.area.radius, 2)) {
        var d = lineDistance(cwp.point, oi.area.center);
        oi.area.radius = Math.max(oi.area.radius, d + CIRCLE_RADIUS);
        oi.cwps.push(cwp);
        overlapping = true;
      }
    }

    if (!overlapping) {
      overlappingInfo.push({
        area: {
          center: cwp.point,
          radius: CIRCLE_RADIUS
        },
        cwps: [cwp]
      });
    }
  }
  
  return overlappingInfo;
};

var applyTransformationWithOverlapping = function(overlappingInfo) {
  for (var i = 0; i < overlappingInfo.length; i++) {
   var cwps = overlappingInfo[i].cwps;
   var cwpsIndexCenter = (cwps.length - 1) / 2;
   
   var prevCwp;
   
   for (var j = 0; j < cwps.length; j++) {
     var cwp = cwps[j];
     
     var point = cwp.point;
     
     var perpendicularAngle = cwp.angle;
     if (j - cwpsIndexCenter < 0) {
       perpendicularAngle = cwp.angle - 90;
     } else if (j - cwpsIndexCenter > 0) {
       perpendicularAngle = cwp.angle + 90;
     }
     var rads = perpendicularAngle * (Math.PI / 180);
     var length = Math.abs(CIRCLE_RADIUS * (j - cwpsIndexCenter));
     
     point.x += length * Math.cos(rads);
     point.y += length * Math.sin(rads);
     cwp.circle.transform("t" + [point.x, point.y]);
     
     if (prevCwp) {
        cwp.circle.insertAfter(prevCwp.circle);
     }
     
     prevCwp = cwp;
   }
 }
};

var lineDistance = function(point1, point2){ 
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

Map.prototype.updatePasses = function() {
  var mouseOverHandler = function () {
    this.attr('r', '12');
    
    var rect = this[0].getBoundingClientRect();
    var stat = this.data('stat');
    map.tooltip.style('display', 'block').html(stat.displayName).style('left', (rect.left + rect.width + TOOLTIP_PADDING) + "px").style('top', rect.top + "px");
  };
  
  var mouseOutHandler = function () {
    this.attr('r', '10');
    map.tooltip.style('display', 'none');
  };
  
  var passIndex = 0;
  for (var passId in allStatsById) {
    var circle = this.raphaelPaper.circle(0, 0, CIRCLE_HEIGHT).attr("fill", passColors(passIndex));
    circle.mouseover(mouseOverHandler);
    circle.mouseout(mouseOutHandler);
    circle.data('stat', allStatsById[passId]);
    circle.hide();
    this.mapPasses[passId] = circle;
    passIndex++;
  }
};

function LiftLegend(container) {
  this.legendObj = d3.select(container).append('form').attr('class', 'liftLegend')
    .on('submit', function() {
      d3.event.preventDefault();
      return false;
    })
    .append('fieldset');
  
  this.legendObj.append('legend').html('Lifts');

  if (selectedSkiStrategy) {
    this.updateStrategy();
  }
}

LiftLegend.prototype.updateStrategy = function() {
  this.legendObj.html('');
  this.legendObj.append('legend').html('Lifts');

  for (var liftId in selectedSkiStrategy.liftPaths) {
    var lift = selectedSkiStrategy.liftPaths[liftId];
    var legendElement = this.legendObj.append('div');
    legendElement.append('div').attr('class', 'liftPath').style('border-color', selectedSkiStrategy.liftPaths[liftId].color);
    legendElement.append('div').attr('class', 'liftName').html(lift.displayName);
  }
};

function PassLegend(container) {
  this.legendObj = d3.select(container).append('form').attr('class', 'passLegend')
    .on('submit', function() {
      d3.event.preventDefault();
      return false;
    })
    .append('fieldset');
  
  this.updatePasses();
}

PassLegend.prototype.updatePasses = function() {
  this.legendObj.html('');
  this.legendObj.append('legend').html('Passes');
  
  var passIndex = 0;
  for (var passId in allStatsById) {
    var stat = allStatsById[passId];
    var passName = stat.displayName;

    var legendElement = this.legendObj.append('div');
    legendElement.append('div').attr('class', 'passColor').style('border-color', passColors(passIndex));
    var passElement = legendElement.append('span').attr('class', 'passName').html(passName);
    var passEditElement = legendElement.append('input').attr('class', 'passNameEdit').style('display', 'none');

    addPassChangeHandlers(passElement, passEditElement, stat);
    
    passIndex++;
  }
};

var addPassChangeHandlers = function(displayElement, editElement, model) {
  displayElement.on("click", function() {
    var displayElementWidth = displayElement[0][0].offsetWidth;
    displayElement.style('display', 'none');
    editElement.style('display', '').style('width', displayElementWidth + 'px');
    var editElementDom = editElement[0][0];
    editElementDom.value = model.displayName;
    editElementDom.focus();
    editElementDom.setSelectionRange(0, editElementDom.value.length);
  });

  var onValueChange = function() {
    var editElementDom = editElement[0][0];
    var elementValue = editElementDom.value;
    editElement.style('display', 'none');
    displayElement.style('display', '').html(elementValue);
    model.displayName = elementValue;
    if (timeline) {
      timeline.updateYTickFormat();
    }
  };

  editElement.on('blur', onValueChange);
  editElement.on('keypress', function() {
    if (d3.event.keyCode == 13) {
      onValueChange();
    }
  });
};

function Timeline(container, viewport, margin) {
  var timelineContainer = this.timelineContainer = d3.select(container).append('div').attr('class', 'timelineContainer');
  
  this.gantt = d3.gantt();
  if (viewport) {
    this.gantt.viewport(viewport);
  }
  
  if (margin) {
    this.gantt.margin(margin);
  }
  
  this.gantt(timelineContainer[0][0]);

  this.gantt.yTickFormatMapper(function(d) {
    var label = allStatsById[d].displayName;
    return label || d;
  });
  
  var lineHolder = this.lineHolder = timelineContainer.append('div').attr('class', 'lineContainer');
  lineHolder.append('div').attr('class', 'lineTop');
  lineHolder.append('div').attr('class', 'line');
  lineHolder.append('div').attr('class', 'lineBottom');
  this.lineLabel = lineHolder.append('div').attr('class', 'lineLabel');

  if (selectedSkiStrategy) {
    this.refresh();
  }
  
  this.updatePosition();
}

Timeline.prototype.refresh = function() {
  var minDate;
  var maxDate;

  var index = 0;
  var taskNames = [];
  var tasks = [];
  for (var key in allStatsById) {
    var fileData = allStatsById[key];
    taskNames.push(fileData.displayName);
    for (var i = 0; i < fileData.entries.length; i++) {
      var entry = fileData.entries[i];

      tasks.push({
        "startDate": entry.startDate,
        "endDate": entry.endDate,
        "taskName": key,
        "status": entry.lift
      });

      if (!minDate) {
        minDate = entry.startDate;
      } else if (minDate - entry.startDate > 0) {
        minDate = entry.startDate;
      }

      if (!maxDate) {
        maxDate = entry.endDate;
      } else if (entry.endDate - maxDate > 0) {
        maxDate = entry.endDate;
      }
    }

    index++;
  }
  
  this.tasks = tasks;

  this.gantt.taskTypes(taskNames);
  
  
  this.gantt.taskStatusColor(getLiftColors());

  var rangeMin = new Date(minDate.getTime() - (maxDate.getTime() - minDate.getTime()));
  var rangeMax = new Date(maxDate.getTime() + (maxDate.getTime() - minDate.getTime()));

  this.gantt.timeDomain([rangeMin, rangeMax]);

  var thisGantt = this.gantt;
  var that = this;

  this.zoom = d3.behavior.zoom()
    .x(thisGantt.getX())
    .scaleExtent([1, 200])
    .on("zoom", function() {
      thisGantt.zoomed();
      that.updatePosition();
      dispatcher.zoom(that.zoom.scale());
    });

  this.zoom.scale(1.5);
  this.zoom(thisGantt.getChart());
  this.gantt.redraw(tasks, true);
};

Timeline.prototype.updateYTickFormat = function() {
  this.gantt.updateYAxis();
};

Timeline.prototype.updatePosition = function() {
  var leftMargin = this.gantt.margin().left;

  var percentage = this.gantt.viewport().width / this.timelineContainer[0][0].offsetWidth;

  var actualX = this.lineHolder[0][0].offsetLeft * percentage - leftMargin;

  var currentDate = this.gantt.getX().invert(actualX);
  var fomattedDate = dateFormatInstance(currentDate);
  this.lineLabel.html(fomattedDate);
  if (map) {
    map.updatePosition(currentDate);
  }
};

Timeline.prototype.zoomCentered = function(scale, transition) {
  var currentTranslate = this.zoom.translate()[0];
  var currentScale = this.zoom.scale();
  
  var scaledNewCenter = this.gantt.viewport().width * (scale / currentScale);
  var diff = (scaledNewCenter - this.gantt.viewport().width) / 2;
  
  var scaledTranslate = currentTranslate * (scale / currentScale);
  
  var newTranslate = scaledTranslate - diff;
  
  this.zoom.translate([newTranslate, 0]);
  this.zoom.scale(scale);
  
  dispatcher.zoom(this.zoom.scale());
  
  this.gantt.zoomed(transition);
};

Timeline.prototype.zoomIntervalMs = function(intervalMilliseconds, transition) {
  var currentScale = this.zoom.scale();
  var currentBeginDate = this.gantt.getX().invert(0);
  var currentEndDate = this.gantt.getX().invert(this.gantt.viewport().width);
  
  var percentage = (currentEndDate - currentBeginDate) / intervalMilliseconds;
  
  this.zoomCentered(currentScale * percentage, transition);
};

var updateStrategy = function(strategy) {
  selectedSkiStrategy = strategy;
  if (map) {
    map.updateStrategy();
  }

  if (liftLegend) {
    liftLegend.updateStrategy();
  }
};

/**
 * Returns the lift colors in the format (liftId, color)
 */
var getLiftColors = function() {
  var liftPaths = selectedSkiStrategy.liftPaths;
  var liftColors = {};
  for (var key in liftPaths) {
      liftColors[key] = liftPaths[key].color;
  }
  
  return liftColors;
};

/**
 * Return the lift entry of the given passId that includes the dateBetween.
 */
var getLiftEntry = function(passId, dateBetween) {
  var fileData = allStatsById[passId];
  for (var i = 0; i < fileData.entries.length; i++) {
    var entry = fileData.entries[i];
    if (entry.startDate < dateBetween && dateBetween < entry.endDate) {
      return entry;
    }
  }

  return null;
};

var recognizeStrategy = function(strategy, content, mode) {
  if (mode == CSV_STAT_MODE) {
    return strategy.recognizeCSV && strategy.recognizeCSV(content);
  } else {
    return strategy.recognizeJSON && strategy.recognizeJSON(content);
  }
};

var getStrategy = function(content, mode) {
  if (selectedSkiStrategy) {
    if (!recognizeStrategy(selectedSkiStrategy, content, mode)) {
      throw new Error("There was already a selected strategy [ " + selectedSkiStrategy.name + "] but it does not recognize new contents. Make sure the files follow the same format.");
    }

    return selectedSkiStrategy;
  }

  var applicableStrategies = [];
  for (var i = 0; i < strategies.length; i++) {
    var strategy = strategies[i];
    if (recognizeStrategy(strategy, content, mode)) {
      applicableStrategies.push(strategy);
    }
  }

  if (applicableStrategies.length === 0) {
    throw new Error("No applicable strategies found!");
  } else if (applicableStrategies.length > 1) {
    throw new Error(applicableStrategies.length + " applicable strategies were found, only one was expected. " + applicableStrategies);
  }

  return applicableStrategies[0];
};

var skistats = {};

var addStat = function(id, content, mode) {
  if (!selectedSkiStrategy) {
    updateStrategy(getStrategy(content, mode));
  }
  var entries;
  if (mode === CSV_STAT_MODE) {
    entries = selectedSkiStrategy.retrieveEntriesCSV(content);
  } else {
    entries = selectedSkiStrategy.retrieveEntriesJSON(content);
  }

  allStatsById[id] = {
    displayName: id,
    entries: entries
  };

  if (map) {
    map.updatePasses();
  }

  if (passLegend) {
    passLegend.updatePasses();
  }
};

skistats.addCSV = function(id, textContents) {
  addStat(id, textContents, CSV_STAT_MODE);
};

skistats.addJSON = function(id, json) {
  addStat(id, json, JSON_STAT_MODE);
};

skistats.registerStrategy = function(strategy) {
  strategies.push(strategy);
};

skistats.map = function(container) {
  if (map) {
    throw new Error("Only single instance of the map is supported");
  }
  map = new Map(container);
};

skistats.liftLegend = function(container) {
  if (liftLegend) {
    throw new Error("Only single instance of the lift legend is supported");
  }
  liftLegend = new LiftLegend(container);
};

skistats.passLegend = function(container) {
  if (passLegend) {
    throw new Error("Only single instance of the pass legend is supported");
  }
  passLegend = new PassLegend(container);
};

var timelineContext = {};

timelineContext.getZoomScaleExtent = function() {
  return timeline.zoom.scaleExtent();
};

timelineContext.getZoomContext = function() {
  if (timeline) {
    return {
      scale: timeline.zoom.scale()
    };
  }
};

timelineContext.zoomCentered = function(scale, transition) {
  if (timeline) {
    timeline.zoomCentered(scale, transition);
  }
};

timelineContext.zoomIntervalMs = function(intervalMilliseconds, transition) {
  if (timeline) {
    timeline.zoomIntervalMs(intervalMilliseconds, transition);
  }
};

timelineContext.onZoom = function(listener) {
  dispatcher.on('zoom', listener);
};

skistats.timeline = function(container, viewport, margin) {
  if (timeline) {
    throw new Error("Only single instance of the timeline is supported");
  }
  timeline = new Timeline(container, viewport, margin);

  return timelineContext;
};

skistats.dateFormat = function(format) {
  if (!arguments.length) {
    return dateFormat;
  }
  dateFormat = format;
  dateFormatInstance = d3.time.format(dateFormat);
  return skistats;
};

skistats.strategyBaseUrl = function(value) {
  if (!arguments.length) {
    return strategyBaseUrl;
  }
  if (map) {
    console.warn("Map was already initialized, strategyBaseUrl will not be applied.");
  }
  strategyBaseUrl = value;
  return skistats;
};


skistats.selectedSkiStrategy = function() {
  return selectedSkiStrategy;
};

skistats.VERSION = '0.0.1';

root.skistats = skistats;


}(this));

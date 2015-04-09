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
    left: 0,
    width: 1200,
    height: 150
  };
  
  var containerD3;
  
  var timeDomainStart;
  var timeDomainEnd;
  var taskTypes = [];
  var taskStatusColor = [];
  var displayedTasks;

  var tickFormat = "%d/%m/%Y %H:%M";
  var yTickFormatMapper;

  var keyFunction = function(d) {
    return d.startDate + d.taskName + d.endDate;
  };

  var rectTransform = function(d) {
    return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
  };

  var x = d3.time.scale().clamp(true);
  var y = d3.scale.ordinal();

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
    .tickSize(8).tickPadding(4).ticks(6);

  var yAxis = d3.svg.axis().scale(y).orient("right").tickSize(0);

  function gantt(container) {
    containerD3 = d3.select(container);

    var containerDom = containerD3[0][0];
    
    var totalWidth = margin.width;
    var totalHeight = margin.height;
    
    
    var width = totalWidth - margin.right - margin.left-5;
    var height = totalHeight - margin.bottom - margin.top-5;
    
    var svg = containerD3
      .append("svg")
      .attr("class", "chart")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0 0 " + totalWidth + " " + totalHeight)
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
    if (tasks) {
      displayedTasks = tasks;
    }
    var rect = gantt.getChartGroup().selectAll("rect").data(displayedTasks, keyFunction);
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
      .attr("width", function(d) {
        return (x(d.endDate) - x(d.startDate));
      });

        //rect.transition()
          rect.attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
      .attr("width", function(d) {
        return (x(d.endDate) - x(d.startDate));
      });

    rect.exit().remove();
    
    gantt.updateXAxis(transition); 
    gantt.updateYAxis(transition);

    return gantt;
  };

  gantt.margin = function(value) {
    if (!arguments.length)
      return margin;
    margin = value;
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


/* skistats main */

var dateFormat = "%d/%m/%Y %H:%M";
var dateFormatInstance = d3.time.format(dateFormat);

var allStatsById = {};

var strategies = [];
var selectedSkiStrategy;

var map;
var liftLegend;
var participantsLegend;
var timeline;
var vline;

function Map(container) {
  this.mapObj = d3.select(container).append('div');
  this.mapActors = {};
  this.raphaelLifts = {};
  this.raphaelPaper = new Raphael(this.mapObj[0][0], '100%', '100%');

  if (selectedSkiStrategy) {
    this.updateStrategy();
  }

  this.updateActors();
}

Map.prototype.updateStrategy = function() {
  this.mapObj.style('background-image', 'url(' + selectedSkiStrategy.mapUrl + ')')
    .style('background-size', 'contain')
    .style('height', '100%')
    .style('background-repeat', 'no-repeat')
    .style('background-position', '50% 0%');

  this.raphaelPaper.setViewBox(0, 0, selectedSkiStrategy.optimalWidth, selectedSkiStrategy.optimalHeight, false);
  this.raphaelPaper.canvas.setAttribute('preserveAspectRatio', 'xMidYMin');

  for (var liftName in selectedSkiStrategy.liftPaths) {
    var lift = selectedSkiStrategy.liftPaths[liftName];
    var liftPath = lift.path;

    var raphaelPath = this.raphaelPaper.path(liftPath);
    raphaelPath.attr('stroke', lift.color).attr('stroke-width', '6px').attr('stroke-opacity', '0.8');

    this.raphaelLifts[liftName] = raphaelPath;
  }
};

Map.prototype.updatePosition = function(date) {
//  var prevCircles = [];
  for (var actorId in allStatsById) {
    var circle = this.mapActors[actorId];
    var entry = getLiftEntry(actorId, date);
    if (!entry) {
      circle.hide();
    } else {
      circle.show();
      var position = (date - entry.startDate) / (entry.endDate - entry.startDate);

      console.log("position " + position);
      var path = this.raphaelLifts[entry.lift];

      var len = path.getTotalLength();
      var point = path.getPointAtLength(position * len);

      //        prevCircles.forEach(function(prevCircle, i) {
      //          circle.transform.
      //          if (point.x
      //        });

      circle.transform("t" + [point.x, point.y]);
    }
  }
};

Map.prototype.updateActors = function() {
  for (var actorId in allStatsById) {
    var circle = this.raphaelPaper.circle(0, 0, 10).attr("fill", "red");
    circle.hide();
    this.mapActors[actorId] = circle;
  }
};

function LiftLegend(container) {
  this.legendObj = d3.select(container).append('form').attr('class', 'liftLegend').append('fieldset');
  this.legendObj.append('legend').html('Lifts');

  if (selectedSkiStrategy) {
    this.updateStrategy();
  }
}

LiftLegend.prototype.updateStrategy = function() {
  this.legendObj.html('');
  this.legendObj.append('legend').html('Lifts');

  for (var liftName in selectedSkiStrategy.liftPaths) {
    var legendElement = this.legendObj.append('div');
    legendElement.append('div').attr('class', 'liftPath').style('border-color', selectedSkiStrategy.liftColors[liftName]);
    legendElement.append('div').attr('class', 'liftName').html(liftName);
  }
};

function ParticipantsLegend(container) {
  this.legendObj = d3.select(container).append('form').attr('class', 'participantsLegend').append('fieldset');
  this.legendObj.append('legend').html('Participants');

  this.updateActors();
}

ParticipantsLegend.prototype.updateActors = function() {
  this.legendObj.html('');
  this.legendObj.append('legend').html('Participants');
  for (var actorId in allStatsById) {
    var stat = allStatsById[actorId];
    var participantName = stat.displayName;

    var legendElement = this.legendObj.append('div');
    legendElement.append('div').attr('class', 'participantColor').style('border-color', 'green');
    var participantElement = legendElement.append('span').attr('class', 'participantName').html(participantName);
    var participantEditElement = legendElement.append('input').attr('class', 'participantNameEdit').style('display', 'none');

    addParticipantChangeHandlers(participantElement, participantEditElement, stat);
  }
};

var addParticipantChangeHandlers = function(displayElement, editElement, model) {
  displayElement.on("click", function() {
    var displayElementWidth = displayElement[0][0].offsetWidth;
    displayElement.style('display', 'none');
    editElement.style('display', '').style('width', displayElementWidth + 'px');
    var editElementDom = editElement[0][0];
    editElementDom.value = model.displayName;
    editElementDom.focus();
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

function Timeline(container) {
  this.gantt = d3.gantt()(container);

  this.gantt.yTickFormatMapper(function(d) {
    var label = allStatsById[d].displayName;
    return label || d;
  });

  if (selectedSkiStrategy) {
    this.refresh();
  }
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
        "taskName": fileData.displayName,
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

  this.gantt.taskTypes(taskNames);
  this.gantt.taskStatusColor(selectedSkiStrategy.liftColors);

  var rangeMin = new Date(minDate.getTime() - (maxDate.getTime() - minDate.getTime()));
  var rangeMax = new Date(maxDate.getTime() + (maxDate.getTime() - minDate.getTime()));

  this.gantt.timeDomain([rangeMin, rangeMax]);

  var thisGantt = this.gantt;

  var zoom = d3.behavior.zoom()
    .x(thisGantt.getX())
    .scaleExtent([1, 200])
    .on("zoom", function() {
      thisGantt.redraw(tasks);

      vline.updatePosition();
    });

  zoom.scale(1.5);
  zoom(thisGantt.getChart());
  this.gantt.redraw(tasks, true);
};

Timeline.prototype.updateYTickFormat = function() {
  this.gantt.updateYAxis();
};

function Vline(container) {
  var lineHolder = this.lineHolder = d3.select(container).append('div').attr('class', 'lineContainer');
  lineHolder.append('div').attr('class', 'lineTop');
  lineHolder.append('div').attr('class', 'line');
  lineHolder.append('div').attr('class', 'lineBottom');
  this.lineLabel = lineHolder.append('div').attr('class', 'lineLabel');

  this.updatePosition();
}

Vline.prototype.updatePosition = function() {
  var gantt = timeline.gantt;

  var leftMargin = gantt.margin().left;

  var percentage = gantt.margin().width / gantt.getChart()[0][0].offsetWidth;

  var actualX = this.lineHolder[0][0].offsetLeft * percentage - leftMargin;

  var currentDate = gantt.getX().invert(actualX);
  this.updateLabel(currentDate);
  if (map) {
    map.updatePosition(currentDate);
  }
};

Vline.prototype.updateLabel = function(date) {
  var fomattedDate = dateFormatInstance(date);
  this.lineLabel.html(fomattedDate);
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

var getLiftEntry = function(actorId, dateBetween) {
  var fileData = allStatsById[actorId];
  for (var i = 0; i < fileData.entries.length; i++) {
    var entry = fileData.entries[i];
    if (entry.startDate < dateBetween && dateBetween < entry.endDate) {
      return entry;
    }
  }

  return null;
};

var getStrategy = function(textContents) {
  if (selectedSkiStrategy) {
    if (!selectedSkiStrategy.recognize(textContents)) {
      throw new Error("There was already a selected strategy [ " + selectedSkiStrategy.name + "] but it does not recognize new contents. Make sure the files follow the same format.");
    }

    return selectedSkiStrategy;
  }

  var applicableStrategies = [];
  for (var i = 0; i < strategies.length; i++) {
    var strategy = strategies[i];
    if (strategy.recognize(textContents)) {
      applicableStrategies.push(strategy);
    }
  }

  if (applicableStrategies.length === 0) {
    throw new Error("No applicable strategies found!");
  } else if (applicableStrategies.length > 1) {
    throw new Error(applicableStrategies.length + " applicable strategies were found, only one was expected. " + applicableStrategies);
  }

  selectedSkiStrategy = applicableStrategies[0];

  return selectedSkiStrategy;
};

var skistats = {};

skistats.addStat = function(id, textContents) {
  if (!selectedSkiStrategy) {
    updateStrategy(getStrategy(textContents));
  }
  var entries = selectedSkiStrategy.retrieveEntries(textContents);

  allStatsById[id] = {
    displayName: id,
    entries: entries
  };

  if (map) {
    map.updateActors();
  }

  if (participantsLegend) {
    participantsLegend.updateActors();
  }
};

skistats.addStrategy = function(strategy) {
  strategies.push(strategy);
};

skistats.withMap = function(container) {
  if (map) {
    throw new Error("Only single instance of the map is supported");
  }
  map = new Map(container);
  return skistats;
};

skistats.withLiftLegend = function(container) {
  if (liftLegend) {
    throw new Error("Only single instance of the lift legend is supported");
  }
  liftLegend = new LiftLegend(container);
  return skistats;
};

skistats.withParticipantsLegend = function(container) {
  if (participantsLegend) {
    throw new Error("Only single instance of the participants legend is supported");
  }
  participantsLegend = new ParticipantsLegend(container);
  return skistats;
};

skistats.withTimeline = function(container) {
  if (timeline) {
    throw new Error("Only single instance of the timeline is supported");
  }
  timeline = new Timeline(container);
  vline = new Vline(container);

  return skistats;
};

skistats.dateFormat = function(format) {
  if (!arguments.length) {
    return dateFormat;
  }
  dateFormat = format;
  dateFormatInstance = d3.time.format(dateFormat);
  return skistats;
};

skistats.selectedSkiStrategy = function() {
  return selectedSkiStrategy;
};

skistats.VERSION = '0.0.1';

root.skistats = skistats;


}(this));

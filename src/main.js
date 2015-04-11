/* skistats main */

var dateFormat = "%d/%m/%Y %H:%M";
var dateFormatInstance = d3.time.format(dateFormat);
var passColors = d3.scale.category10();

var allStatsById = {};

var strategies = [];
var selectedSkiStrategy;

var map;
var liftLegend;
var passLegend;
var timeline;

var dispatcher = d3.dispatch("zoom");

var CIRCLE_HEIGHT = 10;
var CSV_STAT_MODE = "CSV_STAT_MODE";
var JSON_STAT_MODE = "JSON_STAT_MODE";


function Map(container) {
  this.mapObj = d3.select(container).append('div');
  this.mapPasses = {};
  this.raphaelLifts = {};
  this.raphaelPaper = new Raphael(this.mapObj[0][0], '100%', '100%');

  if (selectedSkiStrategy) {
    this.updateStrategy();
  }

  this.updatePasses();
}

Map.prototype.updateStrategy = function() {
  this.mapObj.style('background-image', 'url(' + selectedSkiStrategy.mapUrl + ')')
    .style('background-size', 'contain')
    .style('height', '100%')
    .style('background-repeat', 'no-repeat')
    .style('background-position', '50% 0%');

  this.raphaelPaper.setViewBox(0, 0, selectedSkiStrategy.viewport.width, selectedSkiStrategy.viewport.height, false);
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
  var circlesWithPositions = [];
  
  for (var passId in allStatsById) {
    var circle = this.mapPasses[passId];
    var entry = getLiftEntry(passId, date);
    if (!entry) {
      circle.hide();
    } else {
      circle.show();
      var position = (date - entry.startDate) / (entry.endDate - entry.startDate);

      console.log("position " + position);
      var path = this.raphaelLifts[entry.lift];

      var len = path.getTotalLength();
      var point = path.getPointAtLength(position * len);
      
      circlesWithPositions.push({circle: circle, point: point});
    }
  }
  
  circlesWithPositions.sort(function(a, b){return a.point.x-b.point.x;});
  
  for (var i = 0; i < circlesWithPositions.length; i++) {
    var cwp = circlesWithPositions[i];
    applyOverlappingWithPrevious(cwp, circlesWithPositions, i-1);
  }
};

// TODO improve calculation
function applyOverlappingWithPrevious(currentCWP, circlesWithPositions, prevPosition) {
  var r = CIRCLE_HEIGHT / 2;
  if (prevPosition > 0) {
    var lastCWP;
    for (var i = 0; i <= prevPosition; i++) {
      lastCWP = circlesWithPositions[i];
      if (Math.abs(currentCWP.point.x - lastCWP.point.x) < r && Math.abs(currentCWP.point.y - lastCWP.point.y) < r) {
        currentCWP.point.x = lastCWP.point.x + r;
        currentCWP.point.y = lastCWP.point.y + r;
        currentCWP.circle.insertAfter(lastCWP.circle);
      }
    } 
  }
  
  currentCWP.circle.transform("t" + [currentCWP.point.x, currentCWP.point.y]);
}

Map.prototype.updatePasses = function() {
  var passIndex = 0;
  for (var passId in allStatsById) {
    var circle = this.raphaelPaper.circle(0, 0, CIRCLE_HEIGHT).attr("fill", passColors(passIndex));
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

  for (var liftName in selectedSkiStrategy.liftPaths) {
    var legendElement = this.legendObj.append('div');
    legendElement.append('div').attr('class', 'liftPath').style('border-color', selectedSkiStrategy.liftColors[liftName]);
    legendElement.append('div').attr('class', 'liftName').html(liftName);
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
  var timelineContainer = d3.select(container).append('div').attr('class', 'timelineContainer');
  
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
  
  this.tasks = tasks;

  this.gantt.taskTypes(taskNames);
  this.gantt.taskStatusColor(selectedSkiStrategy.liftColors);

  var rangeMin = new Date(minDate.getTime() - (maxDate.getTime() - minDate.getTime()));
  var rangeMax = new Date(maxDate.getTime() + (maxDate.getTime() - minDate.getTime()));

  this.gantt.timeDomain([rangeMin, rangeMax]);

  var thisGantt = this.gantt;
  var that = this;

  this.zoom = d3.behavior.zoom()
    .x(thisGantt.getX())
    .scaleExtent([1, 200])
    .on("zoom", function() {
      thisGantt.redraw(tasks);

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

  var percentage = this.gantt.viewport().width / this.gantt.getChart()[0][0].offsetWidth;

  var actualX = this.lineHolder[0][0].offsetLeft * percentage - leftMargin;

  var currentDate = this.gantt.getX().invert(actualX);
  var fomattedDate = dateFormatInstance(currentDate);
  this.lineLabel.html(fomattedDate);
  if (map) {
    map.updatePosition(currentDate);
  }
};

Timeline.prototype.zoomCentered = function(scale) {
  var currentTranslate = this.zoom.translate()[0];
  var currentScale = this.zoom.scale();
  
  var scaledNewCenter = this.gantt.viewport().width * (scale / currentScale);
  var diff = (scaledNewCenter - this.gantt.viewport().width) / 2;
  
  var scaledTranslate = currentTranslate * (scale / currentScale);
  
  var newTranslate = scaledTranslate - diff;
  
  this.zoom.translate([newTranslate, 0]);
  this.zoom.scale(scale);
  
  dispatcher.zoom(this.zoom.scale());
  
  this.gantt.redraw(this.tasks);
};

Timeline.prototype.zoomIntervalMs = function(intervalMilliseconds) {
  var currentScale = this.zoom.scale();
  var currentBeginDate = this.gantt.getX().invert(0);
  var currentEndDate = this.gantt.getX().invert(this.gantt.viewport().width);
  
  var percentage = (currentEndDate - currentBeginDate) / intervalMilliseconds;
  
  this.zoomCentered(currentScale * percentage);
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
    return strategy.recognizeCSV(content);
  } else {
    return strategy.recognizeJSON(content);
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
  
  console.log(JSON.stringify(entries));

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

skistats.addStrategy = function(strategy) {
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

timelineContext.zoomCentered = function(scale) {
  if (timeline) {
    timeline.zoomCentered(scale);
  }
};

timelineContext.zoomIntervalMs = function(intervalMilliseconds) {
  if (timeline) {
    timeline.zoomIntervalMs(intervalMilliseconds);
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

skistats.selectedSkiStrategy = function() {
  return selectedSkiStrategy;
};

skistats.VERSION = '0.0.1';

root.skistats = skistats;

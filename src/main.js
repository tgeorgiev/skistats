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

skistats.VERSION = '0.0.1';

root.skistats = skistats;

/* global skistats:false */

/**
* Strategy for providing lift information and handling ski statististics for the Livigno ski resort. 
* @see http://www.skipasslivigno.com/en/.
* It provides invormation about the resort, map of the resort, ski lifts in the fortmat of key-value pairs, where the the key 
* is the id of the ski lift, and the value contains information about the SVG path element that will 
* be overlayed the Livigno map, so that we can interact with it. Also provides display information.
*
* This strategy also can parse CSV and JSON and map it to the format that skistats.js expects. 
* The CSV format that is supported is the format of stats retrieved from http://www.skipasslivigno.com/skicheck/ 
* i.e. "bigl","tnuo","date","pobz","ggbz","disl"
*
* For more information about the strategy specification, please refer to https://github.com/tgeorgiev/skistats/tree/master/src/strategies#specification
*/

(function(skistats) {
  "use strict";
  
  var liftPaths = {
    'L A Sg.Teola - P.Bassi': {
      path: '<path class="line" d="M502,523L502,523L429,499L429,499L355,469L355,469"></path>',
      color: 'steelblue',
      displayName: 'L A Sg.Teola - P.Bassi'
    },
    'L Sg.Valfin - M. Neve': {
      path: '<path class="line" d="M422,470L422,470L385,446L385,446L341,401L341,401L305,352L305,352L288,323L288,323L276,294L276,294"></path>',
      color: 'cornflowerblue',
      displayName: 'L Sg.Valfin - M. Neve'
    },
    'L Sg.Trepalle': {
      path: '<path class="line" d="M139,549L139,549L201,492L201,492L245,465L245,465L249,463L249,463"></path>',
      color: 'lightskyblue',
      displayName: 'L Sg.Trepalle'
    },
    'L A Telec.Mottolino': {
      path: '<path class="line" d="M512,599L512,599L463,597L463,597L445,596L445,596L418,589L418,589L396,582L396,582L329,547L329,547L294,526L294,526L253,510L253,510"></path>',
      color: 'lightcyan',
      displayName: 'L A Telec.Mottolino'
    },
    'L Sg.Monte Sponda': {
      path: '<path class="line" d="M397,542L397,542L311,457L311,457L239,386L239,386"></path>',
      color: 'lightseagreen',
      displayName: 'L Sg.Monte Sponda'
    },
    'L Segg. San Rocco': {
      path: '<path class="line" d="M563,437L563,437L620,435L620,435"></path>',
      color: 'aquamarine',
      displayName: 'L Segg. San Rocco'
    },
    'L A Telec.Carosello I': {
      path: '<path class="line" d="M550,424L550,424L606,411L606,411L654,383L654,383L680,369L680,369"></path>',
      color: 'mediumspringgreen',
      displayName: 'L A Telec.Carosello I'
    },
    'L A Telec.Carosello II': {
      path: '<path class="line" d="M688,366L688,366L817,312L817,312L875,280L875,280L901,260L901,260"></path>',
      color: 'limegreen',
      displayName: 'L A Telec.Carosello II'
    },
    'L Sg.Blesaccia I': {
      path: '<path class="line" d="M676,376L676,376L794,344L794,344L855,323L855,323"></path>',
      color: 'darkorchid',
      displayName: 'L Sg.Blesaccia I'
    },
    'L Sg.Blesaccia II': {
      path: '<path class="line" d="M786,388L786,388L887,344L887,344L954,320L954,320"></path>',
      color: 'violet',
      displayName: 'L Sg.Blesaccia II'
    },
    'L Sg. Fontane': {
      path: '<path class="line" d="M849,455L849,455L917,387L917,387L971,348L971,348"></path>',
      color: 'blueviolet',
      displayName: 'L Sg. Fontane'
    },
    'L Sg.Botarel - Tea dal Plan': {
      path: '<path class="line" d="M529,638"></path>',
      color: 'deeppink',
      displayName: 'L Sg.Botarel - Tea dal Plan'
    },
    'L Sc.Pemonte': {
      path: '<path class="line" d="M529,638L529,638L499,634L499,634L474,630L474,630L436,620L436,620L414,613L414,613L395,603L395,603"></path>',
      color: 'orangered',
      displayName: 'L Sc.Pemonte'
    },
    'L Sg.Fedaria': {
      path: '<path class="line" d="M999,265L999,265L941,248L941,248L896,230L896,230L843,209L843,209"></path>',
      color: 'coral',
      displayName: 'L Sg.Fedaria'
    },
    'L Sg.Baby Lac Salin': {
      path: '<path class="line" d="M860,252L860,252L895,258L895,258"></path>',
      color: 'goldenrod',
      displayName: 'L Sg.Baby Lac Salin'
    },
    'L Sc.San Rocco': {
      path: '<path class="line" d="M558,445L558,445L625,440L625,440"></path>',
      color: 'sienna',
      displayName: 'L Sc.San Rocco'
    },
    'L A. Telec. Tagliede': {
      path: '<path class="line" d="M658,641L658,641L729,622L729,622L766,605L766,605"></path>',
      color: 'chocolate',
      displayName: 'L A. Telec. Tagliede'
    },
    'L A. Telec. Costaccia': {
      path: '<path class="line" d="M764,607L764,607L800,590L800,590L824,567L824,567L878,528L878,528"></path>',
      color: 'lightcoral',
      displayName: 'L A. Telec. Costaccia'
    },
    'L Sg.Valandrea Vetta': {
      path: '<path class="line" d="M881,533L881,533L936,497L936,497L983,458L983,458L1044,416L1044,416"></path>',
      color: 'wheat',
      displayName: 'L Sg.Valandrea Vetta'
    }
  };

  // Used to estimate very rough end time of a lift run, having the start time and vertical rise.
  var ESTIMATED_LIFT_SPEED = 0.9; // 0.9 metres (vertical rise) per second.

  // The format of the dates from the CSV
  var parseDate = d3.time.format("%d/%m/%Y %H.%M.%S").parse;

  // The spec of the strategy
  var livignoStrategy = {
    name: 'Livigno',
    skiPassStatsUrl: 'http://www.skipasslivigno.com/?page_id=154',
    recognizeCSV: function(textContent) {
      var entries = this.retrieveEntriesCSV(textContent);
      return entries && entries.length > 0 && entries[0].resort === 'Livigno-SK';
    },
    retrieveEntriesCSV: function(textContent) {
      return d3.csv.parse(textContent, function(d) {
        var startDate = parseDate(d.date);
        var verticalRise = parseFloat(d.disl);
        var endDate = calculateEndDate(startDate, verticalRise);
        // For each entry, SkiStats expects to know the lift name/id, the start and end date of the lift run entry.
        return {
          lift: d.ggbz ? d.ggbz.trim() : "",
          startDate: startDate,
          endDate: endDate,
          resort: d.pobz
        };
      });
    },
    recognizeJSON: function(json) {
      return json && json.length > 0 && json[0].resort === 'Livigno-SK';
    },
    retrieveEntriesJSON: function(json) {
      // no additional transformations required
      return json;
    },
    liftPaths: liftPaths,
    mapUrl: 'assets/livigno-map.png',
    viewport: {
      width: 1130,
      height: 810
    }
  };

  /**
   * Based on the verticalRise and the ESTIMATED_LIFT_SPEED calculates the time for one chair of the
   * lift to get from the bottom to the top of the lift. Based on this and the start date, calculates the end date.
   */
  function calculateEndDate(startDate, verticalRise) {
    var endDate = new Date(startDate.getTime());
    var additionalSeconds = Math.round(verticalRise / ESTIMATED_LIFT_SPEED);
    endDate.setSeconds(endDate.getSeconds() + additionalSeconds);

    return endDate;
  }

  if (skistats) { 
    skistats.registerStrategy(livignoStrategy);
  } else {
    throw new Error("skiStats not available.");
  }
})(skistats);

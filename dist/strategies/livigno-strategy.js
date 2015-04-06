/* global skistats:false */

// Strategy for parsing Livigno stats
// Colors retrieved from http://www.brobstsystems.com/colors2.htm
(function () {
  "use strict";

    var liftPaths = {
      'L A Sg.Teola - P.Bassi': {
        path: '<path class="line" d="M502,523L502,523L429,499L429,499L355,469L355,469"></path>',
        color: 'steelblue'
      },
      'L Sg.Valfin - M. Neve': {
        path: '<path class="line" d="M422,470L422,470L385,446L385,446L341,401L341,401L305,352L305,352L288,323L288,323L276,294L276,294"></path>',
        color: 'cornflowerblue'
      },
      'L Sg.Trepalle': {
        path: '<path class="line" d="M139,549L139,549L201,492L201,492L245,465L245,465L249,463L249,463"></path>',
        color: 'lightskyblue'
      },
      'L A Telec.Mottolino': {
        path: '<path class="line" d="M512,599L512,599L463,597L463,597L445,596L445,596L418,589L418,589L396,582L396,582L329,547L329,547L294,526L294,526L253,510L253,510"></path>',
        color: 'lightcyan'
      },
      'L Sg.Monte Sponda': {
        path: '<path class="line" d="M397,542L397,542L311,457L311,457L239,386L239,386"></path>',
        color: 'lightseagreen'
      },
      'L Segg. San Rocco': {
        path: '<path class="line" d="M563,437L563,437L620,435L620,435"></path>',
        color: 'aquamarine'
      },
      'L A Telec.Carosello I': {
        path: '<path class="line" d="M550,424L550,424L606,411L606,411L654,383L654,383L680,369L680,369"></path>',
        color: 'mediumspringgreen'
      },
      'L A Telec.Carosello II': {
        path: '<path class="line" d="M688,366L688,366L817,312L817,312L875,280L875,280L901,260L901,260"></path>',
        color: 'limegreen'
      },
      'L Sg.Blesaccia I': {
        path: '<path class="line" d="M676,376L676,376L794,344L794,344L855,323L855,323"></path>',
        color: 'darkorchid'
      },
      'L Sg.Blesaccia II': {
        path: '<path class="line" d="M786,388L786,388L887,344L887,344L954,320L954,320"></path>',
        color: 'violet'
      },
      'L Sg. Fontane': {
        path: '<path class="line" d="M849,455L849,455L917,387L917,387L971,348L971,348"></path>',
        color: 'blueviolet'
      },
      'L Sg.Botarel - Tea dal Plan': {
        path: '<path class="line" d="M529,638"></path>',
        color: 'deeppink'
      },
      'L Sc.Pemonte': {
        path: '<path class="line" d="M529,638L529,638L499,634L499,634L474,630L474,630L436,620L436,620L414,613L414,613L395,603L395,603"></path>',
        color: 'orangered'
      },
      'L Sg.Fedaria': {
        path: '<path class="line" d="M999,265L999,265L941,248L941,248L896,230L896,230L843,209L843,209"></path>',
        color: 'coral'
      },
      'L Sg.Baby Lac Salin': {
        path: '<path class="line" d="M860,252L860,252L895,258L895,258"></path>',
        color: 'goldenrod'
      },
      'L Sc.San Rocco': {
        path: '<path class="line" d="M558,445L558,445L625,440L625,440"></path>',
        color: 'wheat'
      }
    };

    var ESTIMATED_LIFT_SPEED = 1.2; // 1.5 seconds per meter
    var parseDate = d3.time.format("%d/%m/%Y %H.%M.%S").parse;

    var liftColors = {};
    for (var key in liftPaths) {
        liftColors[key] = liftPaths[key].color;
    }

    var livignoStrategy = {
        name: "Livigno",
        recognize: function (textContent) {
            var entries = this.retrieveEntries(textContent);
            return entries && entries.length > 0 && entries[0].resort == "Livigno-SK";
        },
        retrieveEntries: function (textContent) {
            return d3.csv.parse(textContent, function(d) {
                var startDate = parseDate(d.date);
                var liftDistance = parseFloat(d.disl);
                var endDate = calculateEndDate(startDate, liftDistance);
                return {
                    id: d.bigl,
                    displayName: d.bigl,
                    startDate: startDate,
                    endDate: endDate,
                    liftDistance: liftDistance,
                    lift: d.ggbz ? d.ggbz.trim() : "",
                    resort: d.pobz
                };
            });
        },
        liftColors: liftColors,
        liftPaths: liftPaths,
        mapUrl: BASE_STRATEGY_URL + "assets/livigno-map.png",
        optimalWidth: 1130,
        optimalHeight: 810
    };

    function calculateEndDate(startDate, liftDistance) {
        var endDate = new Date(startDate.getTime());
        var additionalSeconds = Math.round(liftDistance * ESTIMATED_LIFT_SPEED);
        endDate.setSeconds(endDate.getSeconds() + additionalSeconds);

        return endDate;
    }

    if (skistats) {
        skistats.addStrategy(livignoStrategy);
    } else {
        throw new Error("skiStats not available.");
    }
})();
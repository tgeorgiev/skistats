# skistats.js

Ski statistics visualization 

See the [project homepage and demo](http://tgeorgiev.github.io/skistats).

## About

This is a JavaScript library for visualizing raw ski stats. It is based on [D3.js](http://d3js.org/) and [Raphael](http://raphaeljs.com) and provides data visualization components for displaying individual or collective lift run statistics.

The main components it exposes:

### Map

![Alt text](/docs/assets/map-component.jpg?raw=true)

The Map component is used to display map of a ski resort, with interactive SVG elements of the ski lifts and can display the participants riding a lift at a given time. The map component can be used standalone, to provide users an interactive display of a resort map. If used with the [timeline](#timeline) can provide even richer experience showing participants riding a lift at the current time.

### Timeline

![Alt text](/docs/assets/timeline-component.jpg?raw=true)

The Timeline component displays all registered lift runs. It is used to show a timeline of all entries with timeblock representing the participants riding different lifts. Supports zooming and panning, for digging in greater detail. 

Can be used standalone.  If used with the [map](#map) can provide even richer experience showing participants riding a lift at the current time.

### Lift legend

![Alt text](/docs/assets/lift-legend-component.jpg?raw=true)

Shows a legend of the ski lifts - color and display name. Useful to be used with the [map](#map) and/or [timeline](#timeline)

### Passes legend

![Alt text](/docs/assets/pass-legend-component.jpg?raw=true)

Shows a legend of the ski passes - color of the ski pass and display name. The display name is editable. When changed, the name will also be applied on the [timeline](#timeline) and [map](#map).

## Installation

Using Bower:

    bower install skistats

Or grab the [source](https://github.com/tgeorgiev/skistats/blob/master/dist/skistats.js) ([minified](https://github.com/tgeorgiev/skistats/blob/master/dist/skistats.min.js)).

## Supported resorts

Every resort is represented by a "strategy". You can read more about the strategies [here](https://github.com/tgeorgiev/skistats/blob/master/src/strategies/). Currently there is a strategy only for

* [Livigno](https://github.com/tgeorgiev/skistats/blob/master/src/strategies/livigno-strategy.js)

If you want to see more resorts, you can help by:

1. Openning a [new issue](https://github.com/tgeorgiev/skistats/issues/new) and specifying which resort you want to see visualizations for. Please also provide the stats you have for your ski pass, so that it is easier for us to see what is provided and what we can use.
2. Creating a new strategy. Instructions on how to create a new strategy can be found [here](https://github.com/tgeorgiev/skistats/tree/master/src/strategies#create-a-new-strategy)

## Usage

To include skistats.js
```javascript
<script type="text/javascript" src="/skistats/skistats.js"></script>
```
To include a preffered strategy
```javascript
<script type="text/javascript" src="/skistats/strategies/livigno-strategy.js"></script>
```
or to include all available strategies
```javascript
<script type="text/javascript" src="/skistats/strategies/all.js"></script>
```

To initialize the main skistats components and add them inside the respectful containers:
```javascript
skistats.map('.map');
skistats.liftLegend('.lifts');
skistats.passLegend('.passes');
skistats.timeline('.timeline', viewport, margin);
```

For a real demo example, check the source [demo/index.html](https://github.com/tgeorgiev/skistats/blob/master/demo/index.html) and see it live [here](http://tgeorgiev.github.io/skistats)

## Contributing

skistats.js is still in early development. It does not support many resorts, does not have many features and may have issues.

It will be great if you can help us improve it. You can do it in the following ways:
* Fork and contribute to the main skistats.js library
* Report issues and feature requests
* Open a [new issue](https://github.com/tgeorgiev/skistats/issues/new) and specify which resort you want to see visualizations for. Please also provide the stats you have for your ski pass, in order to 
* Contribute by creating a new strategy, to introduce support for new resort. Instructions on how to create a new strategy can be found [here](https://github.com/tgeorgiev/skistats/tree/master/src/strategies#create-a-new-strategy)

## License

MIT. See `LICENSE.txt` in this directory.

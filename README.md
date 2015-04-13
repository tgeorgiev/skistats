# skistats.js

Ski statistics visualization 

See the [project homepage and demo](http://tgeorgiev.github.io/skistats).

## About

This is a JavaScript library for visualizing raw ski stats. It is based on D3.js and Raphael and provides data visualization components for displaying individual or collective lift run statistics.

The main components it consists of and exposes are:

* Map

The Map component is used to display map of a ski resort, with interactive SVG elements of the ski lifts and can display the participants riding a lift. See Timeline

* Timeline

The Timeline component displays all registered lift runs. It useful for camparing multiple enties, from different ski passes. It is interactive, supports zooming and panning, and is integrated with the Map component. When moving through lift run entries, the map will update the entries on the lift paths.

* Lift legend

Shows a legend of the ski lifts - color and display name.

* Passes legend

Shows a legend of the ski passes - color of the ski pass and display name. The display name can be changed, if the use clicks on the name. When changed, the name will also be applied on the Timeline and Map.

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
* Contribute by creating a new strategy, to introduce support for new resort. Fork the project, see one of the available strategies to create yours and create pull request

## License

MIT. See `LICENSE.txt` in this directory.

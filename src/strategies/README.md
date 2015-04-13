# skistats.js strategies

Strategies for ski resorts

See the [project homepage and demo](http://tgeorgiev.github.io/skistats).

## About

The way skistats.js supports multiple resorts and statisctics for is by using strategies. skistats.js has a core functionality and handlers for different resorts are added by adding strategies.

## Supported resorts

There are strategies for the following resorts

* [Livigno](https://github.com/tgeorgiev/skistats/blob/master/dist/strategies/livigno-strategy.js)

## Create a new strategy

In case you want to contribute a new strategy, here are few things you need to know.

The strategy is just a JavaScript object with properties and functions that are needed by the skistats lib to translate and display ski statistics for a given ski resort. 

### Specification

#### name
The name of strategy, most likely the name of the ski resort. 
Type: String. **Required.**
```javascript
name: 'My Ski Resort'
```

### mapUrl
The url to the map if the ski resort. Can use any image if the strategy provides it's own, relative to the strategy dir, or provide an external url to the map.
Type: String. **Required.**
```javascript
mapUrl: 'assets/map.png'
```
or    
```javascript
mapUrl: 'http://my-ski-resort.com/map.png'
```

#### viewport
Viewport is the optimal size of the map and the lift path SVG elements were created on. SkiStats will use this as viewport for the map component, while still allowing scaling by preserving the aspect ratio.
Type: Object. **Required.**
```javascript
viewport: {
  width: 1130,
  height: 810
}
```

#### liftPaths
Information about the lifts. Includes lift information and details for how to render a SVG path overlayed on the map image and interact with the paths. Every 
Type: Object. **Required.** Represents a map, where the key is the id of the lift, and value of it is an object with the following properties

##### path
String representation of an SVG path, that maps to the map image lift path. It will be overlayed on top of the map.
Type: String. **Required.**
```javascript
path: '<path class="line" d="M529,638"></path>'
```
    
##### color
Color of the SVG path element
Type: String-color. *Optional*, defaults to black.
```javascript
color: 'deeppink'
```
    
##### displayName
User friendly name of the lift.
Type: String. Required.
```javascript
displayName: 'L Sg.Botarel - Tea dal Plan'
```

```javascript
liftPaths: {
  'L Sg.Botarel - Tea dal Plan': {
    path: '<path class="line" d="M529,638"></path>',
    color: 'deeppink',
    displayName: 'L Sg.Botarel - Tea dal Plan'
  },
  // ...
}
```

#### skiPassStatsUrl
The url where users can retrieve their ski pass statistics from
Type: String. Optional.
```javascript
name: 'http://my-ski-resort.com/ski-pass-stats'
```
    
#### recognizeCSV
Function that checks if it can recognize the given textContent in the format of a CSV, in the format that was retrieved by the ski resort.
Returns true if it recognizes the CSV, false otherwise. 
Type: Function. Optional, if not provided it would mean that this strategy does not support .csv as input
```javascript
recognizeCSV: function(textContents) {
  if (something) {
    return true;
  }

  return false;
}
```

#### retrieveEntriesCSV
After the strategy has confirmed that it can recognize a CSV, this function maps the CSV content to JSON that the skistats library understands. 
Type: Function. *Required* if [recognizeCSV](#recognizecsv) is defined.
```javascript
retrieveEntriesCSV: function(textContents) {
  // parse text contents 
  return jsonContents;
}
```
    
    
#### recognizeJSON
Function that checks if it can recognize the given JSON model, in the format that was retrieved by the ski resort.
Returns true if it recognizes the JSON, false otherwise. 
Type: Function. *Optional*, if not provided it would mean that this strategy does not support json as input
```javascript
recognizeCSV: function(textContents) {
  if (something) {
    return true;
  }

  return false;
}
```

#### retrieveEntriesJSON
After the strategy has confirmed that it can recognize a JSON, this function maps the JSON model to the model the skistats library understands. 
Type: Function. *Required* if [recognizeJSON](#recognizejson) is defined.
```javascript
retrieveEntriesCSV: function(textContents) {
  // parse text contents 
  return jsonContents;
}
```


### Register strategy
After the spec has been defined, to register it at runtime, you will need to call
```javascript
skistats.registerStrategy(strategySpec)
```
    
After this skistats.js will be able to select the strategy if it recognizes the input model it is given.

### Internals
In the context of the strategy you can expect to have [d3.js](http://d3js.org/) and [Raphael](http://raphaeljs.com) at your disposal
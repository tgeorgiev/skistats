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

### Convention

For each strategy there should be a folder that contains all files used by this strategy. Usually those folders onclude:

* JS file defining the [specification](#specification) and making the [registration](#register-strategy) **Required.**
* Map of the resort *Optional*
* README.md file *Optional*

### Specification

#### name

**Required**  
Type: `String`

The name of strategy, most likely the name of the ski resort. 
```javascript
name: 'My Ski Resort'
```

### mapUrl

**Required**  
Type: `String`

The url to the map if the ski resort. Can use any image if the strategy provides it's own, relative to the strategy root dir, or provide an external url to the map.
```javascript
mapUrl: 'my-strategy/map.png'
```
or    
```javascript
mapUrl: 'http://my-ski-resort.com/map.png'
```

#### viewport

**Required**  
Type: `Object` - defines `width` and `height`

Viewport is the optimal size of the map and the lift path SVG elements were created on. SkiStats will use this as viewport for the map component, while still allowing scaling by preserving the aspect ratio.
```javascript
viewport: {
  width: 1130,
  height: 810
}
```

#### liftPaths

**Required**  
Type: `Object` - defines name-value pairs, where the name is the id of the lift, and value of it is an object with the following properties

Information about the lifts. Includes lift information and details for how to render a SVG path overlayed on the map image and interact with the paths. Every 

##### path

**Required**  
Type: `String`

String representation of an SVG path, that maps to the map image lift path. It will be overlayed on top of the map.
```javascript
path: '<path class="line" d="M529,638"></path>'
```
    
##### color

*Optional*, defaults to black.  
Type: `String` - color 

Color of the SVG path element
```javascript
color: 'deeppink'
```
    
##### displayName

**Required**  
Type: `String`

User friendly name of the lift.
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

*Optional*  
Type: `String`

The url where users can retrieve their ski pass statistics from
```javascript
skiPassStatsUrl: 'http://my-ski-resort.com/ski-pass-stats'
```
    
#### recognizeCSV

*Optional*, if not provided it would mean that this strategy does not support .csv as input  
Type: `Function` - accepts text content as argument and returns true if it can recognize the contents 

Function that checks if it can recognize the given textContent in the format of a CSV, in the format that was retrieved by the ski resort.
Returns true if it recognizes the CSV, false otherwise. 
```javascript
recognizeCSV: function(textContents) {
  if (something) {
    return true;
  }

  return false;
}
```

#### retrieveEntriesCSV

*Required* if [recognizeCSV](#recognizecsv) is defined.  
Type: `Function` -  accepts text content and translates it to the JSON model skistats.js understands

After the strategy has confirmed that it can recognize a CSV, this function maps the CSV content to JSON that the skistats library understands. 
```javascript
retrieveEntriesCSV: function(textContents) {
  // parse text contents 
  return jsonModel;
}
```
    
    
#### recognizeJSON

*Optional*, if not provided it would mean that this strategy does not support json as input  
Type: `Function` - accepts a jsonObject argument and returns true if it can recognize it's properties

Function that checks if it can recognize the given JSON model, in the format that was retrieved by the ski resort.
Returns true if it recognizes the JSON, false otherwise. 
```javascript
recognizeJSON: function(jsonObject) {
  if (something) {
    return true;
  }

  return false;
}
```

#### retrieveEntriesJSON

*Required* if [recognizeJSON](#recognizejson) is defined.  
Type: `Function`  -  accepts a json object and translates it to the JSON model skistats.js understands 

After the strategy has confirmed that it can recognize a JSON, this function maps the JSON model to the model the skistats library understands. 
```javascript
retrieveEntriesJSON: function(jsonObject) {
  // translate the jsonObject
  return jsonModel;
}
```


### Register strategy
After the spec has been defined, to register it at runtime, you will need to call
```javascript
skistats.registerStrategy(strategySpec)
```
    
After this skistats.js will be able to select the strategy if it recognizes the input model it is given.

### Internals
In the context of the strategy you can expect to have [D3.js](http://d3js.org/) and [Raphael](http://raphaeljs.com) at your disposal
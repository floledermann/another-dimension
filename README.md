# A lightweight library for converting between units of length

**another-dimension** helps to convert between various units of length, with a focus on units used for screen presentation (physical screen Pixels) and visual acuity experiments (arcminutes, arcseconds).

## Installation & Import

### Node.js

```
npm install another-dimension
```

CommonJS require() syntax:

```javascript
const Dimension = require('another-dimension');
```

ES module import syntax:

```javascript
import Dimension from 'another-dimension';
```

## Basic usage

### Creating Dimensions

#### *`Dimension(spec, [options])`*

Can be used with `new` as *constructor*, or without as a *factory function*.

```javascript
let lengthA = new Dimension("12mm");   // Constructor syntax

let lengthB = Dimension("12mm");       // Factory syntax
```

**spec** can be a Number, a String, or an Object providing a `value` and optional `unit` entry.

```javascript
// String providing value + unit
let lengthA = Dimension("12mm");   

// Object providing value and (optionally) unit
let lengthB = Dimension({value: 12, unit: "mm"});

// Number will use default unit (initially "mm")
let lengthC = Dimension(12);       
```

**options** can be a String specifying the unit, or an object with some of the following entries:
**defaultUnit** Unit to use if not specified, overrides global default unit.

```javascript
// specify value and unit separately
let lengthA = Dimension(12, "mm");   

// specify defaultUnit in options
let lengthB = Dimension(12, {defaultUnit: "in"});  // => 12 inches

// specified unit takes precedence over options.defaultUnit
let lengthC = Dimension("12mm", {defaultUnit: "in"});  // => 12 mm    
```

### Retrieving and converting Dimensions

#### `dimensionInstance.toNumber(targetUnit)`

Returns the dimension converted to targetUnit, as a Number.

```javascript
let dim = Dimension("1in");

let mm = dim.toNumber("mm");  // 25.4
```

#### `dimensionInstance.toDimension(targetUnit)`

Returns a new Dimension instance, converted to the targetUnit.

```javascript
let dim = Dimension("1in");

let dimMM = dim.toDimension("mm");  // Dimension with value: 25.4 and unit: "mm"
```


### Global Configuration

### Using Dimensions as primitives

For Objects involved in numeric calculations, the JavaScript interpreter internally calls `.valueOf()` on the Object before performing the operation. By default, valueOf() of Dimension instances returns their (unconverted) numerical value. If the global option `defaultOutputUnit` is set, the value is converted to the specified unit first.

```javascript
let dim = Dimension("1in");

console.log(dim + dim);  // 2

Dimension.configure({
  defaultOutputUnit: "mm"
});

console.log(dim + dim);  // 50.8
```

### Supported Units

#### Metric Units

km: Kilometers
m: Meters
cm: Centimeters
mm: Millimeters
µ / µm / um: Micrometers

#### Imperial Units

in: Inches
thou: Thousandths of an Inch

#### Typesetting Units

pt: Point

#### Screen Units

px: Pixel

#### Angular Units

deg / °: Angular Degrees
arcmin: Arc Minutes
arcsec: Arc Seconds

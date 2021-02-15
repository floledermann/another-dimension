# A lightweight library for converting between units of length

**another-dimension** helps to convert between various units of length, with a focus on units used for screen presentation (physical screen Pixels) and visual acuity experiments (arcminutes, arcseconds).

Why did I create another unit conversion utility?

- Lightweight, only supporting length units. If you are looking for general conversion of various units, consider [js-quantities](https://www.npmjs.com/package/js-quantities), [convert-units](https://www.npmjs.com/package/convert-units), [convert](https://www.npmjs.com/package/convert) or others.
- Global configuration of *pixel density* and *viewing distance* for accurate conversion from/to screen pixels and angular length units, as often needed for perceptual experiments and user studies.
- Support for [angular length units](https://en.wikipedia.org/wiki/Angular_distance) (degrees, arcminutes and arcseconds) which involve trigonometric functions and configurable viewing distance for accurate conversion to absolute length units.

**`another-dimension`** was created as part of the [stimsrv](https://github.com/floledermann/stimsrv) project to support accurate specification of dimensions for psychophysical experiments.

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

#### *`Dimension(spec[, options])`*

Can be used with `new` as *constructor*, or without as a *factory function*.

```javascript
let lengthA = new Dimension("12mm");   // Constructor syntax

let lengthB = Dimension("12mm");       // Factory syntax
```

**`spec`** can be a Number, a String, or an Object providing a **`value`** and optional **`unit`** entry.

```javascript
// String providing value + unit
let lengthA = Dimension("12mm");   

// Object providing value and (optionally) unit
let lengthB = Dimension({value: 12, unit: "mm"});

// Number will use default unit (initially "mm")
let lengthC = Dimension(12);       
```

**`options`** can be a String specifying the unit, or an object with some of the following entries:

**`options.defaultUnit`** Unit to use if not specified, overrides global default unit.

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

## Supported Units

The list of built-in units is deliberately kept short. New units can be added quickly by providing conversion functions or factors (at minimum to an from the global base unit - mm) using **`Dimension.addConversion()`**

### Metric Units

| Unit / Aliases | Description | mm   |
| -------------- | ----------- | ---- |
| **`km`**       | Kilometer   | 10^6 |
| **`m`**        | Meter       | 10^3 |
| **`cm`**       | Centimeter  | 10   |
| **`mm`**       | Millimeter  | 1    |
| **`µ`** / **`µm`** / **`um`** | Micrometer | 10^-3 |

### Imperial Units

| Unit / Aliases | Description | mm   |
| -------------- | ----------- | ---- |
| **`in`**       | Inch        | 25.4 |
| **`thou`**     | Thousandths of an Inch | 0.0254 |

### Typesetting Units

| Unit / Aliases | Description  | mm   |
| -------------- | -----------  | ---- |
| **`pc`**       | [(DTP) Pica](https://en.wikipedia.org/wiki/Pica_(typography)) (1/6in)  | ≈4.23 |
| **`pt`**       | [(DTP) Point](https://en.wikipedia.org/wiki/Point_(typography)) (1/12pc) | ≈0.353 |
| **`twip`**     | [Twip](https://en.wikipedia.org/wiki/Twip) (1/20pt, sometimes used as device-independent pixel equivalent) | ≈0.0176 |

### Screen Units

| Unit / Aliases | Description    | mm   |
| -------------- | -----------    | ---- |
| **`px`**       | *Physical* Pixel | Varying, depending on `config.pixelDensity` (≈0.265mm @ 96dpi)|

### Angular Units

| Unit / Aliases | Description | mm   |
| -------------- | ----------- | ---- |
| **`deg`** / **`°`** | Angular Degree | Varying, depending on `config.viewingDistance` (≈10.5mm @ 600mm) |
| **`arcmin`**   | Arc Minute | Varying, depending on `config.viewingDistance` (≈0.175mm @ 600mm) |
| **`arcsec`**   | Arc Second | Varying, depending on `config.viewingDistance` (≈0.003mm @ 600mm)|

## Credits

**`another-dimension`** was created by Florian Ledermann as part of the [stimsrv](https://github.com/floledermann/stimsrv) project.

License: MIT License.
 
*"I'll take your brains to another dimension ... pay close attention!" — In memoriam Keith Flint / The Prodigy*

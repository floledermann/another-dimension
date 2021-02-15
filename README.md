# A lightweight library for converting units of length

**`another-dimension`** helps to convert between various units of length, with a focus on units used for screen presentation (physical screen pixels) and visual acuity experiments (arcminutes, arcseconds).

Why did I create another unit conversion utility?

- **Lightweight, only supporting length units**. If you are looking for general conversion of various units, consider [js-quantities](https://www.npmjs.com/package/js-quantities), [convert-units](https://www.npmjs.com/package/convert-units), [convert](https://www.npmjs.com/package/convert) or others.
- **Support for [angular length units](https://en.wikipedia.org/wiki/Angular_distance) (degrees, arcminutes and arcseconds)** which involve trigonometric calculations in the conversion and depend on viewing distance.
- **Support for physical screen pixels** taking into account the (configurable) pixel density.
- Global **configuration of *pixel density* and *viewing distance* for accurate conversion from/to physical screen pixels and angular length units**, as often needed for accurate reproduction of perceptual experiments and user studies.

**`another-dimension`** was created as part of the [stimsrv](https://github.com/floledermann/stimsrv) project to support the accurate specification of dimensions for screen-based psychological experiments.

----

|| &nbsp; [**In a Nutshell**](#in-a-nutshell) &nbsp; || &nbsp; [**Installation & Import**](#intallation--import) &nbsp; || &nbsp; [**API Documentation**](#api-documentation) &nbsp; || &nbsp; [**Supported Units**](#supported-units) &nbsp; || &nbsp; [**Credits**](#credits) &nbsp; || 

----

## **`another-dimension`** in a Nutshell

```javascript
const Dimension = require('another-dimension');

// Configuration for screen-based output scenario (if you need to deviate from the defaults)
Dimension.configure({
  defaultOutputUnit: "px", // convert to pixels when value is used as Number
  defaultUnit: "px",       // default unit to use if no unit is specified
  pixelDensity: 440,       // 440ppi, pixel density of HiDPI smartphone, 
                           //   used to convert pixel sizes
  viewingDistance: 350     // 350mm viewing distance (typical for smartphone use),
                           //   used to convert angular measure
});

// Create some dimensions
let width  = Dimension("10mm");       // 10 mm
let height = Dimension(50, "arcmin"); // 50 arcmin
let depth  = Dimension(50);           // 50 pixels (as per defaultUnit specified above)

// Dimension objects can be used in place of numeric primitives, 
// and will implicitly be converted to pixels (as configured above)
// This will draw a 173.2 x 176.4 pixel rectangle!
canvasContext2D.fillRect(0, 0, width, height);

// Dimension containing the length of the diagonal in pixels (set as defaultUnit above)
let diagonal = Dimension(Math.sqrt(width ** 2 + height ** 2));

// Ouptut diagonal length in mm, using 2 digits precision
console.log(`Diagonal length: ${diagonal.toString("mm",2)}`);
// => "Diagonal length: 14.27mm"
```

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

## API Documentation

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

#### *`dimensionInstance.toDimension(targetUnit)`*

Returns a new Dimension instance, converted to the `targetUnit`.

```javascript
let dim = Dimension("1in");

let dimMM = dim.toDimension("mm");  // Dimension with value: 25.4 and unit: "mm"
```

#### *`dimensionInstance.toNumber(targetUnit)`*

Returns the dimension converted to `targetUnit`, as a Number. If `targetUnit` is not specified, return the unconverted value.

```javascript
let dim = Dimension("1in");

let mm = dim.toNumber("mm");  // 25.4
let inches = dim.toNumber();  // 1
```

#### *`dimensionInstance.toString([targetUnit], [digits])`*

#### *`dimensionInstance.toFixed([digits[, targetUnit]])`*

#### *`dimensionInstance.valueOf()`*

Returns the numeric value of the dimension converted to the globally configured `defaultOutputUnit`, or the unconverted value if `defaultOutputUnit` has not been set.

This method is called internally by the JavaScript interpreter when a Dimension object is used in place of a primitive value, and is provided for this purpose. It should generally rarely be called explicitly (use `dimensionInstance.toNumber()`, `dimensionInstance.toFixed()` or `dimensionInstance.toString()` for better control over the output instead).

### Global Configuration

#### *`Dimension.configure(options)`*

Set global configuration options.

**`options`** is an object containing global configuration options.

| Option                  | Default | Description   |
| ----------------------- | ------- | ------------- |
| **`defaultUnit`**       | `"mm"`  | Default unit to use when creating Dimension instances. |
| **`defaultOutputUnit`** | `null`  | Unit to convert to when a Dimension instance is used as a primitive value. `null` uses the object's specified unit (so no conversion takes place). |
| **`anchorUnit`**        | `"mm"`  | Unit to try as intermediate unit when no direct conversion from source to target unit is available. |
| **`pixelDensity`**      | `96`    | Pixel density (in pixels-per-inch) to use for converting pixel values. |
| **`viewingDistance`**   | `600`   | Viewing distance (in mm) to use for converting angular dimensions. The default of 600mm is often used for "Desktop" settings, for mobile phones use 300-350mm. |
| **`aliases`**           | see [Supported Units](#supported-units) | A key-value map of unit aliases, e.g. `{'"': 'in'}` to use the **"** character as an alias for inches. ***Warning:*** setting this here will overwrite the internal alias table. Use `Dimension.addAlias()` to add aliases to the internal alias table. |

#### *`Dimension.addConversion(fromUnit, toUnit, factorOrFunction)`*

Add a conversion, specified as a fixed conversion factor or a function.

**`fromUnit`** String specifying the unit to convert from.

**`toUnit`** String specifying the unit to convert to.

**`factorOrFunction`** either a Number, specifying a fixed conversion factor, or a Function that will be called for each conversion with the following parameters:

- `value` the value to convert.
- `config` the global configuration object (see [`Dimension.configure()`](#dimensionconfigureoptions)).

To introduce a new unit, you only need to supply a conversion to and from the `anchorUnit` (by default: `"mm"`) as a bare minimum.

##### Example:

```js
// (these conversions are already built in and serve only for illustration purposes)

// to convert from inch to mm, multiply with 25.4
Dimension.addConversion("in", "mm", 25.4);

// to convert from inches to pixels, multiply with config.pixelDensity
Dimension.addConversion("in", "px", (v, config) => v * config.pixelDensity);
```

#### *`Dimension.addAlias(unit, alias)`*

Add an alias (alternative name) for a unit. The aliases will be considered before any conversion. ***Warning:*** Aliases are not looked up recursively, so each alias has to refer to a unit which is actually specified (i.e. for which conversions are either built in or have been specified using [`Dimension.addConversion()`](#dimensionaddconversionfromunit-tounit-factororfunction)).

**`unit`** A String specifying the base unit.

**`alias`** A String or an Array of Strings, specifying alias name(s).

##### Example:

```js
// " is not configured as an alias for inches by default, as it may be confused with arcseconds.

// to use " as an alias for inches
Dimension.addAlias("in", '"');

let length = Dimension('12"');

console.log(length.toString());
// => 12in
```


### Using Dimensions as primitives

For Objects involved in numeric calculations, the JavaScript interpreter internally calls `.valueOf()` on the Object before performing the operation. By default, `valueOf()` of Dimension instances returns their (unconverted) numerical value. If the global option `defaultOutputUnit` is set, the value is converted to the specified unit first.

```javascript
let dim = Dimension("1in");

console.log(dim + dim);  // 2

Dimension.configure({
  defaultOutputUnit: "mm"
});

console.log(dim + dim);  // 50.8
```

## Supported Units

The list of built-in units is deliberately kept short. New units can be added quickly by providing conversion functions or factors (at minimum to and from the global base unit `config.anchorUnit`) using [`Dimension.addConversion()`](#dimensionaddconversionfromunit-tounit-factororfunction)

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
| **`twip`**     | [Twip](https://en.wikipedia.org/wiki/Twip) (1/20pt) | ≈0.0176 |

### Screen Units

| Unit / Aliases | Description             | mm   |
| -------------- | ----------------------- | ---- |
| **`px`**       | *Physical* Screen Pixel | Varying, depending on `config.pixelDensity` (≈0.265mm @ 96dpi)|

### Angular Units

| Unit / Aliases | Description | mm   |
| -------------- | ----------- | ---- |
| **`deg`** / **`°`** | Angular Degree | Varying, depending on `config.viewingDistance` (≈10.5mm @ 600mm) |
| **`arcmin`**   | Arc Minute | Varying, depending on `config.viewingDistance` (≈0.175mm @ 600mm) |
| **`arcsec`**   | Arc Second | Varying, depending on `config.viewingDistance` (≈0.003mm @ 600mm)|

## Credits

**`another-dimension`** was created by Florian Ledermann ([Twitter](https://twitter.com/floledermann)) as part of the [stimsrv](https://github.com/floledermann/stimsrv) project.

License: MIT License.
 
*"I'll take your brains to **another dimension** ... pay close attention!" — In memoriam Keith Flint / The Prodigy*

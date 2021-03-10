// wrap in IIFE for direct use in browser without polluting the global scope
(function() {
  
let config = {
  defaultUnit: "mm",
  defaultOutputUnit: null, // default unit when converted to number
  anchorUnit: "mm",        // unit to use when direct conversion is not available
  pixelDensity: 96,        // pixel per inch
  viewingDistance: 600,    // in mm
  aliases: {
    //'"': "in",   // not configured by default, as this can be confused with arcseconds
    "um": "µ",
    "µm": "µ",
    "°": "deg"
  },
  toJSON: d => ({value: d.value, unit: d.unit}),
  dimensionRegEx: /^\s*(?<value>-?[0-9]*\.?[0-9]+)\s*(?<unit>[^\s\d]+)\s*$/
};


let conversions = {
  "mm": {
    "km": 1000000,
    "m": 1000,
    "cm": 10,
    "hm": 0.01,
    "µ": 0.001,
    "in": 25.4,
    "thou": 0.0254,
    "pt": 25.4 / 72,
    "pc": 25.4 / 6,
    "px": (v,c) => v * 25.4 / (c||config).pixelDensity,
    "deg": (v,c) => Math.tan(v / 2 / 180 * Math.PI ) * 2 * (c||config).viewingDistance,
    "arcmin": (v,c) => conversions.mm.deg(v/60, c),
    "arcsec": (v,c) => conversions.mm.deg(v/3600, c)
  },
  "in": {
    "m": 1 / 0.0254,
    "cm": 1 / 2.54,
    "mm": 1 / 25.4,
    "hm": 1 / 2540,
    "µ": 1 / 25400,
    "thou": 0.001,
    "pt": 1 / 72,
    "pc": 1 / 6,
    "px": (v,c) => v / (c||config).pixelDensity,
    "deg": (v,c) => conversions.mm.deg(v,c) / 25.4,
    "arcmin": (v,c) => conversions.mm.arcmin(v,c) / 25.4,
    "arcsec": (v,c) => conversions.mm.arcsec(v,c) / 25.4      
  },
  "px": {
    "m": (v,c) => v * (c||config).pixelDensity / 0.0254,
    "cm": (v,c) => v * (c||config).pixelDensity / 2.54,
    "mm": (v,c) => v * (c||config).pixelDensity / 25.4,
    "hm": (v,c) => v * (c||config).pixelDensity / 2540,
    "µ": (v,c) => v * (c||config).pixelDensity / 25400,
    "in": (v,c) => v * (c||config).pixelDensity,
    "thou": (v,c) => v * (c||config).pixelDensity / 1000,
    "pt": (v,c) => v * (c||config).pixelDensity / 72,
    "pc": (v,c) => v * (c||config).pixelDensity / 6,
    "deg": (v,c) => conversions.mm.deg(v,c) * (c||config).pixelDensity / 25.4,
    "arcmin": (v,c) => conversions.mm.arcmin(v,c) * (c||config).pixelDensity / 25.4,
    "arcsec": (v,c) => conversions.mm.arcsec(v,c) * (c||config).pixelDensity / 25.4
  },
  "deg": {
    "arcmin": 1/60,
    "arcsec": 1/3600
  }

};


function Dimension(spec, options) {
  
  if (spec instanceof Dimension && !options?.clone) {
    // short-circuit if spec is already a Dimension
    return spec;
  }
  
  if (!(this instanceof Dimension)) {
    // 
    return new Dimension(spec, options);
  }

  if (typeof options == "string") {
    options = {defaultUnit: options};
  }
  
  options = Object.assign({
    defaultUnit: config.defaultUnit || "mm"
  }, options);

  
  if (typeof spec == "string") {
    spec = Dimension.parseDimensionString(spec);
  }
  else if (typeof spec == "object" && "value" in spec) {
    spec = {
      value: spec.value,
      unit: spec.unit || options?.defaultUnit || config.defaultUnit
    }
  }
  else {
    // Number or Object
    spec = {
      value: +spec?.valueOf(),
      unit: options?.defaultUnit || config.defaultUnit
    }
  }
  
  this.value = spec.value || 0;
  this.unit = Dimension.unAlias(spec.unit);
  
  this.valueOf = function() {
    if (config.defaultOutputUnit) {
      return this.toNumber(config.defaultOutputUnit);
    }
    return this.value;
  }
  
  this.toFixed = function(digits, targetUnit) {
    let val = this.toNumber(targetUnit);
    val = val.toFixed(digits);
    return val;
  }
  
  this.toNumber = function(targetUnit) {
    // no unit specified -> return value
    if (!targetUnit) return this.value;
    
    let func = Dimension.getConversionFunction(this.unit, targetUnit);
    
    if (func) return func(this.value);
    
    throw new Error("No conversion path from " + this.unit + " to " + targetUnit + " found!");
  }
  
  this.toDimension = function(targetUnit, options) {
    return Dimension({value: this.toNumber(targetUnit), unit: targetUnit}, options);
  }
  
  this.toJSON = function() {
    return config.toJSON(this);
  }

  this.toString = function(targetUnit, digits) {
    
    // if only a number is specified, use it as digits parameter
    if (typeof targetUnit == "number" && digits === undefined) {
      digits = targetUnit;
      targetUnit = undefined;
    }
    
    let val;
    
    if (digits === undefined) {
      val = this.toNumber(targetUnit);
    } 
    else {
      val = this.toFixed(digits, targetUnit);
    }
    
    return val + (targetUnit || this.unit);
  }
  
  return this;
}

Dimension.configure = function(options) {
  /*
  Attention: if you configure aliases here, the internal aliases table will be replaced.
  Use Dimension.addAlias() to add alias names to the internal table.
  */
  Object.assign(config, options);
  if (!config.aliases) {
    config.aliases = {};
  }
}

Dimension.unAlias = function(unit) {
  
  return config.aliases[unit] || unit;
  
}

Dimension.addAlias = function(unit, alias) {
  
  config.aliases[alias] = unit;
  
}

Dimension.addConversion = function(fromUnit, toUnit, factorOrFunction) {
  
  if (!conversions[toUnit]) {
    conversions[toUnit] = {};
  }
  conversions[toUnit][fromUnit] = factorOrFunction;
  
}

Dimension.getConversionFunction = function(fromUnit, toUnit, options) {

  let _config;
  
  if (options?.freezeConfig) {
    _config = Object.assign({}, config);
  }
  else {
    _config = config;
  }
  
  fromUnit = Dimension.unAlias(fromUnit);
  toUnit = Dimension.unAlias(toUnit);
  
  if (fromUnit == toUnit) {
    // no conversion - return unity function
    return x => x;
  }

  // direct conversion
  let conversion = conversions[toUnit]?.[fromUnit];
  if (conversion) {
    if (typeof conversion == "function") {
      return value => conversion(value, _config)
    }
    return value => value * conversion;
  }
  
  // reverse conversion
  // can only be done for numeric factors
  conversion = conversions[fromUnit]?.[toUnit];
  if (conversion && typeof conversion == "number") {
    return value => value / conversion;
  }

  // indirect conversion
  conversion = conversions[config.anchorUnit]?.[fromUnit];
  let conversion2 = conversions[toUnit]?.[config.anchorUnit];
  let func = null;
  
  if (conversion && conversion2) {
    if (typeof conversion == "function") {
      if (typeof conversion2 == "function") {
        func = value => conversion2(conversion(value, _config), _config);
      }
      else {
        func = value => conversion2 * conversion(value, _config);
      }
    }
    else {
      if (typeof conversion2 == "function") {
        func = value => conversion2(value * conversion, _config);
      }
      else {
        let factor = conversion2 * conversion;
        func = value => factor * value;
      }
    }
    func.indirect = true;
    return func;
  }
  
  return null;
}

Dimension.parseDimensionString = function(str) {
  
  let match = config.dimensionRegEx.exec(str);
  if (match) {
    return {
      value: +match.groups.value,
      unit: match.groups.unit
    }
  }
  else if (config.defaultUnit) {
    let numberRegEx = /^(?<value>-?[0-9]*\.?[0-9]+)$/;
    let match = numberRegEx.exec(str);
    if (match) {
      return {
        value: parseFloat(str),
        unit: config.defaultUnit
      }
    }  
  }
  return null;
}

// ----------------------------------------------------
// v- Boilerplate for Node/Browser module definition -v
// ----------------------------------------------------

// Node.js
if (typeof module == "object" && typeof module.exports == "object") {
  module.exports = Dimension;
}

// Browser - allow for configurable global name
let globalName;
if (typeof window != "undefined" 
    && typeof document != "undefined"
    && document.currentScript?.getAttribute
    && (globalName = document.currentScript.getAttribute("data-another-dimension"))) {
   window[globalName] = Dimension;
}

// end IIFE wrapping
})();



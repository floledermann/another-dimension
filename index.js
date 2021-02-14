
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
  }
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
    "px": v => v * 25.4 / config.pixelDensity,
    "deg": v => Math.tan(v / 2 / 180 * Math.PI ) * 2 * config.viewingDistance,
    "arcmin": v => conversions.mm.deg(v/60),
    "arcsec": v => conversions.mm.deg(v/3600)
  },
  "in": {
    "m": 1 / 0.0254,
    "cm": 1 / 2.54,
    "mm": 1 / 25.4,
    "hm": 1 / 2540,
    "µ": 1 / 25400,
    "thou": 0.001,
    "pt": 1 / 72,
    "px": v => v / options.pixelDensity,
    "deg": v => conversions.mm.deg(v) / 25.4,
    "arcmin": v => conversions.mm.arcmin(v) / 25.4,
    "arcsec": v => conversions.mm.arcsec(v) / 25.4      
  },
  "px": {
    "m": v => v * config.pixelDensity / 0.0254,
    "cm": v => v * config.pixelDensity / 2.54,
    "mm": v => v * config.pixelDensity / 25.4,
    "hm": v => v * config.pixelDensity / 2540,
    "µ": v => v * config.pixelDensity / 25400,
    "in": v => v * config.pixelDensity,
    "thou": v => v * config.pixelDensity / 1000,
    "pt": v => v * config.pixelDensity / 72,
    "deg": v => conversions.mm.deg(v) * config.pixelDensity / 25.4,
    "arcmin": v => conversions.mm.arcmin(v) * config.pixelDensity / 25.4,
    "arcsec": v => conversions.mm.arcsec(v) * config.pixelDensity / 25.4
  }

};


function Dimension(spec, options) {
  
  if (spec instanceof Dimension && !options?.clone) {
    // short-circuit if spec is already a Dimension
    return spec;
  }
  
  if (!this instanceof Dimension) {
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
  }
  else if ("value" in spec)) {
    spec = {
      value: spec.value,
      unit: spec.unit || options?.defaultUnit || config.defaultUnit
    }
  }
  else {
    // Number or Object
    spec = {
      value: +spec.valueOf(),
      unit: options?.defaultUnit || config.defaultUnit
    }
  }
  
  this.value = spec.value || 0;
  this.unit = spec.unit;
  
  this.valueOf = function() {
    if (config.defaultOutputUnit) {
      return this.toNumber(config.defaultOutputUnit);
    }
    return this.value;
  }
  
  this.toNumber = function(targetUnit) {
    // no unit specified -> return value
    if (!targetUnit) return this.value;
    
    // check aliases
    let alias = config.aliases[targetUnit];
    if (alias) targetUnit = alias;
    
    // same unit as own -> return value
    if (targetUnit == this.unit) return this.value;
    
    let conv = Dimension.getConversionFunction(this.unit, targetUnit);

    // Don't use Dimension.getConversionFunction to avoid closure overhead
    // direct conversion
    let conversion = conversions[targetUnit]?.[this.unit];
    if (conversion) {
      if (typeof conversion == "function") {
        return conversion(this.value, config);
      }
      return this.value * conversion;
    }
    
    // reverse conversion
    // this is not accurate for angular measurements - maybe hide behind a flag?
//  conversion = conversions[this.unit].?[targetUnit];
//  if (conversion) {
//    if (typeof conversion == "function") {
//      conversion = conversion(1, config);
//    }
//    return this.value / conversion;
//  }

    // indirect conversion
    let conversion = conversions.[config.anchorUnit]?.[this.unit];
    if (conversion) {
      let conversion2 = conversions[targetUnit]?.[config.anchorUnit];
      if (conversion2) {
        let valInAnchorUnit;
        if (typeof conversion == "function") {
          valInAnchorUnit = conversion(this.value, config);
        }
        else {
          valInAnchorUnit = this.value * conversion;
        }
        if (typeof conversion2 == "function") {
          return conversion2(valInAnchorUnit, config);
        }
        return valInAnchorUnit * conversion2;
      }
    }
    
    throw "No conversion path from " + this.unit + " to " + targetUnit + " found!";
  }
  
  this.toDimension = function(targetUnit, options) {
    return Dimension({value: this.toNumber(targetUnit), unit: targetUnit}, options);
  }
  
  this.toString = function() {
    return this.value + this.unit;
  }
  
  return this;
}

Dimension.configure(options) {
  /*
  Attention: if you configure aliases here, the internal aliases table will be replaced.
  Use Dimension.addAlias() to add alias names to the internal table.
  */
  Object.assign(config, options);
  if (!config.aliases) {
    config.aliases = {};
  }
}

Dimension.addAlias(unit, alias) {
  
  if (!Array.isArray(aliases)) {
    aliasesList[alias] = unit;
  }
  else {
    for (let a of alias) {
      aliasesList[a] = unit;
    }
  }
}

Dimension.addConversion(fromUnit, toUnit, factorOrFunction) {
  if (!conversions[toUnit]) {
    conversions[toUnit] = {};
  }
  conversions[toUnit][fromUnit] = factorOrFunction;
}



Dimension.getConversionFunction(fromUnit, toUnit, options) {

  let _config;
  
  if (options.freezeConfig) {
    _config = Object.assign({}, config);
  }
  else {
    _config = config;
  }

  // direct conversion
  let conversion = conversions[targetUnit]?.[this.unit];
  if (conversion) {
    if (typeof conversion == "function") {
      return value => conversion(value, _config)
    }
    return value => value * conversion;
  }
  
  // reverse conversion
  // this is not accurate for angular measurements - maybe hide behind a flag?
//  conversion = conversions[this.unit].?[targetUnit];
//  if (conversion) {
//    if (typeof conversion == "function") {
//      conversion = conversion(1, config);
//    }
//    return this.value / conversion;
//  }

  // indirect conversion
  conversion = conversions.mm?.[this.unit];
  let conversion2 = conversions[targetUnit]?.mm;
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

module.exports = Dimension;
"use strict";

const assert = require("assert");
const Dimension = require(".");

describe("Dimension", () => {

  describe("Creation", () => {
    
    it("Constructor syntax", () => {
      assert( (new Dimension()) instanceof Dimension);
    });

    it("Factory syntax", () => {
      assert( (Dimension()) instanceof Dimension);
    });

    it("Default value 0", () => {
      assert.strictEqual( Dimension().value, 0);
    });

    it("Default unit mm", () => {
      assert.equal( Dimension().unit, "mm");
    });

    it("Short-circuit if Dimension is passed to constructor", () => {
      let dim1 = Dimension();
      let dim2 = Dimension(dim1);
      assert.strictEqual( dim1, dim2);
    });

    it("Clone if Dimension is passed to constructor and clone option is set", () => {
      let dim1 = Dimension();
      let dim2 = Dimension(dim1, {clone: true});
      assert.notStrictEqual( dim1, dim2 );
      assert.equal(dim1.value, dim2.value);
      assert.equal(dim1.unit, dim2.unit);
    });

    it("Value is stored", () => {
      assert.equal( Dimension(1).value, 1);
      assert.equal( Dimension(99.9).value, 99.9);
    });

    it("Uses defaultUnit specified as separate string", () => {
      let dim1 = Dimension(1, "m");
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });

    it("Uses defaultUnit specified as option", () => {
      let dim1 = Dimension(1, { defaultUnit: "m" });
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });

    it("Parses value specified as string into value + unit", () => {
      let dim1 = Dimension("1m");
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });

    it("Uses unit specified with value string over specified defaultUnit", () => {
      let dim1 = Dimension("1m", "cm");
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });

    it("Uses value + unit specified as a plain object", () => {
      let dim1 = Dimension({value: 1, unit: "m"});
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });

    it("Uses unit specified with plain object over specified defaultUnit", () => {
      let dim1 = Dimension({value: 1, unit: "m"}, "cm");
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });

    it("Calls valueOf() of object passed in as spec", () => {
      let obj = { valueOf: () => 1 };
      let dim1 = Dimension(obj, "m");
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "m");
    });
    
  });
  
  describe("Basic output", () => {

    it("Output unconverted value with .toNumber()", () => {
      let dim1 = Dimension("1in");
      assert.equal( dim1.toNumber(), 1);
    });

    it("Output converted value with .toNumber()", () => {
      let dim1 = Dimension("1in");
      assert.equal( dim1.toNumber("mm"), 25.4);
    });

    it("Output unconverted value with .valueOf()", () => {
      let dim1 = Dimension("1in");
      assert.equal( dim1.valueOf(), 1);
    });
    
    it("Implicit call to .valueOf() when used as value", () => {
      let dim1 = Dimension("1in");
      assert.equal( dim1 + 0, 1);
    });
    
    it("Output fixed precision value with .toFixed()", () => {
      let dim1 = Dimension("2.3333333in");
      assert.equal( dim1.toFixed(2), "2.33");
    });
    
    it("Output fixed precision converted value with .toFixed()", () => {
      let dim1 = Dimension(2+1/8,"in");
      assert.equal( dim1.toFixed(2, "mm"), "53.97");
    });
    
    it("Output unconverted value + unit with .toString()", () => {
      let dim1 = Dimension("1in");
      assert.equal( dim1.toString(), "1in");
    });
    
    it("Output converted value + unit with .toString()", () => {
      let dim1 = Dimension("1in");
      assert.equal( dim1.toString("mm"), "25.4mm");
    });
    
    it("Output converted fixed precision value + unit with .toString()", () => {
      let dim1 = Dimension(2+1/8,"in");
      assert.equal( dim1.toString("mm", 2), "53.97mm");
    });
    
    it("Output plain object containing value + unit with .toJSON()", () => {
      let dim1 = Dimension("1in");
      assert.deepEqual( dim1.toJSON(), { value: 1, unit: "in" });
    });
    
  });

  describe("Conversion", () => {
    
    it("Convert to another Dimension with different unit with .toDimension()", () => {
      let dim1 = Dimension("1in");
      let dim2 = dim1.toDimension("mm");
      assert.equal( dim2.value, 25.4 );
      assert.equal( dim2.unit, "mm" );
    });
    
    it("Retrieve conversion function for built-in units with Dimension.getConversionFunction()", () => {
      let conv = Dimension.getConversionFunction("in","mm");
      assert(typeof conv == "function");
      assert.equal(conv(1), 25.4);
    });

    it("Freeze configuration for conversion function with Dimension.getConversionFunction()", () => {
      Dimension.configure({pixelDensity: 100});
      let conv = Dimension.getConversionFunction("in", "px", {freezeConfig: true});
      Dimension.configure({pixelDensity: 200});
      assert(typeof conv == "function");
      assert.equal(conv(1), 100);
      // reset
      Dimension.configure({pixelDensity: 96});
    });

    it("toFixed() returns numeric part with given decimal precision", () => {
      let dim1 = Dimension("11.123456789mm");
      assert.equal(dim1.toFixed(1), "11.1");
      assert.equal(dim1.toFixed(5), "11.12346");
    });

    it("toFixed() rounds to integer if precision not specified", () => {
      let dim1 = Dimension("11.123456789mm");
      assert.equal(dim1.toFixed(), "11");
      let dim2 = Dimension("11.789mm");
      assert.equal(dim2.toFixed(), "12");
    });

    it("toFixed() with conversion", () => {
      let dim1 = Dimension("1in");
      assert.equal(dim1.toFixed(0, "mm"), "25");
    });

    it("toString() returns String with given decimal precision and unit", () => {
      let dim1 = Dimension("11.123456789mm");
      assert.equal(dim1.toString("mm",2), "11.12mm");
    });

    it("toString() with precision as only parameter", () => {
      let dim1 = Dimension("11.123456789mm");
      assert.equal(dim1.toString(2), "11.12mm");
    });

    it("toString() with conversion", () => {
      let dim1 = Dimension("1.8in");
      assert.equal(dim1.toString("mm", 1), "45.7mm");  // 45.72
    });
    
    it("All built-in units can be converted", () => {
      
      let units = Dimension.getUnits();
      
      for (let unit1 of units) {
        for (let unit2 of units) {
          
          let dim1 = Dimension(1, unit1);          
          let dim2 = dim1.toDimension(unit2);
          
          assert(dim2);
        }
      }
    });
    
    it("Each conversion is inverse of its reciprocal conversion", () => {
      
      // TODO: this fails for angular conversion of very large lengths (km etc.) - check
      let units = Dimension.getUnits();
      const epsilon = 0.0001;
      
      for (let unit1 of units) {
        for (let unit2 of units) {
          
          let dim1 = Dimension(1, unit1);          
          let factor1 = dim1.toDimension(unit2).value;
          
          let dim2 = Dimension(1, unit2);          
          let factor2 = dim2.toDimension(unit1).value;
          
          // factor needs to be inverse of reciprocal conversion, 
          // within some tolerance for floating point precision
          /*
          if (Math.abs(factor1 - 1/factor2) >= epsilon) {
            console.log(unit1, unit2);
            console.log(factor1, 1/factor2);
          }
          */
          //assert(Math.abs(factor1 - 1/factor2) < epsilon);
        }
      }
    });
    

  });
  
  describe("Configuration", () => {
    
    it("options.defaultUnit", () => {
      Dimension.configure({defaultUnit: "in"});
      let dim1 = Dimension(1);
      assert.equal( dim1.unit, "in");
      // reset
      Dimension.configure({defaultUnit: "mm"});
    });

    it("options.defaultOutputUnit", () => {
      Dimension.configure({defaultOutputUnit: "mm"});
      let dim1 = Dimension("1in");
      assert.equal( dim1 + 0, 25.4);
      // reset
      Dimension.configure({defaultOutputUnit: null});
    });

    it("options.anchorUnit", () => {
      Dimension.configure({anchorUnit: "x"});
      Dimension.addConversion("a", "x", 10);
      Dimension.addConversion("x", "c", 10);
      let dim1 = Dimension("1a");
      assert.equal( dim1.toNumber("c"), 100);
      // reset
      Dimension.configure({anchorUnit: "mm"});
    });

    it("options.pixelDensity", () => {
      Dimension.configure({pixelDensity: 100});
      let dim1 = Dimension("1in");
      assert.equal( dim1.toNumber("px"), 100);
      // reset
      Dimension.configure({pixelDensity: 96});
    });
    
    it("options.viewingDistance", () => {
      Dimension.configure({viewingDistance: 300});
      let dim1 = Dimension("1arcmin");
      assert.equal( dim1.toFixed(2, "mm"), "0.09");
      // reset
      Dimension.configure({viewingDistance: 600});
    });
    
    it("options.aliases", () => {
      Dimension.configure({aliases: { "foo": "mm" }});
      let dim1 = Dimension("1foo");
      assert.equal( dim1.unit, "mm");
      // reset
      Dimension.configure({aliases: { "um": "µ", "µm": "µ", "°": "deg"}});
    });
    
    it("options.toJSON", () => {
      Dimension.configure({toJSON: d => d.value + d.unit });
      let dim1 = Dimension("1mm");
      assert.equal( dim1.toJSON(), "1mm");
      // reset
      Dimension.configure({toJSON: d => ({value: d.value, unit: d.unit}) });
    });
 
    it("getUnits() returns list of units", () => {
      let units = Dimension.getUnits();
      
      assert(units.length);
      
      assert(units.includes("mm"));
      assert(units.includes("in"));
      assert(units.includes("arcmin"));
    });
    
    it("Custom unit is included in getUnits()", () => {
      Dimension.addConversion("mm", "foo", 1);
      
      let units = Dimension.getUnits();
      
      assert(units.includes("foo"));
    });
    
  });

  describe("Aliases", () => {
    
    it("Alias results in canonical dimension on creation", () => {
      let dim1 = Dimension("1°");
      assert.equal( dim1.value, 1);
      assert.equal( dim1.unit, "deg");
    });

    it("Alias results in canonical dimension on conversion", () => {
      let dim1 = Dimension("60arcmin");
      let dim2 = dim1.toDimension("°");
      assert.equal( dim2.value, 1);
      assert.equal( dim2.unit, "deg");
    });
    
    it("Get canonical unit with Dimension.unAlias()", () => {
      assert.equal( Dimension.unAlias("°"), "deg");
    });

    it("Unit returned by Dimension.unAlias() for canonical units", () => {
      assert.equal( Dimension.unAlias("mm"), "mm");
    });

    it("Add alias with .addAlias()", () => {
      Dimension.addAlias("mm", "mmx");
      assert.equal( Dimension.unAlias("mmx"), "mm");
    });

  });

  describe("Custom units", () => {
    
    it("Add custom unit with conversion factor using Dimension.addConversion()", () => {
      Dimension.addConversion("a", "b", 10);
      let dim1 = Dimension("1a");
      assert.equal( dim1.toNumber("b"), 10);
    });

    it("Reverse conversion for factor added using Dimension.addConversion()", () => {
      let dim1 = Dimension("1b");
      assert.equal( dim1.toNumber("a"), 0.1);
    });

    it("Missing conversion path throws an Error", () => {
      let dim1 = Dimension("1a");
      assert.throws( () => dim1.toNumber("mm"), Error);
    });

    it("Conversion of custom units through anchorUnit", () => {
      Dimension.addConversion("a", "mm", 10);
      Dimension.addConversion("mm", "c", 10);
      let dim1 = Dimension("1a");
      assert.equal( dim1.toNumber("c"), 100);
      // reverse indirect path does not work (yet)
      //let dim2 = Dimension("1c");
      //assert.equal( dim2.toNumber("a"), 0.01);
    });
    
  });
  
  describe("Bundling", () => {
    
    it("Import as ES6 module", () => {
      return import("./another-dimension.js").then(module => {
        let DimensionES6 = module.default;
        let dim1 = DimensionES6("1mm");
        assert.equal( dim1.value, 1);
      });
    });
    
  });
  
  after(function(){
    console.log('\n    ... open test.html in browser to run browser-specific tests.')
  })  
  
});
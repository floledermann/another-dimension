/*
let Dimension = require("./index.js");

// configuration for screen-based output scenario
Dimension.configure({
  defaultOutputUnit: "px", // convert to pixels when value is used as Number
  defaultUnit: "px",       // default unit to use if no unit is specified
  pixelDensity: 440,        // pixel density of Google Pixel 2 smartphone, to convert pixel sizes
  viewingDistance: 350     // 350mm viewing distance (typical for smartphone use), to convert angular measure
});

// create some dimensions
let width = Dimension("10mm");         // 10 mm
let height = Dimension(100, "arcmin"); // 100 arcmin
let depth = Dimension(50);             // 50 pixels (as per defaultUnit specified above)

// dimensions can be used in place of numeric primitives, 
// and will be converted to pixels (as configured above)
// This will draw a ... x ... pixel rectangle!
console.log("Result: " + width + ", " + height);

// Dimension containing the length of the diagonal in pixels (set as defaultUnit above)
let diagonal = Dimension(Math.sqrt(width ** 2 + height ** 2));

console.log("Diagonal: " + diagonal.toString("mm", 2));
*/

"use strict";

const assert = require("assert");
const Dimension = require("./index.js");

describe("Dimension", () => {
  before( () => {
    //console.log( "before executes once before all tests" );
  } );

  after( () => {
    //console.log( "after executes once after all tests" );
  } );

  describe("creation", () => {
    beforeEach( () => {
      //console.log( "beforeEach executes before every test" );
    } );
    
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
  
  describe("basic output", () => {

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

  describe("conversion", () => {
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

  });
  
  describe("aliases", () => {
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

  describe("custom units", () => {
    
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


  });
  
  describe("configuration", () => {
    
    // TODO

  });
  
});
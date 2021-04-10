import assert from "assert";

import Dimension from "another-dimension";

describe("ES6 usage", () => {

  describe("Bundling", () => {
    
    it("Import as ES6 module using 'import' keyword", () => {
    
      assert(Dimension);
      
      let foo = Dimension("2in");
      assert.equal(foo.toString("mm"), "50.8mm"); 
      
    });
    
  });
  
});



import { readFile, writeFile } from 'fs/promises';

//console.log("building...");

let src = await readFile("another-dimension.js", "utf8");

// comment out CJS module assignment
src = src.replace(/^module\.exports/gm,"//module.exports");

// Build browser compatible file

// wrap in IIFE for direct use in browser without polluting the global scope
const header = `
(function() { 
`;

// allow for configurable global name
const footer = `
// Browser export
let globalName = "Dimension";

if (typeof window != "undefined" && typeof document != "undefined") {
  if (document.currentScript?.getAttribute) {
    globalName = document.currentScript.getAttribute("data-another-dimension-global") || globalName;
  }
  window[globalName] = Dimension;
}

})();
`;

await writeFile("another-dimension-browser.js", header + src + footer);

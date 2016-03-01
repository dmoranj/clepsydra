"use strict";

var fs = require('fs'),
    utils = require('./exampleUtils'),
    clepsydra = require('../lib/clepsydra.js');

function doResolve(fileContents){
    console.log(`
        Promised resolved with the following contents:

        ${fileContents}
        `);
}

function doReject(error) {
    console.log(`
        The following error was found: ${error}
        `);
}

let prom = clepsydra.bindToPromise(fs.readFile, './package.json', 'utf8'),
    prom2 =  clepsydra.bindToPromise(fs.readFile, './unexistent.json', 'utf8');

prom.then(doResolve, doReject);
prom2.then(doResolve, doReject);


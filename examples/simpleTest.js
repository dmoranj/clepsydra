"use strict";

var fs = require('fs'),
    utils = require('./exampleUtils'),
    clepsydra = require('../index.js');

function tabs(n) {
    var tabulation = '';

    for (var i=0; i < n; i++) {
        tabulation += '\t\t\t\t\t\t\t\t\t\t\t\t';
    }

    return tabulation;
}

function* timedThing(id) {
    console.log("[%s][%d] " + utils.tabs(id) + "Do the preparations", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Do the first step", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Do the second step", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Do the third step", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Do the fourth step", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Finish", clepsydra.getFormattedDate(), id);
    return;
}

var theThing,
    ts = [];

for (var i = 0; i < 5; i++) {
    theThing = timedThing(i);
    ts.push(new clepsydra.TimedEvent(theThing, new Date().getTime() + 10*1000 + 2000*i, null));
}

ts.map(clepsydra.push);

clepsydra.run(1000);

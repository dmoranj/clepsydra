"use strict";

var fs = require('fs'),
    utils = require('./exampleUtils'),
    clepsydra = require('../lib/clepsydra.js');

function* complexTimedThing(id) {
    let data,
        parsedData,
        newData,
        readPromise,
        writePromise;

    console.log("[%s][%d] " + utils.tabs(id) + "Reading the package.json file", clepsydra.getFormattedDate(), id);
    readPromise = clepsydra.bindToPromise(fs.readFile, './package.json', 'utf8');

    data = yield readPromise;

    console.log("[%s][%d] " + utils.tabs(id) + "Write to file", clepsydra.getFormattedDate(), id);
    parsedData = JSON.parse(data);

    newData = `
        This project has the following name

        The Absolutely Amazing ${parsedData.name}
        ---------------------------------------

        Using ECMAScript 6 from 2016.

        Edition ${id}

        `;

    writePromise = clepsydra.bindToPromise(fs.writeFile, `title_${id}.txt`, newData);
    yield writePromise;

    console.log("[%s][%d] " + utils.tabs(id) + "Finish", clepsydra.getFormattedDate(), id);
    return;
}

for (var i = 0; i < 5; i++) {
    clepsydra.push(new clepsydra.TimedEvent(complexTimedThing(i), new Date().getTime() + 10*1000 + 2000*i, null));
}

clepsydra.run(1000);

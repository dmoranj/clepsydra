"use strict";

var fs = require('fs'),
    utils = require('./exampleUtils'),
    request = require('request'),
    jsdom = require("jsdom"),
    clepsydra = require('../lib/clepsydra.js');

function doGet(url) {
    let options = {
        uri: url,
        method: 'GET'
    };

    return request.bind(null, options);
}

function parseHTML(data) {
    return jsdom.env.bind(null, data, ["http://code.jquery.com/jquery.js"]);
}

function* complexTimedThing(url) {
    let window,
        results;

    console.log(`[${clepsydra.getFormattedDate()}][${url}] Getting url`);
    results = yield doGet(url);

    console.log(`[${clepsydra.getFormattedDate()}][${url}] Parsing HTML for URL`);
    window = yield parseHTML(results[1]);

    console.log(`[${clepsydra.getFormattedDate()}][${url}] Finished`);
    return window.$("a").length;
}

let pages = [
    'https://www.meneame.net/'
];

for (let page of pages) {
    clepsydra.push(new clepsydra.TimedEvent(complexTimedThing(page), new Date().getTime() + 10*1000, null));
}

clepsydra.run(1000, function (error, results) {
    if (error) {
        console.log(`There was an error executing generators: ${error}`);
    } else {
        console.log('The result was:');

        for (let r of results) {
            console.log(`[${r[0]}]: ${r[1]}`);
        }

        return;
    }
});

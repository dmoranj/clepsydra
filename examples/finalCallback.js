"use strict";

var fs = require('fs'),
    utils = require('./exampleUtils'),
    exec = require('child_process').exec,
    async = require('async'),
    apply = async.apply,
    clepsydra = require('../lib/clepsydra.js');

function* getFiles() {
    let fileList,
        parsedList,
        returnValues;

    console.log(`[${clepsydra.getFormattedDate()}][LSPROC] Reading the file list`);
    fileList = yield exec.bind(null, "ls");
    parsedList = fileList.split('\n');

    console.log(`[${clepsydra.getFormattedDate()}][LSPROC] Modifying the file list`);
    yield;

    returnValues = parsedList
        .filter(e => e !== '')
        .map((e, i) => ([i, e]));

    console.log(`[${clepsydra.getFormattedDate()}][LSPROC] Finished`);
    return returnValues;
}

function* processFile(id, filename) {
    let fileType;

    console.log(`[${clepsydra.getFormattedDate()}][${id}] ${utils.tabs(id)} Examinating file ${filename}`);
    fileType = yield exec.bind(null, `file ${filename}`);

    return fileType;
}

function addToRunner(results, callback) {

    for (let r of results) {
        for (let pair of r[1]) {
            clepsydra.push(
                new clepsydra.TimedEvent(processFile(...pair), new Date().getTime() + pair[0]*1000 + 2000, null)
            );
        }
    }

    callback();
}

function finishProcessing(error, results) {
    for (let r of results) {
        console.log(`Process ${r[0]}: `);
        console.log(`Values: ${r[1]}`);
    }

    console.log('Execution of the runner finished');
    return;
}

clepsydra.push(new clepsydra.TimedEvent(getFiles(), new Date().getTime() + 3*1000 + 2000, null));

async.waterfall([
    apply(clepsydra.run, 1000),
    addToRunner,
    apply(clepsydra.run, 1000)
], finishProcessing);
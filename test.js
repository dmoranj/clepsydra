"use strict";

var timedEventsList = new Map(),
    fs = require('fs'),
    idCounter = 1;

class TimedEvent {
    constructor(generator, start, freq, end) {
        this.generator = generator;
        this.start = start;
        this.freq = freq;
        this.end = end;
        this.lastAction = new Date().getTime();
        this.startingTime = this.lastAction;
        this.status = Symbol.for('READY');
        this.asyncValue = null;
    }

    setStatus(newStatus) {
        this.status = newStatus;
    }

    setResult(newResult) {
        this.asyncValue = newResult;
        this.setStatus(Symbol.for('READY'));
    }

    next() {
        var currentTime = new Date().getTime(),
            ret;

        if (this.end && this.end > currentTime) {
            ret = this.generator.throw(new Error("TIMED_OUT"));
        } else {
            this.lastAction = new Date().getTime();
            ret = this.generator.next(this.asyncValue);
        }

        return ret;
    }

    get isReady() {
        return (new Date().getTime() > this.start) && (this.status === Symbol.for('READY'));
    }
}

function getNextId() {
    return idCounter++;
}

function getFormattedDate(){
    return (new Date()).toISOString();
}

function run(frequency) {
    var intervalId;

    intervalId = setInterval(function() {
        timedEventsList.forEach(function(timedEvent, key) {
            var returnValue;

            if (timedEvent.isReady) {
                returnValue = timedEvent.next();

                if (returnValue.done) {
                    timedEventsList.delete(key);
                } else if (typeof returnValue.value === 'function') {
                    timedEvent.setStatus(Symbol.for('ASYNC'));

                    returnValue.value((error, value) => {
                        timedEvent.setResult(value);
                    });

                } else {
                    timedEvent.setStatus(Symbol.for('READY'));
                }
            }
        });

        if  (timedEventsList.size === 0) {
            clearInterval(intervalId);
        }
    }, frequency);
}

function push(timedEvent) {
    timedEventsList.set(getNextId(), timedEvent);
}

// Example
//-----------------------------------------------------------------------------------------------

function tabs(n) {
    var tabulation = '';

    for (var i=0; i < n; i++) {
        tabulation += '\t\t\t\t\t\t\t\t\t\t\t\t';
    }

    return tabulation;
}

function* timedThing(id) {
    console.log("[%s][%d] " + tabs(id) + "Do the preparations", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + tabs(id) + "Do the first step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + tabs(id) + "Do the second step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + tabs(id) + "Do the third step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + tabs(id) + "Do the fourth step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + tabs(id) + "Finish", getFormattedDate(), id);
    return;
}

function* complexTimedThing(id) {
    var data,
        parsedData,
        newData;

    console.log("[%s][%d] " + tabs(id) + "Reading the package.json file", getFormattedDate(), id);
    data = yield fs.readFile.bind(null, './package.json', 'utf8');

    console.log("[%s][%d] " + tabs(id) + "Write to file", getFormattedDate(), id);
    parsedData = JSON.parse(data);

    newData = `
        This project has the following name

        The Absolutely Amazing ${parsedData.name}
        ---------------------------------------

        Using ECMAScript 6 from 2016.

        Edition ${id}

        `;

    yield fs.writeFile.bind(null, `title_${id}.txt`, newData);

    console.log("[%s][%d] " + tabs(id) + "Finish", getFormattedDate(), id);
    return;
}

var theThing,
    ts = [];

for (var i = 0; i < 5; i++) {
    theThing = complexTimedThing(i);
    ts.push(new TimedEvent(theThing, new Date().getTime() + 10*1000 + 2000*i, null));
}

ts.map(push);
run(1000);

"use strict";

var timedEventsList = new Map(),
    idCounter = 1;

class TimedEvent {
    constructor(generator, start, freq, end) {
        this.generator = generator;
        this.start = start;
        this.freq = freq;
        this.end = end;
        this.lastAction = new Date().getTime();
        this.startingTime = this.lastAction;
        this.generator.next();
    }

    next() {
        var currentTime = new Date().getTime(),
            ret;

        if (this.end && this.end > currentTime) {
            ret = this.generator.throw(new Error("TIMED_OUT"));
        } else {
            this.lastAction = new Date().getTime();
            ret = this.generator.next();
        }

        return ret.done;
    }

    get isReady() {
        return new Date().getTime() > this.start;
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
        timedEventsList.forEach(function(value, key) {
            var finished = false;

            if (value.isReady) {
                finished = value.next();

                if (finished) {
                    timedEventsList.delete(key);
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

var theThing,
    ts = [];

for (var i = 0; i < 5; i++) {
    theThing = timedThing(i);
    ts.push(new TimedEvent(theThing, new Date().getTime() + 10*1000 + 2000*i, null));
}

ts.map(push);
run(1000);

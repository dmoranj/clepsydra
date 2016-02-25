"use strict";

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

function getFormattedDate(){
    return (new Date()).toISOString();
}

function* timedThing(id) {
    console.log("[%s][%d] Do the preparations", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] Do the first step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] Do the second step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] Do the third step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] Do the fourth step", getFormattedDate(), id);
    yield;
    console.log("[%s][%d] Finish", getFormattedDate(), id);
    return;
}

function run(frequency, timed) {
    var intervalId;

    intervalId = setInterval(function() {
        var finished = timed.next();

        if  (finished) {
            clearInterval(intervalId);
        }
    }, frequency);
}

var theThing = timedThing(1),
    t1 = new TimedEvent(theThing, new Date().getTime() + 30*1000, null);



run(2000, t1);

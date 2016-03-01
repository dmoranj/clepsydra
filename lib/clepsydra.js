'use strict';

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
        let currentTime = new Date().getTime(),
            ret;

        if (this.end && this.end > currentTime) {
            ret = this.generator.throw(new Error('TIMED_OUT"'));
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
    let intervalId;

    intervalId = setInterval(function() {
        timedEventsList.forEach(function(timedEvent, key) {
            let returnValue;

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
    let currentId = getNextId();
    timedEventsList.set(currentId, timedEvent);
    return currentId;
}

exports.push = push;
exports.getFormattedDate = getFormattedDate;
exports.TimedEvent = TimedEvent;
exports.run = run;
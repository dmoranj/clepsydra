# Clepsydra

## Index

* [Overview](#overview)
* [Usage](#usage)
* [API Specification] (#api)

##  <a name="usage"/> Overview

Clepsydra is a library for the creation of timed events, based on ECMAScript 6 generators. The target is to allow the
developer to write synchronous-like code that can be executed asynchronously and with time constraints such as:

- It must not start executing before its Start Date.
- It must finish before the End Date (or a TIMEOUT Exception must be thrown in the code, that should force
the execution of the error callback).
- Steps in the code must be executed in time slots.
- It should be allowed to yield the execution to asynchronous tasks, returning to the execution point in the next
time slot.
- It should integrate easily with callbacks and promises.

*Disclaimer*: this library was originally meant to be used as a didactic project to practice and learn ECMAScript 6 features,
so no support is given or expected regarding its use in production systems. For the same reason, all the provided
examples, as well as the library itself run only under Node.js v5.7.0 or higher, with the `--es_staging` flag.

This library is release under the GNU AFFERO GENERAL PUBLIC LICENSE a copy of which you can find in this same repository.

##  <a name="usage"/> Usage
### Overview

The library offers a set of functions used to run Timed Events; new events are added to the event queue, and, when the
`run()` function is executed, they are executed following their time constraints.

The process of adding and executing Timed Events is as follows:
```javascript

clepsydra.push(timedEvent1);

    [ ... ]

clepsydra.push(timedEventN);

clepsydra.run(1000);
```
The `run()` function takes a single argument with the default frequency of the runner. Yielded steps will synchronize
to this frequency unless a lower frequency is defined for its Timed Event. The default frequency will always be the
highest one in the runner.

### Timed Events
Timed events are generators whose execution will start at a certain point in time, and that will yield periodically
with the periodicity set up in the library.

Timed Events are created as instances of the `TimedEvent` class, whose constructor takes the following parameters:

- Generator function to call.
- Time when it will start executing.
- An optional frequency.
- An optional force ending time.
- An optional callback.

The generator used to create the Timed Event is a standard ECMAScript 6 generator, but there are some special rules
regarding how the yield command is executed.

The `yield` command in the generator used to create a Timed Event has some particular behavior, defined by the following
rules:
- If the `yield` sentence doesn't yield any value, the execution of the generator is paused until the next time slot.
- If the `yield` sentence yields a value, and this value is a function, the runner will consider this function to be a
function with a single argument, being this argument a standard Node.js callback (with an initial `error` parameter, that
can be `null`, and any number of parameters). This function will be invoked asynchronously; when the function returns,
execution of the generator will be resumed, passing the callback parameters to the function (a single element if there
is only one parameter, and an array if they are many). If an error is returned in the callback, the same error will be
thrown to the generator.
- If the `yield` sentence yields a Promise, the execution will be resumed when the promise is fulfilled, following the
same rules as the previous callback case.
- If the `yield` sentence yields a value that doesn't belong to any of the previous categories, it is ignored and
considered as it was passed a constant.

Here is an example of how a Timed Event is created:

```javascript
function* timedThing(id) {
    console.log("[%s][%d] " + utils.tabs(id) + "Do the preparations", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Do the first step", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Do the second step", clepsydra.getFormattedDate(), id);
    yield;
    console.log("[%s][%d] " + utils.tabs(id) + "Finish", clepsydra.getFormattedDate(), id);
    return;
}

const p2 = new TimedEvent(myTimedEvent, new Date().getTime() + 30*1000)
```

In the example shown, the `timedThing` generator prints a set of strings in the console, yielding the control between
prints; the execution of the generator will start in `now + 30s`. Lines will be printed with a the standard frequency
specified in the library executor.

This other example shows how to yield asynchronous tasks:
```javascript
function* complexTimedThing(id) {
    var data,
        parsedData,
        newData;

    console.log("[%s][%d] " + utils.tabs(id) + "Reading the package.json file", clepsydra.getFormattedDate(), id);
    data = yield fs.readFile.bind(null, './package.json', 'utf8');

    console.log("[%s][%d] " + utils.tabs(id) + "Write to file", clepsydra.getFormattedDate(), id);
    parsedData = JSON.parse(data);

    newData = `
        This project has the following name

        The Absolutely Amazing ${parsedData.name}
        ---------------------------------------

        Using ECMAScript 6 from 2016.

        Edition ${id}

        `;

    yield fs.writeFile.bind(null, `title_${id}.txt`, newData);

    console.log("[%s][%d] " + utils.tabs(id) + "Finish", clepsydra.getFormattedDate(), id);
    return;
}
```

In this case, the execution

##  <a name="api"/> API Specification

### Classes

### Functions

#### push(timedEvent)
Add a Timed Event to the list of events. It returns the ID assigned to the Timed Event in the event list.

#### run(frequency, [callback])
Executes all the Timed Events in the event list. It takes two parameters:

* `frequency`: indicating the default frequency for the runner.
* `callback`: this callback will be invoked with a map of the results of all the executed Timed Event, or with an error
if there was any.






#  <a name="usage"/> Usage
## Timed Events
Timed events are generators whose execution will start at a certain point in time, and that will yield periodically
with the periodicity set up in the library. They can be started periodically, and when they are, they may overlap.

Timed Events are created based on the TimedEvent() class, whose constructor takes the following parameters:

- Generator function to call.
- Time when it will start executing.
- An optional frequency.
- An optional force ending time.

Here is an example of how a Timed Event is created:
```


const p2 = new TimedEvent(myTimedEvent, new Date().getTime() + 30*1000, null)
```

## Functions
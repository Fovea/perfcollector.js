perfcollector.js
================

Simple performance measurement tool for javascript.

Simple usage
------------

    // Initialize a performance collector, enable it.
    var perfs = PerfCollector.create().enable();

    // Collect statistics about the execution of stuff().
    perfs.start('stuff');
    stuff();
    perfs.end('stuff);

    perfs.logToConsole();

Alternative synthax
-------------------

    var timer = perfs.start('stuff');
    timer.end();
    // or perfs.end(timer);

Analyze the stats
-----------------

PerfCollector gives access to the number of time a given timer has been called,
the total time, average time and max time spend doing the action.

    > perfs.stats
    { 'doStuff()': 
        { calls: 500,
          totalMs: 975,
          maxMs: 8,
          averageMs: 1.95,
          lastMs: 2 },
      'asyncLoop()': 
        { calls: 5,
          totalMs: 2967,
          maxMs: 982,
          averageMs: 593.4,
          lastMs: 982 } }

*stats* is a dictionnary whose key are the name of the timers, and values
a set of statistics:

 - *calls* - number of calls
 - *totalMs* - total time spend in this timer (in millseconds)
 - *averageMs* - average time spend in this timer (in millseconds)
 - *maxMs* - max time spend in this timer (in millseconds)
 - *lastMs* - time spend during the last call (in millseconds)

Disable
-------
When PerfCollector is disabled, all function calls do pretty much nothing at all.
Also note that a newly create PerfCollector is disabled by default.

To enable a PerfCollector: `perf.enable()` or `perf.enable(true)`

To disable a PerfCollector: `perf.disable()` or `perf.enable(false)`

Advanced usage
--------------

###Asynchronous functions

    // Keep a reference to the timer (because maybe multiple ajaxXYZ
    // are running in parralel, so it's important to know which
    // one we measure).
    var timer = perfs.start('ajaxXYZ');
    
    ajaxXYZ(function () {
        // The asynchronous request is done, finish the timer
        timer.end();
    });

###Name the timer at the end

    // Start an anonymous timer
    var timer = perfs.start();

    // Perform an action
    var success = doStuff();

    // End the timer, give it a name depending on what happened.
    if (success)
        perfs.end(timer, 'doStuff:success');
    else
        perfs.end(timer, 'doStuff:error');
    
    // Also possible to write timer.end('doStuff:success')

###Live stats
    
   function foo () {
       
       // Start a timer
       var fooTimer = perfs.start('foo');
       
       // ... do your stuff
        
       // Stop the timer and display statistics to the console.
       fooTimer.end().logToConsole();
   }

###Reuse a timer in a loop

    var timer = perf.timer('syncStuff()');
    for (var i = 0; i < 100; ++i) {
        timer.start();
        syncStuff();
        timer.end();
    }

###Use your own time source

    perf.start('stuff', myAPI.now());
    
    // ... do your stuff
    
    perf.end('stuff', myAPI.now());

Licence
-------

(c) 2013, Jean-Christophe Hoelt, Fovea.cc

Jackbone is available for use under the MIT software license.

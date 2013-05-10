// Load PerfCollector module, initialize one instance and enable it!
var PerfCollector = require('../perfcollector');
var perf = new PerfCollector.Timer().enable();

// stupid time eating method
function heavyStuff () {
    var number = 1;
    for (var i = 0; i < 1000000; ++i) {
        number += i*i;
    }
    return number;
}

// do some stuff, including the heavyStuff.
function doStuff () {

    // Start the timer
    var timer = perf.start('doStuff()');

    // Do stuff
    heavyStuff();

    // Stop the timer
    timer.end();
}

// an async method we wish to benchmark as well.
function asyncLoop(callback) {
    setTimeout(function () {
        for (var i = 0; i < 100; ++i) {
            doStuff();
        }
        callback();
    }, 0);
}

// perform a set of asynchronous operations.
function manyAsyncLoops(callback) {

    var count = 0;
    var done = function () {
        if (++count == 5) {
            callback();
        }
    };

    for (var i = 0; i < 5; ++i) {

        // Here we have to keep the reference to our
        // timer, in order to stop it when the operation
        // is done.
        var loopTimer = perf.start();

        asyncLoop(function () {

            // Notice that you can give a name to your timer
            // at the beggining or at the end. Sometimes useful.
            loopTimer.end('asyncLoop()');
            done();
        });
    }
}

// Run through the stats, display on the console.
function showStats (perf) {
    for (var name in perf.stats) {
        var stat = perf.stats[name];
        console.log(name + ': ' + stat.calls + ' calls, total: ' + stat.totalMs + 'ms, average:' + stat.averageMs + 'ms, max:' + stat.maxMs + 'ms');
    }
}

// Run a few loops, then show the result.
manyAsyncLoops(function () {
    showStats(perf);
});

// Load PerfCollector module, initialize one instance and enable it!
var PerfCollector = require('../perfcollector');
var perf = PerfCollector.create().enable();

// stupid time eating method
function syncStuff () {
    var number = 1;
    for (var i = 0; i < 1000000; ++i) {
        number += i*i;
    }
    return number;
}

// an async method we wish to benchmark as well.
function asyncStuff(callback) {

    // Here we have to keep the reference to our
    // timer, in order to stop it when the operation
    // is done.
    var loopTimer = perf.start();
    setTimeout(function () {
        // Notice that you can give a name to your timer
        // at the beggining or at the end. Sometimes useful.
        loopTimer.end('asyncStuff()');
        callback();
    }, 100);
}

// perform a set of asynchronous operations.
function manyAsync(callback) {

    var count = 0;
    var done = function () {
        if (++count == 5) {
            callback();
        }
    };

    for (var i = 0; i < 5; ++i) {
        asyncStuff(function () {
            done();
        });
    }
}

// Run a few loops, then show the result.

perf.start('main');

var timer = perf.timer('syncStuff()');
for (var i = 0; i < 100; ++i) {
    timer.start();
    syncStuff();
    timer.end();
}
manyAsync(function () {
    perf.end('main').logToConsole();
});

perfs = perf;

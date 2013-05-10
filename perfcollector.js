//     perfcollector.js 0.1.0

//     (c) 2013, Jean-Christophe Hoelt, Fovea.cc
//     perfcollector may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://www.fovea.cc/perfcollector/
(function () {
    'use strict';

    // Save a reference to the global object (`window` in the browser, `exports`
    // on the server).
    var root = this;

    // The top-level namespace. All public methods will
    // be attached to this. Exported for both the browser and the server.
    var PerfCollector;
    if (typeof exports !== 'undefined') {
        PerfCollector = exports;
    } else {
        PerfCollector = root.PerfCollector = {};
    }

    PerfCollector.VERSION = '0.1.0';

    // Retrieve the high-performance time counter.
    var performance = root.performance || {};
    performance.now = (function() {
        return performance.now       ||
               performance.mozNow    ||
               performance.msNow     ||
               performance.oNow      ||
               performance.webkitNow ||
               function() { return new Date().getTime(); };
        })();

    // perfcollector
    // -------------
    //
    // Allows you to profile time to perform certain actions
    // Used by the Router to profile view creation times.
    //
    // Set Jackbone.profile.enabled = true to activate.
    var Timer = PerfCollector.Timer = function () {

        // Set to true to enable profiling your views.
        this.enabled = false;

        // Dictionary of statistics
        this.stats = {};

        // Currently running timers
        this._startDate = {};

        // Name on console.profile
        this._timerConsoleName = {};
    };

    // Called at the beggining of an operation
    Timer.prototype.start = function (t, timerName) {
        if (this.enabled) {
            var id = _.uniqueId('jt');
            this._startDate[id] = t || performance.now();
            if (console.profile && timerName) {
                this._timerConsoleName[id] = timerName;
                console.profile(timerName);
            }
            return id;
        }
    };

    // Called when an operation is done.
    //
    // Will update Jackbone.profiler.stats and show average duration on the
    // console.
    Timer.prototype.end = function (timerId, timerName, t) {
        if (this.enabled) {
        if (this._startDate[timerId]) {
            var duration = (t || performance.now()) - this._startDate[timerId];
            delete this._startDate[timerId];

            if (console.profile) {
                if (this._timerConsoleName[timerId]) {
                    console.profileEnd(this._timerConsoleName[timerId]);
                    delete this._timerConsoleName[timerId];
                }
            }

            // Already have stats for this method? Update them.
            if (typeof this.stats[timerName] !== 'undefined') {
                var stats = this.stats[timerName];
                stats.calls += 1;
                stats.totalMs += duration;
                if (duration > stats.maxMs) {
                    stats.maxMs = duration;
                }
            }
            else {
                // It's the first time we profile this method, create the
                // initial stats.
                this.stats[timerName] = {
                    calls: 1,
                    totalMs: duration,
                    maxMs: duration
                };
            }

            console.log('time(' + timerName + ') = ' + duration + 'ms');
            }
            else {
                console.log('WARNING: invalid profiling timer');
            }
        }
    };

}).call(this);

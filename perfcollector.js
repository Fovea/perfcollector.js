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
        this._timersByName = {};
    };

    Timer.prototype.enable = function (status) {
        if (status !== false)
            status = true;
        this.enabled = status;
    };

    // Called at the beggining of an operation
    Timer.prototype.start = function (t, timerName) {
        var startDate;
        var ret = {};

        if (this.enabled) {
            if (typeof t === 'string') {
                timerName = t;
                t = undefined;
            }
            if (timerName) {
                if (console.profile) {
                    console.profile(timerName);
                }
                this._timersByName[timerName] = ret;
            }

            startDate = t || performance.now();
        }

        var that = this;
        
        ret.name = timerName;
        ret.startDate = startDate;
        ret.end = function (t, timerName) {
            that.end(this, t, timerName);
        };
        ret.stats = function () {
            return that.stats[timerName];
        };

        return ret;
    };

    // Called when an operation is done.
    //
    // Will update Jackbone.profiler.stats and show average duration on the
    // console.
    Timer.prototype.end = function (timer, t, timerName) {
        if (this.enabled) {
            if (typeof timer === 'string') {
                timer = this._timersByName[timer];
            }

            if (timer && typeof timer.startDate !== 'undefined') {

                if (typeof t === 'string') {
                    timerName = t;
                    t = undefined;
                }

                var duration = (t || performance.now()) - timer.startDate;

                var originalName = timer.name;
                if (originalName) {
                    delete this._timersByName[originalName];
                    if (!timerName) {
                        timerName = originalName;
                    }
                }

                if (console.profile && originalName) {
                    console.profileEnd(originalName);
                }

                // Already have stats for this method? Update them.
                if (typeof this.stats[timerName] !== 'undefined') {
                    var stats = this.stats[timerName];
                    stats.calls += 1;
                    stats.totalMs += duration;
                    if (duration > stats.maxMs) {
                        stats.maxMs = duration;
                    }
                    stats.averageMs = stats.totalMs / stats.calls;
                }
                else {
                    // It's the first time we profile this method, create the
                    // initial stats.
                    this.stats[timerName] = {
                        calls: 1,
                        totalMs: duration,
                        maxMs: duration,
                        averageMs: duration
                    };
                }

                console.log('time(' + timerName + ') = %dms', duration);
            }
            else {
                console.log('WARNING: invalid profiling timer');
                console.log(arguments);
            }
        }
    };

}).call(this);

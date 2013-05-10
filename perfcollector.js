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

    // Retrieve the highest-precision time counter.
    var performance = root.performance || {};

    // For node, use process.hrtime is available
    if (root.process && root.process.hrtime) {
        performance.now = function () {
            var t = process.hrtime();
            return t[0] * 1000 + t[1] / 1000000;
        };
    }
    // For browsers, use performance.now or Date.
    else {
        performance.now = (function() {
            return performance.now       ||
                performance.mozNow    ||
                performance.msNow     ||
                performance.oNow      ||
                performance.webkitNow ||
                function() { return new Date().getTime(); };
            })();
    }

    // perfcollector
    // -------------
    //
    // Allows you to profile time to perform certain actions
    // Used by the Router to profile view creation times.
    //
    // Set Jackbone.profile.enabled = true to activate.
    var Klass = function () {

        // Set to true to enable profiling your views.
        this.enabled = false;

        // Dictionary of statistics
        this.stats = {};

        // Currently running timers
        this._timersByName = {};
    };

    Klass.prototype.enable = function (status) {
        if (status !== false)
            status = true;
        this.enabled = status;
        return this;
    };

    Klass.prototype.disable = function () {
        this.enabled = false;
        return this;
    };

    var timerStart = function (t) {
        // Start over an already used timer.
        this.startDate = t || performance.now();
        return this;
    };
    var timerEnd = function (t, timerName) {
        this.klass.end(this, t, timerName);
        return this;
    };
    var timerStats = function () {
        return this.klass.stats[this.name] || {
            calls: 0,
            totalMs: 0,
            averageMs: 0,
            maxMs: 0,
            lastMs: 0
        };
    };
    var timerLogToConsole = function () {
        var stat = timerStats.call(this);
        if (stat) {
            console.log(this.name + ': ' + stat.calls + ' calls, total: ' + stat.totalMs + 'ms, avg:' + stat.averageMs + 'ms, max:' + stat.maxMs + 'ms');
        }
        return this;
    };

    // Called at the beggining of an operation
    Klass.prototype.start = Klass.prototype.timer = function (t, timerName) {
        var startDate;
        var timer = {};

        if (this.enabled) {
            if (typeof t === 'string') {
                timerName = t;
                t = undefined;
            }
            if (timerName) {
                if (!this._timersByName[timerName]) {
                    if (console.profile) {
                        console.profile(timerName);
                    }
                    this._timersByName[timerName] = timer;
                }
            }

            timer.startDate = t || performance.now();
        }

        timer.klass = this;
        timer.name = timerName;
        timer.end = timerEnd;
        timer.stats = timerStats;
        timer.logToConsole = timerLogToConsole;
        timer.start = timerStart;

        return timer;
    };

    // Called when an operation is done.
    //
    // Will update Jackbone.profiler.stats and show average duration on the
    // console.
    Klass.prototype.end = function (timer, t, timerName) {

        if (this.enabled) {
            if (typeof timer === 'string') {
                timerName = timer;
                timer = this._timersByName[timer];
            }

            if (timer && typeof timer.startDate !== 'undefined') {

                if (typeof t === 'string') {
                    timerName = t;
                    t = undefined;
                }

                var now = (t || performance.now());
                var duration = now - timer.startDate;

                var originalName = timer.name;
                if (originalName) {
                    if (this._timersByName[originalName]) {
                        delete this._timersByName[originalName];
                        if (console.profile) {
                            console.profileEnd(originalName);
                        }
                    }
                    if (!timerName) {
                        timerName = originalName;
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
                    stats.averageMs = stats.totalMs / stats.calls;
                    stats.lastMs = duration;
                }
                else {
                    // It's the first time we profile this method, create the
                    // initial stats.
                    this.stats[timerName] = {
                        calls: 1,
                        totalMs: duration,
                        maxMs: duration,
                        averageMs: duration,
                        lastMs: duration
                    };
                }

                // console.log('time[' + timerName + '] = ' + duration + 'ms');
                timer.startDate = undefined;
                timer.name = timerName;
                // return timer;
            }
            else {
                if (!timer) {
                    console.warn('PerfCollector: Invalid timer');
                }
                else {
                    console.warn('PerfCollector: Timer already ended');
                    // return timer;
                }
            }
        }

        return this;
        /*

        // Return a dummy object.
        if (typeof timerName !== 'string') {
            if (typeof timer === 'string') {
                timerName = timer;
            }
            if (typeof t === 'string') {
                timerName = t;
            }
        }

        return {
            klass: this,
            name: timerName,
            stats: timerStats,
            logToConsole: timerLogToConsole
        }; */
    };

    // Run through the stats, display on the console.
    Klass.prototype.logToConsole = function () {
        for (var name in this.stats) {
            var stat = this.stats[name];
            console.log(' - ' + name + ': ' + stat.calls + ' calls, total: ' + stat.totalMs + 'ms, avg:' + stat.averageMs + 'ms, max:' + stat.maxMs + 'ms');
        }
    }

    // Our public API
    // --------------

    // Library version
    PerfCollector.VERSION = '0.1.0';

    // Create a new perf collector
    PerfCollector.create = function () {
        return new Klass();
    };

    PerfCollector.now = function () {
        return performance.now();
    };

    return PerfCollector;

}).call(this);

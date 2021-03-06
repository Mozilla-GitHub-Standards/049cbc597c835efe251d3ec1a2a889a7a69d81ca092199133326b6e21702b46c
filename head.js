/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This file defines the commonly-used functionality needed by a stone ridge
 * test suite. This must be run under xpcshell running in JS v1.8 mode.
 */

/*jshint curly:true, indent:4, latedef:true, undef:true,
  trailing:true, es5:true, esnext:true*/
/*global Components:true, run_test:true, _SR_OUT_FILE:true,
  do_save_results:true*/

var STONERIDGE_FINISHED = null;

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cr = Components.results;

/*
 * This is used to indicate that the tests are done. Now that we know we're
 * done, we can write the results to disk for the python harness to do its thing
 * with.
 */
function do_test_finish() {
    STONERIDGE_FINISHED = true;
}

/*
 * This is only here for symmetry with xpcshell unit tests, stone ridge assumes
 * everything it runs is going to be asynchronous.
 */
function do_test_pending() {}

function make_channel(url) {
    var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    return ios.newChannel(url, "", null);
}

/*
 * The main entry point for all stone ridge tests
 */
function do_stoneridge() {
    STONERIDGE_FINISHED = false;

    run_test();

    // Pump the event loop until we're told to stop
    var thread = Cc["@mozilla.org/thread-manager;1"].getService().currentThread;
    while (!STONERIDGE_FINISHED) {
        thread.processNextEvent(true);
    }
    while (thread.hasPendingEvents()) {
        thread.processNextEvent(true);
    }

    do_save_results(_SR_OUT_FILE);
}

/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This file defines the commonly-used functionality needed by a stone ridge
 * test suite. This must be run under xpcshell running in JS v1.8 mode.
 */

var STONERIDGE_FINISHED = null;
var STONERIDGE_RESULTS = null;

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cr = Components.results;

/*
 * Store some results for writing once we're all done
 */
function do_write_result(key, start, stop) {
  var val = {'start':start, 'stop':stop, 'total':stop - start};

  if (STONERIDGE_RESULTS.hasOwnProperty(key)) {
    STONERIDGE_RESULTS[key].push(val);
  } else {
    STONERIDGE_RESULTS[key] = [val];
  }
}

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

function _do_save_results(output_filename) {
  var ofile = Cc["@mozilla.org/file/directory_service;1"].
              getService(Ci.nsIProperties).
              get("TmpD", Ci.nsILocalFile);

  // And use the file determined by our caller
  ofile.append(output_filename);

  // Now get an output stream for our file
  var ostream = Cc["@mozilla.org/network/file-output-stream;1"].
                createInstance(Ci.nsIFileOutputStream);
  ostream.init(ofile, -1, -1, 0);

  var jstring = JSON.stringify(STONERIDGE_RESULTS);
  ostream.write(jstring, jstring.length);
  ostream.close();
}

function make_channel(url) {
  var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  return ios.newChannel(url, "", null);
}

/*
 * The main entry point for all stone ridge tests
 */
function do_stoneridge(output_filename) {
  STONERIDGE_FINISHED = false;
  STONERIDGE_RESULTS = {};

  run_test();

  // Pump the event loop until we're told to stop
  var thread = Cc["@mozilla.org/thread-manager;1"].
               getService().currentThread;
  while (!STONERIDGE_FINISHED)
    thread.processNextEvent(true);
  while (thread.hasPendingEvents())
    thread.processNextEvent(true);

  _do_save_results(output_filename);
}

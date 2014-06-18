/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Open in Browser extension.
 *
 * The Initial Developer of the Original Code is
 * Sylvain Pasche <sylvain.pasche@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const MAX_INTERCEPT_TIME = 10000;

const EXAMINE_TOPIC = "http-on-examine-response";
const EXAMINE_MERGED_TOPIC = "http-on-examine-merged-response";

const DEBUG = false;

const { Services } = Cu.import("resource://gre/modules/Services.jsm", {});
const { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm", {});
const { LoadContextInfo } = Cu.import("resource://gre/modules/LoadContextInfo.jsm", {});


/**
 * This object stores information which will be used for intercepting URL's
 */
function InterceptedInfo(url, mime) {
  this.url = url;
  this.mime = mime;
}

function debug(msg) {
  if (DEBUG)
    dump(msg + "\n");
}

/**
 * The service
 */
function OpenInBrowser() {
  this.wrappedJSObject = this;

  this._interceptedInfos = [];
}

OpenInBrowser.prototype = {
  classDescription: "Open in browser Javascript XPCOM Component",
  classID: Components.ID("{14aa9340-c449-4956-a5f9-a52fb32f933d}"),
  contractID: "@spasche.net/openinbrowser;1",

  // Clear cache entry using the new cache2 service, introduced in Firefox 32.
  _clearCacheEntryV2: function OIB__clearCacheEntryV2(url, callback) {

    function doomURL(storage, url, callback) {
      storage.asyncDoomURI(Services.io.newURI(url, null, null), "", {
        onCacheEntryDoomed: function(result) {
          debug("onCacheEntryDoomed result for url '" + url + "': " + result);
          callback();
        }
      });
    }

    try {
      let diskStorage = Services.cache2.diskCacheStorage(LoadContextInfo.default, false);
      doomURL(diskStorage, url, function() {
        let memoryStorage = Services.cache2.memoryCacheStorage(LoadContextInfo.default);
        doomURL(memoryStorage, url, callback);
      });

    } catch (e) {
      debug("Exception during cache clearing: " + e);
      callback();
    }
  },

  _clearCacheEntry: function OIB__clearCacheEntry(url, callback) {
    let httpCacheSession;
    try {
      httpCacheSession = Services.cache.createSession("HTTP", 0, true);
    } catch (ex) {
      debug("Trying to clear cache entry using cache2 service");
      return this._clearCacheEntryV2(url, callback);
    }
    httpCacheSession.doomEntriesIfExpired = false;
    try {
      let cacheKey = url.replace(/#.*$/, "");

      let clearEntryListener = {
        onCacheEntryAvailable: function(entry, access, status) {
          try {
            entry.doom();
            entry.close();
          } catch (e) {
            debug("Exception during entry clearing: " + e);
          }
          callback();
        }
      };

      httpCacheSession.asyncOpenCacheEntry(cacheKey, Ci.nsICache.ACCESS_READ_WRITE, clearEntryListener, false);
    } catch (e) {
      debug("Exception during cache clearing: " + e);
      callback();
    }
  },

  addInterceptInfo: function OIB_addInterceptInfo(url, mime) {
    debug("Added intercept info " + url);

    let self = this;
    this._clearCacheEntry(url, function() {
      self._interceptedInfos.push(new InterceptedInfo(url, mime));
      if (self._interceptedInfos.length == 1) {
        self._startCapture();
      }

      // remove intercepted url's after a while in case the observer is not triggered
      let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
      let callback = {
        notify: function notifyCallback(timer) {
          self._removeInterceptedInfo(url);
        }
      };
      timer.initWithCallback(callback, MAX_INTERCEPT_TIME, Ci.nsITimer.TYPE_ONE_SHOT);
    });
  },

  _startCapture: function OIB__startCapture() {
    debug("Start capture");
    Services.obs.addObserver(this, EXAMINE_TOPIC, false);
    Services.obs.addObserver(this, EXAMINE_MERGED_TOPIC, false);
  },

  _stopCapture: function OIB__stopCapture() {
    Services.obs.removeObserver(this, EXAMINE_TOPIC);
    Services.obs.removeObserver(this, EXAMINE_MERGED_TOPIC);
    debug("capture stopped");
  },

  _getInterceptedInfo: function OIB__getInterceptedInfo(url) {
    for (let i = 0; i < this._interceptedInfos.length; i++) {
      if (this._interceptedInfos[i].url == url)
        return this._interceptedInfos[i];
    }
    return null;
  },

  _removeInterceptedInfo: function OIB__removeInterceptedInfo(url) {
    let index = -1;
    for (let i = 0; i < this._interceptedInfos.length; i++) {
      if (this._interceptedInfos[i].url == url) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      return;
    }
    this._interceptedInfos.splice(index, 1);
    if (this._interceptedInfos.length == 0) {
      this._stopCapture();
    }
  },

  observe: function OIB_observe(aSubject, aTopic, aData) {

    if (aTopic != EXAMINE_TOPIC && aTopic != EXAMINE_MERGED_TOPIC)
      return;

    let channel = aSubject.QueryInterface(Ci.nsIHttpChannel);
    let url = channel.originalURI.spec;

    debug("Observer inspecting: " + url);
    let interceptedInfo = this._getInterceptedInfo(url);

    if (!interceptedInfo)
      return;

    debug("Got a match " + url);
    channel.contentType = interceptedInfo.mime;

    // Disable content sniffers that could override the new mime type
    channel.loadFlags &= ~Ci.nsIChannel.LOAD_CALL_CONTENT_SNIFFERS;

    // drop content-disposition header
    channel.setResponseHeader("Content-Disposition", "", false);
    this._removeInterceptedInfo(url);
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver])
};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([OpenInBrowser]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([OpenInBrowser]);

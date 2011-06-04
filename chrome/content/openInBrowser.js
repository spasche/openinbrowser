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

var Ci = Components.interfaces;
var Cc = Components.classes;

var OpenInBrowser = {
  SEPARATOR_ID: "oib_separator",
  OTHER_MIME: "other",

  MIMES_HTTP: [
    "text/plain",
    "text/html",
    "view-source",
    "text/xml",
    // Note:
    // For image mime types, it relies on the fact that Gecko will correctly
    // display an image even if the server sent it with a mime type that does not
    // match the real image type. For instance, a PNG image sent with
    // image/jpeg Content-Type will still be displayed properly.
    "image/jpeg",
    "oib_separator",
    "other",
  ],

  MIMES_NON_HTTP: [
    "view-source"
  ],

  ADDITIONAL_MIMES_PREF: "extensions.openinbrowser.additional_mimes",

  get _netutil() {
    delete this._netutil;
    return this._netutil = Cc["@mozilla.org/network/util;1"].
                           getService(Ci.nsINetUtil);
  },

  get strings() {
    delete this.strings;
    return this.strings = document.getElementById("strings_openInBrowser");
  },

  populateMenu: function OIB_populateMenu(popup, uri) {
    var mimes;

    if (/^http/.test(uri.scheme)) {
      mimes = this.MIMES_HTTP;

      var additionalMimes = Application.prefs.getValue(this.ADDITIONAL_MIMES_PREF, null);
      if (additionalMimes) {
        mimes = mimes.slice();
        for each (let m in additionalMimes.split("|")) {
          if (m)
            mimes.push(m);
        }
      }
    } else {
      mimes = this.MIMES_NON_HTTP;
    }

    while (popup.firstChild)
      popup.removeChild(popup.firstChild);

    for each (let mime in mimes) {
      var item;
      if (mime == this.SEPARATOR_ID) {
        item = document.createElement("menuseparator");
        item.id = this.SEPARATOR_ID;
        popup.appendChild(item);
        continue;
      }
      item = document.createElement("menuitem");
      item.mime = mime;
      // Id attribute is used for finding items with getElementById().
      item.id = "mimeid_" + mime;

      var label = mime;

      // Use .stringBundle.GetStringFromName() instead of .getString()
      // to prevent dumping an exception if not found.
      try {
        label = this.strings.stringBundle.GetStringFromName(mime + ".label");
      } catch(e) { }
      // Must use setAttribute, setting the label property doesn't work when
      // done on elements before they are added to the DOM.
      item.setAttribute("label", label);

      try {
        var accesskey = this.strings.stringBundle
                            .GetStringFromName(mime + ".accesskey");
        item.setAttribute("accesskey", accesskey);
      } catch(e) { }

      popup.appendChild(item);
    }
  },

  validateMime: function OIB_validateMime(mime) {
    var type = this._netutil.parseContentType(mime, {}, {});

    if (!type) {
      alert(this.strings.getFormattedString("InvalidMimeType", [mime]));
      return false;
    }
    return true;
  },

  reloadWithMime: function OIB_reloadWithMime(uri, mime, doc) {
    if (mime == "view-source") {
      var iosvc = Cc["@mozilla.org/network/io-service;1"].
                  getService(Ci.nsIIOService);
      uri = iosvc.newURI("view-source:" + uri.spec, null, null);
    } else {
      var interceptor = Cc["@spasche.net/openinbrowser;1"].
                        getService().wrappedJSObject;
      interceptor.addInterceptInfo(uri.spec, mime);
    }
    var tab = Application.activeWindow.activeTab;
    if (doc) {
      var matchingTabs = [];
      Application.windows.forEach(function(window) {
        window.tabs.forEach(function(tab) {
          if (tab.document == doc)
            matchingTabs.push(tab);
        })
      })
      if (matchingTabs.length == 1) {
        tab = matchingTabs[0];
      }
    }
    tab.load(uri);
  }
}

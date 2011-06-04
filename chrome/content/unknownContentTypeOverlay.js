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

var OIB_DownloadOverlay = {
  dialogAcceptRetVal: true,

  _getMime: function OIBDO_getMime() {
    var mime = document.getElementById("mimeTypesMenu").selectedItem.mime;
    if (mime != OpenInBrowser.OTHER_MIME)
      return mime;

    mime = document.getElementById("mimeOtherText").value;
    if (!OpenInBrowser.validateMime(mime))
      mime = null;

    return mime;
  },

  dialogAccepted: function OIBDO_dialogAccepted() {
    if (document.getElementById('mode').selectedItem.id != "openInBrowser")
      return false;

    this.dialogAcceptRetVal = true;

    var mime = this._getMime();
    if (!mime) {
      // if the mime type is not valid, keep the dialog open
      this.dialogAcceptRetVal = false;
    } else {
      var parent = dialog.mContext.QueryInterface(Ci.nsIInterfaceRequestor)
                                  .getInterface(Ci.nsIDOMWindowInternal);
      OpenInBrowser.reloadWithMime(dialog.mLauncher.source, mime,
                                   parent.document);
    }

    return true;
  },

  getDefaultSelectedItem: function(mimeTypesPopup, serverSentMime) {
    // Exact match.
    for (var i = 0; i < mimeTypesPopup.childNodes.length; i++) {
      var item = mimeTypesPopup.childNodes[i];
      if (item.mime && item.mime == serverSentMime)
        return item;
    }

    function getMediaType(mime) {
      return mime.split("/")[0].toLowerCase();
    }

    // Media type match.
    for (var i = 0; i < mimeTypesPopup.childNodes.length; i++) {
      var item = mimeTypesPopup.childNodes[i];
      if (item.mime &&
          (getMediaType(item.mime) == getMediaType(serverSentMime)))
        return item;
    }
    // Fallback, select first entry.
    return mimeTypesPopup.firstChild;
  },

  init: function OIBDO_init(event) {

    // The Unknown Content Type dialog can have two different layouts.
    // Under some conditions (executables, ...), the dialog only shows
    // the save button. In that case the layout is modified in order to
    // show the radio button for selecting the mime type.
    if (dialog.dialogElement("normalBox").collapsed) {
      document.getElementById("normalBox").collapsed = false;
      document.getElementById("mode").firstChild.collapsed = true;

      // restore button labels
      document.documentElement.mStrBundle.GetStringFromName("button-accept");
      var docEl = document.documentElement;
      docEl.getButton("accept").label = docEl.mStrBundle.GetStringFromName("button-accept");
      docEl.getButton("cancel").label = docEl.mStrBundle.GetStringFromName("button-cancel");

      document.getElementById("rememberChoice").collapsed = true;
    }

    document.documentElement.setAttribute('ondialogaccept',
      'if (OIB_DownloadOverlay.dialogAccepted()) {' +
      '  return OIB_DownloadOverlay.dialogAcceptRetVal;' +
      '} else {' +
        document.documentElement.getAttribute('ondialogaccept') +
      '}');

    // disable the remember choice label, as choice remembering
    //  is not implemented yet for open in browser.
    if (!document.getElementById("rememberChoice").disabled) {
      function modeCmd(event) {
        if (event.target.localName != "radio")
          return;

        var oibRadio = document.getElementById("openInBrowser");
        var rememberChoice = document.getElementById("rememberChoice");
        rememberChoice.disabled = (event.target == oibRadio);
      }
      document.getElementById("mode").addEventListener("command", modeCmd, false);
    }

    var mimeTypesPopup = document.getElementById("mimeTypesPopup");

    var downloadedDocumentUri = dialog.mLauncher.source;
    OpenInBrowser.populateMenu(mimeTypesPopup, downloadedDocumentUri);

    var serverSentMime = dialog.mLauncher.MIMEInfo.MIMEType;

    var selectedItem = this.getDefaultSelectedItem(mimeTypesPopup, serverSentMime);
    document.getElementById('mimeTypesMenu').selectedItem = selectedItem;

    // Insert the server sent MIME menu item.
    if (!/^http/.test(downloadedDocumentUri.scheme))
      return;
    var item = document.createElement("menuitem");
    var serverSentMimeLabel = OpenInBrowser.strings
                                           .getString("ServerSentMimeLabel");
    item.setAttribute("label", serverSentMimeLabel);
    var serverSentMimeTooltip = OpenInBrowser.strings.getFormattedString(
                                    "ServerSentMimeTooltip", [serverSentMime]);
    item.setAttribute("tooltiptext", serverSentMimeTooltip);

    item.mime = serverSentMime;
    var mimeSeparator = document.getElementById(OpenInBrowser.SEPARATOR_ID);
    mimeTypesPopup.insertBefore(item, mimeSeparator);
  },

  onMimeTypeChange: function(event) {
    var isOther = event.target.mime == OpenInBrowser.OTHER_MIME;
    var otherText = document.getElementById("mimeOtherText");

    document.getElementById("mimeOtherText");
    otherText.hidden = !isOther;
    document.getElementById("mode").selectedItem =
             document.getElementById("openInBrowser");
    if (isOther) {
      otherText.focus();
    }
    window.sizeToContent();
  }
}

window.addEventListener('load', function init() {
  OIB_DownloadOverlay.init();
}, false);

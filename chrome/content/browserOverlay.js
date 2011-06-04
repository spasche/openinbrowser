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

var OIB_BrowserOverlay = {

  populateMimeTypesMenu: function OIBBO_popuplateViewAsMenu(event) {
    var popup = event.target;

    var uri = Application.activeWindow.activeTab.uri;
    OpenInBrowser.populateMenu(document.getElementById("mimeTypesPopup"), uri);
  },

  onSetMimeCommand: function OIBBO_onSetMimeCommand(event) {
    var mime = event.target.mime;
    if (!mime)
      return;

    if (mime == OpenInBrowser.OTHER_MIME) {
      mime = prompt(OpenInBrowser.strings.getString("SelectMimeType"));

      if (!OpenInBrowser.validateMime(mime))
        return;
    }

    OpenInBrowser.reloadWithMime(Application.activeWindow.activeTab.uri, mime)
  }
};

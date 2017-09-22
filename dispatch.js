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
 * est31
 *
 * ***** END LICENSE BLOCK ***** */

function getParams() {
	return JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
}

function action(ev) {
	var action = ev.target.id;
	var url = getParams().url;

	browser.runtime.sendMessage({url: url, action: action});
}

document.getElementById("download").addEventListener("click", action);
document.getElementById("open").addEventListener("click", action);
document.getElementById("dialog").addEventListener("click", action);

function i18n(id, msg, ...params) {
	document.getElementById(id).innerHTML = browser.i18n.getMessage(msg, ...params);
}

if (getParams().filename !== "") {
	i18n("whattodo", "whatToDoNamed", getParams().filename);
} else {
	i18n("whattodo", "whatToDo");
}

i18n("download", "download");
i18n("open", "openInBrowser");
i18n("dialog", "nativeChoiceDialog");

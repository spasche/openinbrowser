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
	var mode = getParams().mode;

	var msg = {url: url, action: { kind: action, mime: chosenMime }};
	browser.runtime.sendMessage(msg);
}

document.getElementById("download").addEventListener("click", action);
document.getElementById("open").addEventListener("click", action);
document.getElementById("dialog").addEventListener("click", action);

function buildDropdown(choices) {
	var list = document.getElementById("dropdown-list");
	list.innerHTML = '';
	for (i = 0; i < choices.length; i++) {
		var l = document.createElement('a');
		var text = browser.i18n.getMessage(choices[i]);
		l.appendChild(document.createTextNode(text));
		l.href = "javascript:void(0)";
		l.addEventListener("click", dropdownAction);
		l.number = i;
		list.appendChild(l);
	}
}

var choices = [
	"text/plain",
	"application/pdf",
	// Note:
	// For image mime types, it relies on the fact that Gecko will correctly
	// display an image even if the server sent it with a mime type that does not
	// match the real image type. For instance, a PNG image sent with
	// image/jpeg Content-Type will still be displayed properly.
	"image/png",
	"text/html",
	"view-source",
	"application/json",
	"text/xml",
];

function makeChoice(i) {
	chosenMime = choices[i];
	var chosenName = browser.i18n.getMessage(chosenMime);
	document.getElementById("dropdown-chosen").innerHTML = chosenName;
}

var chosenMime = "";

buildDropdown(choices);
makeChoice(0);

function dropdownAction(ev) {
	var i = ev.target.number;
	makeChoice(i);
}

var mode = getParams().mode;
if (mode !== "mime") {
	// MIME type known, no "open as" GUI needed
	document.getElementById("open-as").style.display = "none";
}

function localize() {
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

	i18n("as", "asInOpenAs");
}

localize();

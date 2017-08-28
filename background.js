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

var dispositionPage = browser.extension.getURL("dispatch.html");

var urlActions = {};

function headerRecv(responseDetails) {
	if (urlActions[responseDetails.url]) {
		var action = urlActions[responseDetails.url];
		delete urlActions[responseDetails.url];
		if (action === "dialog") {
			console.log("Showing native dialog: " + responseDetails.url);
			return;
		} else if (action === "open") {
			console.log("Opening in browser: " + responseDetails.url);

			var newHeaders = responseDetails.responseHeaders.filter(function(obj){
				return obj.name !== "content-disposition";
			});
			// TODO handle MIME types
			console.log(newHeaders);
			return {responseHeaders: newHeaders};
		}
	}
	// Determine whether the download dialog will be shown
	var mayDownload = false;

	for (obj of responseDetails.responseHeaders) {
		if (obj.name === "content-disposition") {
			if (obj.value.startsWith("attachment")) {
				mayDownload = true;
			}
		}
	}

	// TODO handle MIME types

	if (!mayDownload) {
		return;
	}
	console.log("May show dialog for URL " + responseDetails.url);

	var url = dispositionPage + "#" + responseDetails.url;
	browser.tabs.update(responseDetails.tabId, {url: url});

	// This hides the browser's content disposition dialog which would open
	// otherwise (racily??).
	var newHeaders = responseDetails.responseHeaders.filter(function(obj){
		return obj.name !== "content-disposition";
	});
	return {responseHeaders: newHeaders};
}

browser.webRequest.onHeadersReceived.addListener(
	headerRecv,
	{
		urls: ["<all_urls>"],
		types: ["main_frame"]
	},
	["blocking", "responseHeaders"]
);

function handleMessage(data, sender, sendResponse) {
	if (sender.url.startsWith(dispositionPage)) {
		var tabId = sender.tab.id;
		console.log("Message from the page: ",
			data);
		urlActions[data.url] = data.action;
		switch (data.action) {
			case "download":
				// Launch the download
				browser.downloads.download({url: data.url});
				break;
			case "open":
				// Just re-send the request.
				browser.tabs.update(tabId, {url: data.url});
				break;
			case "dialog":
				// Just re-send the request.
				browser.tabs.update(tabId, {url: data.url});
				break;
		}
	}
}

browser.runtime.onMessage.addListener(handleMessage);

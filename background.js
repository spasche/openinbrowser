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

function isUnknownMime(mime) {
	return (mime.startsWith("text/x-")) || (mime.endsWith("/octet-stream"));
}

function headerRecv(responseDetails) {
	console.log("Headers received for URL ", responseDetails);
	if (urlActions[responseDetails.url]) {
		var action = urlActions[responseDetails.url];
		delete urlActions[responseDetails.url];
		if (action.kind === "dialog") {
			console.log("Showing native dialog: " + responseDetails.url);
			return;
		} else if (action.kind === "open") {
			console.log("Opening in browser: " + responseDetails.url);

			var newHeaders = responseDetails.responseHeaders.filter(function(obj){
				return obj.name.toLowerCase() !== "content-disposition";
			});
			if (action.mime) {
				responseDetails.responseHeaders.map(function(obj){
					if (obj.name.toLowerCase() === "content-type") {
						obj.value = action.mime;
					}
					return obj;
				});
			}
			console.log(newHeaders);
			return {responseHeaders: newHeaders};
		}
	}
	// Determine whether the download dialog will be shown
	var filename = "";
	var mayDownload = responseDetails.responseHeaders.some(function(obj) {
		if (obj.name.toLowerCase() === "content-disposition" &&
				obj.value.startsWith("attachment")) {
			// https://stackoverflow.com/a/23054920
			filename =

/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(obj.value)[1];
			return true;
		}
		return false;
	});
	var unknownMime = responseDetails.responseHeaders.some(function(obj) {
		return obj.name.toLowerCase() === "content-type" && isUnknownMime(obj.value);
	});

	if (!(mayDownload || unknownMime)) {
		return;
	}
	console.log("May show dialog for URL " + responseDetails.url);

	var mode = "cdisp";
	if (unknownMime) {
		mode = "mime";
	}
	var params = {
		url: responseDetails.url,
		filename: filename,
		mode: mode,
	};
	var url = dispositionPage + "#" + encodeURIComponent(JSON.stringify(params));

	browser.tabs.update(responseDetails.tabId, {url: url});

	// This hides the browser's content disposition dialog which would open
	// otherwise (racily??).
	var newHeaders = responseDetails.responseHeaders.filter(function(obj){
		return obj.name.toLowerCase() !== "content-disposition";
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
		var createEntry = true;
		switch (data.action.kind) {
			case "download":
				// Launch the download
				browser.downloads.download({url: data.url});
				break;
			case "open":
				// Just re-send the request.
				if (data.action.mime === "view-source") {
					createEntry = false;
					browser.tabs.update(tabId, {url: "view-source:" + data.url});
				} else {
					browser.tabs.update(tabId, {url: data.url});
				}
				break;
			case "dialog":
				// Just re-send the request.
				browser.tabs.update(tabId, {url: data.url});
				break;
		}
		if (createEntry) {
			urlActions[data.url] = data.action;
		}
	}
}

browser.runtime.onMessage.addListener(handleMessage);

## 1.18

Replace deprecated for-each-in loops with ES6 for-of loops (closes #26).

## 1.17

Remove dependency on FUEL which is removed in Firefox 47 (closes #18).

## 1.16

Prevent the browser from caching the response (closes #9). Thanks to Alexander Rosenberg for the fix.

## 1.15

Compatibility fix for older Firefox versions and derivatives (Pale Moon).

## 1.14

Firefox 32 compatibility: use the new cache2 API for clearing cache entries (fixes #8).

## 1.13

- Add Russian (ru) locale (by Infocatcher).
- Select text MIME type if no existing MIME type is matched.

## 1.12

Add PDF support as a menu item (contributed by Felipe Gasper).
Update for a Firefox API change.

## 1.11

- Compatibility with Firefox 8 (nsIDOMWindowInternal is no more).
- Add a "View as" entry in the "Web Developer" App Menu.
- Patch by Mathnerd314 (slightly modified).

## 1.10

Added Swedish localization, provided by Mikael Hiort af Ornäs.

## 1.9

Added German localization, provided by Richard Nonix.

## 1.8

Update for Firefox 4 (XPCOM changes). Thanks to Mathnerd314 for the patch.

## 1.7

Added SeaMonkey support. Patch by Stanimir Stamenkov.

## 1.6

- new "Server sent MIME" entry for selecting the MIME type sent by the server.
- better default MIME selection algorithm (in particular if you have set the extensions.openinbrowser.additional_mimes preference).

## 1.5

Content should now be opened in the correct tab (it wasn't the case if you opened background tabs).

## 1.4

Changed some logic in the overlay to avoid breaking other extensions (such as Open IT Online). Thanks to Denis Remondini for the detailed explanation how to fix this.

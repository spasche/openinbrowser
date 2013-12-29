Open in Browser
===============

Open in Browser is a Firefox extension that allows you to open documents directly in the browser.

## Installation

You can install the extension from its [addons.mozilla.org page](https://addons.mozilla.org/En-us/firefox/addon/open-in-browser/).

## Screenshots

![Opening Dialog](https://addons.cdn.mozilla.net/img/uploads/previews/full/23/23688.png)
![View as Menu](https://addons.cdn.mozilla.net/img/uploads/previews/full/23/23689.png)

## Configuration

You can add additional mime types to the list by creating a pref named `extensions.openinbrowser.additional_mimes` in about:config with the list of additional types separated by a `|`.
For instance, `application/pdf|audio/ogg-vorbis`.

## Limitations and Issues

* It does not work for protocols other that HTTP because of a technical limitation. It is only possible to view the content as source in this case.
* Automatic opening in browser is not implemented, that's why the "Do this automatically for files like this..." checkbox is greyed out when open in browser is selected.

## Building the extension

You need a Unix shell with `make` and `zip` in your PATH. Cygwin works well on Windows.

Go in the root of the sources and run:

    make xpi

This will generate a `openinbrowser-VERSION.xpi` archive in the parent directory.

## Testing

A few manual tests are available in the tests directory.

For the HTTP protocol tests, you should serve the tests directory with a Web server that interprets PHP scripts.
Then you can open the tests/tests.html file (for instance, http://localhost/openinbrowser/tests/tests.html) and follow the
instructions.

For the file protocol test, open the tests/tests.html file from the file system (for instance. file:///C:/openinbrowser/tests/tests.html) and follow the instructions.

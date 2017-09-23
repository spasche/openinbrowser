Open in Browser
===============

Open in Browser is a Firefox extension that allows you to open documents directly in the browser.

## Installation

You can install the extension from its [addons.mozilla.org page](https://addons.mozilla.org/En-us/firefox/addon/open-in-browser/).

## Configuration

You can add additional mime types to the list by creating a pref named `extensions.openinbrowser.additional_mimes` in about:config with the list of additional types separated by a `|`.
For instance, `application/pdf|audio/ogg-vorbis`.

## Limitations and Issues

* It does not work for protocols other that HTTP because of a technical limitation.
* Automatic opening in browser is not implemented.
* You can't customize things yet.
* It creates its own UI instead of extending the existing UI.

## Building the extension

You need a Unix shell with `make` and `git` in your PATH. Cygwin works well on Windows.

Go in the root of the sources and run:

    make xpi

This will generate a `openinbrowser-VERSION.xpi` archive in the current directory.

If you want to modify the sources, first commit your changes in git and then run the above `make` command again.
You can use `git commit --amend` to update the last commit. 

## Testing

A few manual tests are available in the tests directory.

For the HTTP protocol tests, you should serve the tests directory with a Web server that interprets PHP scripts.
If you have Docker, you can use the following command:

    cd openinbrowser/tests/
    docker run -it -p 8080:80 -v "$PWD":/var/www/html php:5.6-apache

which will run a Web server on port 8080. You can then access the tests using http://localhost:8080/tests.html and
follow the instructions.

For the file protocol test, open the tests/tests.html file from the file system (for instance. file:///C:/openinbrowser/tests/tests.html) and follow the instructions.

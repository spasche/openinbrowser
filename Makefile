all:
	:

NAME := openinbrowser
VERSION := $(shell grep em:version install.rdf|sed 's@.*em:version>\([^<]*\)<.*@\1@')
TARGET_XPI = $(NAME)-$(VERSION).xpi

xpi:
	rm -rf ../tmp || :
	mkdir ../tmp
	cp -r ../$(NAME) ../tmp
	cd ../tmp/$(NAME)/chrome; \
	zip -r $(NAME).jar *; \
	rm -rf content locale
	rm -rf ../tmp/$(NAME)/.hg
	find ../tmp -name "*~" -exec rm {} \;
	rm ../tmp/$(NAME)/chrome.manifest
	mv ../tmp/$(NAME)/chrome.manifest_jar ../tmp/$(NAME)/chrome.manifest
	cd ../tmp/$(NAME); \
	zip -r $(TARGET_XPI) *
	rm ../$(TARGET_XPI) || :
	mv ../tmp/$(NAME)/$(TARGET_XPI) ..
	rm -rf ../tmp

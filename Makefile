NAME := openinbrowser
VERSION := $(shell grep '"version":' manifest.json|sed 's@.*version.*:\s*"\([^"]*\)".*@\1@')
TARGET_XPI = $(NAME)-$(VERSION).xpi

xpi:
	git archive --format zip -o $(TARGET_XPI) HEAD -- .

.PHONY: xpi

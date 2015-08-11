NAME := openinbrowser
VERSION := $(shell grep em:version install.rdf|sed 's@.*em:version>\([^<]*\)<.*@\1@')
TARGET_XPI = $(NAME)-$(VERSION).xpi

xpi:
	git archive --format zip -o $(TARGET_XPI) HEAD -- . ':!/tests/*'

.PHONY: xpi

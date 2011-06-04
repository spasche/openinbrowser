all:
	:

NAME := openinbrowser
VERSION := $(shell grep em:version install.rdf|sed 's@.*em:version>\([^<]*\)<.*@\1@')
TARGET_XPI = $(NAME)-$(VERSION).xpi

xpi:
	rm -rf ../tmp || :
	mkdir ../tmp
	cp -r ../$(NAME) ../tmp
	rm -rf ../tmp/$(NAME)/.hg ../tmp/$(NAME)/.git ../tmp/$(NAME)/tests
	find ../tmp -name "*~" -exec rm {} \;
	cd ../tmp/$(NAME); \
	zip -r $(TARGET_XPI) *
	rm ../$(TARGET_XPI) || :
	mv ../tmp/$(NAME)/$(TARGET_XPI) ..
	rm -rf ../tmp

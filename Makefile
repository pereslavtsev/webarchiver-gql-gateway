.DEFAULT_GOAL := build
.PHONY: build

BIN := ./node_modules/.bin

JEST = $(BIN)/jest
NEST = $(BIN)/nest

build:
	$(NEST) build

test-debug:
	node \
		--inspect-brk \
		-r tsconfig-paths/register \
		-r ts-node/register \
		$(JEST) \
		--runInBand

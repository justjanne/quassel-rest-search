IMAGE := k8r.eu/justjanne/$(shell basename $(shell git remote get-url origin) .git)
TAGS := $(shell git describe --always --tags HEAD)

.PHONY: build
build:
	docker build --pull -t $(IMAGE):$(TAGS) .
	docker tag $(IMAGE):$(TAGS) $(IMAGE):latest
	@echo Successfully tagged $(IMAGE):$(TAGS) as latest

.PHONY: push
push: build
	docker push $(IMAGE):$(TAGS)
	docker push $(IMAGE):latest
	@echo Successfully pushed $(IMAGE):$(TAGS) as latest

#!/bin/sh
IMAGE=k8r.eu/justjanne/quassel-rest-search
TAGS=$(git describe --always --tags HEAD)

docker push $IMAGE:$TAGS
docker push $IMAGE:latest
echo Successfully pushed $IMAGE:latest

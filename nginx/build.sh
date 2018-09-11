#!/bin/sh

NAME=mynginx
VERSION=1.0.0-22-eeeff

echo "Building image ($VERSION) ..."
docker build -t $NAME:$VERSION -f Dockerfile.nginx .
docker tag $NAME:$VERSION $NAME:latest

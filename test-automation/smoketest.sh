#!/bin/bash

cd test-automation

docker build -t wm-smoke:latest .
docker run --name wm-smoke --shm-size=2g wm-smoke:latest ./testrun.sh -d -p 4444:4444
docker cp wm-smoke:./test-automation/test-results .
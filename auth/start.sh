#!/bin/bash

./setup-kong-route.sh kong:8001 true && yarn test:e2e
#!/bin/bash

export CYPRESS_BASE_URL="http://dev${TRAVIS_BUILD_NUMBER}.moonlight-health.com"
cd qa
npm test
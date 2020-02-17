#!/bin/bash

./travis/script.sh moonlight-health moonlight-health.com

aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"

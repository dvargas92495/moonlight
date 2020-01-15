#!/bin/bash

cd client
npm install
npm run build

aws s3 sync --delete build s3://moonlight-client

aws cloudfront create-invalidation --distribution-id E1RUJ2RP8VS0PX --paths "/*"
aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"
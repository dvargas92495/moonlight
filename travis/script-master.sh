#!/bin/bash

cd client
npm install

echo "
REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
" > .env.local

npm run build

aws s3 sync --delete build s3://moonlight-client

aws cloudfront create-invalidation --distribution-id E1RUJ2RP8VS0PX --paths "/*"
aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"
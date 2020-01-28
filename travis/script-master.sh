#!/bin/bash

echo "
REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
REACT_APP_RDS_MASTER_USER_PASSWORD=${RDS_MASTER_USER_PASSWORD}
" > client/.env.local

cd db
npm install
npm run migrate

cd ../lambda
npm install
npm run build
zip -jq signUp.zip ./build/signUp.js
aws lambda create-function \
    --function-name "moonlight-health-signUp" \
    --runtime nodejs10.x \
    --role arn:aws:iam::643537615676:role/Moonlight-Lambda-Execution \
    --handler "signUp.handler" \
    --publish \
    --zip-file fileb://signUp.zip \
    --tags Application=Moonlight \

cd ../client
npm install
npm run build

aws s3 sync --delete build s3://moonlight-client

aws cloudfront create-invalidation --distribution-id E1RUJ2RP8VS0PX --paths "/*"
aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"
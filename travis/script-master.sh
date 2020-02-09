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
aws lambda update-function-code \
    --function-name "moonlight-health-signUp" \
    --publish \
    --zip-file fileb://signUp.zip \

zip -jq confirmSignUp.zip ./build/confirmSignUp.js
aws lambda update-function-code \
    --function-name "moonlight-health-confirmSignUp" \
    --publish \
    --zip-file fileb://confirmSignUp.zip \

zip -jq signIn.zip ./build/signIn.js
aws lambda update-function-code \
    --function-name "moonlight-health-signIn" \
    --publish \
    --zip-file fileb://signIn.zip \

zip -jq getAvailability.zip ./build/getAvailability.js
aws lambda update-function-code \
    --function-name "moonlight-health-getAvailability" \
    --publish \
    --zip-file fileb://getAvailability.zip \

zip -jq putAvailability.zip ./build/putAvailability.js
aws lambda update-function-code \
    --function-name "moonlight-health-putAvailability" \
    --publish \
    --zip-file fileb://putAvailability.zip \

zip -jq getSpecialistViews.zip ./build/getSpecialistViews.js
aws lambda update-function-code \
    --function-name "moonlight-health-getSpecialistViews" \
    --publish \
    --zip-file fileb://getSpecialistViews.zip \

cd ../client
npm install
npm run build

aws s3 sync --delete build s3://moonlight-client

aws cloudfront create-invalidation --distribution-id E1RUJ2RP8VS0PX --paths "/*"
aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"
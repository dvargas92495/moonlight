#!/bin/bash

./travis/script.sh moonlight-client moonlight-health.com

cd lambda
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

zip -jq getProfile.zip ./build/getProfile.js
aws lambda update-function-code \
    --function-name "moonlight-health-getProfile" \
    --publish \
    --zip-file fileb://getProfile.zip \

zip -jq putProfile.zip ./build/putProfile.js
aws lambda update-function-code \
    --function-name "moonlight-health-putProfile" \
    --publish \
    --zip-file fileb://putProfile.zip \

zip -jq getSpecialistViews.zip ./build/getSpecialistViews.js
aws lambda update-function-code \
    --function-name "moonlight-health-getSpecialistViews" \
    --publish \
    --zip-file fileb://getSpecialistViews.zip \

aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"

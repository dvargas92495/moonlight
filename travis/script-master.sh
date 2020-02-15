#!/bin/bash

./travis/script.sh moonlight-client moonlight-health.com

cd lambda
npm install
npm run build

update-function() {
    zip -jq $1.zip ./build/$1.js
    aws lambda update-function-code \
        --function-name "moonlight-health-$1" \
        --publish \
        --zip-file fileb://$1.zip \
}

update-function signUp
update-function confirmSignUp
update-function signIn
update-function getAvailability
update-function putAvailability
update-function getProfile
update-function putProfile
update-function getSpecialistViews
update-function postEvents

aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"

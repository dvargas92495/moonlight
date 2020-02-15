#!/bin/bash

./travis/script.sh moonlight-client moonlight-health.com

cd lambda
npm install
npm run build

update_function () {
    zip -jq $1.zip ./build/$1.js
    aws lambda update-function-code --function-name "moonlight-health-${1}" --publish --zip-file "fileb://${1}.zip"
}

update_function signUp
update_function confirmSignUp
update_function signIn
update_function getAvailability
update_function putAvailability
update_function getProfile
update_function putProfile
update_function getSpecialistViews
update_function postEvents

aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"

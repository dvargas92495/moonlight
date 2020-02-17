#!/bin/bash

ENV_NAME=$1
DOMAIN=$2

API_GATEWAY_REST_API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${ENV_NAME}'].id" --output text)

echo "
REACT_APP_API_GATEWAY_INVOKE_URL=https://${API_GATEWAY_REST_API_ID}.execute-api.us-east-1.amazonaws.com/production/
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

update_function () {
    zip -jq $1.zip ./build/$1.js
    aws lambda update-function-code --function-name "${ENV_NAME}-${1}" --publish --zip-file "fileb://${1}.zip"
    rm $1.zip
}

update_function post-signup
update_function post-confirm-signup
update_function post-signin
update_function get-availability
update_function post-availability
update_function get-profile
update_function post-profile
update_function get-specialist-views
update_function get-events
update_function post-events

cd ../client
npm test
npm run build
aws s3 sync --delete build "s3://${ENV_NAME}"

CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='${DOMAIN}'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

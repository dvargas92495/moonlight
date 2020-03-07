#!/bin/bash

ENV_NAME=$1
DOMAIN=$2
COGNITO_NAME=$3

API_GATEWAY_REST_API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${ENV_NAME}'].id" --output text)
REACT_APP_USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?Name=='${COGNITO_NAME}'].Id" --output text)
REACT_APP_USER_CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id $REACT_APP_USER_POOL_ID --query "UserPoolClients[?ClientName=='moonlight-client'].ClientId" --output text)
REACT_APP_USER_CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id $REACT_APP_USER_POOL_ID --client-id $REACT_APP_USER_CLIENT_ID --query "UserPoolClient.ClientSecret" --output text)
RDS_MASTER_HOST=$(aws rds describe-db-instances --db-instance-identifier ${ENV_NAME} --query "DBInstances[0].Endpoint.Address" --output text)

echo "REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
REACT_APP_API_GATEWAY_INVOKE_URL=https://${API_GATEWAY_REST_API_ID}.execute-api.us-east-1.amazonaws.com/production/
REACT_APP_USER_POOL_ID=${REACT_APP_USER_POOL_ID}
REACT_APP_USER_CLIENT_ID=${REACT_APP_USER_CLIENT_ID}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
REACT_APP_RDS_MASTER_USER_PASSWORD=${TF_VAR_RDS_MASTER_USER_PASSWORD}
REACT_APP_RDS_MASTER_HOST=${RDS_MASTER_HOST}
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

for filename in build/*.js; do
    update_function $(basename "$filename" .js)
done

cd ../client
npm install
npm run build
aws s3 sync --delete build "s3://${ENV_NAME}"

CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='${DOMAIN}'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

#!/bin/bash

set -e

if [ -z $TF_WORKSPACE ] 
then
    echo "Please set the TF_WORKSPACE environment variable to deploy function"
    exit 1
fi

if [ -z $1 ] 
then
    echo "Please specify the function name as the first argument"
    exit 1
fi

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}
DOMAIN="https://${ENV_NAME//-/.}.com"

deploy-lambda() {
    zip -jq $1.zip ./build/$1.js
    MODIFIED=$(aws lambda update-function-code --function-name "${ENV_NAME}-${1}" --publish --zip-file "fileb://${1}.zip" --query "LastModified" --output text)
    rm $1.zip
    echo "Function $1 successfully updated at $MODIFIED"
}

if [ all = $1 ]
then
    REACT_APP_USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?Name=='${ENV_NAME}'].Id" --output text)
    REACT_APP_USER_CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id $REACT_APP_USER_POOL_ID --query "UserPoolClients[?ClientName=='emdeo-client'].ClientId" --output text)
    REACT_APP_USER_CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id $REACT_APP_USER_POOL_ID --client-id $REACT_APP_USER_CLIENT_ID --query "UserPoolClient.ClientSecret" --output text)
    
    echo "REACT_APP_USER_POOL_ID=${REACT_APP_USER_POOL_ID}
REACT_APP_USER_CLIENT_ID=${REACT_APP_USER_CLIENT_ID}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
REACT_APP_RDS_MASTER_USER_PASSWORD=${TF_VAR_RDS_MASTER_USER_PASSWORD}
REACT_APP_RDS_MASTER_HOST=${RDS_MASTER_HOST}
REACT_APP_ENVIRONMENT_NAME=${ENV_NAME}
REACT_APP_ORIGIN_DOMAIN=${DOMAIN}" > .env.local

    npm install
    npm run build

    for filename in build/*.js; do
        deploy-lambda $(basename "$filename" .js)
    done
else
    deploy-lambda $1
fi

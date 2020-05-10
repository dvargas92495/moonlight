#!/bin/bash

set -e

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}
DOMAIN="https://${ENV_NAME//-/.}.com"

if [ -z "$(ls -A travis/manual)" ]; then
   echo "No manual migrations to run"
else
    for filename in travis/manual/*.sh; do
        ./$filename
    done
fi

cd terraform/environment
./terraform init
./terraform apply -auto-approve
cd ../..

if [ -z $AWS_SECRET_ACCESS_KEY ]; then
  AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
fi
API_GATEWAY_REST_API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${ENV_NAME}'].id" --output text)
REACT_APP_USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?Name=='${ENV_NAME}'].Id" --output text)
REACT_APP_USER_CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id $REACT_APP_USER_POOL_ID --query "UserPoolClients[?ClientName=='emdeo-client'].ClientId" --output text)
REACT_APP_USER_CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id $REACT_APP_USER_POOL_ID --client-id $REACT_APP_USER_CLIENT_ID --query "UserPoolClient.ClientSecret" --output text)
export RDS_MASTER_HOST=$(aws rds describe-db-instances --db-instance-identifier ${ENV_NAME} --query "DBInstances[0].Endpoint.Address" --output text)

echo "REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
REACT_APP_API_GATEWAY_INVOKE_URL=https://${API_GATEWAY_REST_API_ID}.execute-api.us-east-1.amazonaws.com/production/
REACT_APP_USER_POOL_ID=${REACT_APP_USER_POOL_ID}
REACT_APP_USER_CLIENT_ID=${REACT_APP_USER_CLIENT_ID}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
REACT_APP_RDS_MASTER_USER_PASSWORD=${TF_VAR_RDS_MASTER_USER_PASSWORD}
REACT_APP_RDS_MASTER_HOST=${RDS_MASTER_HOST}
REACT_APP_ENVIRONMENT_NAME=${ENV_NAME}
REACT_APP_ORIGIN_DOMAIN=${DOMAIN}
" > client/.env.local

cd db
npm install
npm run migrate

cd ../lambda
./deploy.sh all

cd ../client
./deploy.sh

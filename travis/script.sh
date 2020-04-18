#!/bin/bash

check() {
    exit_code=$?
    if [ $exit_code -ne 0 ]
    then
        echo "Previous command failed"
        exit $exit_code
    fi
}

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}
DOMAIN="${ENV_NAME//-/.}.com"

if [ -z "$(ls -A travis/manual)" ]; then
   echo "No manual migrations to run"
else
    for filename in travis/manual/*.sh; do
        ./$filename
        check
    done
fi

cd terraform
./terraform init
./terraform apply -auto-approve
check
cd ..

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
REACT_APP_ENVIRONMANE_NAME=${ENV_NAME}
" > client/.env.local

cd db
npm install
npm run migrate
check

cd ../lambda
npm install
npm run build
check

for filename in build/*.js; do
    ./deploy.sh $(basename "$filename" .js)
done

cd ../client
npm install
npm run build
check
aws s3 sync --delete build "s3://${ENV_NAME}"

CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='${DOMAIN}'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

WWW_CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='www.${DOMAIN}'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $WWW_CLOUDFRONT_ID --paths "/*"

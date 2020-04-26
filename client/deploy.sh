#!/bin/bash

set -e

if [ -z $TF_WORKSPACE ] 
then
    echo "Please set the TF_WORKSPACE environment variable to deploy client"
    exit 1
fi

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}
DOMAIN="${ENV_NAME//-/.}.com"

npm install
npm run build
aws s3 sync --delete build "s3://${ENV_NAME}"

CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='${DOMAIN}'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

WWW_CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='www.${DOMAIN}'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $WWW_CLOUDFRONT_ID --paths "/*"
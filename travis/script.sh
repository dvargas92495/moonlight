#!/bin/bash

set -e

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}
DOMAIN="https://${ENV_NAME//-/.}.com"

export RDS_MASTER_HOST=$(aws rds describe-db-instances --db-instance-identifier ${ENV_NAME} --query "DBInstances[0].Endpoint.Address" --output text)

cd db
npm run migrate

cd ../lambda
./deploy.sh all

cd ../client
./deploy.sh

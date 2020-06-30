#!/bin/bash

set -e

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}

REACT_APP_USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?Name=='${ENV_NAME}'].Id" --output text)
RDS_MASTER_HOST=$(aws rds describe-db-instances --db-instance-identifier ${ENV_NAME} --query "DBInstances[0].Endpoint.Address" --output text)

USERS=$(aws cognito-idp list-users --user-pool-id $REACT_APP_USER_POOL_ID --query "Users[*].[Attributes[?Name=='email'].Value, Username]" --output text)

for u in $USERS
do
    if [[ $u == *"@"* ]]; then
        PGPASSWORD=$TF_VAR_RDS_MASTER_USER_PASSWORD psql -h $RDS_MASTER_HOST -U emdeo -c "UPDATE users SET username='${u}' WHERE uuid='${UUID}'"
    else
        UUID=$u    
    fi
done
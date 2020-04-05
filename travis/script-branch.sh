#!/bin/bash

export TF_VAR_RDS_MASTER_USER_PASSWORD=$QA_RDS_MASTER_USER_PASSWORD

DOMAIN="env1.qa.moonlight-health.com"

./travis/script.sh $DOMAIN

cd client
npm test

exit_code=$?
if [ $exit_code -ne 0 ]
then
    echo "Client tests failed"
    exit $exit_code
fi

export CYPRESS_BASE_URL="https://$DOMAIN"
cd ../qa
npm test

#!/bin/bash

check() {
    exit_code=$?
    if [ $exit_code -ne 0 ]
    then
        echo "Previous command failed"
        exit $exit_code
    fi
}

export TF_VAR_RDS_MASTER_USER_PASSWORD=$QA_RDS_MASTER_USER_PASSWORD

DOMAIN="env1.qa.emdeo.com"

./travis/script.sh $DOMAIN
check

cd client
npm test
check

export CYPRESS_BASE_URL="https://$DOMAIN"
cd ../qa
npm test

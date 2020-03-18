#!/bin/bash

export TF_VAR_RDS_MASTER_USER_PASSWORD=$QA_RDS_MASTER_USER_PASSWORD

DOMAIN="env1.qa.moonlight-health.com"

./travis/script.sh $DOMAIN

cd client
npm test

export CYPRESS_BASE_URL="https://$DOMAIN"
cd ../qa
npm test

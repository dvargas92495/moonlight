#!/bin/bash

cd terraform
./terraform init
./terraform apply -auto-approve
cd ..

DOMAIN="env1.qa.moonlight-health.com"

./travis/script.sh $TF_WORKSPACE $DOMAIN $TF_WORKSPACE

cd client
npm test

export CYPRESS_BASE_URL="https://$DOMAIN"
cd ../qa
npm test

#!/bin/bash

set -e

export TF_VAR_RDS_MASTER_USER_PASSWORD=$QA_RDS_MASTER_USER_PASSWORD

./travis/script.sh

cd client
npm test

export CYPRESS_BASE_URL="https://env1.qa.emdeo.com"
cd ../qa
npm test

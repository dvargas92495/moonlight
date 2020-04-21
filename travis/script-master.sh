#!/bin/bash

set -e

export TF_VAR_RDS_MASTER_USER_PASSWORD=$PROD_RDS_MASTER_USER_PASSWORD

./travis/script.sh

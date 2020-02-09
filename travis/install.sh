#!/bin/bash

pip install awscli --upgrade --user

curl -sLo ./terraform.zip https://releases.hashicorp.com/terraform/0.12.20/terraform_0.12.20_linux_amd64.zip
unzip ./terraform.zip -d ./
rm terraform.zip

#!/bin/bash

set -e

pip install wheel
pip install awscli --upgrade --user

curl -sLo ./terraform/terraform.zip https://releases.hashicorp.com/terraform/0.12.24/terraform_0.12.24_linux_amd64.zip
unzip ./terraform/terraform.zip -d ./terraform/environment/
rm ./terraform/terraform.zip
echo "
credentials \"app.terraform.io\" {
  token = \"${TERRAFORM_API_TOKEN}\"
}
" > $HOME/.terraformrc

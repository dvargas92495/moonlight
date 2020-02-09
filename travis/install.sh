#!/bin/bash

pip install awscli --upgrade --user

curl -sLo ./terraform/terraform.zip https://releases.hashicorp.com/terraform/0.12.20/terraform_0.12.20_linux_amd64.zip
unzip ./terraform/terraform.zip -d ./terraform/
rm ./terraform/terraform.zip
echo "
credentials \"app.terraform.io\" {
  token = \"${TERRAFORM_API_TOKEN}\"
}
" > /home/travis/.terraformrc

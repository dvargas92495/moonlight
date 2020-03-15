This directory is responsible for our backend logic, in the form of serverless functions

## Getting Started

1. Run `npm install`

## Deploying a new script

1. Make sure the `aws` cli is installed and that you have `zip`
1. Set the AWS Access Key
   1. Copy the value of `AWS_ACCESS_KEY_ID` from `client/.env.local`
   1. `export AWS_ACCESS_KEY_ID=${PASTE}`
1. Set the AWS Secret Key
   1. Copy the value of `AWS_SECRET_ACCESS_KEY` from `client/.env.local`
   1. `export AWS_SECRET_ACCESS_KEY=${PASTE}`
1. Run `npm run build`
1. Run `./deploy.sh ${NAME_OF_FUNCTION}`

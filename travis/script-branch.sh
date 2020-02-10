#!/bin/bash

cd terraform
./terraform init
./terraform apply -auto-approve

cd ..
echo "
REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
REACT_APP_RDS_MASTER_USER_PASSWORD=${RDS_MASTER_USER_PASSWORD}
" > client/.env.local

cd db
# npm install
# npm run migrate

cd ../client
npm test
npm run build
aws s3 sync --delete build "s3://${TF_WORKSPACE}"

CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{Alias:Aliases.Items[0],Id:Id}[?Alias=='env1.qa.moonlight-health.com'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

# ROUTE53_CHANGE_ID=$(aws route53 change-resource-record-sets --hosted-zone-id Z18VX8M08PX0TW --query "ChangeInfo.Id" --output text --change-batch "{
#   \"Comment\": \"Creating Alias resource record set in Route 53 for ${DOMAIN}\",
#   \"Changes\": [{
#     \"Action\": \"CREATE\",
#     \"ResourceRecordSet\": {
#       \"Name\": \"${DOMAIN}\",
#       \"Type\": \"A\",
#       \"AliasTarget\":{
#         \"HostedZoneId\": \"Z3AQBSTGFYJSTF\",
#         \"DNSName\": \"s3-website-us-east-1.amazonaws.com\",
#         \"EvaluateTargetHealth\": false
#       }
#     }
#  }]
# }")

# NEXT_WAIT_TIME=0
# OUTPUT="PENDING"
# until [[ "$OUTPUT" = INSYNC* ]]; do
#   sleep $NEXT_WAIT_TIME
#   OUTPUT=$(aws route53 get-change --id "/change/${ROUTE53_CHANGE_ID}" --query "ChangeInfo.Status" --output text)
#   let NEXT_WAIT_TIME=NEXT_WAIT_TIME+1
#   echo "After ${NEXT_WAIT_TIME} attempt, ID ${ROUTE53_CHANGE_ID} has status ${OUTPUT}"
#   if [ $NEXT_WAIT_TIME -eq 20 ]; then
#     exit 1
#   fi  
# done

# export CYPRESS_BASE_URL="http://$DOMAIN"
# cd ../qa
# npm test
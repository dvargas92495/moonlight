#!/bin/bash

cd client
npm test

echo "
REACT_APP_AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
REACT_APP_USER_CLIENT_SECRET=${REACT_APP_USER_CLIENT_SECRET}
" > .env.local

ENV_NUMBER=1
npm run build

DOMAIN="env${ENV_NUMBER}.qa.moonlight-health.com"

aws s3api create-bucket --bucket $DOMAIN
aws s3 website "s3://${DOMAIN}" --index-document index.html --error-document index.html
aws s3api put-bucket-tagging --bucket $DOMAIN --tagging TagSet="[{Key=Application,Value=Moonlight}]"
aws s3api put-public-access-block --bucket $DOMAIN --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false
aws s3api put-bucket-policy --bucket $DOMAIN --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Sid\": \"RestrictedWriteObjects\",
      \"Effect\": \"Allow\",
      \"Principal\": {
        \"AWS\": \"arn:aws:iam::643537615676:user/moonlight-admin\"
      },
      \"Action\": [\"s3:PutObject\", \"s3:DeleteObject\"],
      \"Resource\": \"arn:aws:s3:::${DOMAIN}/*\"
    },
    {
      \"Sid\": \"RestrictedReadBuckets\",
      \"Effect\": \"Allow\",
      \"Principal\": {
        \"AWS\": \"arn:aws:iam::643537615676:user/moonlight-admin\"
      },
      \"Action\": \"s3:ListBucket\",
      \"Resource\": \"arn:aws:s3:::${DOMAIN}\"
    },
    {
      \"Sid\": \"PublicReadObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${DOMAIN}/*\"
    }
  ]
}"
aws s3 sync build "s3://${DOMAIN}"

ROUTE53_CHANGE_ID=$(aws route53 change-resource-record-sets --hosted-zone-id Z18VX8M08PX0TW --query "ChangeInfo.Id" --output text --change-batch "{
  \"Comment\": \"Creating Alias resource record set in Route 53 for ${DOMAIN}\",
  \"Changes\": [{
    \"Action\": \"CREATE\",
    \"ResourceRecordSet\": {
      \"Name\": \"${DOMAIN}\",
      \"Type\": \"A\",
      \"AliasTarget\":{
        \"HostedZoneId\": \"Z3AQBSTGFYJSTF\",
        \"DNSName\": \"s3-website-us-east-1.amazonaws.com\",
        \"EvaluateTargetHealth\": false
      }
    }
 }]
}")

NEXT_WAIT_TIME=0
OUTPUT="PENDING"
until [[ "$OUTPUT" = INSYNC* ]]; do
  sleep $NEXT_WAIT_TIME
  OUTPUT=$(aws route53 get-change --id "/change/${ROUTE53_CHANGE_ID}" --query "ChangeInfo.Status" --output text)
  let NEXT_WAIT_TIME=NEXT_WAIT_TIME+1
  echo "After ${NEXT_WAIT_TIME} attempt, ID ${ROUTE53_CHANGE_ID} has status ${OUTPUT}"
  if [ $NEXT_WAIT_TIME -eq 20 ]; then
    exit 1
  fi  
done

export CYPRESS_BASE_URL="http://$DOMAIN"
cd ../qa
npm test
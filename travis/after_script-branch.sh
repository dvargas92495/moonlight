#!/bin/bash

ENV_NUMBER=1
DOMAIN="env${ENV_NUMBER}.qa.moonlight-health.com"

aws s3 rb "s3://${DOMAIN}" --force
aws route53 change-resource-record-sets --hosted-zone-id Z18VX8M08PX0TW --change-batch "{
  \"Comment\": \"Deleting Alias resource record set in Route 53 for ${DOMAIN}\",
  \"Changes\": [{
    \"Action\": \"DELETE\",
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
}"

cd db
npm run rollback
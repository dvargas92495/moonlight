#!/bin/bash

# TODO - create 1 time job to delete resources in two hours instead of immediately after

DOMAIN="dev${TRAVIS_BUILD_NUMBER}.moonlight-health.com"

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

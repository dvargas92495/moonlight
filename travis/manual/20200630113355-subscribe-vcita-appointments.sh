#!/bin/bash

set -e

ENV_NAME=${TF_WORKSPACE/moonlight-health/emdeo}

API_GATEWAY_REST_API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${ENV_NAME}'].id" --output text)
TARGET_URL="https://${API_GATEWAY_REST_API_ID}.execute-api.us-east-1.amazonaws.com/production/vcita/appointments/scheduled" 

curl --location --request POST 'http://api.vcita.biz/platform/v1/webhook/unsubscribe' \
  --header "authorization: Bearer ${REACT_APP_VCITA_API_TOKEN}" \
  --header 'content-type: application/json' \
  --data "{\"event\":\"appointment/scheduled\",\"target_url\":\"https://${API_GATEWAY_REST_API_ID}.execute-api.us-east-1.amazonaws.com/production/vcita/appointments/scheduled\"}"

curl --location --request POST 'http://api.vcita.biz/platform/v1/webhook/subscribe' \
  --header "authorization: Bearer ${REACT_APP_VCITA_API_TOKEN}" \
  --header 'content-type: application/json' \
  --data "{\"event\":\"appointment/scheduled\",\"target_url\":\"https://${API_GATEWAY_REST_API_ID}.execute-api.us-east-1.amazonaws.com/production/vcita/appointments/scheduled\"}"

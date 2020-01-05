#!/bin/bash

aws s3 sync --delete client/build s3://dev-moonlight-client
  
aws cloudfront create-invalidation --distribution-id EDKR87QL42CJM --paths "/*"

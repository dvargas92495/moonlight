#!/bin/bash

if [ -z $TF_WORKSPACE ] 
then
    echo "Please set the TF_WORKSPACE environment variable to deploy function"
    exit 1
fi

if [ -z $1 ] 
then
    echo "Please specify the function name as the first argument"
    exit 1
fi

zip -jq $1.zip ./build/$1.js
MODIFIED=$(aws lambda update-function-code --function-name "${TF_WORKSPACE/moonlight-health/emdeo}-${1}" --publish --zip-file "fileb://${1}.zip" --query "LastModified" --output text)
rm $1.zip
echo "Function $1 successfully updated at $MODIFIED"

#!/bin/bash

set -e

./travis/script.sh

cd client
npm test

cd ../lambda
npm test

cd ../qa
rm cypress.env.json
# npm test - uncomment with self hosted runners

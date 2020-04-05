#!/bin/bash

cd terraform
./terraform init
./terraform state mv aws_s3_bucket.patient_forms aws_s3_bucket.app_storage[\"patient-forms\"]

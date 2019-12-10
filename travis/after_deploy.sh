curl "https://d1vvhvl2y92vvt.cloudfront.net/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
export AWS_CONFIG_FILE=.awsconfig

aws cloudfront create-invalidation --distribution-id E1RUJ2RP8VS0PX --paths "/*"
aws cloudfront create-invalidation --distribution-id E2E35W4UJ7YKON --paths "/*"
This directory is responsible for managing Database migrations

## Getting Started

1. Run `npm install`
1. Set the db host
   1. Copy the value of `REACT_APP_RDS_MASTER_HOST` from `client/.env.local`
   1. `export RDS_MASTER_HOST=${PASTE}`
1. Set the db password
   1. Copy the value of `REACT_APP_RDS_MASTER_USER_PASSWORD` from `client/.env.local`
   1. `export REACT_APP_RDS_MASTER_USER_PASSWORD=${PASTE}`

## Adding a script

1. Come up with a name for your script
1. Run `npm run create -- ${NAME_OF_SCRIPT}`

## Running your migration

1. `npm run migrate`

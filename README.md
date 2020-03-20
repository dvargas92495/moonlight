# moonlight

A health service platform connecting specialists with generalists, in an effort to reduce inefficiencies in healthcare.

## Getting Started

1. Clone the repo - `git clone https://github.com/dvargas92495/moonlight.git`
1. Install pre-commit
   1. `pip install pre-commit`
   1. `pre-commit install`
1. Install client dependencies
   1. `cd client`
   1. `npm install`
1. Install aws cli
   1. `pip3 install awscli --upgrade --user`
1. If using windows, Install GNU on Windows
   1. Download installer from https://github.com/bmatzelle/gow/releases/tag/v0.8.0
   2. We need this for `zip`
1. Copy Moonlight env.local file from lastpass to client/.env.local
1. Run the frontend - `npm start` (while in `client/`)
1. Access the app at `localhost:3000`!

This runs your local front end code, against the dvargas.dev.moonlight-health AWS backend.

## Environments

There are three crucial environments in AWS right now. There will soon be a fourth environment coming soon.

### Production

This is the `moonlight-health` environment, reachable at moonlight-health.com. This data is sacred and should be thought of only
live, real customer data should be housed here. Everytime we merge to master, we have a travis job setup to automatically deploy
those changes to production.

### QA

This is the `env1-qa-moonlight-health` environment, reachable at `env1.qa.moonlight-health.com`. This is where we test
our changes before they reach production and only members within the organization should have access to it. Everytime we
push changes to a new branch, those changes get deployed to qa. In the future, we plan to have multiple `*-qa-moonlight-health`
environments in the future to allow for multiple branches to be working concurrently without collisions.

### Dev

This is the `dvargas-dev-moonlight-health` environment, reachable at `dvargas.dev.moonlight-health.com`. This is the developer's
personal playground environment to test out any changes quickly before starting a pull request. Only the developer should have
to it. We plan to have multiple `*-dev-moonlight-health` environments, based on whoever else plans to work at an environment level.

### Local

This still needs to be set up. The idea is to make it so that devs could quickly work on app development with the aws services simulated
locally, without needing a full `dev` environment to test changes like the environment above.

## Directory Structure

We want to keep the root directory as clean as possible. Besides the subdirectories, you'll only find this readme, the gitignore, the
travis spec that we need to fun jobs (could this move to `travis`?), and `pre-commit-config.yaml` config needed to be able to run our
precommit hook (to be moved to a `precommit` directory once we have multiple hooks to run). Each of the subsequent sub folders control
a separate domain of the app, which will have their own READMEs for more information.

- `client` - all of our frontend code
- `db` - all of our database migration scripts
- `lambda` - all of our backend logic
- `qa` - all of our end to end testing that are run on branches
- `terraform` - all of our aws configs managed by terraform
- `travis` - all of our build scripts necessary to deploy to qa and production

## Contribution

Only @dvargas92495 will have access to push directly to master. Please open a pull request, and request a review once the tests pass
on your branch. I plan to keep this repository public, and welcome contributions.

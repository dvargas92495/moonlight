# moonlight

A health service platform connecting mobile surgeons with dental offices.

## Getting Started

1. Clone the repo - `git clone https://github.com/dvargas92495/moonlight.git`
1. Install pre-commit
   1. `pip install pre-commit`
   1. `pre-commit install`
1. Install client dependencies
   1. `cd client`
   1. `npm install`
1. Copy Moonlight env.local file from lastpass to client/.env.local
1. Run the frontend - `npm start` (while in `client/`)
1. Access the app at `localhost:3000`!

This runs your local front end code, against the dvargas.dev.moonlight-health AWS backend.

## Environments

There are three crucial environments in AWS right now. There will soon be a fourth environment coming soon.

### Production

This is the `moonlight-health` environment. This data is sacred and should be thought of only live, real customer
data should be housed here. Everytime we merge to master, we have a travis

# FM Synthesis Study

A web-app for conducting an online FM synthesis semantic study, following the procedure set out in [1]. Built around [lab.js](https://lab.js.org/) and [Express](https://expressjs.com/)

## Installation

Installation is straightforward with:

```zsh
yarn install
```

## Usage

The Node.js process can be started with:

```zsh
yarn start
```

The app will listen on the port specified in the environment variable `process.env.PORT`. If not found, it will default to port 8081. The app will connect to the database specified in the environment variable `process.env.MONGODB_URI`. If not found, it will attempt to connect to the database `test` on `localhost:27017`.

Once started, the experiment can be run by simply navigating to the server address in a browser.

## Accessing Data

Two API endpoints are provided for accessing experiment data in JSON format:

- `/api/get-synth-patches`
- `/api/get-questionnaires`

Entries in these files are linked by the anonymous `participant_id` field which is a unique hash. No personally identifying information is stored.

## References

[1] B. Hayes and C. Saitis, ‘There’s more to timbre than musical instruments: semantic dimensions of FM sounds’, presented at the Timbre, Thessaloniki, Greece (Online), 2020, Advance online publication.

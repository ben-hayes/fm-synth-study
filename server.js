/**
 * @author Ben Hayes <b.j.hayes@se19.qmul.ac.uk>
 */


/**
 * Include npm packages
 */
const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');

/**
 * Include local functions
 */
const makeSynthPatchDoc = require('./store_synth_patches.js');
const createExperimentSpec = require('./create_experiment_spec.js');

/**
 * Define DB collection globals
 */
const SYNTH_PATCH_COLLECTION = "fm_study_synth_patches"
const QUESTIONNAIRE_COLLECTION = "fm_study_questionnaires"

/**
 * Initialise Express
 */
const app = express();
app.use(body_parser.json({
  limit: '50mb', // This is necessary to prevent large responses being rejected
                 // by the server
}));
app.use(express.static('client'));

/**
 * Start MongoDB client, and once ready start Express server
 */
let db;
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = client.db();
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

/**
 * Handles MongoDB errors
 * @param {*} res 
 * @param {*} reason 
 * @param {*} message 
 * @param {*} code 
 */
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

/**
 * API endpoint for storing experiment responses
 */
app.post('/api/store-experiment-data', function(req, res) {
    const participant_id = req.body.metadata.pid;
    const questionnaire_responses = [];
    const synth_patches = [];

    let last_synth_patch = { descriptors: [] };
    for (const entry of req.body.data) {
        if (entry.sender === 'synth') {
            last_synth_patch.synth = entry;
        } else if (entry.sender === 'prompt') {
            last_synth_patch.prompt = entry;
        } else if (entry.sender === 'descriptor') {
            last_synth_patch.descriptors.push(entry);
        } else if (entry.sender === 'synth_sequence') {
            last_synth_patch.participant_id = entry.participant_id;
            last_synth_patch.note = entry.note;
            last_synth_patch.reference_synth = entry.reference_synth;

            const synth_doc = makeSynthPatchDoc(last_synth_patch);
            synth_doc.creation_date = new Date();
            synth_patches.push(synth_doc);
            last_synth_patch = { descriptors: [] };
        } else if (entry.sender === 'questionnaire') {
            questionnaire_responses.push(entry);
        }
    }

    db.collection(QUESTIONNAIRE_COLLECTION)
        .insert(questionnaire_responses[0], (err, doc) => {
        if (err) {
            handleError(res, err.message, "Failed to insert new record");
        } else {
            db.collection(SYNTH_PATCH_COLLECTION)
                .insertMany(synth_patches, (err, doc) => {
                if (err) {
                    handleError(res, err.message, "Failed to insert new record");
                } else {
                    res.sendStatus(201);
                }
            });
        }
    });
});

/**
 * API endpoint for fetching experiment spec (to enable participation)
 */
app.get('/api/get-experiment-spec', function(req, res) {
    db.collection(SYNTH_PATCH_COLLECTION)
        .find().toArray((err, docs) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(createExperimentSpec(docs)));;
        });
});

/**
 * API endpoint for fetching experiment responses
 */
app.get('/api/get-synth-patches', function(req, res) {
    db.collection(SYNTH_PATCH_COLLECTION)
        .find().toArray((err, docs) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(docs));
        });
});

/**
 * API endpoint for fetching questionnaire responses
 */
app.get('/api/get-questionnaires', function(req, res) {
    db.collection(QUESTIONNAIRE_COLLECTION)
        .find().toArray((err, docs) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(docs));
        });
});
const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');

const makeSynthPatchDoc = require('./store_synth_patches.js');
const createExperimentSpec = require('./create_experiment_spec.js');

const SYNTH_PATCH_COLLECTION = "fm_study_synth_patches"
const QUESTIONNAIRE_COLLECTION = "fm_study_questionnaires"

const app = express();
app.use(body_parser.json());
app.use(express.static('client'));

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

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

app.post('/api/save-synth-patch', function(req, res) {
    const synth_data = req.body;
    const synth_doc = makeSynthPatchDoc(synth_data);

    synth_doc.creation_date = new Date();

    db.collection(SYNTH_PATCH_COLLECTION)
        .insert(synth_doc, (err, doc) => {
          if (err) {
            handleError(res, err.message, "Failed to insert new record");
          } else {
            res.status(201);
          }
    });
});

app.post('/api/save-questionnaire', function(req, res) {
    const questionnaire = req.body;

    questionnaire.creationDate = new Date();

    db.collection(QUESTIONNAIRE_COLLECTION)
        .insert(questionnaire, (err, doc) => {
          if (err) {
            handleError(res, err.message, "Failed to insert new record");
          } else {
            res.status(201);
          }
    });
});

app.get('/api/get-experiment-spec', function(req, res) {
    db.collection(SYNTH_PATCH_COLLECTION)
        .find().toArray(synth_patches, (err, docs) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(createExperimentSpec(docs)));;
        });
});
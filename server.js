const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');

const FM_STUDY_COLLECTION = 'fm_study';

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

app.post('/api/save-experiment', function(req, res) {
    const experiment_data = req.body;

    experiment_data.creationData = new Date();

    db.collection(FM_STUDY_COLLECTION)
      .find(
        {'metadata.id': experiment_data.metadata.id},
        (err, count) => {
          if (err) {
            handleError(res, err.message, "Failed to check for existing records");
          } else {
            if (count === 0) {
              db.collection(FM_STUDY_COLLECTION)
                .insert(experiment_data, (err, doc) => {
                  if (err) {
                    handleError(res, err.message, "Failed to insert new record");
                  } else {
                    res.status(201);
                  }
                });
            } else {
              db.collection(FM_STUDY_COLLECTION)
                .updateOne(
                  {'metadata.id': experiment_data.metadata.id},
                  {$push: {data: experiment_data.data}},
                  {upsert: true},
                  (err, doc) => {
                    if (err) {
                      handleError(res, err.message, "Failed to update record");
                    } else {
                      res.status(201);
                    }
                  }
                );
            }
          }
        }
      );
});
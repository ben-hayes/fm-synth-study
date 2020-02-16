const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const FM_STUDY_COLLECTION = 'fm_study';
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

const app = express();
app.use(body_parser.json());
app.use(allowCrossDomain);

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

app.get('/api/test', function(req, res) {
    res.status(200).json({fart:'poop'});
});

app.post('/api/save-experiment', function(req, res) {
    const experiment_data = req.body;

    experiment_data.creationData = new Date();

    db.collection(FM_STUDY_COLLECTION).insertOne(experiment_data, (err, doc) => {
        if (err) {
            handleError(res, err.message, "Failed to insert experiment data");
        } else {
            res.status(201).json(doc.ops[0]);
            console.log("Successfully stored experiment data");
        }
    });
});
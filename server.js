'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {router} = require('./users');
// all the routing for the sleepLog API lives in this file
const logsRouter = require('./routes/logs');

const {PORT, DATABASE_URL} = require('./config');

app.use(express.static('public'));
// We mount the logsRouter at `/api/logs`
app.use('/api/logs', logsRouter);

// able to create username, password, firstName, lastName
app.use('/api/users', router);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let server;

function runServer(databaseUrl, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
        })
        .on('error', err => {
            mongoose.disconnect();
            reject(err);
        });
    });
 });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
            resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block runs.
// but we also export the runServer command so other code (for instance, test code) can start the server as needed.
// When we open this file in order to import app and runServer in a test module, 
// we don't want the server to automatically run, and this conditional block makes that possible.

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
    // app.listen(process.env.PORT || 8080, function () {
    //     mongoose.connect(DATABASE_URL).then(function() {
    //         console.log('Connected!');
    //     }).catch(err => {
    //         console.error(err.message);
    //     });
    //     console.info(`App is listening on ${this.address().port}`);
    // });
}

module.exports = {app, runServer, closeServer};
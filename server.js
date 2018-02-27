'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// all the routing for the sleepLog API lives in this file
const logsRouter = require('./routes/logs');

const {SleepLog} = require('./models');

app.use(express.static('public'));

// We mount the logsRouter at `/api/logs`
app.use('/api/logs', logsRouter);

app.get('/', (req, res) => {
    // res.send('hello');
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/', jsonParser, (req, res) => {
//    SleepLog
//     .create(req.body)
//     .then((log) => res.status(201).json(log.serialize()))
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({message: 'Internal server error'});
//     });
});

// if server.js is called directly (aka, with `node server.js`), this block runs.
// but we also export the runServer command so other code (for instance, test code) can start the server as needed.
// When we open this file in order to import app and runServer in a test module, 
// we don't want the server to automatically run, and this conditional block makes that possible.

if (require.main === module) {
    app.listen(process.env.PORT || 8080, function () {
        console.info(`App is listening on ${this.address().port}`);
    });
}


// let server;

// function runServer() {
//     const port = process.env.PORT || 8080;
//     return new Promise((resolve, reject) => {
//         server = app.listen(port, () => {
//             console.log(`Your app is listening on port ${port}`);
//             resolve(server);
//         }).on('error', err => {
//             reject(err);
//         });
//     });
// }

// function closeServer() {
//     return new Promise((resolve, reject) => {
//         console.log('Closing server!');
//         server.close(err => {
//             if(err) {
//                 reject(err);
//                 return;
//             }
//             resolve();
//         });
//     });
// }

module.exports = {app};
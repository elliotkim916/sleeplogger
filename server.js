'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const passport = require('passport');
const {router: usersRouter} = require('./users');
// all the routing for the sleepLog API lives in this file
const logsRouter = require('./routes/logs');

const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
const {PORT, DATABASE_URL} = require('./config');
const app = express();

app.use(express.static('public'));
// We mount the logsRouter at `/api/logs`
app.use('/api/logs', logsRouter);

// CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.send(204);
    }
    next();
  });
  
passport.use(localStrategy);
passport.use(jwtStrategy);

// able to create username, password, firstName, lastName
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', {session: false});

app.get('/api/protected', jwtAuth, (req, res) => {
    return res.json({
      data: 'rosebud'
    });
  });
  
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
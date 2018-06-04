const mongoose = require('mongoose');
const {DATABASE_URL} = require('../config');
const {SleepLog} = require('../models/logs');

const logSeed = require('../db/logs.json');

mongoose.connect(DATABASE_URL)
    .then(function() {
        return mongoose.connection.db.dropDatabase();
    }).then(function() {
        return SleepLog.insertMany(logSeed);
    }).then(function() {
        return mongoose.disconnect();
    }).catch(err => {
        console.error(err.message);
    });
    

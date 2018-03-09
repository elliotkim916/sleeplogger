'use strict';

const mongoose = require('mongoose');

const sleepLogSchema = mongoose.Schema({
    hoursOfSleep: {type: String, required: true},
    feeling: {type: String},
    description: {type: String},
    created: {type: Date, default: Date.now}
});

sleepLogSchema.methods.serialize = function() {
    return {
        hoursOfSleep: this.hoursOfSleep,
        feeling: this.feeling,
        description: this.description,
        created: this.created
    };
};

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);

module.exports = {SleepLog};
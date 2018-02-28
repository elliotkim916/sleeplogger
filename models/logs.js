'use strict';

const mongoose = require('mongoose');

const sleepLogSchema = mongoose.Schema({
    quality: {type: String, required: true},
    description: {type: String},
    created: {type: Date, default: Date.now}
});

sleepLogSchema.methods.serialize = function() {
    return {
        quality: this.quality,
        description: this.description,
        created: this.created
    };
};

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);

module.exports = {SleepLog};
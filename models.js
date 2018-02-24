const mongoose = require('mongoose');

const sleepLogSchema = mongoose.Schema({
    quality: {type: string, required: true},
    description: {type: string},
    created: {type: Date, default: Date.now}
})
;
sleepLogSchema.methods.serialize = function() {
    return {
        id: this._id,
        quality: this.quality,
        description: this.description,
        created: this.created
    };
};

const sleepLog = mongoose.model('SleepLog', sleepLogSchema);

module.exports = {sleepLog};
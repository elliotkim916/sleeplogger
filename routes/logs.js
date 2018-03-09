'use strict';

const router = require('express').Router();
const jsonParser = require('body-parser').json();

const {SleepLog} = require('../models/logs');

router.get('/', function(req, res) {
    SleepLog
        .find()
        .then(logs => {
            res.json(logs);
        });
});

router.get('/:id', function(req, res) {
    SleepLog
        .findById(req.params.id)
        .then(logs => {
            res.json(logs)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went horribly awry'});
        });
});

router.post('/', jsonParser, function(req, res) {
    // ensure quality and description are in the request body
    const requiredFields = ['hoursOfSleep', 'description'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    
    SleepLog
        .create({
            hoursOfSleep: req.body.hoursOfSleep,
            description: req.body.description,
        }).then(log => res.status(201).json(log))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong..'});
        });
});

router.delete('/:id', (req, res) => {
    console.log(req.params.id);
    SleepLog
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({message: 'Success'});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went terribly wrong..'});
        });
});

router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updatableFields = ['hoursOfSleep', 'description'];
    updatableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    SleepLog   
        .findByIdAndUpdate(req.params.id, { $set: updated}, {new: true})
        .then(updatedPost => {
            res.status(204).end()
        }).catch(err => {
            res.status(500).json({message: 'Something went wrong..'});
        });
});

module.exports = router;
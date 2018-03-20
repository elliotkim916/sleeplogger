'use strict';

const router = require('express').Router();
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');

const {SleepLog} = require('../models/logs');
const passport = require('passport');

router.use(passport.authenticate('jwt', {session: false}));

router.get('/', function(req, res) {
    SleepLog
        .find({creator: req.user.id})
        .then(logs => {
            res.json(logs);
        });
});

router.get('/:id', function(req, res) {
    SleepLog
        .find({creator: req.params.id})
        .exec()
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
    const requiredFields = ['hoursOfSleep', 'feeling', 'description'];
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
            feeling: req.body.feeling,
            description: req.body.description,
            creator: req.body.creator,
            created: Date.now()
        }).then(log => res.status(201).json(log))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong..'});
        });
});

router.delete('/:id', (req, res) => {
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
    const updatableFields = ['hoursOfSleep', 'feeling', 'description'];
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
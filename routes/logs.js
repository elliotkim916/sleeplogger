'use strict';

const router = require('express').Router();
const jsonParser = require('body-parser').json();

const logs = [
    {
        quality: 'Good',
        description: 'Slept a full 8 hours with no interruptions!',
        created: 'February 24, 2018'
    },
    {
        quality: 'Bad',
        description: 'Barely got any sleep, and it was hard to fall asleep because of noisy neighbors!',
        created: 'February 25, 2018'
    },
    {
        quality: 'Good',
        description: 'Sleep was amazing! Felt so energized when I woke up.',
        created: 'February 26, 2018'
    }
];

router.get('/', function(req, res) {
    res.send(logs);
});

router.post('/', jsonParser, function(req, res) {
    logs.push(req.body);
    res.json(req.body).status(200);
});

module.exports = router;
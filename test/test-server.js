'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const id = mongoose.Types.ObjectId();

const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const should = chai.should();

const jwt = require('jsonwebtoken');
const config = require('../config');

const testData = require('../db/logs');

const {SleepLog} = require('../models/logs');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const bodyParser = require('body-parser');
chai.use(chaiHttp);

// deletes db between tests to maintain state between tests
function tearDownDb() {
    console.warn('Deleting database!');
    return mongoose.connection.dropDatabase();
}

const createAuthToken = user => {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const TEST_USER = {
    "id": "333333333333333333333300",
    "username": "davidLee",
    "password": "pleaseWork"
}

const USER_TOKEN = createAuthToken(TEST_USER);

describe('SleepLogger API Resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return SleepLog.insertMany(testData);
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

describe('GET endpoint', function() {
    it('should return all sleep log posts', function() {
        let res;
        return chai.request(app)
            .get('/api/logs')
            .set('Authorization', `Bearer ${ USER_TOKEN }`)
            .then(function(_res) {
                res = _res;
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
            })
    });

    let resSleepLogPost;
    it('should return sleep log post with the right fields', function() {
        return chai.request(app)
            .get('/api/logs')
            .set('Authorization', `Bearer ${ USER_TOKEN }`)
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);

                res.body.forEach(function(post) {
                    expect(post).to.be.a('object');
                    expect(post).to.include.keys('feeling', 'description', 'hoursOfSleep', 'creator', 'created');
                });

                resSleepLogPost = res.body[0];
                return SleepLog.findById(resSleepLogPost._id);
            })

            .then(function(post) {
                expect(resSleepLogPost.feeling).to.equal(post.feeling);
                expect(resSleepLogPost.description).to.equal(post.description);
                expect(resSleepLogPost.hoursOfSleep).to.equal(post.hoursOfSleep);
                expect(new Date(resSleepLogPost.created).toString()).to.equal(post.created.toString());
                expect(resSleepLogPost.creator).to.equal(post.creator.toString());
            });
    });

    describe('POST endpoint', function() {
        it('should add a new sleep log post', function() {
        const newPost = {
            "hoursOfSleep": "12",
            "feeling": "Refreshed & well-rested",
            "description": "Knocked out all night with no distractions!!!",
            "creator": "333333333333333333333300",
            "created": "2018-03-19T02:03:27.000Z"
        }

        return chai.request(app)
            .post('/api/logs')
            .set('Authorization', `Bearer ${ USER_TOKEN }`)
            .send(newPost)
            .then(function(res) {
                expect(res).to.be.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('creator', 'feeling', 'description', 'hoursOfSleep', 'created');
                expect(res.body.creator).to.equal(newPost.creator);
                expect(res.body.feeling).to.equal(newPost.feeling);
                expect(res.body.description).to.equal(newPost.description);
                expect(res.body.hoursOfSleep).to.equal(newPost.hoursOfSleep);
                expect(res.body.created.slice(0, res.body.created.length - 14)).to.equal(newPost.created.slice(0, newPost.created.length - 14));
                return SleepLog.findById(res.body._id);
            })

    // we retrieve new post from the db and compare its data to the data we sent over
        .then(function(post) {
            expect(post.creator.toString()).to.equal(newPost.creator);
            expect(post.feeling).to.equal(newPost.feeling);
            expect(post.description).to.equal(newPost.description);
            expect(post.hoursOfSleep).to.equal(newPost.hoursOfSleep);
            expect((post.created.toJSON()).toString().slice(0, post.created.length - 14)).to.equal((newPost.created).toString().slice(0, post.created.length - 14));
            });
        });
    });

    describe('PUT endpoint', function() {
        it('should update the fields you send over', function() {
            const toUpdate = {
                feeling: 'Moderate I suppose',
                description: 'Neighbors were pretty loud so I had a hard time falling asleep'
            }

        return SleepLog
            .findOne()
            .then(post => {
                toUpdate._id = post._id;
        
        return chai.request(app)
            .put(`/api/logs/${post._id}`)
            .set('Authorization', `Bearer ${ USER_TOKEN }`)
            .send(toUpdate);
        })
        .then(res => {
            expect(res).to.have.status(204);
            return SleepLog.findById(toUpdate._id);
        }) 

    // we retrieve the update post from db and prove the post in db is equal to the updated values we sent over   
        .then(post => {
            expect(toUpdate.feeling).to.equal(post.feeling);
            expect(toUpdate.description).to.equal(post.description);
        });
        });
    });

    describe('DELETE endpoint', function() {
        it('should delete a sleep log post', function() {
            let log;
            return SleepLog
                .findOne()
                .then(function(_log) {
                    log = _log;
                    return chai.request(app)
                    .delete(`/api/logs/${log._id}`)
                    .set('Authorization', `Bearer ${ USER_TOKEN }`)
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return SleepLog.findById(log._id);
                })
                .then(function(_log) {
                    expect(_log).to.be.null;

                });
        });
    });
});   
}); 
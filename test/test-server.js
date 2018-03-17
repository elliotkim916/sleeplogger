'use strict';

const mongoose = require('mongoose');
const id = require('mongoose').Types.ObjectId();

const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const should = chai.should();

const {SleepLog} = require('../models/logs');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// deletes db between tests to maintain state between tests
function tearDownDb() {
    console.warn('Deleting database!');
    return mongoose.connection.dropDatabase();
}

// seeds the db
function seedSleepLogData() {
    console.info('Seeding sleep log data');
    const seedData = [];
    for (let i=1; i<=5; i++) {
        seedData.push(generateTestSleepLogData());
    }
    return SleepLog.insertMany(seedData);
}

// generates fake log data
function generateTestSleepLogData() {
    return {
        hoursOfSleep: faker.lorem.words(),
        feeling: faker.lorem.words(),
        description: faker.lorem.paragraph(),
        created: faker.date.past(),
        creator: id
    }
}

describe('SleepLogger API Resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedSleepLogData();
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
            .then(function(_res) {
                res = _res;
                expect(res).to.be.status(200);
                expect(res.body).to.have.lengthOf.at.least(1);

                return SleepLog.count();
            })

            .then(function(count) {
                expect(res.body).to.have.lengthOf(count);
            });
    });

    let resSleepLogPost;
    it('should return sleep log post with the right fields', function() {
        return chai.request(app)
            .get('/api/logs')
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);

                res.body.forEach(function(post) {
                    expect(post).to.be.a('object');
                    expect(post).to.include.keys('feeling', 'description', 'created', 'hoursOfSleep', 'creator');
                });

                resSleepLogPost = res.body[0];
                return SleepLog.findById(resSleepLogPost._id);
            })
// checking the values in my sleep log post correspond with those in the db
            .then(function(post) {
                expect(resSleepLogPost.feeling).to.equal(post.feeling);
                expect(resSleepLogPost.description).to.equal(post.description);
            });
    });

    describe('POST endpoint', function() {
        it('should add a new sleep log post', function() {
        const newPost = generateTestSleepLogData();
        
        return chai.request(app)
            .post('/api/logs')
            .send(newPost)
            .then(function(res) {
                expect(res).to.be.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('feeling', 'description', 'created', 'hoursOfSleep');
                expect(res.body.feeling).to.equal(newPost.feeling);
                expect(res.body.description).to.equal(newPost.description);
                expect(res.body.hoursOfSleep).to.equal(newPost.hoursOfSleep);
                return SleepLog.findById(res.body._id);
            })
    // we retrieve new post from the db and compare its data to the data we sent over
        .then(function(post) {
            expect(post.feeling).to.equal(newPost.feeling);
            expect(post.description).to.equal(newPost.description);
            expect(post.hoursOfSleep).to.equal(newPost.hoursOfSleep);
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
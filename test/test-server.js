'use strict';

const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app} = require('../server');
const expect = chai.expect;
chai.use(chaiHttp);

describe('sleeplog', function() {
    before(function() {
        app.listen(8080);
    });

    after(function() {
        app.close;
    });

    it('should return 200', function() {
        return chai.request(app)
        .get('/')
        .then(function(res) {
            expect(res).to.have.status(200);
        });
    });
});
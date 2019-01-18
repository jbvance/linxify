'use strict';
//global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const  { Category } = require('../categories/models');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');
const {User} = require('../users');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('/api/categogories', function() {
    const username = 'exampleUser1';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';
    let token = null;
    let user = null;

    before(function() {
        return runServer(TEST_DATABASE_URL);
      });
    
    after(function() {
      return closeServer();
    });
  
    beforeEach(function() {
      user = null;
      return User.hashPassword(password).then(password =>
        User.create({
          username,
          password,
          firstName,
          lastName
        })
        .then(u => { 
          user = u;                         
          token = jwt.sign(
            {
              user: {
                username,
                firstName,
                lastName,
                id: u._id
              }
            },
            JWT_SECRET,
            {
              algorithm: 'HS256',
              subject: username,
              expiresIn: '7d'
            }
          );           
        })
      );
    });
  
    afterEach(function() {    
      User.remove({})     
      .then(function() {
        return Category.remove({});
      });
    });

    describe('POST', function() {
        it ('should not add category if no authenticated user (jwt)', function() {
          return chai
            .request(app)
            .post('/api/categories')
            .send({
              name: 'new category'
            })
            .then(() =>
              expect.fail(null, null, 'Request should not succeed')
            )
            .catch(err => {
              if (err instanceof chai.AssertionError) {
                throw err;
              }
  
              const res = err.response;
              expect(res).to.have.status(401);            
            });
        });

        it ('should add a category', function() {
            return chai
                .request(app)
                .post('/api/categories')
                .set('authorization', `Bearer ${token}`) 
                .send({
                name: 'new category'
                })
                .then((res) =>{
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(201);
                expect(res.body.data.name).to.equal('new category');
                });        
        });

        it ('should delete a category', function() {
            return Category.create({
                name: 'new category',
                user: user._id
            })
            .then(function(category) {
                return chai
                    .request(app)
                    .delete(`/api/categories/${category._id}`)
                    .set('authorization', `Bearer ${token}`)                    
                    .then((res) =>{
                    expect(res.body).to.be.an('object');
                    expect(res.status).to.equal(200);
                    expect(res.body.message).to.equal(`Category '${category.name}' successfully deleted.`);
                    });   
            })
                 
        });

        it ('should update a category', function() {
            return Category.create({
                name: 'new category',
                user: user._id
            })
            .then(function(category) {
                return chai
                    .request(app)
                    .put(`/api/categories/${category._id}`)
                    .set('authorization', `Bearer ${token}`) 
                    .send({ name: 'updated category name'})                   
                    .then((res) =>{
                    expect(res.body).to.be.an('object');
                    expect(res.status).to.equal(200);
                    expect(res.body.data.name).to.equal('updated category name');
                    });   
            })                 
        });

        it ('should get categories for a user', function() {
            return Category.create({
                name: 'new category 1',
                user: user._id
            }, {
                name: 'new category 2',
                user: user._id
            })
            .then(function() {
                return chai
                    .request(app)
                    .get(`/api/categories/`)
                    .set('authorization', `Bearer ${token}`)                                     
                    .then((res) =>{
                    expect(res.body).to.be.an('object');
                    expect(res.status).to.equal(200);
                    expect(res.body.data.length).to.equal(2);
                    });  
            });
        });
    });

});
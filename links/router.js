'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwtAuth = passport.authenticate('jwt', { session: false });
const { createLink, getLinks, deleteLink, updateLink } = require('./linksController');
const errorHandlers = require('../errorHandlers');

const jsonParser = bodyParser.json();

const router = express.Router();

router.use(jwtAuth);

router.post('/', jsonParser, createLink);

router.get('/', getLinks);

router.delete('/:id', deleteLink);

router.put('/:id', jsonParser, errorHandlers.catchErrors(updateLink));

module.exports = {router};

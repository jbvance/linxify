'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwtAuth = passport.authenticate('jwt', { session: false });
const { createCategory, getCategories, deleteCategory, updateCategory } = require('./categoriesController');
const { catchErrors } = require('../errorHandlers');

const jsonParser = bodyParser.json();

const router = express.Router();

router.use(jwtAuth);

router.post('/', jsonParser, catchErrors(createCategory));

router.get('/', catchErrors(getCategories));

router.delete('/:id', catchErrors(deleteCategory));

router.put('/:id', jsonParser, catchErrors(updateCategory));

module.exports = {router};
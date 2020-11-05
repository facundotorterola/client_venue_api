/* eslint-disable no-use-before-define */
const express = require('express');

const router = express.Router();
const Controller = require('./index');
const response = require('../../../network/response');

// Router
router.get('/', list);
router.get('/:id', get);
router.post('/', insert);
router.put('/:id', update);
router.delete('/:id', deleteVenue);

function list(req, res, next) {
  Controller.list()
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

function get(req, res, next) {
  Controller.get(req.params.id)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

function insert(req, res, next) {
  Controller.insert(req.body)
    .then((data) => {
      response.success(req, res, data, 201);
    })
    .catch(next);
}

function update(req, res, next) {
  Controller.update(req.params.id, req.body)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

function deleteVenue(req, res, next) {
  Controller.deleteVenue(req.params.id)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

module.exports = router;

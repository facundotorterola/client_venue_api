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
router.delete('/:id', deleteClient);

// FavoriteVenue
router.get('/favoriteVenues/:id', listFavoriteVenues);
router.post('/favoriteVenues/:id', insertFavoriteVenues);
router.delete('/favoriteVenues/:idClient/:idVenue', deleteFavoriteVenues);

function list(req, res, next) {
  Controller.list(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

function get(req, res, next) {
  Controller.get(req.params.id)
    .then((data) => {
      console.log(data);
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

function deleteClient(req, res, next) {
  Controller.deleteClient(req.params.id)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

// Favorite Venues

function listFavoriteVenues(req, res, next) {
  Controller.listFavoriteVenues(req.params.id)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

function insertFavoriteVenues(req, res, next) {
  Controller.insertFavoriteVenues(req.params.id, req.body)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

function deleteFavoriteVenues(req, res, next) {
  Controller.deleteFavoriteVenues(req.params.idClient, req.params.idVenue)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
}

module.exports = router;

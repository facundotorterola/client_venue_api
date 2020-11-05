const chai = require('chai');
const chaiHttp = require('chai-http');
const { it, describe, beforeEach } = require('mocha');

const { expect } = require('chai');
const chalk = require('chalk');
const config = require('../config');

const fakerVenue = require('./factories/venue');

const store = require('../store/mysql');

chai.use(chaiHttp);
const url = `${config.api.host}:${config.api.port}`;
const TABLE = 'Venue';

beforeEach(async () => {
  await store.clearTable(TABLE);
});
describe(chalk.underline('Get all venues'), () => {
  it('should returns empty venues', async () => {
    const res = await chai.request(url).get('/api/venue/');
    expect(res).to.have.status(200);
  });
  it('should returns all venues', async () => {
    const venueDummy = fakerVenue.venue();
    let venueInserted = await store.insert(TABLE, venueDummy);
    venueDummy.id = venueInserted.id;
    const venueDummyTwo = fakerVenue.venue();
    venueInserted = await store.insert(TABLE, venueDummyTwo);
    venueDummyTwo.id = venueInserted.id;
    const res = await chai.request(url).get('/api/venue/');
    console.log(res.body);
    expect(res).to.have.status(200);
    console.log(res.body);
    const venues = res.body.body;
    expect(venues).to.have.length(2);
    expect(venues).to.eql([venueDummy, venueDummyTwo]);
  });
});

describe(chalk.underline('Get venue by id'), () => {
  it('should return venue with id', async () => {
    const venueDummy = fakerVenue.venue();
    const venueInserted = await store.insert(TABLE, venueDummy);
    venueDummy.id = venueInserted.id;
    const idInserted = venueInserted.id;
    const res = await chai.request(url).get(`/api/venue/${idInserted}`);
    expect(res).to.have.status(200);
    const venue = res.body.body;
    expect(venue).to.eql(venueDummy);
  });
  it('should returns not found', async () => {
    const lastId = await store.getLastId();
    const res = await chai.request(url).get(`/api/venue/${lastId + 1}`);
    expect(res).to.have.status(404);
  });
});

describe(chalk.underline('Create venue'), () => {
  it('should create venue', async () => {
    const venueToCreate = fakerVenue.venue();
    const res = await chai.request(url).post('/api/venue/').send(venueToCreate);
    expect(res).to.have.status(201);
    const venue = res.body.body;
    expect(venue).to.have.property('name').to.be.equal(venueToCreate.name);
  });
  it('should not create venue without name', async () => {
    const venueToCreate = fakerVenue.venueWithoutName();
    const res = await chai.request(url).post('/api/venue/').send(venueToCreate);
    expect(res).to.have.status(403);
  });
});

describe(chalk.underline('Update venue'), () => {
  it('should update venue', async () => {
    const venueDummy = fakerVenue.venue();
    const venueInserted = await store.insert(TABLE, venueDummy);
    const venueToUpdate = fakerVenue.venue();
    const idInserted = venueInserted.id;
    const res = await chai
      .request(url)
      .put(`/api/venue/${idInserted}`)
      .send(venueToUpdate);
    expect(res).to.have.status(200);
    const venue = res.body.body;
    venueToUpdate.id = idInserted;
    expect(venue).to.eql(venueToUpdate);
  });
  it('should return not found', async () => {
    const venueToUpdate = fakerVenue.venue();
    const lastId = await store.getLastId();
    const res = await chai
      .request(url)
      .put(`/api/venue/${lastId + 1}`)
      .send(venueToUpdate);
    console.log(res.body);
    expect(res).to.have.status(404);
  });
});

describe(chalk.underline('Delete venue'), () => {
  it('should delete a venue', async () => {
    const venueDummy = fakerVenue.venue();
    const venueInserted = await store.insert(TABLE, venueDummy);
    const idInserted = venueInserted.id;
    const res = await chai.request(url).delete(`/api/venue/${idInserted}`);
    expect(res).to.have.status(200);
    const resGet = await chai.request(url).get(`/api/venue/${idInserted}`);
    expect(resGet).to.have.status(404);
  });
  it('should return not found', async () => {
    const lastId = await store.getLastId();
    const res = await chai.request(url).delete(`/api/venue/${lastId + 1}`);
    expect(res).to.have.status(404);
  });
});

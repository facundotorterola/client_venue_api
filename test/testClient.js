const chai = require('chai');
const chaiHttp = require('chai-http');
const { it, describe, beforeEach, before, after } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const chalk = require('chalk');
const config = require('../config');
const fakerClient = require('./factories/client');
const fakerVenue = require('./factories/venue');
const store = require('../store/mysql');

chai.use(chaiHttp);
const url = `${config.api.host}:${config.api.port}`;
const TABLE = 'Client';

before(() => {
  sinon.stub(console, 'log'); // disable console.log
  sinon.stub(console, 'info'); // disable console.info
  sinon.stub(console, 'warn'); // disable console.warn
  sinon.stub(console, 'error'); // disable console.error
});
beforeEach(async () => {
  await store.clearTable(TABLE);
});
after(() => {
  console.log.restore(); // enable console.log
  console.info.restore(); // enable console.info
  console.warn.restore(); // enable console.warn
  console.error.restore(); // enable console.error
});

describe(chalk.underline('GET all clients'), () => {
  it('should returns empty clients', async () => {
    const res = await chai.request(url).get('/api/client/');
    expect(res).to.have.status(200);
  });
  it('should returns all clients', async () => {
    let clientDummy = fakerClient.client();
    const clientInserted = await store.insert(TABLE, clientDummy);
    clientInserted.favoriteVenues = [];
    clientDummy = fakerClient.client();
    const clientInsertedTwo = await store.insert(TABLE, clientDummy);
    clientInsertedTwo.favoriteVenues = [];

    const res = await chai.request(url).get('/api/client/');
    expect(res).to.have.status(200);
    console.log(res.body);
    const clients = res.body.body;
    expect(clients).to.have.length(2);
    expect(clients).to.eql([clientInserted, clientInsertedTwo]);
  });

  it('should returns all clients between 10 and 30 years ', async () => {
    let clientDummy = fakerClient.client(15);
    const clientInserted = await store.insert(TABLE, clientDummy);
    clientInserted.favoriteVenues = [];
    clientDummy = fakerClient.client(5);
    await store.insert(TABLE, clientDummy);

    clientDummy = fakerClient.client(60);
    await store.insert(TABLE, clientDummy);

    clientDummy = fakerClient.client(25);
    const clientInsertedTwo = await store.insert(TABLE, clientDummy);
    clientInsertedTwo.favoriteVenues = [];

    let res = await chai.request(url).get('/api/client/');
    expect(res).to.have.status(200);
    console.log(res.body);
    expect(res.body.body).to.have.length(4);
    res = await chai.request(url).get('/api/client?minAge=10&maxAge=30');
    const clients = res.body.body;
    expect(clients).to.have.length(2);
    expect(clients).to.eql([clientInserted, clientInsertedTwo]);
  });
});

describe(chalk.underline('Get client by id'), () => {
  it('should return client with id', async () => {
    const clientDummy = fakerClient.client();
    const clientInserted = await store.insert(TABLE, clientDummy);
    clientInserted.favoriteVenues = [];
    const res = await chai.request(url).get(`/api/client/${clientInserted.id}`);
    expect(res).to.have.status(200);
    const client = res.body.body;
    expect(client).to.eql(clientInserted);
  });
  it('should returns not found', async () => {
    const lastId = await store.getLastId();
    const res = await chai.request(url).get(`/api/client/${lastId + 1}`);
    expect(res).to.have.status(404);
  });
});

describe(chalk.underline('Create client'), () => {
  it('should create client', async () => {
    const clientCreated = fakerClient.client();

    const res = await chai
      .request(url)
      .post('/api/client/')
      .send(clientCreated);
    expect(res).to.have.status(201);
    const client = res.body.body;
    clientCreated.id = client.id;
    clientCreated.favoriteVenues = [];
    expect(client).to.eql(clientCreated);
  });

  it('should not create client without email', async () => {
    const clientCreated = fakerClient.clientWithoutEmail();
    console.log(clientCreated);
    const res = await chai
      .request(url)
      .post('/api/client/')
      .send(clientCreated);
    expect(res).to.have.status(403);
  });

  it('should not create client without name', async () => {
    const clientCreated = fakerClient.clientWithoutName();
    const res = await chai
      .request(url)
      .post('/api/client/')
      .send(clientCreated);
    expect(res).to.have.status(403);
  });
});

describe(chalk.underline('Update client'), () => {
  it('should update client', async () => {
    const clientData = fakerClient.client();
    const clientToCreate = await store.insert(TABLE, clientData);
    const clientUpdate = fakerClient.client();
    clientUpdate.id = clientToCreate.id;
    const idInserted = clientToCreate.id;
    const res = await chai
      .request(url)
      .put(`/api/client/${idInserted}`)
      .send(clientUpdate);
    expect(res).to.have.status(200);
    const client = res.body.body;
    expect(client).to.eql(clientUpdate);
  });

  it('should returns not found', async () => {
    const lastId = await store.getLastId();
    const clientUpdate = fakerClient.client();
    const res = await chai
      .request(url)
      .put(`/api/client/${lastId + 1}`)
      .send(clientUpdate);
    expect(res).to.have.status(404);
  });
});

describe(chalk.underline('Delete client'), () => {
  it('should delete client', async () => {
    const clientData = fakerClient.client();
    const clientToDelete = await store.insert(TABLE, clientData);
    const res = await chai
      .request(url)
      .delete(`/api/client/${clientToDelete.id}`);
    expect(res).to.have.status(200);
  });

  it('should returns error cannot delete a client does not exist', async () => {
    const clientData = fakerClient.client();
    const clientToDelete = await store.insert(TABLE, clientData);
    const res = await chai
      .request(url)
      .delete(`/api/client/${clientToDelete.id + 1}`);
    expect(res).to.have.status(404);
  });
});

describe(chalk.underline('Add favorites venues for client'), () => {
  it('should add a venue to favoriteVenues client', async () => {
    await store.clearTable('Venue');
    const clientData = fakerClient.client();
    const clientToSetFavoriteVenue = await store.insert(TABLE, clientData);
    const favoriteVenue = await store.insert('Venue', fakerVenue.venue());
    const data = {
      venueId: favoriteVenue.id,
    };
    const res = await chai
      .request(url)
      .post(`/api/client/favoriteVenues/${clientToSetFavoriteVenue.id}`)
      .send(data);
    expect(res).to.have.status(200);

    const favoriteVenues = res.body.body;
    expect(favoriteVenues).to.have.length(1);
    expect(favoriteVenues).to.eql([favoriteVenue]);
  });

  it('should return not found', async () => {
    const favoriteVenue = await store.insert('Venue', fakerVenue.venue());
    const data = {
      venueId: favoriteVenue.id,
    };
    const res = await chai
      .request(url)
      .post('/api/client/favoriteVenues/999')
      .send(data);
    expect(res).to.have.status(500);
  });
});

describe(chalk.underline('Get favorites venues of client'), () => {
  it('should return the favorite Venues of the client', async () => {
    await store.clearTable('Venue');
    await store.clearTable('FavoriteVenues');

    const clientData = fakerClient.client();
    const clientToSetFavoriteVenue = await store.insert(TABLE, clientData);
    const venueDummy = fakerVenue.venue();
    const favoriteVenue = await store.insert('Venue', venueDummy);
    const data = {
      clientId: clientToSetFavoriteVenue.id,
      venueId: favoriteVenue.id,
    };
    venueDummy.id = favoriteVenue.id;
    await store.insert('FavoriteVenues', data);
    const res = await chai
      .request(url)
      .get(`/api/client/favoriteVenues/${clientToSetFavoriteVenue.id}`);
    console.log(res.body);
    expect(res).to.have.status(200);
    const favoriteVenues = res.body.body;
    expect(favoriteVenues).to.have.length(1);
    expect(favoriteVenues).to.eql([favoriteVenue]);
  });

  it('should delete in cascade favorites venues client', async () => {
    let venueDummy = fakerVenue.venue();
    const venueToDelete = await store.insert('Venue', venueDummy);
    venueDummy = fakerVenue.venue();
    const venueToConserve = await store.insert('Venue', venueDummy);
    const clientDummy = fakerClient.client();
    const client = await store.insert(TABLE, clientDummy);
    let data = {
      clientId: client.id,
      venueId: venueToDelete.id,
    };
    await store.insert('FavoriteVenues', data);

    data = {
      clientId: client.id,
      venueId: venueToConserve.id,
    };
    await store.insert('FavoriteVenues', data);

    let res = await chai
      .request(url)
      .get(`/api/client/favoriteVenues/${client.id}`);
    expect(res).to.have.status(200);
    let favoriteVenues = res.body.body;
    expect(favoriteVenues).to.have.length(2);
    expect(favoriteVenues).to.eql([venueToDelete, venueToConserve]);

    const query = `id = ${venueToDelete.id}`;
    await store.deleteRow('Venue', query);
    res = await chai
      .request(url)
      .get(`/api/client/favoriteVenues/${client.id}`);
    favoriteVenues = res.body.body;
    expect(favoriteVenues).to.have.length(1);
    expect(favoriteVenues).to.eql([venueToConserve]);
  });
});

describe(chalk.underline('Delete favorites venues for client'), () => {
  it('should delete the favorite venue', async () => {
    await store.clearTable('Venue');
    await store.clearTable('FavoriteVenues');
    const clientData = fakerClient.client();
    const clientToSetFavoriteVenue = await store.insert(TABLE, clientData);
    const venueDummy = fakerVenue.venue();
    const favoriteVenue = await store.insert('Venue', venueDummy);
    const data = {
      clientId: clientToSetFavoriteVenue.id,
      venueId: favoriteVenue.id,
    };
    venueDummy.id = favoriteVenue.id;
    await store.insert('FavoriteVenues', data);
    let res = await chai
      .request(url)
      .get(`/api/client/favoriteVenues/${clientToSetFavoriteVenue.id}`);

    console.log(res.body);
    expect(res).to.have.status(200);
    const favoriteVenues = res.body.body;
    expect(favoriteVenues).to.have.length(1);
    expect(favoriteVenues).to.eql([venueDummy]);
    res = await chai
      .request(url)
      .delete(
        `/api/client/favoriteVenues/${clientToSetFavoriteVenue.id}/${favoriteVenue.id}`
      );
    expect(res).to.have.status(200);
    res = await chai
      .request(url)
      .get(`/api/client/favoriteVenues/${clientToSetFavoriteVenue.id}`);
    expect(res).to.have.status(200);
    expect(res.body.body).to.have.length(0);
  });
});

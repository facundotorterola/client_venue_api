/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const TABLE = 'Client';
const TABLE_FAVORITEVENUES = 'FavoriteVenues';
const error = require('../../../utils/error');

module.exports = (injectedStore) => {
  let store = injectedStore;
  if (!store) {
    // eslint-disable-next-line global-require
    store = require('../../../store/mysql');
  }

  function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;

    return re.test(email);
  }

  function getClientsIds(clients) {
    const clientsIds = [];
    clients.forEach((client) => {
      clientsIds.push(client.id);
    });
    return clientsIds;
  }

  async function listFavoriteVenues(id, ids) {
    const join = {};
    join.Venue = 'venueId';
    let query;
    let columns;
    if (ids) {
      query = `clientId IN (${ids.toString()})`;
      columns = ['Venue.id', 'Venue.name', 'FavoriteVenues.clientId'];
    } else {
      query = `clientId = ${id}`;
      columns = ['Venue.id', 'Venue.name'];
    }
    return store.query(TABLE_FAVORITEVENUES, query, join, columns);
  }

  async function list(filter) {
    let clients;
    if (filter && Object.keys(filter).length > 0) {
      let query = '';
      if (filter.minAge) {
        query += `age > ${filter.minAge}`;
      }
      if (filter.maxAge && query.length > 0) {
        query += ` AND age< ${filter.maxAge}`;
      } else if (filter.maxAge) {
        query += `age < ${filter.maxAge}`;
      }

      clients = await store.query(TABLE, query);
    } else {
      clients = await store.list(TABLE);
    }

    if (clients.length !== 0) {
      const clientsIds = getClientsIds(clients);
      let clientsFavoriteVenues = await listFavoriteVenues(0, clientsIds);
      for (let i = 0; i < clients.length; i++) {
        clients[i].favoriteVenues = clientsFavoriteVenues.filter(
          (favoriteVenue) => favoriteVenue.clientId === clients[i].id
        );

        // remove elements
        clientsFavoriteVenues = clientsFavoriteVenues.filter(
          (favoriteVenue) => favoriteVenue.clientId !== clients[i].id
        );

        clients[i].favoriteVenues.forEach((item) => delete item.clientId);
      }
    }
    return clients;
  }

  async function get(id) {
    const client = await store.get(TABLE, id);
    client.favoriteVenues = await listFavoriteVenues(id);
    return client;
  }
  async function insert(data) {
    let client = {
      name: data.name,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
    };
    if (!client.name) {
      throw error('Client: the name is required', 403);
    }
    if (!client.email || !validateEmail(client.email)) {
      throw error('Client: the emails is required', 403);
    }
    client = await store.insert(TABLE, client);
    client.favoriteVenues = [];
    return client;
  }

  async function update(id, data) {
    const client = {
      id,
      name: data.name,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
    };
    return store.update(TABLE, client);
  }

  async function deleteClient(id) {
    const query = `id = ${id}`;
    return store.deleteRow(TABLE, query);
  }

  async function insertFavoriteVenues(id, data) {
    const favoriteVenue = {
      clientId: id,
      venueId: data.venueId,
    };
    await store.insert(TABLE_FAVORITEVENUES, favoriteVenue);
    return listFavoriteVenues(id);
  }

  async function deleteFavoriteVenues(clientId, venueId) {
    const query = `clientId = ${clientId} AND venueId= ${venueId}`;
    return store.deleteRow(TABLE_FAVORITEVENUES, query);
  }

  return {
    list,
    get,
    insert,
    update,
    deleteClient,
    listFavoriteVenues,
    insertFavoriteVenues,
    deleteFavoriteVenues,
  };
};

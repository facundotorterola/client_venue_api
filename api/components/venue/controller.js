/* eslint-disable global-require */
const TABLE = 'Venue';
const error = require('../../../utils/error');

module.exports = (injectedStore) => {
  let store = injectedStore;
  if (!store) {
    store = require('../../../store/mysql');
  }
  async function list() {
    const venues = await store.list(TABLE);
    return venues;
  }

  function get(id) {
    return store.get(TABLE, id);
  }
  async function insert(data) {
    const venue = {
      name: data.name,
    };
    if (!venue.name) {
      throw error('Venue: the name is required', 403);
    }
    return store.insert(TABLE, venue);
  }

  async function update(id, data) {
    const venue = {
      id,
      name: data.name,
    };
    return store.update(TABLE, venue);
  }

  async function deleteVenue(id) {
    const query = `id = ${id}`;
    return store.deleteRow(TABLE, query);
  }

  return {
    list,
    get,
    insert,
    update,
    deleteVenue,
  };
};

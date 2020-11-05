/* eslint-disable no-shadow */
const mysql = require('mysql');

const config = require('../config');
const error = require('../utils/error');

const dbConfig = {
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
};

// Connection
let connection;

function handleConnection() {
  connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.error('[db error]', err);
      setTimeout(handleConnection(), 2000);
    } else {
      console.log('DB Connection success');
    }
  });
  connection.on('error', (err) => {
    console.error('[db error]', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleConnection();
    } else {
      throw err;
    }
  });
}
handleConnection();

function list(TABLA) {
  console.log(`[DB query] SELECT * FROM ${TABLA};`);
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM ${TABLA};`, (err, result) => {
      if (!err) {
        resolve(result);
      }
      reject(err);
    });
  });
}

function get(TABLA, id) {
  console.log(`[DB query] SELECT * FROM ${TABLA} WHERE id=${id};`);

  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM ${TABLA} WHERE id=${id};`,
      (err, result) => {
        if (!err) {
          if (result.length === 0) {
            reject(error(`the ${TABLA} has not object with id=${id}`, 404));
          }
          resolve(result[0]);
        }
        reject(err);
      }
    );
  });
}

function insert(TABLA, data) {
  console.log(`[DB query] INSERT INTO ${TABLA} SET ?`, data);

  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO ${TABLA} SET ?`,
      data,
      async (err, result) => {
        if (!err) {
          const row = await get(TABLA, result.insertId);
          resolve(row);
        }
        reject(err);
      }
    );
  });
}

function query(TABLA, query, join, columns) {
  let joinQuery = '';
  let columnsQuery = '*';
  if (join) {
    const key = Object.keys(join)[0];
    joinQuery = `INNER JOIN ${key} ON ${key}.id =${TABLA}.${join[key]}`;
  }
  if (columns) {
    columnsQuery = columns.toString();
  }
  console.log(
    `[DB query] SELECT ${columnsQuery} FROM ${TABLA} ${joinQuery} WHERE ${query};`
  );

  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT ${columnsQuery} FROM ${TABLA} ${joinQuery} WHERE ${query};`,
      (err, result) => {
        if (!err) {
          resolve(result);
        }
        reject(err);
      }
    );
  });
}

function update(TABLA, data) {
  console.log(`[DB query] UPDATE ${TABLA} SET ? WHERE id=?`, [data, data.id]);

  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE ${TABLA} SET ? WHERE id=?`,
      [data, data.id],
      async (err, result) => {
        if (!err) {
          console.log(err);
          console.log(result);
          if (result.affectedRows === 0) {
            reject(
              error(`the ${TABLA} has not object with id=${data.id}`, 404)
            );
          }
          const row = await get(TABLA, data.id);
          resolve(row);
        }
        reject(err);
      }
    );
  });
}

function deleteRow(TABLA, query) {
  console.log(`DELETE FROM ${TABLA} WHERE ${query}`);

  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM ${TABLA} WHERE ${query}`, (err, result) => {
      if (!err) {
        if (result.affectedRows !== 0) {
          resolve({ success: true });
        } else {
          reject(error(`the ${TABLA} has not object with ${query}`, 404));
        }
      }
      reject(err);
    });
  });
}

function clearTable(TABLA) {
  // console.log(`DELETE FROM ${TABLA}`);

  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM ${TABLA};`, (err, result) => {
      if (!err) {
        resolve(result);
      }
      reject(err);
    });
  });
}

function getLastId() {
  console.log('SELECT LAST_INSERT_ID() as lastId;');
  return new Promise((resolve, reject) => {
    connection.query('SELECT LAST_INSERT_ID() as lastId;', (err, result) => {
      if (!err) {
        console.log(result[0].lastId);
        resolve(result[0].lastId);
      }
      reject(err);
    });
  });
}

module.exports = {
  list,
  get,
  insert,
  update,
  query,
  deleteRow,
  clearTable,
  getLastId,
};

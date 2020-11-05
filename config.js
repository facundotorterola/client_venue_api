let config;
if (process.env.ENV === 'TEST') {
  config = {
    api: {
      host: process.env.HOST || 'localhost',
      port: process.env.API_PORT || 3001,
    },
    mysql: {
      host: process.env.MYSQL_HOST_TEST || 'remotemysql.com',
      user: process.env.MYSQL_USER_TEST || '2ON1aRi39u',
      password: process.env.MYSQL_PASSWORD_TEST || 'LPiXmZhu5D',
      database: process.env.MYSQL_DB_TEST || '2ON1aRi39u',
    },
  };
} else {
  config = {
    api: {
      host: process.env.HOST || 'localhost',
      port: process.env.API_PORT || 3000,
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'remotemysql.com',
      user: process.env.MYSQL_USER || '1AuNiyXKsl',
      password: process.env.MYSQL_PASSWORD || 'KeVJExdIml',
      database: process.env.MYSQL_DB || '1AuNiyXKsl',
    },
  };
}
module.exports = config;

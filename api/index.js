const app = require('./app');
const config = require('../config');

app.listen(config.api.port, () => {
  console.log('Api listening on port ', config.api.port);
});

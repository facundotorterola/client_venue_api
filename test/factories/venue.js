const faker = require('faker');

function venue() {
  return {
    name: faker.company.companyName(),
  };
}

function venueWithoutName() {
  return {};
}

module.exports = {
  venue,
  venueWithoutName,
};

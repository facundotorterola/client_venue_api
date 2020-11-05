const faker = require('faker');

function client(age) {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age:
      age ||
      faker.random.number({
        max: 100,
        min: 1,
      }),
  };
}

function clientWithoutEmail() {
  return {
    name: faker.name.findName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: faker.random.number(),
  };
}

function clientWithoutName() {
  return {
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: faker.random.number(),
  };
}

module.exports = {
  client,
  clientWithoutEmail,
  clientWithoutName,
};

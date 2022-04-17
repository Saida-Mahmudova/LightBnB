const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'saidamahmudova',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => { console.log(response) })
const getAllProperties = (options, limit) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [10])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
/// Users

const getUserWithEmail = (email) => {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      return result.rows[0]
    })
    .catch((err) => {
      console.log(err.message)
    })
}
exports.getUserWithEmail = getUserWithEmail;


const getUserWithId = (id) => {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      return result.rows[0]
    })
    .catch((err) => {
      console.log(err.message)
    })
}
exports.getUserWithId = getUserWithId;


const addUser = (user) => {
  return pool
    .query(`INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.email, user.password])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message)
    })
}
exports.addUser = addUser;

/// Reservations

const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
//  * Get all properties.
//  * @param {{}} options An object containing query options.
//  * @param {*} limit The number of results to return.
//  * @return {Promise<[{}]>}  A promise to the properties.
//  */
// const getAllProperties = function (options, limit = 10) {
//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// }
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;

const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'saidamahmudova',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

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

const getAllReservations = function (guest_id, limit) {
  return pool
    .query(`SELECT reservations.*, properties.*, AVG(rating) as average_rating
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON property_reviews.property_id = reservations.property_id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.id, properties.title, cost_per_night
    ORDER BY start_date DESC
    LIMIT $2;`, [guest_id, 10])
    .then(res => res.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => { console.log(response) })
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += `WHERE owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night > $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night > $${queryParams.length}`;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night$ < $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night < $${queryParams.length}`;
    }
  }

  queryString += `GROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    if (queryParams.length === 1) {
      queryString += `
    HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
    } else {
      queryString += ` 
    HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
    }
  }

  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 6
  return pool.query(queryString, queryParams).then(res => res.rows);
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (properties) {

  return pool
    .query(`
    INSERT INTO properties(title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
    `, [properties.title, properties.description, properties.thumbnail_photo_url,
    properties.cover_photo_url, properties.cost_per_night, properties.parking_spaces,
    properties.number_of_bathrooms, properties.number_of_bedrooms, properties.country,
    properties.street, properties.city, properties.province, properties.post_code])
    .then((newProperty) => {
      return newProperty.rows[0]
    })
    .catch((err) => err.message);
}
exports.addProperty = addProperty;
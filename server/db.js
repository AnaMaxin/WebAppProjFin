/*Import pg pool module. This is a middleware to connect the server with the postgres database*/
const Pool = require("pg").Pool;

/* Instantiate Pool object. Provide the parameters to establish the connection with the database.*/
const pool = new Pool({
  user: "admin01",
  password: "5432",
  host: "localhost",
  port: 5432,
  database: "web_application_database",
});

module.exports = pool;

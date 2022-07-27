const sqlite3 = require('sqlite3').verbose();

/**
 * Create a connection to sqllite database named "WebTools.db"
 */
let db_connection = new sqlite3.Database('./WebTools.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });

  module.exports.connection = db_connection;
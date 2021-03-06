// Set up MySQL connection.
const mysql = require("mysql");

let connection;
// setting up the code to connect Node to MySql -
// JawsDB - provides a fully functional MySql DB server - to use with Heroku app (run this to get the query: heroku config -a [appName])
if (process.env.JAWSDB_URL) {
  console.log("Running the database from Heroku...");
  connection = mysql.createConnection(process.env.JAWSDB_URL);
  console.log("Heroku connection through queryString created.");
} else {
  connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "wa8bxbm0ennqp83q",
  });
}

// To user ClearDB addon in Heroku, use this article for a step-by-step procedure:
// https://bezkoder.com/deploy-node-js-app-heroku-cleardb-mysql/

// Make connection.
connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

// Export connection for our ORM to use.
module.exports = connection;

// Import the mssql package for interacting with SQL Server.
const sql = require('mssql');

// Load environment variables from a .env file into process.env.
require('dotenv').config();

// Configuration object for the SQL Server connection.
const config = {
    user: process.env.DB_USER, // Database username from environment variables.
    password: process.env.DB_PASSWORD, // Database password from environment variables.
    server: process.env.DB_SERVER, // Database server address, e.g., 'localhost' or 'ip_address'.
    database: process.env.DB_DATABASE, // Database name from environment variables.
    port: parseInt(process.env.DB_PORT, 10), // Database port number, default for SQL Server is 1433.
    options: {
        encrypt: false, // Set to true if using Azure SQL Database or to enable encryption.
        enableArithAbort: true, // Option to enable or disable arithmetic abort.
    }
};

// Create a connection pool and connect to the SQL Server using the configuration.
const poolPromise = new sql.ConnectionPool(config)
    .connect() // Attempt to establish a connection.
    .then(pool => {
        console.log('Connected to SQL Server'); // Log success message on successful connection.
        return pool; // Return the connected pool.
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err); // Log error message on failure.
        throw err; // Throw the error to be handled by the calling code.
    });

// Export the sql module and the poolPromise for use in other parts of the application.
module.exports = {
    sql, poolPromise
};
// Import the sql module and poolPromise from the database configuration file.
const { sql, poolPromise } = require('../config/db');

/**
 * Retrieves data from the specified table and columns in SQL Server.
 * 
 * This function constructs and executes a SELECT query to retrieve specific columns
 * from the given table. It uses the poolPromise for database connection management.
 * 
 * @param {string} tableName - The name of the table to query.
 * @param {Object} columns - An object representing the columns to retrieve. 
 *                            The object keys should be the column names.
 * @returns {Promise<Array>} - A promise that resolves to the retrieved data as an array of records.
 * @throws {Error} - Throws an error if the query execution fails.
 */
async function getDataFromSQLServer(tableName, columns) {
    try {
      console.log(`Connecting to the database to fetch data from table: ${tableName} with columns: ${columns.join(', ')}`);
      
      // Await the database connection pool
      const pool = await poolPromise;
  
      // Join the column names into a comma-separated string
      const columnNames = columns.join(', ');
      // Construct the SQL query
      const query = `SELECT ${columnNames} FROM ${tableName}`;
  
      console.log(`Executing query: ${query}`);

      // Execute the query and await the result
      const result = await pool.request().query(query);
  
      // Return the data as an array of records
      return result.recordset;
    } catch (err) {
      // Log any errors during the process
      console.error("Error retrieving data from the database:", err);
      
      // Throw a new error to propagate it further
      throw new Error(err);
    }
  }

/**
 * Retrieves data from the specified table and columns with a WHERE condition in SQL Server.
 * 
 * This function is similar to getDataFromSQLServer, but it allows filtering the results 
 * by a specified condition (WHERE clause). It uses the poolPromise for database connection management.
 * 
 * @param {string} tableName - The name of the table to query.
 * @param {Object} columns - An object representing the columns to retrieve. 
 *                            The object keys should be the column names.
 * @param {string} condition - The WHERE condition for filtering the results.
 * @returns {Promise<Array>} - A promise that resolves to the filtered data as an array of records.
 * @throws {Error} - Throws an error if the query execution fails.
 */
async function getDataFromSQLServerWithCondition(tableName, columns, condition) {
    try {
      console.log(`Connecting to the database to fetch data from table: ${tableName} with columns: ${Object.keys(columns).join(', ')}`);
      
      // Await the database connection pool
      const pool = await poolPromise;
  
      // Join the column names into a comma-separated string
      const columnNames = columns.join(', ');

      // Construct the SQL query with the WHERE condition
      const query = `SELECT ${columnNames} FROM ${tableName} WHERE ${condition}`;
  
      console.log(`Executing query: ${query}`);

      // Execute the query and await the result
      const result = await pool.request().query(query);
  
      // Return the data as an array of records
      return result.recordset;
    } catch (err) {
      // Log any errors during the process
      console.error("Error retrieving data from the database:", err);
      
      // Throw a new error to propagate it further
      throw new Error(err);
    }
  }



  /**
 * Inserts the fetched data into the regles table in SQL Server.
 * 
 * @param {Array} data - The data to be inserted into the table.
 * @returns {Promise<void>}
 */
async function insertData(data) {
  try {
      await truncateTable(); // Truncate the table before inserting new data
      // Get the connection pool from poolPromise
      const pool = await poolPromise;

      // Prepare and execute the SQL INSERT statement for each row of data
      const request = new sql.Request(pool);
      for (const row of data) {
          await request.query(`
              INSERT INTO regles (Date_Tirage, Heure, Cadeaux, CodeAM)
              VALUES ('${row.Date}', '${row.Heure}', '${row.Cadeaux}', '${row.CodeAM}')
          `);
      }

      console.log('Data inserted successfully');
  } catch (err) {
      console.error('Error inserting data:', err);
  }
}

/**
* Truncates the regles table in SQL Server to remove old data before inserting new data.
* 
* @returns {Promise<void>}
*/
async function truncateTable() {
  try {
      // Get the connection pool from poolPromise
      const pool = await poolPromise;

      // SQL query to truncate the table
      const query = 'TRUNCATE TABLE regles';
      
      // Execute the query
      await pool.request().query(query);
      
      console.log('Table truncated successfully.');
  } catch (err) {
      console.error('Error truncating the table:', err);
  }
}


// Export the functions to be used in other modules
module.exports = {
  getDataFromSQLServer,
  insertData,
  truncateTable,
  getDataFromSQLServerWithCondition
};
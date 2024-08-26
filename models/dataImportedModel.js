// Import the sql module and poolPromise from the database configuration file.
const { sql, poolPromise } = require('../config/db');

/**
 * Retrieves data from the specified table and columns.
 * 
 * @param {string} tableName - The name of the table to query.
 * @param {Object} columns - An object representing the columns to retrieve.
 * @returns {Promise<Array>} - A promise that resolves to the retrieved data.
 * @throws {Error} - Throws an error if the query fails.
 */
async function getImportedData(tableName, columns) {
    try {
      console.log(`Connecting to the database to fetch data from table: ${tableName} with columns: ${Object.keys(columns).join(', ')}`);
      const pool = await poolPromise;
  
      const columnNames = Object.keys(columns).join(', ');
      const query = `SELECT ${columnNames} FROM ${tableName} order by 1`;
  
      console.log(`Executing query: ${query}`);
      const result = await pool.request().query(query);
  
    //   console.log("Data retrieved from the database:", result.recordset);
      return result.recordset;
    } catch (err) {
      console.error("Error retrieving data from the database:", err);
      throw new Error(err);
    }
  }
  
  module.exports = {
    getImportedData,
  };
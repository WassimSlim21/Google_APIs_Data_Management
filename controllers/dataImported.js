const { google } = require("googleapis");
const dataImportedModel = require("../models/dataImportedModel");
require('dotenv').config();

/**
 * Handles the request to get imported data from the specified table and columns,
 * and then updates a Google Sheet with the fetched data.
 *
 * @param {Object} req - The request object, containing information about the HTTP request.
 * @param {Object} res - The response object, used to send a response back to the client.
 * @param {Function} next - The next middleware function in the stack.
 */
async function getImportedData(req, res, next) {
  const { Table_name, Columns, spreadsheetId, range } = req.body;

  console.log("Received request to get imported data with parameters:", {
    Table_name,
    Columns,
    spreadsheetId,
    range,
  });

  // Check if Table_name or Columns are not provided in the request body
  if (!Table_name || !Columns) {
    const errorMessage = "Table_name and Columns are required.";
    console.error(errorMessage);
    return res.status(400).json({ success: false, message: errorMessage });
  }

  // Start time
  const startTime = new Date();
  console.log("Process started at:", startTime.toISOString());

  try {
    console.log("Fetching imported data from the database...");
    const data = await dataImportedModel.getImportedData(Table_name, Columns);
    console.log("Data fetched from the database:", data);

    // Convert specific columns to float
    const floatColumns = ['PRV_PROMO', 'PV', 'TVA_ACHAT', 'COUT_TRANSP', 'PV_PERMANENT', 'PRV_PERM' ];
    const convertedData = data.map(row => {
      floatColumns.forEach(col => {
        if (row[col]) {
          row[col] = parseFloat(row[col]);
        }
      });
      return row;
    });

    console.log("Updating Google Sheets with the fetched data...");
    await updateGoogleSheet(convertedData, spreadsheetId, range, req.authClient, Columns);
    console.log("Google Sheets updated successfully.");

    // End time and duration calculation
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000; // duration in seconds
    console.log("Process ended at:", endTime.toISOString());
    console.log(`Total duration: ${duration} seconds`);

    const successMessage = "Data has been exported to Google Sheets successfully.";
    console.log(successMessage);
    res.status(200).json({ success: true, message: successMessage });
  } catch (err) {
    console.error("Error in getImportedData:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
}

/**
 * Updates the specified Google Sheets with the provided data.
 *
 * @param {Array} data - The data to be updated in the Google Sheets.
 * @param {string} spreadsheetId - The ID of the Google Sheets spreadsheet.
 * @param {string} range - The range to update in the spreadsheet.
 * @param {Object} auth - The authentication object for Google Sheets API.
 * @param {Object} columns - An object representing the columns to retrieve.
 */
async function updateGoogleSheet(data, spreadsheetId, range, auth, columns) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const dataRange = `${range}!A2`;

    console.log(`Clearing existing data in the range: ${dataRange}`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: dataRange,
      key: process.env.APIKEY
    });

    console.log(`Updating the sheet with new data in the range: ${dataRange}`);
    const updateRes = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: dataRange,
      valueInputOption: "RAW",
      requestBody: {
        values: data.map((row) => Object.values(row)),
      },
      key: process.env.APIKEY,
    });

    console.log("Data updated successfully:", updateRes.data);
  } catch (error) {
    console.error("Error updating Google Sheets:", error);
    throw error;
  }
}

// Export the getImportedData function to be used in other parts of the application
module.exports = {
  getImportedData,
};
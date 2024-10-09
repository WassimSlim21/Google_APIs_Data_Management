// Import the googleapis library and configure the Sheets API
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const dataImportedModel = require("../models/dataModel");
require('dotenv').config();

/**
 * Retrieves rules from a Google Sheets spreadsheet and inserts the data into SQL Server.
 * 
 * @param {Object} req - The request object containing spreadsheetId, range, and PageName.
 * @param {Object} res - The response object to send back the data or error.
 * @param {Function} next - The next middleware in the stack (optional).
 * @returns {Promise<void>}
 */
async function get_rules(req, res, next) {
    const { spreadsheetId, range, PageName } = req.body;

    console.log("Received request to get imported data with parameters:", {
        spreadsheetId,
        range,
    });

    // Check if spreadsheetId, range, and PageName are provided in the request body
    if (!spreadsheetId || !range || !PageName) {
        const errorMessage = "spreadsheetId, PageName, and range are required.";
        console.error(errorMessage);
        return res.status(400).json({ success: false, message: errorMessage });
    }

    // Start time for performance logging
    const startTime = new Date();
    console.log("Process started at:", startTime.toISOString());

    try {
        // Authenticate with Google Sheets API using the client from middleware
        const auth = req.authClient; // Use the authenticated client from the middleware

        // Fetch the data from the Google Sheets API
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth, // Use the authenticated client here
        });

        const rows = response.data.values;

        if (rows.length) {
            // Extract headers and map data to objects
            const [headers, ...dataRows] = rows;

            // Map each row of data to a structured object with column names as keys
            const data = dataRows.map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index] || ''; // Handle missing values by setting empty string
                });
                return rowData;
            });

            // End time for performance logging and duration calculation
            const endTime = new Date();
            const duration = (endTime - startTime) / 1000; // duration in seconds
            console.log("Process ended at:", endTime.toISOString());
            console.log(`Total duration: ${duration} seconds`);

            const successMessage = "Data has been fetched from Google Sheets successfully.";
            console.log(successMessage);
            console.log(data.CodeAM); // Log the CodeAM data for debugging
            await dataImportedModel.insertData(data); // Insert the data into the database
            return res.status(200).json({ success: true, data, message: successMessage });
        } else {
            const noDataMessage = "No data found in the specified range.";
            console.log(noDataMessage);
            return res.status(404).json({ success: false, message: noDataMessage });
        }
    } catch (err) {
        console.error("Error in get_rules:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

/**
 * Retrieves the value of cell G1 from a specified Google Sheets spreadsheet.
 * 
 * @param {Object} req - The request object containing spreadsheetId and PageName.
 * @param {Object} res - The response object to send back the data or error.
 * @returns {Promise<void>}
 */
async function getCodeAM(req, res) {
    const { spreadsheetId, PageName } = req.body;

    console.log("Received request to get data from G1 with parameters:", {
        spreadsheetId,
        PageName,
    });

    // Check if spreadsheetId and PageName are provided in the request body
    if (!spreadsheetId || !PageName) {
        const errorMessage = "spreadsheetId and PageName are required.";
        console.error(errorMessage);
        return res.status(400).json({ success: false, message: errorMessage });
    }

    // Define the range for cell G1
    const range = `${PageName}!G1`;

    // Start time for performance logging
    const startTime = new Date();
    console.log("Process started at:", startTime.toISOString());

    try {
        // Authenticate with Google Sheets API using the client from middleware
        const auth = req.authClient; // Use the authenticated client from the middleware

        // Fetch the data from Google Sheets API
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth, // Use the authenticated client here
        });

        const cellValue = response.data.values?.[0]?.[0];

        // End time for performance logging and duration calculation
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000; // duration in seconds
        console.log("Process ended at:", endTime.toISOString());
        console.log(`Total duration: ${duration} seconds`);

        // If a value is found in cell G1, return it
        if (cellValue !== undefined) {
            const successMessage = "Value of G1 has been fetched successfully.";
            console.log(successMessage);
            console.log("Value of G1:", cellValue);
            
            return res.status(200).json({ 
                success: true, 
                data: { Code_AM: cellValue, exists: true }, // Add exists field
                message: successMessage 
            });
        } else {
            const noDataMessage = "No value found in cell G1.";
            console.log(noDataMessage);
            return res.status(200).json({ // Change status to 200 for successful execution
                success: true, 
                data: { Code_AM: null, exists: false }, // Add exists field as false
                message: noDataMessage 
            });
        }
    } catch (err) {
        console.error("Error in getCodeAM:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

// Export the functions to be used in other modules
module.exports = { get_rules, getCodeAM };
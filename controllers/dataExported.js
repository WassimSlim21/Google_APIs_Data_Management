const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { sql, poolPromise } = require('../config/db'); // Adjust the path to your config file

require('dotenv').config();

async function get_data_Gsheet(req, res, next) {
    const { spreadsheetId, range, PageName } = req.body;

    console.log("Received request to get imported data with parameters:", {
        spreadsheetId,
        range,
        PageName,
    });

    // Check if spreadsheetId, range, and PageName are provided in the request body
    if (!spreadsheetId || !range || !PageName) {
        const errorMessage = "spreadsheetId, PageName, and range are required.";
        console.error(errorMessage);
        return res.status(400).json({ success: false, message: errorMessage });
    }

    // Start time
    const startTime = new Date();
    console.log("Process started at:", startTime.toISOString());
    try {
        // Authenticate with Google Sheets API
        const auth = req.authClient; // Use the authenticated client from the middleware

        // Combine PageName with the range
        const fullRange = `${PageName}!${range}`;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: fullRange,
            auth, // Use the authenticated client here
        });

        const rows = response.data.values;

        if (rows.length) {
            // Extract headers and map data to objects
            const [headers, ...dataRows] = rows;

            const data = dataRows.map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index] || ''; // Handle missing values
                });
                return rowData;
            });

            // End time and duration calculation
            const endTime = new Date();
            const duration = (endTime - startTime) / 1000; // duration in seconds
            console.log("Process ended at:", endTime.toISOString());
            console.log(`Total duration: ${duration} seconds`);

            const successMessage = "Data has been fetched from Google Sheets successfully.";
            console.log(successMessage);
            return res.status(200).send({ data});
        } else {
            const noDataMessage = "No data found in the specified range.";
            console.log(noDataMessage);
            return res.status(404).json({ success: false, message: noDataMessage });
        }
    } catch (err) {
        console.error("Error in get_data_Gsheet:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}
module.exports = { get_data_Gsheet };
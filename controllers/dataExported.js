const { google } = require('googleapis'); // Import Google Sheets API
const sheets = google.sheets('v4');       // Initialize the Sheets API
require('dotenv').config();               // Load environment variables from .env


/**
 * Fetches data from a specified Google Sheets document.
 * 
 * This function retrieves data from a given range and worksheet (tab) within a Google Sheets document.
 * The request body must contain the `spreadsheetId`, `range`, and `PageName` (tab name).
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Body of the request containing the input parameters
 * @param {string} req.body.spreadsheetId - The ID of the Google Sheets document
 * @param {string} req.body.range - The range of cells to retrieve (e.g., 'A1:D10')
 * @param {string} req.body.PageName - The name of the worksheet (tab) in the sheet
 * @param {Object} req.authClient - Authenticated Google OAuth2 client used to make the request
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Sends a JSON response with the fetched data or an error message
 * 
 * @example
 * // Request body:
 * // {
 * //   "spreadsheetId": "your_spreadsheet_id_here",
 * //   "range": "A1:D10",
 * //   "PageName": "Sheet1"
 * // }
 * 
 * // Response (Success):
 * // {
 * //   "success": true,
 * //   "message": "Data has been fetched from Google Sheets successfully.",
 * //   "data": [ ... ],
 * //   "pageName": "Sheet1",
 * //   "sheetName": "My Spreadsheet",
 * //   "sheetId": "your_spreadsheet_id_here",
 * //   "range": "Sheet1!A1:D10",
 * //   "duration": "2.3 seconds"
 * // }
 */
async function get_data_Gsheet(req, res, next) {
    const { spreadsheetId, range, PageName } = req.body;

    console.log("Received request to get imported data with parameters:", {
        spreadsheetId,
        range,
        PageName,
    });

    // Validate the presence of required parameters in the request body
    if (!spreadsheetId || !range || !PageName) {
        const errorMessage = "spreadsheetId, PageName, and range are required.";
        console.error(errorMessage);
        return res.status(400).json({ success: false, message: errorMessage });
    }

    // Record the start time of the process
    const startTime = new Date();
    console.log("Process started at:", startTime.toISOString());

    try {
        // Authenticate using the provided authClient (assumed to be middleware)
        const auth = req.authClient;

        // Retrieve metadata about the Google Sheets document, such as its title
        const sheetMetadata = await sheets.spreadsheets.get({
            spreadsheetId,
            auth
        });
        const sheetName = sheetMetadata.data.properties.title;

        // Construct the full range by combining the tab name (PageName) and the range
        const fullRange = `${PageName}!${range}`;

        // Fetch the values from the specified range in the Google Sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: fullRange,
            auth,
        });

        const rows = response.data.values;

        // If data is found, process the rows into a structured JSON object
        if (rows.length) {
            const [headers, ...dataRows] = rows;

            const data = dataRows.map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index] || ''; // Handle missing values
                });
                return rowData;
            });

            // Calculate the total duration of the process
            const endTime = new Date();
            const duration = (endTime - startTime) / 1000; // duration in seconds
            console.log("Process ended at:", endTime.toISOString());
            console.log(`Total duration: ${duration} seconds`);

            const successMessage = "Data has been fetched from Google Sheets successfully.";
            console.log(successMessage);

            // Return the fetched data, along with metadata such as sheetName and duration
            return res.status(200).send({
                success: true,
                message: successMessage,
                data,
                pageName: PageName,
                sheetName,           // Title of the spreadsheet
                sheetId: spreadsheetId,
                range: fullRange,     // Full range with tab name included
                duration: `${duration} seconds`
            });
        } else {
            // No data found in the specified range
            const noDataMessage = "No data found in the specified range.";
            console.log(noDataMessage);
            return res.status(404).json({
                success: false,
                message: noDataMessage,
                pageName: PageName,
                sheetName,
                sheetId: spreadsheetId,
                range: fullRange
            });
        }
    } catch (err) {
        // Log and return an internal server error response if any exception occurs
        console.error("Error in get_data_Gsheet:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
            pageName: PageName,
            sheetName,
            sheetId: spreadsheetId,
            range: fullRange
        });
    }
}

module.exports = { get_data_Gsheet };
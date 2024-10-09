// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataExportedController module, which contains the getImportedData function.
const dataExportedController = require('../controllers/dataExported');
const connectToGsheet = require('../middlewares/gsheetConnection');

/**
 * POST /exportData
 * 
 * This route allows you to export data to a specified Google Sheets document.
 * It clears the existing data in the specified range before exporting new data.
 * 
 * **Request Example:**
 * 
 * 1. **Endpoint:**
 *    ```
 *    POST http://172.17.1.130:3000/exportData
 *    ```
 * 
 * 2. **Request Body:**
 *    ```json
 *    {
 *      "spreadsheetId": "1lD4XGO0JtKA1PvR2A3NnZBQAFz_lEm04uabvSPV9uww",
 *      "range": "A10:D",
 *      "PageName": "Regles"
 *    }
 *    ```
 *    - **`spreadsheetId`**: The ID of the Google Sheets document.
 *    - **`range`**: The range of cells you want to export (e.g., "A10:D").
 *    - **`PageName`**: The name of the worksheet/tab in the Google Sheets document.
 * 
 * 3. **Response Example (Success - HTTP 200):**
 *    ```json
 *    {
 *      "success": true,
 *      "message": "Data has been fetched from Google Sheets successfully.",
 *      "data": [
 *        { "Column1": "Value1", "Column2": "Value2", ... },
 *        { "Column1": "Value3", "Column2": "Value4", ... }
 *      ],
 *      "pageName": "Regles",
 *      "sheetName": "Sheet Name",
 *      "sheetId": "1lD4XGO0JtKA1PvR2A3NnZBQAFz_lEm04uabvSPV9uww",
 *      "range": "A10:D",
 *      "duration": "2.34 seconds"
 *    }
 *    ```
 * 
 * 4. **Response Example (Error - HTTP 400 or 404):**
 *    ```json
 *    {
 *      "success": false,
 *      "message": "The specified PageName 'Regles' does not exist in the spreadsheet.",
 *      "error": "PageName 'Regles' not found in the document"
 *    }
 *    ```
 *    - In case of an error, a suitable message will be returned, indicating the issue (e.g., invalid `spreadsheetId`, `range`, or `PageName`).
 * 
 * **Middleware:**
 * - **`connectToGsheet`** middleware ensures that the request is authenticated with Google Sheets API before fetching data.
 * 
 * @route POST /exportData
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing the input parameters: `spreadsheetId`, `range`, and `PageName`
 * @param {Object} req.authClient - Authenticated Google OAuth2 client used to make the request
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Sends a JSON response with the fetched data or an error message
 */
router.post('/', connectToGsheet, dataExportedController.get_data_Gsheet);

// Export the router to be used in other parts of the application.
module.exports = router;
// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataImportedController module, which contains the necessary functions.
const dataImportedController = require('../controllers/dataImported');
const googleDriveController = require('../services/googleService');

// Middleware for Google Sheets connection.
const connectToGsheet = require('../middlewares/gsheetConnection');

/**
 * @route GET /sheetConnect
 * @desc Verifies Google Sheets connection.
 * @access Public
 * @returns {Object} Response message indicating connection status.
 * 
 * **Request Example:**
 *  GET http://<hostname>:<port>/sheetConnect
 * 
 * **Response Example:**
 *  HTTP 200:
 *  ```json
 *  {
 *    "message": "Verify Google Connection"
 *  }
 *  ```
 */
router.get('/sheetConnect', connectToGsheet, async (req, res) => {
    res.send({success:true, message:'Verify Google Connection'});    

});

/**
 * @route POST / (Base Route)
 * @desc Post any data to Google Sheets based on the request body parameters.
 * @access Public
 * @returns {Object} Response with success or failure message.
 * 
 * **Request Example:**
 *  POST http://<hostname>:<port>/
 *  Request Body:
 *  ```json
 *  {
 *    "Table_name": "myTable",
 *    "Columns": ["column1", "column2"],
 *    "spreadsheetId": "spreadsheet-id",
 *    "pageName": "Sheet1"
 *  }
 *  ```
 * 
 * **Response Example:**
 *  HTTP 200:
 *  ```json
 *  {
 *    "success": true,
 *    "message": "Data has been exported to Google Sheets successfully.",
 *    "data": [ array of data  ]
 *  }
 *  ```
 */
router.post('/', connectToGsheet, dataImportedController.getImportedData);


/**
 * @route POST /filtered
 * @desc Post filtered data to Google Sheets based on the provided condition.
 * @access Public
 * @returns {Object} Response with success or failure message.
 * 
 * **Request Example:**
 *  POST http://<hostname>:<port>/filtered
 *  Request Body:
 *  ```json
 *  {
 *    "Table_name": "myTable",
 *    "Columns": ["column1", "column2"],
 *    "spreadsheetId": "spreadsheet-id",
 *    "pageName": "Sheet1",
 *    "condition": "column1 = 'some_value'"
 *  }
 *  ```
 * 
 * **Response Example:**
 *  HTTP 200:
 *  ```json
 *  {
 *    "success": true,
 *    "message": "Filtered data has been exported to Google Sheets successfully.",
 *    "data": [ array of filtered data  ]
 *  }
 *  ```
 */
router.post('/filtered', connectToGsheet, dataImportedController.getImportedDataWithCondition);


// Post Upload File to Drive
/**
 * @route POST /upload
 * @desc Upload a file to Google Drive.
 * @access Public
 * @returns {Object} Response with success or failure message.
 * 
 * **Request Example:**
 *  POST http://<hostname>:<port>/upload
 *  Request Body:
 *  ```json
 * {
 * "filePath" :"E:\\file1.txt",
 * "sharedDriveId" : "0AGOeIVrkGevcUk9PVA",
 *  "folderId" : "1X6wMonNGQP68J-SHdnertX18PEMpidjU"
 * }
 *  ```
 * 
 * **Response Example:**
 *  HTTP 200:
 *  ```json
 *  {
 *    "success": true,
 *        "message": "Files uploaded successfully",
 *        "fileId": "1B_0bzHEyMDgOeU5FW8lapqtwhm814iXR"
 *  }
 *  ```
 */
router.post('/upload', connectToGsheet, googleDriveController.uploadFileToDrive);

// Post Upload Multiples File to Drive
/**
 * @route POST /uploadMultiples
 * @desc Upload multiple files to Google Drive.
 * @access Public
 * @returns {Object} Response with success or failure message.
 * 
 * **Request Example:**
 *  POST http://<hostname>:<port>/uploadMultiples
  *  Request Body:
 *  ```json
 * {
 * "sharedDriveId" :"0AGOeIVrkGevcUk9PVA",
 * "folderId" : "1X6wMonNGQP68J-SHdnertX18PEMpidjU",
 *  "folderPath" : "E:\\ARCHIVE"
 * }
 *  ```
 * 
 * **Response Example:**
 *  HTTP 200:
 *  ```json
 *  {
 *    "success": true,
 *        "message": "Files uploaded successfully",
 *     "fileIds": [
 * "1abtScPbkrgoBVIgUJMqJY3Ie1DjL0SzF",
        "1PVzPgV4c2-AiFL4Z2Pwche8CJr6nAGXL",
        "1GGlEhf0nrE2FtGw7iRn9mts_J4vx1rps",
        "1wdBN-cOkJ6pt7TfAVObtl9n6Om6q1BNQ",
        "1J6AOq1cEX8lkZiTK8O7PmfDzfHyhxKzG",
        "1DIT_FR3h7ztS4pOAPVJpJvB4OCIG-_tu",
        "1Sbfd-Qvz8ymMoyi8BuNDAL0QjkZRclYZ",
        "1H3bZlLsRiBx5hkBP3XC6L06dy0w97SHi"*
        ]
 *  }
 *  ```
 */
router.post('/uploadMultiples', connectToGsheet, googleDriveController.uploadMultipleFiles);


// Export the router to be used in other parts of the application.
module.exports = router;
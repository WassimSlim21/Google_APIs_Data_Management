const { google } = require("googleapis");
const fs = require('fs');
const path = require('path');

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
    console.error(succes, errorMessage);
    return res.status(400).json({ success: false, message: errorMessage });
  }

  // Start time
  const startTime = new Date();
  console.log("Process started at:", startTime.toISOString());

  try {
    console.log("Fetching imported data from the database...");
    const data = await dataImportedModel.getImportedData(Table_name, Columns);

   

    console.log("Updating Google Sheets with the fetched data...");
    await updateGoogleSheet(data, spreadsheetId, range, req.authClient, Columns);
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
 * Handles the request to get articles data from the specified table and columns,
 * Conversion to float for some article columns
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getArticles(req, res, next) {
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

    // Convert specific columns to float
    const floatColumns = ['Article', 'PRV_PROMO', 'PV', 'TVA_ACHAT', 'COUT_TRANSP', 'PV_PERMANENT', 'PRV_PERM' ];
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

    // Extract the keys from the columns object to use as headers
    const headers = Object.keys(columns);
    
    // Set the header (columns) in the first row
    const headerRange = `${range}!A1`;
    console.log(`Updating the sheet with headers in the range: ${headerRange}`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers], // The header row is an array of column names
      },
      key: process.env.APIKEY,
    });

    // Set the data starting from the second row
    const dataRange = `${range}!A2`;
    console.log(`Clearing existing data in the range: ${dataRange}`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: dataRange,
      key: process.env.APIKEY,
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

  } catch (error) {
    console.error("Error updating Google Sheets:", error);
    throw error;
  }
}


/**
 * Uploads a file to Google Drive.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function uploadFileToDrive(req, res) {
  const { filePath ,sharedDriveId, folderId} = req.body; // Expect the file path, SharedDriveId, folderId in the request body
  
  if (!filePath) {
    return res.status(400).json({ success: false, message: 'File path is required.' });
  }


  console.log("sharedDrive", sharedDriveId);
  console.log("folderId", folderId);

  console.log('File path received:', filePath);

  try {
    const drive = google.drive({ version: 'v3', auth: req.authClient });
    const fileMetadata = {
      'name': filePath.split('\\').pop(), // Extracts the filename from the filePath
      'parents': [folderId], // Folder ID where the file will be uploaded
      'driveId': sharedDriveId // The shared drive ID
    };
    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream(filePath), // Read the file from the provided path
    };

    console.log('Uploading file to shared drive folder...');
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true // Required when interacting with shared drives
    });

    console.log('File uploaded successfully, File ID:', response.data.id);
    res.status(200).json({ success: true, message: 'File uploaded successfully', fileId: response.data.id });
  } catch (err) {
    console.error('Error uploading file to Google Drive:', err);
    res.status(500).json({ success: false, message: 'Failed to upload file', error: err.message });
  }
}

/**
 * Uploads all files from the "E:\\ARCHIVES" folder to a shared drive in parallel.
 * Deletes all existing files in the shared drive folder before uploading.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function uploadMultipleFiles(req, res) {
  // Path to the folder containing the files
  const {folderPath} = req.body;

  // Shared drive and folder details
  const { sharedDriveId, folderId } = req.body;  // The shared drive ID and folder ID

  try {
    // Initialize Google Drive client
    const drive = google.drive({ version: 'v3', auth: req.authClient });

    // Step 1: Delete all files in the target folder
    const deleteExistingFiles = async () => {
      const listParams = {
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id)',
        supportsAllDrives: true,  // Required for shared drives
        includeItemsFromAllDrives: true,
        driveId: sharedDriveId,
        corpora: 'drive',
      };

      const filesInFolder = await drive.files.list(listParams);
      const deletePromises = filesInFolder.data.files.map(file =>
        drive.files.delete({
          fileId: file.id,
          supportsAllDrives: true,  // Required for shared drives
        })
      );
      await Promise.all(deletePromises);
      console.log('All existing files deleted successfully.');
    };

    await deleteExistingFiles();

    // Step 2: Get all file names from the local folder
    const fileNames = fs.readdirSync(folderPath);

    if (!fileNames || fileNames.length === 0) {
      return res.status(400).json({ success: false, message: 'No files found in the folder.' });
    }

    // Step 3: Function to upload a single file
    const uploadFile = (fileName) => {
      const filePath = path.join(folderPath, fileName); // Full path of the file

      const fileMetadata = {
        'name': fileName, // File name
        'parents': [folderId], // Folder ID in the shared drive
        'driveId': sharedDriveId, // Shared drive ID
      };

      const media = {
        mimeType: 'application/octet-stream', // Set the correct mime type based on your file types
        body: fs.createReadStream(filePath),
      };

      return drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
        supportsAllDrives: true, // Required for shared drives
      });
    };

    // Step 4: Upload all files in parallel
    const uploadPromises = fileNames.map(uploadFile);
    const uploadResults = await Promise.all(uploadPromises);

    // Collect uploaded file IDs
    const fileIds = uploadResults.map(result => result.data.id);

    console.log('Files uploaded successfully:', fileIds);
    res.status(200).json({ success: true, message: 'Files uploaded successfully', fileIds });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ success: false, message: 'Failed to upload files', error: err.message });
  }
}


module.exports = {
  getImportedData,
  getArticles, 
  uploadFileToDrive,
  uploadMultipleFiles

};


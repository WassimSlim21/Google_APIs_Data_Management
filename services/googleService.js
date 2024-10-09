const { google } = require("googleapis");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Uploads a file to Google Drive.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function uploadFileToDrive(req, res) {
  const { filePath, sharedDriveId, folderId } = req.body;

  if (!filePath) {
    return res.status(400).json({ success: false, message: 'File path is required.' });
  }

  try {
    const drive = google.drive({ version: 'v3', auth: req.authClient });
    const fileMetadata = {
      'name': path.basename(filePath),
      'parents': [folderId],
      'driveId': sharedDriveId 
    };
    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true 
    });

    res.status(200).json({ success: true, message: 'File uploaded successfully', fileId: response.data.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload file', error: err.message });
  }
}

/**
 * Uploads multiple files from a folder to Google Drive.
 */
async function uploadMultipleFiles(req, res) {
  const { folderPath, sharedDriveId, folderId } = req.body;

  try {
    const drive = google.drive({ version: 'v3', auth: req.authClient });

    const deleteExistingFiles = async () => {
      const filesInFolder = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: sharedDriveId,
        corpora: 'drive',
      });

      const deletePromises = filesInFolder.data.files.map(file =>
        drive.files.delete({
          fileId: file.id,
          supportsAllDrives: true,
        })
      );
      await Promise.all(deletePromises);
    };

    await deleteExistingFiles();

    const fileNames = fs.readdirSync(folderPath);
    if (!fileNames || fileNames.length === 0) {
      return res.status(400).json({ success: false, message: 'No files found in the folder.' });
    }

    const uploadPromises = fileNames.map(fileName => {
      const filePath = path.join(folderPath, fileName);
      const fileMetadata = {
        'name': fileName,
        'parents': [folderId],
        'driveId': sharedDriveId,
      };
      const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath),
      };

      return drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
        supportsAllDrives: true,
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    const fileIds = uploadResults.map(result => result.data.id);

    res.status(200).json({ success: true, message: 'Files uploaded successfully', fileIds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload files', error: err.message });
  }
}

/**
 * Updates the specified Google Sheets with the provided data.
 *
 * @param {Array} data - The data to be updated in the Google Sheets.
 * @param {string} spreadsheetId - The ID of the Google Sheets spreadsheet.
 * @param {string} pageName - The name of the page within the sheet.
 * @param {Object} auth - The authentication object for Google Sheets API.
 * @param {Object} columns - An object representing the columns to retrieve.
 */
async function updateGoogleSheet(data, spreadsheetId, pageName, auth, columns) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const headers = Object.keys(columns);
    
    const headerRange = `${pageName}!A1`;
    console.log(`Updating the sheet with headers in the range: ${headerRange}`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers], 
      },
      key: process.env.APIKEY,
    });

    const dataRange = `${pageName}!A2`;
    console.log(`Clearing existing data in the range: ${dataRange}`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: dataRange,
      key: process.env.APIKEY,
    });

    console.log(`Updating the sheet with new data in the range: ${dataRange}`);
    await sheets.spreadsheets.values.update({
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

module.exports = {
    updateGoogleSheet,
  uploadFileToDrive,
  uploadMultipleFiles
};
const dataModel = require("../models/dataModel");
const { updateGoogleSheet } = require("../services/googleService");

/**
 * Fetches data and updates Google Sheets.
 */
async function getImportedData(req, res) {
  const { Table_name, Columns, spreadsheetId, pageName } = req.body;

  // Check if Table_name and Columns are provided
  if (!Table_name || !Array.isArray(Columns) || Columns.length === 0) {
    return res.status(400).json({ success: false, message: "Table_name and Columns are required." });
  }

  try {
    const data = await dataModel.getDataFromSQLServer(Table_name, Columns);
    await updateGoogleSheet(data, spreadsheetId, pageName, req.authClient, Columns);
    res.status(200).json({ success: true, message: "Data has been exported to Google Sheets successfully.", data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
}

async function getImportedDataWithCondition(req, res) {
  const { Table_name, Columns, spreadsheetId, pageName, condition } = req.body;

  // Check if Table_name and Columns are provided
  if (!Table_name || !Array.isArray(Columns) || Columns.length === 0) {
    return res.status(400).json({ success: false, message: "Table_name and Columns are required." });
  }

  try {
    const data = await dataModel.getDataFromSQLServerWithCondition(Table_name, Columns, condition);
    await updateGoogleSheet(data, spreadsheetId, pageName, req.authClient, Columns);
    res.status(200).json({ success: true, message: "Data has been exported to Google Sheets successfully.", data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
}

module.exports = {
  getImportedData,
  getImportedDataWithCondition
};
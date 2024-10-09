const dataModel = require("../models/dataModel");
const { updateGoogleSheet } = require("../services/googleService");

/**
 * Fetches data and updates Google Sheets.
 */
async function getImportedData(req, res) {
  const { Table_name, Columns, spreadsheetId, pageName } = req.body;

  if (!Table_name || !Columns) {
    return res.status(400).json({ success: false, message: "Table_name and Columns are required." });
  }

  try {
    const data = await dataModel.getDataFromSQLServer(Table_name, Columns);
    await updateGoogleSheet(data, spreadsheetId, pageName, req.authClient, Columns);
    res.status(200).json({ success: true, message: "Data has been exported to Google Sheets successfully.", data:data});
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
}

async function getImportedDataWithCondition(req, res) {
  const { Table_name, Columns, spreadsheetId, pageName, condition } = req.body;

  if (!Table_name || !Columns) {
    return res.status(400).json({ success: false, message: "Table_name and Columns are required." });
  }

  try {
    const data = await dataModel.getDataFromSQLServerWithCondition(Table_name, Columns, condition);
    await updateGoogleSheet(data, spreadsheetId, pageName, req.authClient, Columns);
    res.status(200).json({ success: true, message: "Data has been exported to Google Sheets successfully.",  data:data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
}

async function getArticles(req, res) {
  const { Table_name, Columns, spreadsheetId, pageName } = req.body;

  if (!Table_name || !Columns) {
    return res.status(400).json({ success: false, message: "Table_name and Columns are required." });
  }

  try {
    const data = await dataModel.getDataFromSQLServer(Table_name, Columns);

    const floatColumns = ['Article', 'PRV_PROMO', 'PV', 'TVA_ACHAT', 'COUT_TRANSP', 'PV_PERMANENT', 'PRV_PERM'];
    const convertedData = data.map(row => {
      floatColumns.forEach(col => {
        if (row[col]) {
          row[col] = parseFloat(row[col]);
        }
      });
      return row;
    });

    await updateGoogleSheet(convertedData, spreadsheetId, pageName, req.authClient, Columns);
    res.status(200).json({ success: true, message: "Data has been exported to Google Sheets successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
}

module.exports = {
  getImportedData,
  getImportedDataWithCondition,
  getArticles
};
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { sql, poolPromise } = require('../config/db'); // Adjust the path to your config file

require('dotenv').config();

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

    // Start time
    const startTime = new Date();
    console.log("Process started at:", startTime.toISOString());

    try {
        // Authenticate with Google Sheets API
        const auth = req.authClient; // Use the authenticated client from the middleware

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
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
            console.log(data.CodeAM);
            await insertData(data);
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

async function insertData(data) {
    try {
        await truncateTable();
        // Get the connection pool from poolPromise
        const pool = await poolPromise;

        // Prepare and execute the SQL INSERT statement
        const request = new sql.Request(pool);
        for (const row of data) {
            await request.query(`
                INSERT INTO regles (Date, Heure, Cadeaux, CodeAM)
                VALUES ('${row.Date}', '${row.Heure}', '${row.Cadeaux}', '${row.CodeAM}')
            `);
        }

        console.log('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
    }
}

async function truncateTable() {
    try {
        // Get the connection pool from poolPromise
        const pool = await poolPromise;

        // SQL query to truncate the table
        const query = 'TRUNCATE TABLE regles';
        
        // Execute the query
        await pool.request().query(query);
        
        console.log('Table truncated successfully.');
    } catch (err) {
        console.error('Error truncating the table:', err);
    }
}

module.exports = { get_rules };
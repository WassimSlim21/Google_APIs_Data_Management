// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataImportedController module, which contains the getImportedData function.
const dataImportedController = require('../controllers/dataImported');
const connectToGsheet = require('../middlewares/gsheetConnection');

router.get('/sheetConnect', connectToGsheet, async (req, res) => {
    // Now you can use req.authClient to interact with Google Sheets API
    // Example: const sheets = google.sheets({ version: 'v4', auth: req.authClient });
    // Perform your operations here

    res.send('Example route with Google Sheets connection');    
});

// Define a POST route at the root path, which uses the getImportedData function from the controller.
router.post('/',connectToGsheet, dataImportedController.getArticles);
router.post('/packRentree',connectToGsheet, dataImportedController.getImportedData);
// Export the router to be used in other parts of the application.
module.exports = router;
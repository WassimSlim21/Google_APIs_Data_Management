// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataImportedController module, which contains the getImportedData function.
const dataExportedController = require('../controllers/dataExported');
const connectToGsheet = require('../middlewares/gsheetConnection');



// Post Any Data to Gsheet

router.post('/',connectToGsheet, dataExportedController.get_data_Gsheet);


// Export the router to be used in other parts of the application.
module.exports = router;
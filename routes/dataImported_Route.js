// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataImportedController module, which contains the getImportedData function.
const dataImportedController = require('../controllers/dataImported');
const connectToGsheet = require('../middlewares/gsheetConnection');

router.get('/sheetConnect', connectToGsheet, async (req, res) => {

    res.send('Verify Google Connection');    
});

// Post Articles Data to Gsheet
router.post('/articles',connectToGsheet, dataImportedController.getArticles);
// Post Any Data to Gsheet
router.post('/',connectToGsheet, dataImportedController.getImportedData);
router.post('/upload', connectToGsheet, dataImportedController.uploadFileToDrive);
router.post('/get_end_date', connectToGsheet, dataImportedController.getEndDate);

// Export the router to be used in other parts of the application.
module.exports = router;
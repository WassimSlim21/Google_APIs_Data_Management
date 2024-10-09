// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataImportedController module, which contains the getImportedData function.
const dataImportedController = require('../controllers/dataImported');
const googleDriveController = require('../services/googleService');

const connectToGsheet = require('../middlewares/gsheetConnection');

router.get('/sheetConnect', connectToGsheet, async (req, res) => {

    res.send('Verify Google Connection');    
});


// Post Any Data to Gsheet
router.post('/',connectToGsheet, dataImportedController.getImportedData);


// Post Articles Data to Gsheet Développement spécéfisue avec transformation des données 
router.post('/articles',connectToGsheet, dataImportedController.getArticles);

router.post('/upload', connectToGsheet, googleDriveController.uploadFileToDrive);
router.post('/uploadMultiples', connectToGsheet, googleDriveController.uploadMultipleFiles);

// Export the router to be used in other parts of the application.
module.exports = router;
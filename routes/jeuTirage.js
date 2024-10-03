// Import the express module to create a router.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the dataImportedController module, which contains the getImportedData function.
const JeuTirageController = require('../controllers/jeuTirage');
const connectToGsheet = require('../middlewares/gsheetConnection');


// Define a POST route at the root path, which uses the getImportedData function from the controller.
router.post('/get_rules',connectToGsheet, JeuTirageController.get_rules);
router.post('/getCodeAM',connectToGsheet, JeuTirageController.getCodeAM);

// Export the router to be used in other parts of the application.
module.exports = router;
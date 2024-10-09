const { google } = require('googleapis');
const keys = require("../key.json");
require('dotenv').config();

/**
 * Middleware to connect to Google Sheets API.
 *
 * This middleware function establishes a connection to the Google Sheets API using
 * the provided service account credentials. Once authenticated, it adds the 
 * authenticated client to the request object and passes control to the next middleware
 * or route handler.
 *
 * @param {Object} req - The request object, containing information about the HTTP request.
 * @param {Object} res - The response object, used to send a response back to the client.
 * @param {Function} next - The next middleware function in the stack.
 */
async function connectToGsheet(req, res, next) {

  try {
    // Create a new JWT client using the service account credentials
    const auth = new google.auth.JWT(
      keys.client_email,    // Client email from the service account
      null,                 // Path to the private key file (not used here)
      keys.private_key,     // Private key from the service account
      keys.scopes // Add Drive scope here
    );

    // Authorize the client to use the Google Sheets API
    await auth.authorize();
    console.log('Connected to Google APIs (Drive & Sheet) ');

    // Attach the authenticated client to the request object
    req.authClient = auth;
    req.apiKey = process.env.APIKEY;

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error if the connection fails
    console.error('Error connecting to Google Sheets/Drive:', error);

    // Send a 500 Internal Server Error response to the client
    res.status(500).json({ error: 'Failed to connect to Google Sheets/Drive' });
  }
}

// Export the middleware function to be used in other parts of the application
module.exports = connectToGsheet;

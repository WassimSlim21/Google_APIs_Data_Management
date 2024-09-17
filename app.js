// Import necessary modules.
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const dataImportedRouter = require('./routes/dataImported_Route');

// Create an Express application.
const app = express();

// Set up view engine.
app.set('views', path.join(__dirname, 'views')); // Set the directory for views.
app.set('view engine', 'jade'); // Set the view engine to 'jade'.

// Middleware setup.
app.use(logger('dev')); // Use morgan for logging requests in the 'dev' format.
app.use(express.json()); // Middleware to parse JSON request bodies.
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded request bodies.
app.use(cookieParser()); // Middleware to parse cookies.
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory.

// Define routes.

app.use('/data_imported', dataImportedRouter); // Use the data imported router for '/data_imported' path.

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  next(createError(404)); // Create a 404 error and pass it to the next middleware (error handler).
});

// Error handler.
app.use(function(err, req, res, next) {
  // Set locals, only providing error details in development.
  res.locals.message = err.message; // Set the error message.
  res.locals.error = req.app.get('env') === 'production' ? err : {}; // Set the error object if in development.


  res.status(err.status || 500); // Set the response status code.
  res.render('error'); // Render the 'error' view.
});

// Export the app module.
module.exports = app;
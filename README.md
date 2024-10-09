# GCPMigrationXProject

This project is a Node.js-based web application designed to automate the process of fetching, processing, and storing data from Google Sheets into an SQL database. It also enables users to upload files to Google Drive and perform other data management operations efficiently. The application interacts with Google Sheets API and Google Drive API for seamless spreadsheet and file management and uses Microsoft SQL Server to handle database operations. The system incorporates custom middleware for Google Sheets authentication, data retrieval, and SQL data insertion.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- Fetch and update data between SQL Server and Google Sheets
- Upload files to Google Drive
- Retrieve and process game rules data
- Authenticate with Google APIs
- Asynchronous operations for improved performance
- Error handling and data integrity checks

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/GCPMigrationXProject.git
   ```
2. Navigate to the project directory:
   ```
   cd GCPMigrationXProject
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the required environment variables (refer to `.env.example`)
5. Set up Google API credentials:
   - Place your `key.json` file for Google API authentication in the project root

## Usage

1. Start the server:
   ```
   npm start
   ```
2. The server will start running on `http://localhost:3000` (or the port specified in your environment variables)

## Project Structure

```
GCPMigrationXProject/
│
├── bin/
│   └── www                 # Server startup script
├── config/
│   └── db.js               # Database configuration
├── controllers/
│   ├── dataImported.js     # Controller for data import operations
│   └── jeuTirage.js        # Controller for game rules operations
├── middlewares/
│   └── gsheetConnection.js # Middleware for Google Sheets authentication
├── models/
│   └── dataImportedModel.js # Model for data operations
├── routes/
│   ├── dataImported_Route.js # Routes for data import operations
│   └── jeuTirage.js          # Routes for game rules operations
├── .env                    # Environment variables
├── app.js                  # Main application file
├── ecosystem.config.js     # PM2 configuration file
├── key.json                # Google API credentials
└── package.json            # Project dependencies and scripts
```

## API Documentation

### `/data_imported/`

**Method:** POST

**Description:** Import data to Google Sheets

**Request Body:**
```json
{
  "Table_name": "string",
  "Columns": {
    "column1": "string",
    "column2": "string",
    ...
  },
  "spreadsheetId": "string",
  "range": "string"
}
```

- `Table_name`: The name of the SQL table to fetch data from
- `Columns`: An object where keys are column names and values are their types
- `spreadsheetId`: The ID of the Google Sheet to update
- `range`: The range in the sheet to update (e.g., "Sheet1!A1:D10")

### `/data_imported/articles`

**Method:** POST

**Description:** Import article data to Google Sheets

**Request Body:**
```json
{
  "Table_name": "string",
  "Columns": {
    "Article": "float",
    "PRV_PROMO": "float",
    "PV": "float",
    "TVA_ACHAT": "float",
    "COUT_TRANSP": "float",
    "PV_PERMANENT": "float",
    "PRV_PERM": "float",
    ...
  },
  "spreadsheetId": "string",
  "range": "string"
}
```

- Fields are similar to `/data_imported/`, but specific columns are converted to float

### `/data_imported/upload`

**Method:** POST

**Description:** Upload a file to Google Drive

**Request Body:**
```json
{
  "filePath": "string",
  "sharedDriveId": "string",
  "folderId": "string"
}
```

- `filePath`: The local path of the file to upload
- `sharedDriveId`: The ID of the shared Google Drive
- `folderId`: The ID of the folder in the shared drive to upload to

### `/data_imported/uploadMultiples`

**Method:** POST

**Description:** Upload multiple files to Google Drive

**Request Body:**
```json
{
  "folderPath": "string",
  "sharedDriveId": "string",
  "folderId": "string"
}
```

- `folderPath`: The local path of the folder containing files to upload
- `sharedDriveId`: The ID of the shared Google Drive
- `folderId`: The ID of the folder in the shared drive to upload to

### `/jeuTirage/get_rules`

**Method:** POST

**Description:** Retrieve game rules

**Request Body:**
```json
{
  "spreadsheetId": "string",
  "range": "string"
}
```

- `spreadsheetId`: The ID of the Google Sheet containing the rules
- `range`: The range in the sheet to retrieve data from

### `/jeuTirage/getCodeAM`

**Method:** POST

**Description:** Retrieve CodeAM from Google Sheets

**Request Body:**
```json
{
  "spreadsheetId": "string",
  "PageName": "string"
}
```

- `spreadsheetId`: The ID of the Google Sheet containing the CodeAM
- `PageName`: The name of the sheet to retrieve the CodeAM from (the CodeAM is expected to be in cell G1)


## Dependencies

- express: Web application framework
- googleapis: Google API client library
- mssql: Microsoft SQL Server client for Node.js
- dotenv: Environment variable management
- http-errors: HTTP error creation utility
- cookie-parser: Cookie parsing middleware
- morgan: HTTP request logger middleware
- pm2: Process manager for Node.js applications

## Deployment

This project is deployed using PM2, a process manager for Node.js applications. The PM2 configuration is stored in `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'projxgsheetmigration',
      script: 'bin/www',
      instances: 'max', // or specify the number of instances
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development', // default environment
      },
      env_production: {
        NODE_ENV: 'production',
        // Other environment variables for production
      }
    }
  ]
};
```

To deploy or update the application:

1. Make your changes to the codebase
2. Save the PM2 configuration:
   ```
   pm2 save
   ```
3. Restart the application:
   ```
   pm2 restart 0
   ```

This will apply your changes and restart the application using the PM2 process manager.

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-branch`
5. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).

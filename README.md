# Google_APIs_Data_Management


This project is a Node.js-based web application that automates the process of fetching, processing, and storing data from Google Sheets into a Microsoft SQL Server database. It enables users to efficiently upload files to Google Drive and perform various data management operations by seamlessly integrating with the Google Sheets API and Google Drive API. The application features custom middleware for authentication, data retrieval, and SQL data insertion.

Additionally, the project employs an SSIS package that loads data from diverse sources, including Oracle, PostgreSQL, and Microsoft SQL Server, as well as generated files from other servers. The ETL process populates a local SQL Server database, and C# scripts are used to call the Node.js API to synchronize this data with Google Sheets and Google Drive, ensuring smooth data management across platforms.

![alt text](https://github.com/WaassimDev/proj-x-gsheet/blob/prod/public/images/Project%20Overview.png)

## Data Flow : 
### Step 1 - Data Extraction (Get Data):
The process begins with extracting data from an external database into an ETL (Extract, Transform, Load) process managed by SSIS.

### Step 2 - Data Insertion (Insert Data):
Once the data is extracted, it is inserted into a local SQL Server database using the SSIS ETL process.

### Step 3 - HTTP Request (Post Request):
The SSIS process sends an HTTP request to a Node.js application, specifying the requirements (table name, columns, Google Sheets ID, etc.). Node.js returns a status code for the request, which is received and processed by SSIS.

### Step 4 - SQL Query (SQL Query):
The Node.js application executes an SQL query on the local SQL Server database to retrieve the necessary data as a result set.

### Step 5 - Google Account Service (Account Service):
Node.js retrieves the necessary authentication information from the Google Account service to access Google Sheets, adhering to an IP whitelisting rule to ensure that only specified IPs can interact with the spreadsheets.

### Step 6 - Insertion into Google Sheets (Insert Data via API):
Node.js uses the Google Sheets API to insert data into the specified spreadsheet. The data is formatted in JSON before being sent.

### Step 7 - Insertion of Files into Google Drive (Insert Files into Google Drive):
Large files are uploaded to Google Drive, replacing the need for email attachments. This utilizes Shared Drives to facilitate access to updated files while removing old files to maintain organization.

### Step 8 - Execution of the SSIS Package:
The SSIS package is executed via a SQL Agent. Results and status codes are returned at each step to ensure process tracking and error management.

![alt text](https://github.com/WaassimDev/proj-x-gsheet/blob/prod/public/images/Data%20Flow.png)



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

![alt text](https://github.com/WaassimDev/proj-x-gsheet/blob/prod/public/images/napkin-selection.png)


## Installation

1. Clone the repository:
   ```
   git clone https://github.com/WassimSlim21/Google_APIs_Data_Management.git
   ```
2. Navigate to the project directory:
   ```
   cd google_apis_data_management
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

## Project Structure

```
Google_APIs_Data_Management/
│
├── bin/
│   └── www                 # Server startup script
├── config/
│   └── db.js               # Database configuration
├── controllers/
│   ├── dataExported.js     # Controller for data export operations
│   ├── dataImported.js     # Controller for data import operations
├── middlewares/
│   └── gsheetConnection.js # Middleware for Google Sheets authentication
├── models/
│   └── dataImportedModel.js # Model for data operations
├── routes/
│   ├── dataExported_Route.js # Routes for data export operations
│   ├── dataImported_Route.js # Routes for data import operations
├── services/
│   └── googleService.js    # Google API related services
├── .env                    # Environment variables
├── app.js                  # Main application file
├── ecosystem.config.js     # PM2 configuration file
├── key.json                # Google API credentials
└── package.json            # Project dependencies and scripts
```

![alt text](https://github.com/WaassimDev/proj-x-gsheet/blob/prod/public/images/Project%20Structure.png)

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

### `/exportData`

**Method:** POST

**Description:** Fetch data from a specified Google Sheets document

**Request Body:**
```json
{
  "spreadsheetId": "string",
  "range": "string",
  "PageName": "string"
}
```

- `spreadsheetId`: The ID of the Google Sheet to fetch data from
- `range`: The range of cells to retrieve (e.g., "A1:D10")
- `PageName`: The name of the worksheet (tab) in the sheet

**Response (Success):**
```json
{
  "success": true,
  "message": "Data has been fetched from Google Sheets successfully.",
  "data": [ ... ],
  "pageName": "string",
  "sheetName": "string",
  "sheetId": "string",
  "range": "string",
  "duration": "string"
}
```

- `data`: An array of objects representing the fetched data
- `pageName`: The name of the worksheet (tab) that was queried
- `sheetName`: The title of the Google Sheets document
- `sheetId`: The ID of the Google Sheets document
- `range`: The full range that was queried, including the worksheet name
- `duration`: The time taken to fetch the data

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message",
  "pageName": "string",
  "sheetName": "string",
  "sheetId": "string",
  "range": "string"
}
```

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

### `/filtered`

**Method:** POST

**Description:** Post filtered data to Google Sheets based on the provided condition.

**Request Body:**
```json
{
  "Table_name": "string",
  "Columns": ["string"],
  "spreadsheetId": "string",
  "pageName": "string",
  "condition": "string"
}
```

- `Table_name`: The name of the SQL table to fetch data from
- `Columns`: An array of column names to fetch
- `spreadsheetId`: The ID of the Google Sheet to update
- `pageName`: The name of the worksheet (tab) in the sheet to update
- `condition`: SQL condition to filter the data (e.g., "column1 = 'some_value'")

**Response (Success):**
```json
{
  "success": true,
  "message": "Filtered data has been exported to Google Sheets successfully.",
  "data": [ ... ]
}
```

- `data`: An array of objects representing the filtered data that was exported

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

**Example Usage:**
```http
POST http://<hostname>:<port>/filtered
Content-Type: application/json

{
  "Table_name": "myTable",
  "Columns": ["column1", "column2"],
  "spreadsheetId": "spreadsheet-id",
  "pageName": "Sheet1",
  "condition": "column1 = 'some_value'"
}
```

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
0. Clone this repository : 
https://github.com/jessety/pm2-installer
`pm2-installer` will check if it can contact the npm registry and install online if possible, or use the offline cache if not.
- The `pm2` service runs as the `Local Service` user. To interact with `pm2`, you need to use an elevated terminal (e.g. right click and select "Run as Admin") before running any commands that interface with the service, e.g. `pm2 list`.
- If you update node and npm, make sure to either manually re-configure your npm & node installations or run `npm run configure` again.

Under the Cloned Repository `pm2-installer` Run these commands : 
-  `npm install`
-  `npm run configure`
-  `npm run setup`

1. Start the pm2 app using the ecosystem.config.js file : 
- `pm2 start ecosystem.config.js --env production`
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.




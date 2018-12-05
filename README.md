# Smartsheet Delete Bulk Rows

## Delete large groups of rows from a sheet based on a given value being found in the row

**Example:** Delete every row in a sheet where the Status column is set to Complete.

### NOTE: This module requires the [Smartsheet Javascript SDK](https://github.com/smartsheet-platform/smartsheet-javascript-sdk) and is meant to be used alongside it.

Deleting collections of rows can be problematic with the [Smartsheet API](https://smartsheet-platform.github.io/api-docs/). The row ids are appended as query strings to the request:
```
DELETE /sheets/{sheetId}/rows?ids={rowId1},{rowId2},{rowId3}
```
There can be issues when needing to delete hundreds of rows in a sheet as you can easily get beyond the max characters for a URL.

This module solves this by: 
1. Getting the current sheet data. 
2. Searching through the rows to find matches with the given value.
3. Making the first found row a parent of all of the subsequent found rows by indenting them under it.
4. Deleting the new parent row.

When a parent row (a row with at least one other row indented under it) in Smartsheet all of its child rows are deleted as well. By indenting the rows one can delete hundreds of rows from a sheet by making only three requests to the Smartsheet API instead of possibly making several requests, batching up row ids for deletion. This can help to stay under rate limits as well as increase performance of your process with the Smartsheet API.

## Installation
```
not yet published to npm
```

## Usage

```javascript
//Assumes smartsheetClient has been instantiated elsewhere already

const deleteBulkRows = require('smartsheet-delete-bulk-rows');

const options = {
    sheetId: 4583173393803140,
    columnId: 2331373580117892,
    deleteValue: 'Complete'
};

deleteBulkRows(smartsheetClient, options)
 .then((results) => {
     console.log(results);
     })
 .catch((err) => {
     console.log(err)
 });
```

# Arguments

The function takes two arguments, your Smartsheet client object and an options object.

## smartsheetClient

This module is used alongside the Smartsheet Javascript SDK. Pass in your current Smartsheet client object for use in the requests.

## options

**options.sheetId**

The id of the sheet you are deleting rows from

**options.columnId**

The id of the column to look for that will have the value to decide if the row is deleted or not.

**options.deleteValue**

The value that should be matched


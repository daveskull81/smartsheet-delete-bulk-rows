/**
 * Requires use of the Smartsheet Javascript SDK along with this module
 * 
 * Accepts two arguments:
 * - your instance of the Smartsheet client from the Javascript SDK
 * - an options object:
 *  {
 *      sheetId: 4583173393803140,
 *      columnId: 2331373580117892,
 *      deleteValue: 'Complete'
 *  }
 * 
 * The function gets the data of the sheet for options.sheetId
 * Searches through all of the rows for a match to options.deleteValue
 * Updates all of the rows to be indented under the first row found
 * Thens deletes the new parent row, deleting all of the rows indented under it
 */

module.exports = (smartsheetClient, options) => {
    return new Promise((resolve, reject) => {
        //Get the data of the sheet
        smartsheetClient.sheets.getSheet({id: options.sheetId})
        .then((sheetData) => {
            //Filter the rows array of the GET Sheet response by filtering the cells array on each row by the deleteValue
            return sheetData.rows.filter(row => {
                return row.cells.filter(cell => cell.columnId === options.columnId && cell.value === options.deleteValue).length > 0;
                //Finally map a new array with just the row ids for each row where the deleteValue was found
            }).map(row => row.id);
        })
        .then(rowsToDelete => {
            //The array provided may not have any values if nothing meets the criteria
            //Check for if the array has at least one value
            if (rowsToDelete.length > 0) {
                    //Use the first row found as the new parent row for the rows to be deleted
                    const parentRow = rowsToDelete.shift();
                    //Create an array of row objects with the row ids and setting the new row location being indented under the parent row
                    const rows = rowsToDelete.map(rowId => {  
                        return {"id": rowId, "parentId": parentRow}; 
                    });
                //Send request to update the rows location
                smartsheetClient.sheets.updateRow({ sheetId: options.sheetId, body: rows})
                .then(response => {
                    //Once the rows have their location updated send the request to delete the parent row
                    smartsheetClient.sheets.deleteRow({ sheetId: options.sheetId, rowId: parentRow})
                    .then(response => {
                        //If successful return a message object with number of rows deleted
                        resolve({ message: response.message, numberOfRowsDeleted: rowsToDelete.length});
                    })
                    //Catch errors in the request to delete the parent row and return the Smartsheet API error
                    .catch(err => reject({ message: 'Error Deleting Rows from Sheet', smartsheetError: err}));
                })
                //Catch errors in the request to the row locations and return the Smartsheet API error
                .catch(err => reject({ message: 'Error Updating Row Locations', smartsheetError: err}));
            } else {
                //If no errors match deleteValue provided
                resolve({ message: 'Now rows matched criteria. 0 rows deleted from the sheet'});
            }
        })
        //Catch errors in the request to get the Sheet data and return the Smartsheet API error
        .catch(err => reject({ message: 'Error Getting Sheet Data', smartsheetError: err}));
    });
};
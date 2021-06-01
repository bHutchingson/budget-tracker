let db;
let budgetVersion;

//Create new db request
const request = indexedDB.open('BudgetDB', budgetVersion || 21);
let db;
let budgetVersion;

//Create new db request
const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = event => {
    console.log('Upgrade neede in IndexDB.');

    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;

    console.log(`DB has been updated from version ${oldVersion} to ${newVersion}`);

    db = event.target.result;

    if(db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetStore', { autoIncrement: true });
    }
};
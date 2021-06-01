let db;
let budgetVersion;

//Create new db request
const request = indexedDB.open('BudgetDB', budgetVersion || 21);

//on upgrade
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

//on error
request.onerror = event => {
    console.log(`ERROR ${event.target.errorCode}`);
};

//check database
const checkDatabase = () => {
    
    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                response.json();
            })
            .then(res => {
                if(res.length !== 0) {
                    transaction = db.transaction(['BudgetStore'], 'readwrite');

                    const currentStore = transaction.objectStore('BudgetStore');

                    currentStore.clear();
                    console.log('Store is cleared');
                }
            })
        }
    };
};
let db;
let budgetVersion;

//Create new db request
const request = indexedDB.open('BudgetDB', budgetVersion || 17);

//on upgrade
request.onupgradeneeded = event => {
    console.log('Upgrade needed in IndexDB.');

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

//on success
request.onsuccess = event => {
    console.log('success');
    db = event.target.result;

    if(navigator.onLine) {
        console.log('Backend online');
        checkDatabase();
    }
};

//save record
const saveRecord = record => {
    console.log('Attempting to save record');

    const transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    store.add(record);
};

window.addEventListener('online', checkDatabase);
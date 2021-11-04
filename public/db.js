// GIVEN a user is on Budget App without an internet connection
// WHEN the user inputs a withdrawal or deposit
// THEN that will be shown on the page, and added to their transaction history when their connection is back online.

let db;

// open indexedDB
const request = indexedDB.open("BudgetDB", 1);

// when upgrade is needed/init BudgetStore and autoincr.
request.onupgradeneeded = function (evt) {
  db = evt.target.result;

  if (db.objectStoreNames.length === 0) {
  db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

// if there is an error, log the error
request.onerror = function (evt) {
  console.log(evt.target.errorCode);
};

function checkDatabase() {
  // open a transaction with readwrite ability
  let transaction = db.transaction(["BudgetStore"], "readwrite");
  // access the object store
  const store = transaction.objectStore("BudgetStore");
  // get all records from store, set to variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    // if database has data..
    if (getAll.result.length > 0) {
      // post all transaction data to db
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.json())
      .then((res) => {
        if (res.length !== 0) {
        // if successful, start a transaction
        transaction = db.transaction(["BudgetStore"], "readwrite");
        // access the object store
        const currentStore = transaction.objectStore("BudgetStore");
        // clear the data from the store
        currentStore.clear();
      }
      });
    }
  };
};


// when successful, check if online
request.onsuccess = function (evt) {
  db = evt.target.result;

  if (navigator.online) {
    checkDatabase();
  }
};

// save a record of balance change
function saveRecord(record) {
  console.log("Record Saved");
  // open a transaction with readwrite ability
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  // access the object store
  const store = transaction.objectStore("BudgetStore");
  // add record to store
  store.add(record);
}


// listen for the app coming online
window.addEventListener("online", checkDatabase);
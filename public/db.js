// GIVEN a user is on Budget App without an internet connection
// WHEN the user inputs a withdrawal or deposit
// THEN that will be shown on the page, and added to their transaction history when their connection is back online.
const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (evt) {
  const db = evt.target.result;
  db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onsuccess = function (evt) {
  db = evt.target.result;

  if (navigator.online) {
    checkDatabase();
  }
};

request.onerror = function (evt) {
  console.log(evt.target.errorCode);
};
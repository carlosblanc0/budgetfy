/**
 * Open and closes "new transaction button".
 */
const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

/**
 * Saves entries on user's browser using localStorage.
 */
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances: transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances: transactions",
      JSON.stringify(transactions)
    );
  },
};

/**
 * Performs basic arithmetic operations.
 * @return populates "in", "out", and "total" card.
 */
const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  income() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income = income + transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expenses = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expenses = expenses + transaction.amount;
      }
    });
    return expenses;
  },
  subtotal() {
    return Transaction.income() + Transaction.expenses();
  },
};

/**
 * Performs alterations onto the DOM structure.
 * @return Displays altered HTML state.
 */
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";
    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td> 
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Delete entry icon" />
        </td>
        `;

    return html;
  },
  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.income()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("subtotalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.subtotal()
    );
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

/**
 * @param {} value as in negative or positive double.
 * @return displays rounded decimal in "total" tab.
 */
const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    return Math.round(value);
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return signal + value;
  },

  formatDate(date) {
    const splitDate = date.split("-");
    return `${splitDate[1]}/${splitDate[2]}/${splitDate[0]}`;
  },
};

/**
 * Getter function - performs operations on a newly submitted form.
 */
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Invalid entry - can't be empty");
    }
  },

  formatData() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return {
      description: description,
      amount: amount,
      date: date,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  resetFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();
    try {
      Form.validateFields();
      const transaction = Form.formatData();
      Form.saveTransaction(transaction);
      Form.resetFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();

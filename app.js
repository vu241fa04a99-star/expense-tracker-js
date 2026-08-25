const fs = require("fs");
const readline = require("readline");

const DATA_FILE = "expenses.json";

// ==========================================
// FILE MANAGEMENT
// ==========================================

function loadExpenses() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, "[]");
            return [];
        }

        const data = fs.readFileSync(DATA_FILE, "utf8");

        if (!data.trim()) {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.log("Error loading expenses.");
        return [];
    }
}

function saveExpenses(expenses) {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(expenses, null, 2),
            "utf8"
        );
    } catch (error) {
        console.log("Error saving expenses.");
    }
}

// ==========================================
// EXPENSE FUNCTIONS
// ==========================================

function generateId(expenses) {
    if (expenses.length === 0) {
        return 1;
    }

    return Math.max(...expenses.map(expense => expense.id)) + 1;
}

function addExpense(name, amount, category) {
    const expenses = loadExpenses();

    const newExpense = {
        id: generateId(expenses),
        name: name,
        amount: amount,
        category: category,
        date: new Date().toLocaleDateString("en-IN")
    };

    expenses.push(newExpense);
    saveExpenses(expenses);

    return newExpense;
}

function getExpenses() {
    return loadExpenses();
}

function deleteExpense(id) {
    const expenses = loadExpenses();

    const index = expenses.findIndex(expense => expense.id === id);

    if (index === -1) {
        return false;
    }

    expenses.splice(index, 1);
    saveExpenses(expenses);

    return true;
}

function getTotal() {
    const expenses = loadExpenses();

    return expenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );
}

function getCategoryExpenses(category) {
    const expenses = loadExpenses();

    return expenses.filter(
        expense =>
            expense.category.toLowerCase() ===
            category.toLowerCase()
    );
}

// ==========================================
// READLINE
// ==========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}

// ==========================================
// DISPLAY FUNCTIONS
// ==========================================

function showTitle() {
    console.clear();

    console.log("======================================");
    console.log("        JAVASCRIPT EXPENSE TRACKER");
    console.log("======================================");
}

function showMenu() {
    console.log("\n");
    console.log("1. Add Expense");
    console.log("2. View All Expenses");
    console.log("3. Delete Expense");
    console.log("4. Show Total Spending");
    console.log("5. Filter by Category");
    console.log("6. Exit");
    console.log("--------------------------------------");
}

function displayExpenses(expenses) {
    if (expenses.length === 0) {
        console.log("\nNo expenses found.");
        return;
    }

    console.log("\n--------------------------------------");
    console.log("             EXPENSES");
    console.log("--------------------------------------");

    expenses.forEach(expense => {
        console.log(`ID       : ${expense.id}`);
        console.log(`Name     : ${expense.name}`);
        console.log(`Amount   : ₹${expense.amount.toFixed(2)}`);
        console.log(`Category : ${expense.category}`);
        console.log(`Date     : ${expense.date}`);
        console.log("--------------------------------------");
    });
}

// ==========================================
// ADD EXPENSE
// ==========================================

async function addExpenseMenu() {
    console.log("\n========== ADD EXPENSE ==========");

    const name = await ask("Expense name: ");
    const amountInput = await ask("Amount: ");
    const category = await ask("Category: ");

    const amount = Number(amountInput);

    if (name.trim() === "") {
        console.log("\nExpense name cannot be empty.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        console.log("\nPlease enter a valid amount.");
        return;
    }

    if (category.trim() === "") {
        console.log("\nCategory cannot be empty.");
        return;
    }

    const expense = addExpense(
        name.trim(),
        amount,
        category.trim()
    );

    console.log("\nExpense added successfully!");
    console.log(`Expense ID: ${expense.id}`);
}

// ==========================================
// VIEW EXPENSES
// ==========================================

function viewExpensesMenu() {
    const expenses = getExpenses();

    displayExpenses(expenses);
}

// ==========================================
// DELETE EXPENSE
// ==========================================

async function deleteExpenseMenu() {
    const expenses = getExpenses();

    if (expenses.length === 0) {
        console.log("\nThere are no expenses to delete.");
        return;
    }

    displayExpenses(expenses);

    const idInput = await ask("\nEnter expense ID to delete: ");
    const id = Number(idInput);

    if (isNaN(id)) {
        console.log("\nPlease enter a valid ID.");
        return;
    }

    const deleted = deleteExpense(id);

    if (deleted) {
        console.log("\nExpense deleted successfully!");
    } else {
        console.log("\nExpense with that ID was not found.");
    }
}

// ==========================================
// TOTAL SPENDING
// ==========================================

function showTotalMenu() {
    const total = getTotal();

    console.log("\n========== TOTAL SPENDING ==========");
    console.log(`Total Expenses: ₹${total.toFixed(2)}`);
}

// ==========================================
// CATEGORY FILTER
// ==========================================

async function filterCategoryMenu() {
    const category = await ask(
        "\nEnter category to search: "
    );

    if (category.trim() === "") {
        console.log("\nCategory cannot be empty.");
        return;
    }

    const expenses = getCategoryExpenses(category.trim());

    if (expenses.length === 0) {
        console.log(
            `\nNo expenses found in category "${category}".`
        );
        return;
    }

    displayExpenses(expenses);

    const categoryTotal = expenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );

    console.log(
        `Category Total: ₹${categoryTotal.toFixed(2)}`
    );
}

// ==========================================
// STATISTICS
// ==========================================

function showStatistics() {
    const expenses = getExpenses();

    if (expenses.length === 0) {
        console.log("\nNo expenses available.");
        return;
    }

    const total = getTotal();

    const highestExpense = expenses.reduce(
        (highest, expense) =>
            expense.amount > highest.amount
                ? expense
                : highest,
        expenses[0]
    );

    const lowestExpense = expenses.reduce(
        (lowest, expense) =>
            expense.amount < lowest.amount
                ? expense
                : lowest,
        expenses[0]
    );

    console.log("\n========== STATISTICS ==========");
    console.log(`Number of Expenses : ${expenses.length}`);
    console.log(`Total Spending     : ₹${total.toFixed(2)}`);
    console.log(
        `Average Spending   : ₹${(
            total / expenses.length
        ).toFixed(2)}`
    );
    console.log(
        `Highest Expense    : ₹${highestExpense.amount.toFixed(
            2
        )} (${highestExpense.name})`
    );
    console.log(
        `Lowest Expense     : ₹${lowestExpense.amount.toFixed(
            2
        )} (${lowestExpense.name})`
    );
}

// ==========================================
// MAIN APPLICATION
// ==========================================

async function startApp() {
    while (true) {
        showTitle();
        showMenu();

        const choice = await ask("Choose an option: ");

        switch (choice.trim()) {
            case "1":
                await addExpenseMenu();
                break;

            case "2":
                viewExpensesMenu();
                break;

            case "3":
                await deleteExpenseMenu();
                break;

            case "4":
                showTotalMenu();
                break;

            case "5":
                await filterCategoryMenu();
                break;

            case "6":
                showStatistics();

                console.log(
                    "\nThank you for using Expense Tracker!"
                );

                rl.close();
                return;

            default:
                console.log(
                    "\nInvalid option. Please choose 1-6."
                );
        }

        await ask("\nPress ENTER to continue...");
    }
}

// ==========================================
// START
// ==========================================

console.log("Starting Expense Tracker...");

startApp();

/* =========================================================
   ROZMARRA — EXPENSE TRACKER
   ========================================================= */


/* ================= STORAGE ================= */

const EXPENSE_STORAGE_KEY = "rozmarra_expenses";
const BUDGET_STORAGE_KEY = "rozmarra_monthly_budget";


/* ================= CATEGORIES ================= */

const categories = {
    Food: "#4f8bff",
    Transport: "#14b8a6",
    Shopping: "#8b5cf6",
    Bills: "#f59e0b",
    Education: "#06b6d4",
    Entertainment: "#ec4899",
    Health: "#22c55e",
    Other: "#94a3b8"
};


/* ================= DOM ELEMENTS ================= */

const expenseForm = document.getElementById("expenseForm");
const expenseFormPanel = document.getElementById("expenseFormPanel");

const openExpenseFormBtn =
    document.getElementById("openExpenseForm");

const closeExpenseFormBtn =
    document.getElementById("closeExpenseForm");

const cancelExpenseBtn =
    document.getElementById("cancelExpense");

const descriptionInput =
    document.getElementById("expenseDescription");

const amountInput =
    document.getElementById("expenseAmount");

const categoryInput =
    document.getElementById("expenseCategory");

const noteInput =
    document.getElementById("expenseNote");


/* Budget */

const budgetForm =
    document.getElementById("budgetForm");

const budgetInput =
    document.getElementById("budgetInput");

const editBudgetBtn =
    document.getElementById("editBudgetBtn");

const cancelBudgetBtn =
    document.getElementById("cancelBudgetBtn");

const budgetAmount =
    document.getElementById("budgetAmount");

const budgetSpent =
    document.getElementById("budgetSpent");

const budgetRemaining =
    document.getElementById("budgetRemaining");

const budgetPercentage =
    document.getElementById("budgetPercentage");

const remainingLabel =
    document.getElementById("remainingLabel");

const budgetProgress =
    document.getElementById("budgetProgress");

const budgetStatus =
    document.getElementById("budgetStatus");


/* Summary */

const monthlySpending =
    document.getElementById("monthlySpending");

const transactionCount =
    document.getElementById("transactionCount");

const dailyAverage =
    document.getElementById("dailyAverage");


/* Analytics */

const categoryChart =
    document.getElementById("categoryChart");

const topCategories =
    document.getElementById("topCategories");


/* Transactions */

const expenseTableBody =
    document.getElementById("expenseTableBody");

const searchExpenses =
    document.getElementById("searchExpenses");

const categoryFilter =
    document.getElementById("categoryFilter");


/* ================= DATA ================= */

let expenses = loadExpenses();

let currentBudget = loadBudget();


/* ================= HELPERS ================= */

function getCurrentMonthKey() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1)
        .padStart(2, "0");

    return `${year}-${month}`;
}


function getCurrentDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1)
        .padStart(2, "0");

    const day = String(now.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);

}


function formatShortCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

}


function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* ================= EXPENSE STORAGE ================= */

function loadExpenses() {

    try {

        const stored =
            localStorage.getItem(EXPENSE_STORAGE_KEY);

        return stored
            ? JSON.parse(stored)
            : [];

    } catch (error) {

        console.error("Could not load expenses:", error);

        return [];

    }

}


function saveExpenses() {

    localStorage.setItem(
        EXPENSE_STORAGE_KEY,
        JSON.stringify(expenses)
    );

}


/* ================= BUDGET STORAGE ================= */

function loadBudget() {

    try {

        const stored =
            localStorage.getItem(BUDGET_STORAGE_KEY);

        if (!stored) {
            return null;
        }

        const budget = JSON.parse(stored);

        /*
         * Budget belongs to a specific month.
         * If the month has changed, start fresh.
         */

        if (budget.month !== getCurrentMonthKey()) {

            localStorage.removeItem(BUDGET_STORAGE_KEY);

            return null;
        }

        return budget;

    } catch (error) {

        console.error("Could not load budget:", error);

        return null;

    }

}


function saveBudget(amount) {

    currentBudget = {
        month: getCurrentMonthKey(),
        amount: amount
    };

    localStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify(currentBudget)
    );

}


/* ================= CURRENT MONTH EXPENSES ================= */

function getCurrentMonthExpenses() {

    const currentMonth = getCurrentMonthKey();

    return expenses.filter(expense =>
        expense.date.startsWith(currentMonth)
    );

}


function getCurrentMonthSpending() {

    return getCurrentMonthExpenses()
        .reduce((total, expense) =>
            total + Number(expense.amount), 0);

}


/* ================= BUDGET RENDERING ================= */

function renderBudget() {

    const spent = getCurrentMonthSpending();

    /*
     * No budget has been set yet.
     */

    if (!currentBudget || !currentBudget.amount) {

        budgetAmount.textContent = "0";

        budgetSpent.textContent =
            formatShortCurrency(spent);

        budgetRemaining.textContent = "—";

        budgetPercentage.textContent = "0%";

        remainingLabel.textContent = "Remaining";

        budgetProgress.style.width = "0%";

        budgetProgress.className =
            "budget-progress-fill";

        budgetStatus.textContent =
            "Set a monthly budget to start tracking.";

        budgetStatus.className =
            "budget-status";

        return;
    }


    const budget = Number(currentBudget.amount);

    const remaining = budget - spent;

    const percentage =
        (spent / budget) * 100;


    /* Main values */

    budgetAmount.textContent =
        budget.toLocaleString("en-IN");

    budgetSpent.textContent =
        formatShortCurrency(spent);


    /* Remaining / over budget */

    if (remaining >= 0) {

        remainingLabel.textContent =
            "Remaining";

        budgetRemaining.textContent =
            formatShortCurrency(remaining);

    } else {

        remainingLabel.textContent =
            "Over budget";

        budgetRemaining.textContent =
            formatShortCurrency(Math.abs(remaining));

    }


    /* Percentage */

    budgetPercentage.textContent =
        `${Math.round(percentage)}%`;


    /* Progress */

    const progressWidth =
        Math.min(percentage, 100);

    budgetProgress.style.width =
        `${progressWidth}%`;


    /*
     * Change the progress state depending
     * on how much of the budget is used.
     */

    budgetProgress.className =
        "budget-progress-fill";

    budgetStatus.className =
        "budget-status";


    if (percentage > 100) {

        budgetProgress.classList.add("over");

        budgetStatus.classList.add("over");

        budgetStatus.textContent =
            `${formatShortCurrency(Math.abs(remaining))} over your monthly budget.`;

    }

    else if (percentage >= 90) {

        budgetProgress.classList.add("danger");

        budgetStatus.classList.add("danger");

        budgetStatus.textContent =
            "You are very close to your monthly budget.";

    }

    else if (percentage >= 70) {

        budgetProgress.classList.add("warning");

        budgetStatus.classList.add("warning");

        budgetStatus.textContent =
            `${Math.round(percentage)}% of your monthly budget has been used.`;

    }

    else {

        budgetStatus.textContent =
            `${Math.round(percentage)}% of your monthly budget has been used.`;

    }

}


/* ================= BUDGET FORM ================= */

function openBudgetForm() {

    budgetForm.classList.remove("hidden");

    budgetInput.value =
        currentBudget
            ? currentBudget.amount
            : "";

    budgetInput.focus();

}


function closeBudgetForm() {

    budgetForm.classList.add("hidden");

}


editBudgetBtn.addEventListener(
    "click",
    openBudgetForm
);


cancelBudgetBtn.addEventListener(
    "click",
    closeBudgetForm
);


budgetForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const amount =
            Number(budgetInput.value);


        if (!amount || amount <= 0) {

            alert("Please enter a valid monthly budget.");

            return;
        }


        saveBudget(amount);

        renderBudget();

        closeBudgetForm();

    }
);


/* ================= SUMMARY ================= */

function renderSummary() {

    const monthExpenses =
        getCurrentMonthExpenses();

    const total =
        monthExpenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    monthlySpending.textContent =
        formatCurrency(total);


    transactionCount.textContent =
        monthExpenses.length;


    /*
     * Number of days passed in current month.
     */

    const now = new Date();

    const dayOfMonth =
        now.getDate();


    const average =
        dayOfMonth > 0
            ? total / dayOfMonth
            : 0;


    dailyAverage.textContent =
        formatCurrency(average);

}


/* ================= CATEGORY ANALYTICS ================= */

function getCategoryTotals() {

    const totals = {};

    getCurrentMonthExpenses().forEach(expense => {

        if (!totals[expense.category]) {
            totals[expense.category] = 0;
        }

        totals[expense.category] +=
            Number(expense.amount);

    });

    return totals;

}


function renderCategoryChart() {

    const totals =
        getCategoryTotals();

    const entries =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1]);


    if (entries.length === 0) {

        categoryChart.innerHTML = `
            <div class="empty-chart">
                Add expenses to see your spending breakdown.
            </div>
        `;

        return;
    }


    const maxAmount =
        entries[0][1];


    categoryChart.innerHTML =
        entries.map(([category, amount]) => {

            const percentage =
                (amount / maxAmount) * 100;

            const color =
                categories[category] || "#94a3b8";

            return `
                <div class="chart-row">

                    <div class="chart-category">
                        ${escapeHTML(category)}
                    </div>

                    <div class="chart-track">

                        <div
                            class="chart-fill"
                            style="
                                width: ${percentage}%;
                                background: ${color};
                            "
                        ></div>

                    </div>

                    <div class="chart-amount">
                        ${formatShortCurrency(amount)}
                    </div>

                </div>
            `;

        }).join("");

}


function renderTopCategories() {

    const totals =
        getCategoryTotals();

    const entries =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);


    if (entries.length === 0) {

        topCategories.innerHTML = `
            <div class="empty-chart">
                No expenses recorded yet.
            </div>
        `;

        return;
    }


    const total =
        entries.reduce(
            (sum, [, amount]) =>
                sum + amount,
            0
        );


    topCategories.innerHTML =
        entries.map(([category, amount]) => {

            const percentage =
                total > 0
                    ? ((amount / total) * 100).toFixed(1)
                    : 0;

            const color =
                categories[category] || "#94a3b8";


            return `
                <div class="category-item">

                    <div class="category-info">

                        <span
                            class="category-dot"
                            style="background:${color}"
                        ></span>

                        <span class="category-name">
                            ${escapeHTML(category)}
                        </span>

                    </div>

                    <div>

                        <span class="category-value">
                            ${formatShortCurrency(amount)}
                        </span>

                        <span class="category-percent">
                            ${percentage}%
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}


/* ================= ADD EXPENSE ================= */

expenseForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const description =
            descriptionInput.value.trim();

        const amount =
            Number(amountInput.value);

        const category =
            categoryInput.value;

        const note =
            noteInput.value.trim();


        /* Validation */

        if (!description) {

            alert("Please enter an expense description.");

            return;
        }


        if (!amount || amount <= 0) {

            alert("Please enter a valid amount.");

            return;
        }


        if (!category) {

            alert("Please select a category.");

            return;
        }


        /*
         * DATE IS AUTOMATICALLY GENERATED HERE.
         * The user does not enter the date manually.
         */

        const expense = {

            id:
                crypto.randomUUID(),

            description:
                description,

            amount:
                amount,

            category:
                category,

            date:
                getCurrentDate(),

            note:
                note

        };


        expenses.push(expense);

        saveExpenses();


        /* Reset form */

        expenseForm.reset();

        expenseFormPanel.classList.remove("visible");


        /*
         * Re-render everything.
         *
         * This also automatically updates:
         * - Monthly spending
         * - Budget spent
         * - Budget remaining
         * - Budget percentage
         * - Category breakdown
         * - Transactions
         */

        renderAll();

    }
);


/* ================= DELETE EXPENSE ================= */

function deleteExpense(id) {

    const confirmed =
        confirm("Delete this expense?");


    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            expense => expense.id !== id
        );


    saveExpenses();

    renderAll();

}


/* ================= TRANSACTION TABLE ================= */

function renderTransactions() {

    const search =
        searchExpenses.value
            .trim()
            .toLowerCase();

    const selectedCategory =
        categoryFilter.value;


    let filteredExpenses =
        [...expenses];


    /* Search */

    if (search) {

        filteredExpenses =
            filteredExpenses.filter(expense => {

                return (
                    expense.description
                        .toLowerCase()
                        .includes(search)

                    ||

                    expense.category
                        .toLowerCase()
                        .includes(search)

                    ||

                    (expense.note || "")
                        .toLowerCase()
                        .includes(search)
                );

            });

    }


    /* Category */

    if (selectedCategory !== "all") {

        filteredExpenses =
            filteredExpenses.filter(
                expense =>
                    expense.category === selectedCategory
            );

    }


    /* Newest first */

    filteredExpenses.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    if (filteredExpenses.length === 0) {

        expenseTableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="empty-table"
                >
                    No expenses found.
                </td>
            </tr>
        `;

        return;
    }


    expenseTableBody.innerHTML =
        filteredExpenses.map(expense => {

            const color =
                categories[expense.category]
                || "#94a3b8";


            const noteHTML =
                expense.note
                    ? `
                        <div class="expense-note">
                            ${escapeHTML(expense.note)}
                        </div>
                    `
                    : "";


            return `
                <tr>

                    <td>

                        <div class="expense-name">
                            ${escapeHTML(expense.description)}
                        </div>

                        ${noteHTML}

                    </td>


                    <td>

                        <span
                            class="category-tag"
                            style="
                                background: ${color}18;
                                color: ${color};
                            "
                        >
                            ${escapeHTML(expense.category)}
                        </span>

                    </td>


                    <td>
                        ${formatDate(expense.date)}
                    </td>


                    <td>
                        <strong>
                            ${formatCurrency(expense.amount)}
                        </strong>
                    </td>


                    <td>

                        <button
                            class="delete-btn"
                            onclick="deleteExpense('${expense.id}')"
                            title="Delete expense"
                        >
                            ×
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* ================= FORM CONTROLS ================= */

openExpenseFormBtn.addEventListener(
    "click",
    function () {

        expenseFormPanel.classList.add("visible");

        descriptionInput.focus();

    }
);


closeExpenseFormBtn.addEventListener(
    "click",
    function () {

        expenseFormPanel.classList.remove("visible");

    }
);


cancelExpenseBtn.addEventListener(
    "click",
    function () {

        expenseForm.reset();

        expenseFormPanel.classList.remove("visible");

    }
);


/* ================= FILTERS ================= */

searchExpenses.addEventListener(
    "input",
    renderTransactions
);


categoryFilter.addEventListener(
    "change",
    renderTransactions
);


/* ================= RENDER ALL ================= */

function renderAll() {

    renderBudget();

    renderSummary();

    renderCategoryChart();

    renderTopCategories();

    renderTransactions();

}


/* ================= INITIAL LOAD ================= */

renderAll();
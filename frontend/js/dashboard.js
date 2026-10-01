/* =========================================================
   ROZMARRA — DASHBOARD
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


/* ================= DOM ================= */

const greeting =
    document.getElementById("greeting");

const currentDate =
    document.getElementById("currentDate");

const monthlySpending =
    document.getElementById("monthlySpending");

const spendingStatus =
    document.getElementById("spendingStatus");

const remainingBudget =
    document.getElementById("remainingBudget");

const budgetProgress =
    document.getElementById("budgetProgress");

const budgetStatus =
    document.getElementById("budgetStatus");

const habitProgress =
    document.getElementById("habitProgress");

const habitStatus =
    document.getElementById("habitStatus");

const subscriptionCount =
    document.getElementById("subscriptionCount");

const subscriptionStatus =
    document.getElementById("subscriptionStatus");

const spendingOverview =
    document.getElementById("spendingOverview");

const todayPercentage =
    document.getElementById("todayPercentage");

const todayCompleted =
    document.getElementById("todayCompleted");

const todayMessage =
    document.getElementById("todayMessage");

const todayHabitList =
    document.getElementById("todayHabitList");

const upcomingSubscriptions =
    document.getElementById("upcomingSubscriptions");

const aiInsightTitle =
    document.getElementById("aiInsightTitle");

const aiInsightText =
    document.getElementById("aiInsightText");


/* ================= HELPERS ================= */

function getCurrentMonthKey() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    return `${year}-${month}`;

}


function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* ================= DATE / GREETING ================= */

function renderHeader() {

    const now = new Date();

    const hour =
        now.getHours();


    let greetingText;

    if (hour < 12) {

        greetingText =
            "Good morning, Keshav";

    } else if (hour < 17) {

        greetingText =
            "Good afternoon, Keshav";

    } else {

        greetingText =
            "Good evening, Keshav";

    }


    greeting.textContent =
        greetingText;


    currentDate.textContent =
        formatDate(now);

}


/* ================= EXPENSE DATA ================= */

function loadExpenses() {

    try {

        const stored =
            localStorage.getItem(
                EXPENSE_STORAGE_KEY
            );

        return stored
            ? JSON.parse(stored)
            : [];

    } catch (error) {

        console.error(
            "Could not load expenses:",
            error
        );

        return [];

    }

}


function loadBudget() {

    try {

        const stored =
            localStorage.getItem(
                BUDGET_STORAGE_KEY
            );

        if (!stored) {
            return null;
        }

        const budget =
            JSON.parse(stored);


        if (
            budget.month !==
            getCurrentMonthKey()
        ) {

            return null;

        }

        return budget;

    } catch (error) {

        return null;

    }

}


function getCurrentMonthExpenses() {

    const expenses =
        loadExpenses();

    const month =
        getCurrentMonthKey();


    return expenses.filter(
        expense =>
            expense.date.startsWith(month)
    );

}


function getMonthlySpending() {

    return getCurrentMonthExpenses()
        .reduce(
            (total, expense) =>
                total +
                Number(expense.amount),
            0
        );

}


/* ================= SPENDING CARD ================= */

function renderSpendingCard() {

    const expenses =
        getCurrentMonthExpenses();

    const total =
        getMonthlySpending();


    monthlySpending.textContent =
        formatCurrency(total);


    if (expenses.length === 0) {

        spendingStatus.textContent =
            "No expenses recorded yet.";

        return;
    }


    spendingStatus.textContent =
        `${expenses.length} transaction${expenses.length === 1 ? "" : "s"} this month`;

}


/* ================= BUDGET CARD ================= */

function renderBudgetCard() {

    const budget =
        loadBudget();

    const spent =
        getMonthlySpending();


    if (!budget || !budget.amount) {

        remainingBudget.textContent =
            "—";

        budgetProgress.style.width =
            "0%";

        budgetProgress.className =
            "mini-progress-fill";

        budgetStatus.textContent =
            "Set a monthly budget";

        return;

    }


    const budgetAmount =
        Number(budget.amount);

    const remaining =
        budgetAmount - spent;

    const percentage =
        (spent / budgetAmount) * 100;


    if (remaining >= 0) {

        remainingBudget.textContent =
            formatCurrency(remaining);

    } else {

        remainingBudget.textContent =
            formatCurrency(
                Math.abs(remaining)
            );

    }


    budgetProgress.style.width =
        `${Math.min(percentage, 100)}%`;

    budgetProgress.className =
        "mini-progress-fill";


    if (percentage > 100) {

        budgetProgress.classList.add(
            "danger"
        );

        budgetStatus.textContent =
            "Over your monthly budget";

    }

    else if (percentage >= 90) {

        budgetProgress.classList.add(
            "danger"
        );

        budgetStatus.textContent =
            `${Math.round(percentage)}% of budget used`;

    }

    else if (percentage >= 70) {

        budgetProgress.classList.add(
            "warning"
        );

        budgetStatus.textContent =
            `${Math.round(percentage)}% of budget used`;

    }

    else {

        budgetStatus.textContent =
            `${Math.round(percentage)}% of budget used`;

    }

}


/* ================= SPENDING OVERVIEW ================= */

function renderSpendingOverview() {

    const expenses =
        getCurrentMonthExpenses();


    if (expenses.length === 0) {

        spendingOverview.innerHTML = `
            <div class="dashboard-empty">
                Add expenses to see your spending overview.
            </div>
        `;

        return;

    }


    const totals = {};


    expenses.forEach(expense => {

        if (!totals[expense.category]) {

            totals[expense.category] =
                0;

        }

        totals[expense.category] +=
            Number(expense.amount);

    });


    const entries =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 5);


    const maximum =
        entries[0][1];


    spendingOverview.innerHTML =
        entries.map(
            ([category, amount]) => {

                const percentage =
                    (amount / maximum) * 100;

                const color =
                    categories[category]
                    || "#94a3b8";


                return `
                    <div class="spending-category">

                        <div class="spending-category-header">

                            <span class="spending-category-name">
                                ${escapeHTML(category)}
                            </span>

                            <span class="spending-category-amount">
                                ${formatCurrency(amount)}
                            </span>

                        </div>

                        <div class="spending-track">

                            <div
                                class="spending-fill"
                                style="
                                    width: ${percentage}%;
                                    background: ${color};
                                "
                            ></div>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* ================= HABITS ================= */

/*
 * For now this uses demo data.
 *
 * Once the Habits page is connected to
 * localStorage/backend, this function can
 * read the real habit data.
 */

function getDemoHabits() {

    return [

        {
            name: "Drink 2L Water",
            completed: true
        },

        {
            name: "Read for 30 minutes",
            completed: true
        },

        {
            name: "Exercise",
            completed: false
        },

        {
            name: "Sleep before 11 PM",
            completed: false
        }

    ];

}


function renderHabits() {

    const habits =
        getDemoHabits();


    if (habits.length === 0) {

        habitProgress.textContent =
            "0%";

        habitStatus.textContent =
            "No habits recorded";

        todayPercentage.textContent =
            "0%";

        todayCompleted.textContent =
            "0 of 0 habits completed";

        todayMessage.textContent =
            "Add habits to start tracking your progress.";

        todayHabitList.innerHTML = "";

        return;

    }


    const completed =
        habits.filter(
            habit => habit.completed
        ).length;


    const percentage =
        Math.round(
            (completed / habits.length) *
            100
        );


    habitProgress.textContent =
        `${percentage}%`;

    habitStatus.textContent =
        `${completed} of ${habits.length} completed`;


    todayPercentage.textContent =
        `${percentage}%`;

    todayCompleted.textContent =
        `${completed} of ${habits.length} habits completed`;


    if (percentage === 100) {

        todayMessage.textContent =
            "Excellent. All habits completed today.";

    }

    else if (percentage >= 50) {

        todayMessage.textContent =
            "You're making good progress today.";

    }

    else {

        todayMessage.textContent =
            "Keep going. There is still time today.";

    }


    todayHabitList.innerHTML =
        habits.map(
            habit => {

                return `
                    <div class="habit-row">

                        <span class="habit-name">
                            ${escapeHTML(habit.name)}
                        </span>

                        <span
                            class="habit-check ${
                                habit.completed
                                    ? "completed"
                                    : ""
                            }"
                        >
                            ${
                                habit.completed
                                    ? "✓"
                                    : "○"
                            }
                        </span>

                    </div>
                `;

            }
        ).join("");

}


/* ================= SUBSCRIPTIONS ================= */

/*
 * Temporary demo data.
 *
 * This will later be replaced with the
 * actual subscription data from the
 * Subscriptions page/database.
 */

function getDemoSubscriptions() {

    return [

        {
            name: "Netflix",
            date: "2026-10-03",
            amount: 649
        },

        {
            name: "Spotify",
            date: "2026-10-08",
            amount: 119
        },

        {
            name: "Google One",
            date: "2026-10-15",
            amount: 130
        }

    ];

}


function renderSubscriptions() {

    const subscriptions =
        getDemoSubscriptions();


    subscriptionCount.textContent =
        subscriptions.length;


    if (subscriptions.length === 0) {

        subscriptionStatus.textContent =
            "No active subscriptions";

        upcomingSubscriptions.innerHTML = `
            <div class="dashboard-empty">
                No upcoming subscriptions.
            </div>
        `;

        return;

    }


    subscriptionStatus.textContent =
        "Currently active";


    upcomingSubscriptions.innerHTML =
        subscriptions
            .slice(0, 3)
            .map(
                subscription => {

                    const date =
                        new Date(
                            subscription.date +
                            "T00:00:00"
                        );


                    return `
                        <div class="subscription-row">

                            <div class="subscription-info">

                                <div class="subscription-icon">
                                    $
                                </div>

                                <div>

                                    <div class="subscription-name">
                                        ${escapeHTML(subscription.name)}
                                    </div>

                                    <div class="subscription-date">
                                        ${date.toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short"
                                            }
                                        )}
                                    </div>

                                </div>

                            </div>

                            <div class="subscription-price">
                                ${formatCurrency(
                                    subscription.amount
                                )}
                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* ================= AI INSIGHT ================= */

function renderAIInsight() {

    const expenses =
        getCurrentMonthExpenses();

    const spending =
        getMonthlySpending();


    if (expenses.length === 0) {

        aiInsightTitle.textContent =
            "Start tracking to unlock insights.";

        aiInsightText.textContent =
            "Once you add expenses and habits, Rozmarra can connect your activity and provide personalized summaries and observations.";

        return;

    }


    const categoryTotals = {};


    expenses.forEach(expense => {

        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) +
            Number(expense.amount);

    });


    const topCategory =
        Object.entries(categoryTotals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    if (!topCategory) {
        return;
    }


    aiInsightTitle.textContent =
        `${topCategory[0]} is your highest spending category this month.`;


    aiInsightText.textContent =
        `You've spent ${formatCurrency(
            topCategory[1]
        )} on ${topCategory[0]} so far, out of ${formatCurrency(
            spending
        )} in total monthly expenses.`;

}


/* ================= RENDER ================= */

function renderDashboard() {

    renderHeader();

    renderSpendingCard();

    renderBudgetCard();

    renderSpendingOverview();

    renderHabits();

    renderSubscriptions();

    renderAIInsight();

}


/* ================= INITIAL LOAD ================= */

renderDashboard();
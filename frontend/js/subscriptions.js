/* =========================================================
   ROZMARRA — SUBSCRIPTION TRACKER
   ========================================================= */


/* ================= STORAGE ================= */

const SUBSCRIPTION_STORAGE_KEY =
    "rozmarra_subscriptions";


/* ================= CATEGORIES ================= */

const categories = {

    Entertainment: "#4f8bff",

    Education: "#06b6d4",

    Productivity: "#8b5cf6",

    Software: "#6366f1",

    "Cloud Storage": "#14b8a6",

    Gaming: "#ec4899",

    News: "#f59e0b",

    Other: "#94a3b8"

};


/* ================= DOM ELEMENTS ================= */

const subscriptionForm =
    document.getElementById(
        "subscriptionForm"
    );

const subscriptionFormPanel =
    document.getElementById(
        "subscriptionFormPanel"
    );

const openSubscriptionFormBtn =
    document.getElementById(
        "openSubscriptionForm"
    );

const closeSubscriptionFormBtn =
    document.getElementById(
        "closeSubscriptionForm"
    );

const cancelSubscriptionBtn =
    document.getElementById(
        "cancelSubscription"
    );


/* FORM */

const subscriptionNameInput =
    document.getElementById(
        "subscriptionName"
    );

const subscriptionAmountInput =
    document.getElementById(
        "subscriptionAmount"
    );

const billingCycleInput =
    document.getElementById(
        "billingCycle"
    );

const subscriptionCategoryInput =
    document.getElementById(
        "subscriptionCategory"
    );

const nextBillingDateInput =
    document.getElementById(
        "nextBillingDate"
    );

const subscriptionNoteInput =
    document.getElementById(
        "subscriptionNote"
    );


/* SUMMARY */

const monthlyCost =
    document.getElementById(
        "monthlyCost"
    );

const subscriptionCount =
    document.getElementById(
        "subscriptionCount"
    );

const yearlyCost =
    document.getElementById(
        "yearlyCost"
    );


/* ANALYTICS */

const upcomingRenewals =
    document.getElementById(
        "upcomingRenewals"
    );

const categoryBreakdown =
    document.getElementById(
        "categoryBreakdown"
    );


/* TABLE */

const subscriptionTableBody =
    document.getElementById(
        "subscriptionTableBody"
    );

const searchSubscriptions =
    document.getElementById(
        "searchSubscriptions"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


/* ================= DATA ================= */

let subscriptions =
    loadSubscriptions();


/* =========================================================
   STORAGE
   ========================================================= */

function loadSubscriptions() {

    try {

        const stored =
            localStorage.getItem(
                SUBSCRIPTION_STORAGE_KEY
            );


        return stored
            ? JSON.parse(stored)
            : [];

    } catch (error) {

        console.error(
            "Could not load subscriptions:",
            error
        );

        return [];

    }

}


function saveSubscriptions() {

    localStorage.setItem(
        SUBSCRIPTION_STORAGE_KEY,
        JSON.stringify(subscriptions)
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(amount);

}


function formatShortCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(amount);

}


function getToday() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


function getInitials(name) {

    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}


/* =========================================================
   MONTHLY COST
   ========================================================= */

function calculateMonthlyCost() {

    return subscriptions.reduce(
        (total, subscription) => {

            const amount =
                Number(subscription.amount);


            if (
                subscription.billingCycle ===
                "monthly"
            ) {

                return total + amount;

            }


            /*
             * Convert yearly subscriptions
             * into an estimated monthly cost.
             */

            return total + (
                amount / 12
            );

        },
        0
    );

}


/* =========================================================
   YEARLY COST
   ========================================================= */

function calculateYearlyCost() {

    return subscriptions.reduce(
        (total, subscription) => {

            const amount =
                Number(subscription.amount);


            if (
                subscription.billingCycle ===
                "monthly"
            ) {

                return total + (
                    amount * 12
                );

            }


            return total + amount;

        },
        0
    );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function renderSummary() {

    monthlyCost.textContent =
        formatCurrency(
            calculateMonthlyCost()
        );


    yearlyCost.textContent =
        formatCurrency(
            calculateYearlyCost()
        );


    subscriptionCount.textContent =
        subscriptions.length;

}


/* =========================================================
   RENEWAL HELPERS
   ========================================================= */

function getDaysUntil(dateString) {

    const today =
        new Date(
            getToday() + "T00:00:00"
        );

    const target =
        new Date(
            dateString + "T00:00:00"
        );


    const difference =
        target - today;


    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


function getRenewalStatus(dateString) {

    const days =
        getDaysUntil(dateString);


    if (days === 0) {

        return {
            text: "Due today",
            className: "today"
        };

    }


    if (days > 0 && days <= 7) {

        return {
            text: `In ${days} day${days === 1 ? "" : "s"}`,
            className: "soon"
        };

    }


    if (days < 0) {

        return {
            text: "Overdue",
            className: "today"
        };

    }


    return {
        text: `In ${days} days`,
        className: "upcoming"
    };

}


/* =========================================================
   UPCOMING RENEWALS
   ========================================================= */

function renderUpcomingRenewals() {

    if (subscriptions.length === 0) {

        upcomingRenewals.innerHTML = `
            <div class="empty-state">
                No subscriptions added yet.
            </div>
        `;

        return;

    }


    const sorted =
        [...subscriptions]
            .sort(
                (a, b) =>
                    new Date(a.nextBillingDate) -
                    new Date(b.nextBillingDate)
            )
            .slice(0, 5);


    upcomingRenewals.innerHTML =
        sorted
            .map(subscription => {

                const status =
                    getRenewalStatus(
                        subscription.nextBillingDate
                    );


                return `
                    <div class="renewal-item">

                        <div class="renewal-left">

                            <div class="service-icon">
                                ${escapeHTML(
                                    getInitials(
                                        subscription.name
                                    )
                                )}
                            </div>

                            <div class="renewal-info">

                                <div class="renewal-name">
                                    ${escapeHTML(
                                        subscription.name
                                    )}
                                </div>

                                <div class="renewal-date">
                                    ${formatDate(
                                        subscription.nextBillingDate
                                    )}
                                </div>

                            </div>

                        </div>


                        <div class="renewal-right">

                            <div class="renewal-amount">
                                ${formatCurrency(
                                    subscription.amount
                                )}
                            </div>

                            <span
                                class="renewal-status ${status.className}"
                            >
                                ${status.text}
                            </span>

                        </div>

                    </div>
                `;

            })
            .join("");

}


/* =========================================================
   CATEGORY BREAKDOWN
   ========================================================= */

function renderCategoryBreakdown() {

    if (subscriptions.length === 0) {

        categoryBreakdown.innerHTML = `
            <div class="empty-state">
                No subscriptions added yet.
            </div>
        `;

        return;

    }


    const categoryData = {};


    subscriptions.forEach(
        subscription => {

            const category =
                subscription.category;


            if (!categoryData[category]) {

                categoryData[category] = {

                    count: 0,

                    cost: 0

                };

            }


            categoryData[category].count += 1;


            /*
             * Use monthly equivalent cost
             * for category comparison.
             */

            if (
                subscription.billingCycle ===
                "monthly"
            ) {

                categoryData[category].cost +=
                    Number(
                        subscription.amount
                    );

            } else {

                categoryData[category].cost +=
                    Number(
                        subscription.amount
                    ) / 12;

            }

        }
    );


    const entries =
        Object.entries(categoryData)
            .sort(
                (a, b) =>
                    b[1].cost -
                    a[1].cost
            );


    categoryBreakdown.innerHTML =
        entries
            .map(
                ([category, data]) => {

                    const color =
                        categories[category]
                        || "#94a3b8";


                    return `
                        <div class="category-item">

                            <div class="category-info">

                                <span
                                    class="category-dot"
                                    style="
                                        background:${color}
                                    "
                                ></span>

                                <span class="category-name">
                                    ${escapeHTML(category)}
                                </span>

                                <span class="category-count">
                                    ${data.count}
                                </span>

                            </div>

                            <span class="category-cost">
                                ${formatShortCurrency(
                                    data.cost
                                )}/mo
                            </span>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   ADD SUBSCRIPTION
   ========================================================= */

subscriptionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            subscriptionNameInput.value.trim();

        const amount =
            Number(
                subscriptionAmountInput.value
            );

        const billingCycle =
            billingCycleInput.value;

        const category =
            subscriptionCategoryInput.value;

        const nextBillingDate =
            nextBillingDateInput.value;

        const note =
            subscriptionNoteInput.value.trim();


        /* VALIDATION */

        if (!name) {

            alert(
                "Please enter the service name."
            );

            return;

        }


        if (!amount || amount <= 0) {

            alert(
                "Please enter a valid amount."
            );

            return;

        }


        if (!billingCycle) {

            alert(
                "Please select a billing cycle."
            );

            return;

        }


        if (!category) {

            alert(
                "Please select a category."
            );

            return;

        }


        if (!nextBillingDate) {

            alert(
                "Please select the next billing date."
            );

            return;

        }


        /*
         * The next billing date can be today
         * or any future date.
         */

        if (
            nextBillingDate <
            getToday()
        ) {

            alert(
                "Next billing date cannot be in the past."
            );

            return;

        }


        const subscription = {

            id:
                crypto.randomUUID(),

            name:
                name,

            amount:
                amount,

            billingCycle:
                billingCycle,

            category:
                category,

            nextBillingDate:
                nextBillingDate,

            note:
                note

        };


        subscriptions.push(
            subscription
        );


        saveSubscriptions();


        subscriptionForm.reset();


        subscriptionFormPanel.classList.remove(
            "visible"
        );


        renderAll();

    }
);


/* =========================================================
   DELETE SUBSCRIPTION
   ========================================================= */

function deleteSubscription(id) {

    const confirmed =
        confirm(
            "Delete this subscription?"
        );


    if (!confirmed) {
        return;
    }


    subscriptions =
        subscriptions.filter(
            subscription =>
                subscription.id !== id
        );


    saveSubscriptions();

    renderAll();

}


/* =========================================================
   TABLE
   ========================================================= */

function renderSubscriptionsTable() {

    const search =
        searchSubscriptions.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter.value;


    let filtered =
        [...subscriptions];


    /* SEARCH */

    if (search) {

        filtered =
            filtered.filter(
                subscription => {

                    return (

                        subscription.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        subscription.category
                            .toLowerCase()
                            .includes(search)

                        ||

                        (
                            subscription.note || ""
                        )
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    /* CATEGORY FILTER */

    if (
        selectedCategory !==
        "all"
    ) {

        filtered =
            filtered.filter(
                subscription =>
                    subscription.category ===
                    selectedCategory
            );

    }


    /* SORT BY NEXT BILLING DATE */

    filtered.sort(
        (a, b) =>
            new Date(
                a.nextBillingDate
            ) -
            new Date(
                b.nextBillingDate
            )
    );


    if (filtered.length === 0) {

        subscriptionTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >
                    No subscriptions found.
                </td>

            </tr>
        `;

        return;

    }


    subscriptionTableBody.innerHTML =
        filtered
            .map(
                subscription => {

                    const color =
                        categories[
                            subscription.category
                        ] || "#94a3b8";


                    const noteHTML =
                        subscription.note
                            ? `
                                <div class="subscription-note">
                                    ${escapeHTML(
                                        subscription.note
                                    )}
                                </div>
                            `
                            : "";


                    return `
                        <tr>

                            <td>

                                <div class="subscription-name">
                                    ${escapeHTML(
                                        subscription.name
                                    )}
                                </div>

                                ${noteHTML}

                            </td>


                            <td>

                                <span
                                    class="category-tag"
                                    style="
                                        background:${color}18;
                                        color:${color};
                                    "
                                >
                                    ${escapeHTML(
                                        subscription.category
                                    )}
                                </span>

                            </td>


                            <td>

                                <span class="billing-tag">
                                    ${
                                        subscription.billingCycle ===
                                        "monthly"
                                            ? "Monthly"
                                            : "Yearly"
                                    }
                                </span>

                            </td>


                            <td class="next-billing">

                                ${formatDate(
                                    subscription.nextBillingDate
                                )}

                            </td>


                            <td>

                                <strong>
                                    ${formatCurrency(
                                        subscription.amount
                                    )}
                                </strong>

                            </td>


                            <td>

                                <button
                                    class="delete-btn"
                                    onclick="deleteSubscription('${subscription.id}')"
                                    title="Delete subscription"
                                >
                                    ×
                                </button>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   FORM CONTROLS
   ========================================================= */

openSubscriptionFormBtn.addEventListener(
    "click",
    function () {

        subscriptionFormPanel.classList.add(
            "visible"
        );

        subscriptionNameInput.focus();

    }
);


closeSubscriptionFormBtn.addEventListener(
    "click",
    function () {

        subscriptionFormPanel.classList.remove(
            "visible"
        );

    }
);


cancelSubscriptionBtn.addEventListener(
    "click",
    function () {

        subscriptionForm.reset();

        subscriptionFormPanel.classList.remove(
            "visible"
        );

    }
);


/* =========================================================
   FILTERS
   ========================================================= */

searchSubscriptions.addEventListener(
    "input",
    renderSubscriptionsTable
);


categoryFilter.addEventListener(
    "change",
    renderSubscriptionsTable
);


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {

    renderSummary();

    renderUpcomingRenewals();

    renderCategoryBreakdown();

    renderSubscriptionsTable();

}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

renderAll();
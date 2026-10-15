// Default habits
const defaultHabits = [
    {
        id: "water",
        name: "Drink 8 glasses of water",
        description: "Stay hydrated throughout the day.",
        frequency: "Daily"
    },
    {
        id: "exercise",
        name: "Exercise",
        description: "Exercise for at least an hour.",
        frequency: "Daily"
    },
    {
        id: "dsa",
        name: "Study DSA",
        description: "Study for at least an hour.",
        frequency: "Daily"
    },
    {
        id: "reading",
        name: "Read",
        description: "Read a book for 20 minutes.",
        frequency: "Daily"
    }
];

// Load saved data safely
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error("Could not load saved data:", error);
        return fallback;
    }
}

let habits = loadData(HABITS_KEY, defaultHabits);
let completions = loadData(COMPLETIONS_KEY, {});

// ========================================
// DATE HELPERS
// ========================================

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function getCompletedIds(dateKey = getDateKey()) {
    return completions[dateKey] || [];
}

function saveData() {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

// ========================================
// RENDER HABITS
// ========================================

function renderHabits() {
    const habitsSection = document.getElementById("Habits");

    if (!habitsSection) {
        console.error('Habit section with id="Habits" was not found.');
        return;
    }

    let habitList = document.getElementById("habit-list");

    if (!habitList) {
        habitList = document.createElement("div");
        habitList.id = "habit-list";

        const heading = habitsSection.querySelector("h2");

        if (heading) {
            heading.insertAdjacentElement("afterend", habitList);
        } else {
            habitsSection.appendChild(habitList);
        }
    }

    habitList.innerHTML = "";

    const completedToday = getCompletedIds();

    if (habits.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No habits yet. Add your first habit!";
        habitList.appendChild(message);
    }

    habits.forEach(function (habit) {
        const isCompleted = completedToday.includes(habit.id);

        const card = document.createElement("div");
        card.className = "habit-item";

        if (isCompleted) {
            card.classList.add("completed");
        }

        const title = document.createElement("h3");
        title.textContent = habit.name;

        const description = document.createElement("p");
        description.textContent = habit.description || "";

        const frequency = document.createElement("span");
        frequency.className = "habit-frequency";
        frequency.textContent = habit.frequency;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "habit-" + habit.id;
        checkbox.checked = isCompleted;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = isCompleted
            ? "Completed"
            : "Mark as completed";

        checkbox.addEventListener("change", function () {
            updateCompletion(habit.id, checkbox.checked);
        });

        const controls = document.createElement("div");
        controls.className = "habit-controls";
        controls.appendChild(checkbox);
        controls.appendChild(label);

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(frequency);
        card.appendChild(controls);

        habitList.appendChild(card);
    });

    updateStats();
}

// ========================================
// UPDATE HABIT COMPLETION
// ========================================

function updateCompletion(habitId, isCompleted) {
    const today = getDateKey();

    if (!completions[today]) {
        completions[today] = [];
    }

    if (isCompleted) {
        if (!completions[today].includes(habitId)) {
            completions[today].push(habitId);
        }
    } else {
        completions[today] = completions[today].filter(function (id) {
            return id !== habitId;
        });
    }

    saveData();
    renderHabits();
}

// ========================================
// UPDATE STATISTICS
// ========================================

function updateStats() {
    const today = getDateKey();
    const completedToday = getCompletedIds(today);

    // Today's completed tasks
    setText(
        "tasks-completed",
        completedToday.filter(function (id) {
            return habits.some(function (habit) {
                return habit.id === id;
            });
        }).length + "/" + habits.length
    );

    // Today's success rate
    const validCompleted = habits.filter(function (habit) {
        return completedToday.includes(habit.id);
    }).length;

    const todayRate = habits.length
        ? Math.round((validCompleted / habits.length) * 100)
        : 0;

    setText("success-rate", todayRate + "%");

    // Work out the current week, starting Monday
    const now = new Date();
    const monday = new Date(now);

    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const daysElapsed = Math.floor(
        (new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
            monday) / 86400000
    ) + 1;

    let expected = 0;
    let completedCount = 0;

    // Daily habits: one opportunity per elapsed day
    habits.forEach(function (habit) {
        if (habit.frequency === "Daily") {
            for (let i = 0; i < daysElapsed; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);

                expected++;

                if (getCompletedIds(getDateKey(date)).includes(habit.id)) {
                    completedCount++;
                }
            }
        } else {
            // Weekly habits: one completion opportunity per week
            expected++;

            for (let i = 0; i < daysElapsed; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);

                if (getCompletedIds(getDateKey(date)).includes(habit.id)) {
                    completedCount++;
                    break;
                }
            }
        }
    });

    const weeklyRate = expected
        ? Math.round((completedCount / expected) * 100)
        : 0;

    setText("weekly-progress-text", weeklyRate + "%");
    setText("weekly-progress", weeklyRate + "%");

    const progressBar = document.getElementById("weekly-progress-bar");

    if (progressBar) {
        progressBar.style.width = weeklyRate + "%";
    }

    // Daily streak: consecutive days with every daily habit completed
    const dailyHabits = habits.filter(function (habit) {
        return habit.frequency === "Daily";
    });

    let streak = 0;
    const checkDate = new Date();

    // If today's habits aren't all complete yet, start checking yesterday.
    const allCompletedToday = dailyHabits.length > 0 &&
        dailyHabits.every(function (habit) {
            return completedToday.includes(habit.id);
        });

    if (!allCompletedToday) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dailyHabits.length > 0) {
        const dateKey = getDateKey(checkDate);
        const completed = getCompletedIds(dateKey);

        const allCompleted = dailyHabits.every(function (habit) {
            return completed.includes(habit.id);
        });

        if (!allCompleted) {
            break;
        }

        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    setText(
        "daily-streak",
        streak + (streak === 1 ? " day" : " days")
    );
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// ========================================
// ADD A NEW HABIT
// ========================================

function setupHabitForm() {
    const form = document.querySelector("form");
    const addButton = document.getElementById("addHabitBtn");

    // Find the section containing the form
    const formSection = form ? form.closest("section") : null;

    if (addButton && formSection) {
        addButton.addEventListener("click", function () {
            formSection.classList.toggle("hidden");
        });
    }

    if (!form) {
        console.warn("Habit form was not found.");
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("habit-name");
        const descriptionInput = document.getElementById("description");
        const frequencyInput = document.getElementById("frequency");

        if (!nameInput || !descriptionInput || !frequencyInput) {
            console.error("One or more habit form fields are missing.");
            return;
        }

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const frequency = frequencyInput.value;

        if (!name) {
            alert("Please enter a habit name.");
            nameInput.focus();
            return;
        }

        const newHabit = {
            id: "habit-" + Date.now(),
            name: name,
            description: description,
            frequency: frequency
        };

        habits.push(newHabit);

        saveData();
        renderHabits();
        form.reset();

        if (formSection) {
            formSection.classList.add("hidden");
        }
    });
}

// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    renderHabits();
    setupHabitForm();
});
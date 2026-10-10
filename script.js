const SUPABASE_URL = "xysjwllphxnkfhkkommd";
const SUPABASE_KEY = "sb_publishable_XByuMa3E92n7fm6Fi3MYKw_r3NJWeKX";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
const targetProblems = 5;

let completedProblems = Math.min(
    Number(localStorage.getItem("completedProblems") ?? 3),
    targetProblems
);

const continueButton = document.getElementById("continue-button");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const progressPercentage = document.getElementById("progress-percentage");

// Update all progress details together
function updateProgressUI() {
    progressText.textContent =
        completedProblems + " of " + targetProblems + " problems completed";

    progressBar.style.width =
        (completedProblems / targetProblems) * 100 + "%";

    progressPercentage.textContent =
        Math.round((completedProblems / targetProblems) * 100) + "% completed";
        
const goalMessage = document.getElementById("goal-message");

goalMessage.textContent =
    completedProblems === targetProblems
        ? "Daily goal completed! Great work!"
        : "";

}

updateProgressUI();

continueButton.addEventListener("click", function () {
    if (completedProblems < targetProblems) {
        completedProblems++;

        localStorage.setItem("completedProblems", completedProblems);
        updateProgressUI();
    } else {
        alert("Daily goal completed! Great work!");
    }
});

const resetButton = document.getElementById("reset-button");

resetButton.addEventListener("click", function () {
    completedProblems = 0;
    localStorage.setItem("completedProblems", completedProblems);
    updateProgressUI();
});

const totalProblems = document.getElementById("total-problems");
const problemInput = document.getElementById("problem-input");
const saveProblemsButton = document.getElementById("save-problems");

totalProblems.textContent =
    localStorage.getItem("totalProblems") ?? "250";

saveProblemsButton.addEventListener("click", function () {
    const count = Number(problemInput.value);

    if (
        problemInput.value.trim() === "" ||
        !Number.isInteger(count) ||
        count < 0
    ) {
        alert("Enter a valid whole number.");
        return;
    }

    totalProblems.textContent = count;
    localStorage.setItem("totalProblems", count);
    problemInput.value = "";
});


const streakCount = document.getElementById("streak-count");
const completeTodayButton = document.getElementById("complete-today");

let streak = Number(localStorage.getItem("streak") ?? 0);
let lastCompletedDate = localStorage.getItem("lastCompletedDate") ?? "";

function updateStreakUI() {
    streakCount.textContent = streak + (streak === 1 ? " day" : " days");

    if (lastCompletedDate === new Date().toDateString()) {
        completeTodayButton.disabled = true;
        completeTodayButton.textContent = "Today's Goal Completed";
    } else {
        completeTodayButton.disabled = false;
        completeTodayButton.textContent = "Complete Today's Goal";
    }
}

updateStreakUI();

completeTodayButton.addEventListener("click", function () {
    const today = new Date().toDateString();

    if (lastCompletedDate !== today) {
        streak++;
        lastCompletedDate = today;

        localStorage.setItem("streak", streak);
        localStorage.setItem("lastCompletedDate", today);

        updateStreakUI();
    }
});


const contestList = document.getElementById("contest-list");

async function loadAllContests() {
    contestList.textContent = "Loading contests...";

    try {
        const response = await fetch(
            "https://competeapi.vercel.app/contests/upcoming/"
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const contests = await response.json();

        const upcomingContests = contests
            .filter(contest => contest.startTime > Date.now())
            .sort((a, b) => a.startTime - b.startTime);

        
allContests = contests
    .filter(contest => contest.startTime > Date.now())
    .sort((a, b) => a.startTime - b.startTime);

renderContests(
    document.querySelector(".filter-button.active")?.dataset.platform ?? "all"
);


        updateContestCountdowns();

    } catch (error) {
        console.error(error);
        contestList.textContent =
            "Unable to load contests. Please try again later.";
    }
}

function updateContestCountdowns() {
    document.querySelectorAll(".contest-countdown").forEach(element => {
        const remaining =
            Number(element.dataset.start) - Date.now();

        if (remaining <= 0) {
            element.textContent = "Contest starting now";
            return;
        }

        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        element.textContent =
            `Starts in ${days}d ${hours}h ${minutes}m ${seconds}s`;
    });
}

let allContests = [];

function renderContests(platform = "all") {
    const contestList = document.getElementById("contest-list");

    const filteredContests = allContests.filter(contest => {
        return platform === "all" || contest.site.toLowerCase() === platform;
    });

    contestList.innerHTML = "";

    filteredContests.forEach(contest => {
        const card = document.createElement("div");
        card.className = "card";

        const startDate = new Date(contest.startTime);

        card.innerHTML = `
            <p>${contest.site.toUpperCase()}</p>
            <h3>${contest.title}</h3>
            <p>${startDate.toLocaleString()}</p>
            <p>Duration: ${contest.duration / 3600000} hours</p>
            <p class="contest-countdown" data-start="${contest.startTime}">
                Calculating countdown...
            </p>
            <a href="${contest.url}" target="_blank" rel="noopener noreferrer">
                View Contest ↗
            </a>
        `;

        contestList.appendChild(card);
    });

    updateContestCountdowns();
}

document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", function () {
        document.querySelectorAll(".filter-button").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
        renderContests(this.dataset.platform);
    });
});

loadAllContests();
setInterval(updateContestCountdowns, 1000);

let isSignUp = true;

const authForm = document.getElementById("auth-form");
const authButton = document.getElementById("auth-button");
const toggleAuth = document.getElementById("toggle-auth");
const authMessage = document.getElementById("auth-message");

toggleAuth.addEventListener("click", function () {
    isSignUp = !isSignUp;

    authButton.textContent = isSignUp ? "Sign Up" : "Log In";

    toggleAuth.textContent = isSignUp
        ? "Already have an account? Log in"
        : "New here? Create an account";

    authMessage.textContent = "";
});

authForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    authButton.disabled = true;
    authMessage.textContent = "Please wait...";

    try {
        let result;

        if (isSignUp) {
            result = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });
        } else {
            result = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
        }

        if (result.error) {
            throw result.error;
        }

        if (isSignUp && !result.data.session) {
            authMessage.textContent =
                "Account created! Check your email to confirm it.";
        } else {
            authMessage.textContent =
                isSignUp ? "Account created!" : "Login successful!";
        }
    } catch (error) {
        authMessage.textContent = error.message;
    } finally {
        authButton.disabled = false;
    }
});

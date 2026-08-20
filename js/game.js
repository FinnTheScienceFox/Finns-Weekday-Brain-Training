/* =========================================================
   FINN'S WEEKDAY BRAIN TRAINING!
   Shared game systems and utilities
========================================================= */

const WEEKDAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
    "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
    "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
];

const CORRECT_MESSAGES = [
    "Correct! 🎉", "Good Job! 🎉", "Spot On! 🎉", "Nice One! 🎉",
    "Perfect! 🎉", "Awesome! 🎉", "Keep It Up! 🎉"
];

const DOOMSDAY_NORMAL = {
    0: 3, 1: 28, 2: 14, 3: 4, 4: 9, 5: 6,
    6: 11, 7: 8, 8: 5, 9: 10, 10: 7, 11: 12
};

let currentMode = null;

/* DOM helpers */
function $(id) {
    return document.getElementById(id);
}

function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}

function show(element) {
    if (element) element.classList.remove("hidden");
}

function hide(element) {
    if (element) element.classList.add("hidden");
}

function setText(element, text) {
    if (element) element.textContent = text;
}

/* Small, intentionally limited markdown renderer used by tutorial text. */
function formatText(text) {
    if (!text) return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
}

/* Date helpers */
function randomDate(minYear, maxYear) {
    const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const month = Math.floor(Math.random() * 12);
    const maxDay = new Date(year, month + 1, 0).getDate();
    const day = Math.floor(Math.random() * maxDay) + 1;

    return new Date(year, month, day);
}

function randomTutorialDate() {
    return randomDate(1800, 2200);
}

function randomGameDate() {
    return randomDate(1600, 2499);
}

function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function formatDate(date, includeYear = true) {
    const result = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
    return includeYear ? `${result}, ${date.getFullYear()}` : result;
}

function formatShortDate(date) {
    return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/* Doomsday calculation */
function centuryAnchor(year) {
    const cycle = ((Math.floor(year / 100) % 4) + 4) % 4;
    return [2, 0, 5, 3][cycle];
}

function calculateDoomsday(year) {
    const yy = year % 100;
    const groupsOf12 = Math.floor(yy / 12);
    const leftover = yy % 12;
    const groupsOf4 = Math.floor(leftover / 4);

    return (groupsOf12 + leftover + groupsOf4 + centuryAnchor(year)) % 7;
}

function monthDoomsday(month, year) {
    if (month === 0) return isLeapYear(year) ? 4 : 3;
    if (month === 1) return isLeapYear(year) ? 29 : 28;
    return DOOMSDAY_NORMAL[month];
}

function doomsdayDate(month, year) {
    return new Date(year, month, monthDoomsday(month, year));
}

/* Feedback */
function randomCorrectMessage() {
    return CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
}

function displayFeedback(element, correct, message) {
    if (!element) return;

    element.className = `feedback ${correct ? "correct" : "incorrect"}`;
    element.textContent = message;
}

/* Shared answer-button UI */
function createAnswerButtons(container, answers, onSelect) {
    if (!container) return;

    container.innerHTML = "";

    answers.forEach(answer => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.dataset.answer = String(answer);
        button.textContent = String(answer);

        button.addEventListener("click", () => {
            qsa(".answer-button", container).forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");
            onSelect(answer, button);
        });

        container.appendChild(button);
    });
}

function createSubmitButton(container, onSubmit) {
    if (!container) return null;

    qs(".submit-button", container)?.remove();

    const button = document.createElement("button");
    button.type = "button";
    button.className = "submit-button";
    button.textContent = "Submit";
    button.addEventListener("click", onSubmit);
    container.appendChild(button);

    return button;
}

/* Shared multiple-choice renderer for Guided, Quiz, and Endless. */
function renderModeQuestion(mode, question, answers, onSelect, onSubmit) {
    const questionElement = $(`${mode}-question`);
    const answersElement = $(`${mode}-answers`);
    const feedback = $(`${mode}-feedback`);

    if (!questionElement || !answersElement) return;

    questionElement.innerHTML = formatText(question);
    if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
    }

    let selected = null;

    createAnswerButtons(answersElement, answers, answer => {
        selected = answer;
        onSelect(answer);
    });

    createSubmitButton(answersElement, () => {
        if (selected === null) {
            displayFeedback(feedback, false, "Please choose an answer first.");
            return;
        }

        onSubmit();
    });
}

/* Screen navigation */
function transitionTo(callback) {
    const flash = $("screen-flash");

    if (!flash) {
        callback();
        return;
    }

    flash.style.transition = "opacity 0.18s ease";
    flash.style.opacity = "1";

    setTimeout(() => {
        callback();
        setTimeout(() => {
            flash.style.opacity = "0";
        }, 30);
    }, 180);
}

function showScreen(screenId) {
    qsa(".screen").forEach(hide);
    show($(screenId));
}

function goHome() {
    if (typeof stopQuizTimer === "function") stopQuizTimer();

    currentMode = null;

    if (typeof resetTutorialSidebar === "function") resetTutorialSidebar();
    if (typeof resetGuidedSidebar === "function") resetGuidedSidebar();

    transitionTo(() => showScreen("home-screen"));
}

function startMode(mode) {
    currentMode = mode;
    showScreen(`${mode}-screen`);

    const starters = {
        tutorial: startTutorial,
        practice: startPractice,
        guided: startGuided,
        quiz: setupQuiz,
        endless: startEndless
    };

    starters[mode]?.();
}

/* Initialization */
function initialize() {
    setupTitleScreen();
    setupTutorialControls();
    setupGuidedControls();
    setupPracticeControls();
    setupQuizControls();
    setupEndlessControls();

    qsa(".screen").forEach(hide);
    showScreen("home-screen");

    resetTutorialSidebar();
    resetGuidedSidebar();
}

document.addEventListener("DOMContentLoaded", initialize);

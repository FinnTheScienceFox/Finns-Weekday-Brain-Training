/* =========================================================
   FINN'S WEEKDAY BRAIN TRAINING!
   ========================================================= */


/* =========================================================
   CONSTANTS
========================================================= */

const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const TUTORIAL_MIN_YEAR = 1800;
const TUTORIAL_MAX_YEAR = 2200;

const GENERAL_MIN_YEAR = 1600;
const GENERAL_MAX_YEAR = 2499;


/*
    Standard Doomsday dates.

    January and February have two possibilities because of
    leap years.
*/

const DOOMSDAY_DATES = {
    1: [3, 4],
    2: [28, 29],
    3: [14],
    4: [4],
    5: [9],
    6: [6],
    7: [11],
    8: [8],
    9: [5],
    10: [10],
    11: [7],
    12: [12]
};


/*
    Century anchors.

    These are the actual weekday numbers used by the
    Doomsday calculation.

    1600 = Saturday (6)
    1700 = Thursday (4)
    1800 = Friday (5)
    1900 = Wednesday (3)
    2000 = Tuesday (2)
    2100 = Sunday (0)
    2200 = Friday (5)
    2300 = Wednesday (3)
    2400 = Tuesday (2)

    The pattern repeats every 400 years.
*/

const CENTURY_ANCHORS = {
    0: 2, // 2000
    1: 0, // 2100
    2: 5, // 2200
    3: 3  // 2300
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    currentMode: null,

    tutorial: {
        date: null,
        step: 1,
        results: {},
        selectedAnswer: null,
        answered: false,
        lastDate: null
    },

    guided: {
        date: null,
        selectedAnswer: null,
        answered: false,
        hintsLeft: 3,
        revealedSteps: new Set()
    },

    endless: {
        date: null,
        streak: 0,
        selectedAnswer: null,
        answered: false
    },

    quiz: {
        total: 10,
        current: 0,
        correct: 0,
        date: null,
        selectedAnswer: null,
        answered: false
    },

    practice: {
        category: null,
        question: null,
        answered: false
    }

};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function hide(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

function show(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}


/* =========================================================
   DATE HELPERS
========================================================= */

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function randomDate(minYear, maxYear) {

    const year = randomInteger(minYear, maxYear);
    const month = randomInteger(1, 12);

    const maxDay = new Date(
        year,
        month,
        0
    ).getDate();

    const day = randomInteger(1, maxDay);

    return {
        year,
        month,
        day
    };
}


function formatDate(date) {
    return `${MONTHS[date.month - 1]} ${date.day}, ${date.year}`;
}


function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}


function isLeapYear(year) {

    if (year % 400 === 0) {
        return true;
    }

    if (year % 100 === 0) {
        return false;
    }

    return year % 4 === 0;
}


function getWeekday(date) {

    return new Date(
        date.year,
        date.month - 1,
        date.day
    ).getDay();
}


/* =========================================================
   DOOMSDAY ALGORITHM
========================================================= */

function getCenturyAnchor(year) {

    const century = Math.floor(year / 100);

    const offset = ((century - 20) % 4 + 4) % 4;

    return CENTURY_ANCHORS[offset];
}


function getYearCalculations(year) {

    const lastTwo = year % 100;

    const groupsOf12 = Math.floor(lastTwo / 12);

    const leftover = lastTwo % 12;

    const groupsOf4 = Math.floor(leftover / 4);

    const centuryAnchor = getCenturyAnchor(year);

    const sum =
        groupsOf12 +
        leftover +
        groupsOf4 +
        centuryAnchor;

    const weekdayNumber = sum % 7;

    return {
        lastTwo,
        groupsOf12,
        leftover,
        groupsOf4,
        centuryAnchor,
        sum,
        weekdayNumber,
        weekday: WEEKDAYS[weekdayNumber]
    };
}


function getDoomsdayWeekday(year) {
    return getYearCalculations(year).weekdayNumber;
}


function getDoomsdayDate(year, month) {

    const leap = isLeapYear(year);

    if (month === 1) {
        return leap ? 4 : 3;
    }

    if (month === 2) {
        return leap ? 29 : 28;
    }

    return DOOMSDAY_DATES[month][0];
}


/* =========================================================
   CENTURY ANCHOR HELPERS
========================================================= */

function centuryAnchorDescription(century) {

    const year = century * 100;
    const weekday = getCenturyAnchor(year);

    return `${century} = ${WEEKDAYS[weekday]} (${weekday})`;
}


function normalizeNumberInput(value) {

    const number = Number(
        String(value)
            .trim()
            .replace(/[^0-9-]/g, "")
    );

    return Number.isFinite(number) ? number : null;
}


/* =========================================================
   TRANSITIONS
========================================================= */

function transitionTo(callback) {

    const flash = $("transition-flash");

    flash.classList.remove("fade-in", "fade-out");

    /*
        Force the browser to acknowledge the removal so that
        the animation can restart every time.
    */

    void flash.offsetWidth;

    flash.classList.add("fade-in");

    setTimeout(() => {

        callback();

        flash.classList.remove("fade-in");
        flash.classList.add("fade-out");

    }, 190);
}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => screen.classList.add("hidden"));
}


function showScreen(id) {

    hideAllScreens();

    show($(id));
}


function goHome() {

    resetTutorial();
    resetGuided();
    resetEndless();
    resetQuiz();
    resetPractice();

    state.currentMode = null;

    transitionTo(() => {
        showScreen("home-screen");
    });
}


/* =========================================================
   HOME MENU
========================================================= */

document
    .querySelectorAll(".mode-card")
    .forEach(button => {

        button.addEventListener("click", () => {

            const mode = button.dataset.mode;

            transitionTo(() => {

                state.currentMode = mode;

                if (mode === "tutorial") {
                    startTutorial();
                }

                else if (mode === "guided") {
                    startGuided();
                }

                else if (mode === "endless") {
                    startEndless();
                }

                else if (mode === "quiz") {
                    startQuizSetup();
                }

                else if (mode === "practice") {
                    startPracticeMenu();
                }

            });

        });

    });


/* =========================================================
   SIDEBAR GENERATION
========================================================= */

const SIDEBAR_NAMES = [
    "Groups of 12",
    "Leftover",
    "Groups of 4",
    "Century Anchor",
    "Add Them Up",
    "Reduce by 7",
    "Year's Doomsday",
    "Leap Year?",
    "Month's Doomsday",
    "Final Date"
];


function createSidebar(containerId, mode) {

    const container = $(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    SIDEBAR_NAMES.forEach((name, index) => {

        const stepNumber = index + 1;

        const element = document.createElement("div");

        element.className = "sidebar-step";

        element.dataset.step = stepNumber;

        element.innerHTML = `
            <strong>${stepNumber}.</strong>
            ${name}
            <span class="sidebar-result"></span>
        `;

        if (mode === "guided") {
            element.classList.add("hint-available");

            element.addEventListener("click", () => {
                useGuidedHint(stepNumber);
            });
        }

        container.appendChild(element);

    });
}


function resetSidebar(containerId) {

    const container = $(containerId);

    if (!container) {
        return;
    }

    container
        .querySelectorAll(".sidebar-step")
        .forEach(step => {

            step.classList.remove(
                "active",
                "completed",
                "revealed"
            );

            const result =
                step.querySelector(".sidebar-result");

            if (result) {
                result.textContent = "";
            }

        });
}


function setSidebarDate(containerId, date) {

    const element = $(containerId);

    if (element) {
        element.textContent = formatDate(date);
    }
}


function activateSidebarStep(containerId, stepNumber) {

    const container = $(containerId);

    if (!container) {
        return;
    }

    container
        .querySelectorAll(".sidebar-step")
        .forEach(step => {

            step.classList.remove("active");

            if (
                Number(step.dataset.step) === stepNumber
            ) {
                step.classList.add("active");
            }

        });
}


function completeSidebarStep(
    containerId,
    stepNumber,
    result
) {

    const container = $(containerId);

    if (!container) {
        return;
    }

    const step =
        container.querySelector(
            `.sidebar-step[data-step="${stepNumber}"]`
        );

    if (!step) {
        return;
    }

    step.classList.add("completed");

    const resultElement =
        step.querySelector(".sidebar-result");

    if (resultElement) {
        resultElement.textContent = result;
    }
}


/* =========================================================
   ANSWER BUTTON GENERATION
========================================================= */

function createAnswerButtons(
    containerId,
    answers,
    callback
) {

    const container = $(containerId);

    container.innerHTML = "";

    answers.forEach(answer => {

        const button = document.createElement("button");

        button.className = "answer-button";

        button.dataset.value = answer.value;

        button.textContent = answer.label;

        button.addEventListener("click", () => {

            container
                .querySelectorAll(".answer-button")
                .forEach(other => {
                    other.classList.remove("selected");
                });

            button.classList.add("selected");

            callback(answer.value);

        });

        container.appendChild(button);

    });
}


/* =========================================================
   TUTORIAL
========================================================= */

function resetTutorial() {

    state.tutorial = {
        date: null,
        step: 1,
        results: {},
        selectedAnswer: null,
        answered: false,
        lastDate: null
    };

    const area = $("tutorial-answer-area");

    if (area) {
        show(area);
        area.innerHTML = "";
    }

    show($("tutorial-submit"));

    $("tutorial-feedback").innerHTML = "";

    resetSidebar("tutorial-sidebar-steps");
}


function startTutorial() {

    resetTutorial();

    state.currentMode = "tutorial";

    createSidebar(
        "tutorial-sidebar-steps",
        "tutorial"
    );

    state.tutorial.date =
        randomDate(
            TUTORIAL_MIN_YEAR,
            TUTORIAL_MAX_YEAR
        );

    state.tutorial.lastDate =
        state.tutorial.date;

    setSidebarDate(
        "tutorial-sidebar-date",
        state.tutorial.date
    );

    showScreen("tutorial-screen");

    renderTutorialStep();
}


function renderTutorialStep() {

    const date = state.tutorial.date;

    const calculations =
        getYearCalculations(date.year);

    const step =
        state.tutorial.step;

    state.tutorial.selectedAnswer = null;
    state.tutorial.answered = false;

    $("tutorial-step-counter").textContent =
        `Step ${step} of 10`;

    $("tutorial-date-display").textContent =
        formatDate(date);

    $("tutorial-feedback").innerHTML = "";

    const answerArea =
        $("tutorial-answer-area");

    answerArea.innerHTML = "";

    show(answerArea);

    show($("tutorial-submit"));

    activateSidebarStep(
        "tutorial-sidebar-steps",
        step
    );


    /* ---------------------------------------------
       STEP 1
    --------------------------------------------- */

    if (step === 1) {

        $("tutorial-step-title").textContent =
            "Groups of 12";

        $("tutorial-question").innerHTML =
            `The last two digits of the year are <strong>${calculations.lastTwo}</strong>. How many groups of 12 can we make out of ${calculations.lastTwo}? (Remember this answer!)`;

        createNumberAnswers(
            answerArea,
            calculations.groupsOf12,
            -1,
            15,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 2
    --------------------------------------------- */

    else if (step === 2) {

        $("tutorial-step-title").textContent =
            "Find What's Left Over";

        $("tutorial-question").innerHTML =
            `For the last two digits, <strong>${calculations.lastTwo}</strong>, take 12 away until you can't anymore. What's left over? (Remember this answer!)`;

        createNumberAnswers(
            answerArea,
            calculations.leftover,
            0,
            11,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 3
    --------------------------------------------- */

    else if (step === 3) {

        $("tutorial-step-title").textContent =
            "Groups of 4";

        $("tutorial-question").innerHTML =
            `Take the answer from the last step, <strong>${calculations.leftover}</strong>. How many groups of 4 can we make out of ${calculations.leftover}? (Remember this answer!)`;

        createNumberAnswers(
            answerArea,
            calculations.groupsOf4,
            0,
            4,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 4
    --------------------------------------------- */

    else if (step === 4) {

        $("tutorial-step-title").textContent =
            "Century Anchor";

        const century =
            Math.floor(date.year / 100);

        $("tutorial-question").innerHTML =
            `The first two digits of the year are <strong>${century}</strong>. Remember the repeating pattern for <em>century anchors</em>: 18 = Friday (5). 19 = Wednesday (3). 20 = Tuesday (2). 21 = Sunday (0). Using the cycle above, what is the <em>century anchor</em>? (Remember this answer!)`;

        createNumberAnswers(
            answerArea,
            calculations.centuryAnchor,
            0,
            6,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 5
    --------------------------------------------- */

    else if (step === 5) {

        $("tutorial-step-title").textContent =
            "Add Them Up";

        /*
            IMPORTANT:
            Steps 1–4 are removed from the sidebar BEFORE
            the player sees the question.
        */

        for (let i = 1; i <= 4; i++) {

            const stepElement =
                document.querySelector(
                    `#tutorial-sidebar-steps .sidebar-step[data-step="${i}"]`
                );

            if (stepElement) {
                stepElement.remove();
            }

        }

        $("tutorial-question").innerHTML =
            `Hopefully you've memorized your answers so far! Add these results together... What's the result?`;

        createNumberAnswers(
            answerArea,
            calculations.sum,
            0,
            30,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 6
    --------------------------------------------- */

    else if (step === 6) {

        $("tutorial-step-title").textContent =
            "Reduce by 7";

        $("tutorial-question").innerHTML =
            `For last question's sum, <strong>${calculations.sum}</strong>, take 7 away until you can't anymore. What's left over?`;

        createNumberAnswers(
            answerArea,
            calculations.weekdayNumber,
            0,
            6,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 7
    --------------------------------------------- */

    else if (step === 7) {

        $("tutorial-step-title").textContent =
            "The Year's Doomsday";

        $("tutorial-question").innerHTML =
            `This leftover number, <strong>${calculations.weekdayNumber}</strong>, is the weekday of ${date.year}'s Doomsday dates! Remember the mnemonic for numbered weekdays: 0 = "NONEday" (Sunday), 1 = "ONEday" (Monday), 2 = "TWOsday" (Tuesday), 3 = THREE syllables (Wednesday), 4 = "FOURsday" (Thursday), 5 = "FIVEday" (Friday), 6 = "SIXurday" (Saturday). Using the mnemonic above, what weekday does this number represent?`;

        createWeekdayAnswers(
            answerArea,
            calculations.weekdayNumber,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 8
    --------------------------------------------- */

    else if (step === 8) {

        $("tutorial-step-title").textContent =
            "Leap Year?";

        const lastTwo =
            calculations.lastTwo;

        $("tutorial-question").innerHTML =
            `Now, we need to check if this year is a leap year. Take the last two digits of the year, <strong>${lastTwo}</strong>... Can you make groups of 4 with NO leftovers?`;

        createYesNoAnswers(
            answerArea,
            isLeapYear(date.year),
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 9
    --------------------------------------------- */

    else if (step === 9) {

        $("tutorial-step-title").textContent =
            "Month's Doomsday";

        const leap =
            isLeapYear(date.year);

        const monthDoomsday =
            getDoomsdayDate(
                date.year,
                date.month
            );

        const leapText =
            leap ? "is" : "is not";

        const firstSecond =
            leap ? "second" : "first";

        $("tutorial-question").innerHTML =
            `Each month has a Doomsday date: 1/3-4, 2/28-29, 3/14, 4/4, 5/9, 6/6, 7/11, 8/8, 9/5, 10/10, 11/7, and 12/12 for each month. This year <strong>${leapText}</strong> a leap year, which means the <strong>${firstSecond}</strong> number for January and February are their Doomsday dates. What is the Doomsday date for <strong>${MONTHS[date.month - 1]}</strong>?`;

        createAllDoomsdayAnswers(
            date,
            monthDoomsday,
            value => {
                state.tutorial.selectedAnswer = value;
            }
        );

    }


    /* ---------------------------------------------
       STEP 10
    --------------------------------------------- */

    else if (step === 10) {

        $("tutorial-step-title").textContent =
            "Find the Final Date";

        renderTutorialStep10Part1();

    }

}


function createNumberAnswers(
    container,
    correct,
    min,
    max,
    callback
) {

    let values = [];

    for (let i = min; i <= max; i++) {
        values.push(i);
    }

    createAnswerButtons(
        container.id,
        values.map(value => ({
            value,
            label: String(value)
        })),
        callback
    );
}


function createWeekdayAnswers(
    container,
    correct,
    callback
) {

    createAnswerButtons(
        container.id,
        WEEKDAYS.map((day, index) => ({
            value: index,
            label: day
        })),
        callback
    );
}


function createYesNoAnswers(
    container,
    correct,
    callback
) {

    createAnswerButtons(
        container.id,
        [
            {
                value: true,
                label: "Yes"
            },
            {
                value: false,
                label: "No"
            }
        ],
        callback
    );
}


function createAllDoomsdayAnswers(
    date,
    correctDay,
    callback
) {

    const answers = [];

    for (let month = 1; month <= 12; month++) {

        const dates =
            DOOMSDAY_DATES[month];

        dates.forEach(day => {

            answers.push({
                value: `${month}/${day}`,
                label: `${month}/${day}`
            });

        });

    }

    /*
        Shuffle the options so that the correct answer isn't
        always in a predictable location.
    */

    shuffleArray(answers);

    createAnswerButtons(
        "tutorial-answer-area",
        answers,
        callback
    );
}


/* =========================================================
   TUTORIAL SUBMISSION
========================================================= */

$("tutorial-submit").addEventListener(
    "click",
    submitTutorialAnswer
);


function submitTutorialAnswer() {

    const step =
        state.tutorial.step;

    const date =
        state.tutorial.date;

    const calculations =
        getYearCalculations(date.year);

    const selected =
        state.tutorial.selectedAnswer;

    if (selected === null) {
        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;
        return;
    }

    let correct = false;

    if (step === 1) {
        correct = Number(selected) === calculations.groupsOf12;
    }

    else if (step === 2) {
        correct = Number(selected) === calculations.leftover;
    }

    else if (step === 3) {
        correct = Number(selected) === calculations.groupsOf4;
    }

    else if (step === 4) {
        correct = Number(selected) === calculations.centuryAnchor;
    }

    else if (step === 5) {
        correct = Number(selected) === calculations.sum;
    }

    else if (step === 6) {
        correct = Number(selected) === calculations.weekdayNumber;
    }

    else if (step === 7) {
        correct = Number(selected) === calculations.weekdayNumber;
    }

    else if (step === 8) {
        correct = Boolean(selected) === isLeapYear(date.year);
    }

    else if (step === 9) {

        const expected =
            `${date.month}/${getDoomsdayDate(date.year, date.month)}`;

        correct = selected === expected;

    }

    else if (step === 10) {

        /*
            Step 10 has its own two-part submission flow.
            This function won't normally handle its first
            part directly.
        */

        return;
    }


    state.tutorial.answered = true;

    document
        .querySelectorAll("#tutorial-answer-area .answer-button")
        .forEach(button => {
            button.disabled = true;
        });

    hide($("tutorial-submit"));


    if (correct) {

        handleTutorialCorrect(step);

    } else {

        handleTutorialIncorrect(step);
    }

}


function handleTutorialCorrect(step) {

    const date =
        state.tutorial.date;

    const calculations =
        getYearCalculations(date.year);

    let result = "";

    if (step === 1) {
        result = calculations.groupsOf12;
        state.tutorial.results[1] = result;
    }

    else if (step === 2) {
        result = calculations.leftover;
        state.tutorial.results[2] = result;
    }

    else if (step === 3) {
        result = calculations.groupsOf4;
        state.tutorial.results[3] = result;
    }

    else if (step === 4) {
        result = calculations.centuryAnchor;
        state.tutorial.results[4] = result;
    }

    else if (step === 5) {
        result = calculations.sum;
    }

    else if (step === 6) {
        result = calculations.weekdayNumber;
    }

    else if (step === 7) {
        result = calculations.weekday;
    }

    else if (step === 8) {
        result = isLeapYear(date.year) ? "Yes" : "No";
    }

    else if (step === 9) {
        result =
            `${date.month}/${getDoomsdayDate(date.year, date.month)}`;
    }


    if (step !== 5 && step !== 10) {

        completeSidebarStep(
            "tutorial-sidebar-steps",
            step,
            result
        );

    }


    $("tutorial-feedback").innerHTML =
        `<span class="correct">Correct!</span>`;

    /*
        Step 5 permanently removes 1–4 before answering,
        so we simply continue with the remaining sidebar.
    */

    if (step === 10) {

        return;
    }

    setTimeout(() => {

        state.tutorial.step++;

        renderTutorialStep();

    }, 700);

}


function handleTutorialIncorrect(step) {

    const date =
        state.tutorial.date;

    const calculations =
        getYearCalculations(date.year);

    let message =
        "Sorry, not quite... Try again!";


    if (step === 5) {

        const r =
            state.tutorial.results;

        message =
            `Sorry, not quite... Your answers were ${r[1]}, ${r[2]}, ${r[3]}, and ${r[4]}; What do these add to?`;

    }


    $("tutorial-feedback").innerHTML =
        `<span class="incorrect">${message}</span>`;

    /*
        Allow another attempt.
    */

    document
        .querySelectorAll("#tutorial-answer-area .answer-button")
        .forEach(button => {
            button.disabled = false;
        });

    show($("tutorial-submit"));
}


/* =========================================================
   TUTORIAL STEP 10
========================================================= */

function renderTutorialStep10Part1() {

    const date =
        state.tutorial.date;

    const calculations =
        getYearCalculations(date.year);

    const doomsdayDay =
        getDoomsdayDate(
            date.year,
            date.month
        );

    const startDate =
        new Date(
            date.year,
            date.month - 1,
            doomsdayDay
        );

    const targetDate =
        new Date(
            date.year,
            date.month - 1,
            date.day
        );

    const difference =
        Math.round(
            (
                targetDate - startDate
            ) / 86400000
        );

    const weeks =
        difference >= 0
            ? Math.floor(difference / 7)
            : Math.ceil(difference / 7);

    const startWeekday =
        calculations.weekdayNumber;

    $("tutorial-question").innerHTML =
        `Every 7 days lands on the same weekday. Starting at our Doomsday date <strong>${MONTHS[date.month - 1]} ${doomsdayDay}</strong>, which was a <strong>${WEEKDAYS[startWeekday]}</strong>, count forward or back by 7 until you're within one week of the target date. How many full weeks can you move?`;

    const answerArea =
        $("tutorial-answer-area");

    answerArea.innerHTML = "";

    /*
        Give the player both positive and negative choices.
    */

    const values = [];

    for (let i = -6; i <= 6; i++) {
        values.push(i);
    }

    createAnswerButtons(
        "tutorial-answer-area",
        values.map(value => ({
            value,
            label: String(value)
        })),
        value => {
            state.tutorial.step10Weeks = value;
            state.tutorial.step10CorrectWeeks = weeks;
        }
    );

    show($("tutorial-submit"));

    $("tutorial-submit").onclick =
        submitTutorialStep10Part1;
}


function submitTutorialStep10Part1() {

    const selected =
        state.tutorial.step10Weeks;

    if (selected === undefined) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }

    const correct =
        selected === state.tutorial.step10CorrectWeeks;

    if (!correct) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

        return;
    }

    $("tutorial-feedback").innerHTML =
        `<span class="correct">Correct!</span>`;

    hide($("tutorial-submit"));

    renderTutorialStep10Part2();
}


function renderTutorialStep10Part2() {

    const date =
        state.tutorial.date;

    const doomsdayDay =
        getDoomsdayDate(
            date.year,
            date.month
        );

    const weeks =
        state.tutorial.step10Weeks;

    const doomsdayDate =
        new Date(
            date.year,
            date.month - 1,
            doomsdayDay
        );

    const calculatedDate =
        new Date(
            doomsdayDate.getTime()
            + weeks * 7 * 86400000
        );

    const targetDate =
        new Date(
            date.year,
            date.month - 1,
            date.day
        );

    const difference =
        Math.round(
            (
                targetDate - calculatedDate
            ) / 86400000
        );

    const direction =
        difference > 0
            ? "ahead of"
            : "behind";

    const amount =
        Math.abs(difference);

    const weeksText =
        weeks === 1 || weeks === -1
            ? "week"
            : "weeks";

    const directionText =
        weeks >= 0
            ? "forward"
            : "backward";

    const calculatedDay =
        calculatedDate.getDate();

    $("tutorial-question").innerHTML =
        `Great, you've moved <strong>${Math.abs(weeks)}</strong> ${weeksText} ${directionText}! You are now at <strong>${MONTHS[calculatedDate.getMonth()]} ${calculatedDay}</strong>, and are <strong>${amount}</strong> ${amount === 1 ? "day" : "days"} ${direction} your target. Which weekday is the target date?`;

    /*
        IMPORTANT:
        Clear the previous answer buttons.
    */

    $("tutorial-answer-area").innerHTML = "";

    createWeekdayAnswers(
        $("tutorial-answer-area"),
        getWeekday(date),
        value => {
            state.tutorial.step10FinalAnswer = value;
        }
    );

    show($("tutorial-submit"));

    $("tutorial-submit").onclick =
        submitTutorialStep10Part2;

    $("tutorial-feedback").innerHTML = "";
}


function submitTutorialStep10Part2() {

    const selected =
        state.tutorial.step10FinalAnswer;

    if (selected === undefined) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }

    const correct =
        selected === getWeekday(
            state.tutorial.date
        );

    if (!correct) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

        return;
    }

    $("tutorial-feedback").innerHTML =
        `<span class="correct">Correct! You solved the date!</span>`;

    hide($("tutorial-submit"));

    /*
        Remove the answer box ONLY after the final
        Tutorial question is answered.
    */

    hide($("tutorial-answer-area"));

    setTimeout(() => {

        $("tutorial-question").innerHTML =
            `<strong>Fantastic!</strong><br><br>You successfully worked through all 10 steps and calculated ${formatDate(state.tutorial.date)}.`;

    }, 300);
}


/* =========================================================
   GUIDED MODE
========================================================= */

function resetGuided() {

    state.guided = {
        date: null,
        selectedAnswer: null,
        answered: false,
        hintsLeft: 3,
        revealedSteps: new Set()
    };

    resetSidebar("guided-sidebar-steps");

    $("guided-feedback").innerHTML = "";
    $("guided-answer-area").innerHTML = "";

    show($("guided-submit"));
}


function startGuided() {

    resetGuided();

    createSidebar(
        "guided-sidebar-steps",
        "guided"
    );

    state.guided.date =
        randomDate(
            GENERAL_MIN_YEAR,
            GENERAL_MAX_YEAR
        );

    setSidebarDate(
        "guided-sidebar-date",
        state.guided.date
    );

    $("guided-hints-left").textContent = 3;

    showScreen("guided-screen");

    renderGuided();
}


function renderGuided() {

    const date =
        state.guided.date;

    $("guided-date-display").textContent =
        formatDate(date);

    $("guided-answer-area").innerHTML = "";

    $("guided-feedback").innerHTML = "";

    show($("guided-submit"));

    createWeekdayAnswers(
        $("guided-answer-area"),
        getWeekday(date),
        value => {
            state.guided.selectedAnswer = value;
        }
    );

    /*
        Set all hint buttons back to available.
    */

    document
        .querySelectorAll("#guided-sidebar-steps .sidebar-step")
        .forEach(step => {

            step.classList.remove(
                "revealed",
                "completed"
            );

            step.classList.add(
                "hint-available"
            );

        });
}


function useGuidedHint(stepNumber) {

    if (state.guided.hintsLeft <= 0) {

        $("guided-feedback").innerHTML =
            `<span class="incorrect">You've used all 3 hints for this problem.</span>`;

        return;
    }

    if (
        state.guided.revealedSteps.has(stepNumber)
    ) {
        return;
    }

    state.guided.revealedSteps.add(stepNumber);

    state.guided.hintsLeft--;

    $("guided-hints-left").textContent =
        state.guided.hintsLeft;

    const date =
        state.guided.date;

    const calculations =
        getYearCalculations(date.year);

    let result = "";

    if (stepNumber === 1) {
        result =
            `Answer: ${calculations.groupsOf12}`;
    }

    else if (stepNumber === 2) {
        result =
            `Answer: ${calculations.leftover}`;
    }

    else if (stepNumber === 3) {
        result =
            `Answer: ${calculations.groupsOf4}`;
    }

    else if (stepNumber === 4) {
        result =
            `Answer: ${calculations.centuryAnchor}`;
    }

    else if (stepNumber === 5) {
        result =
            `Add ${calculations.groupsOf12} + ${calculations.leftover} + ${calculations.groupsOf4} + ${calculations.centuryAnchor}.`;
    }

    else if (stepNumber === 6) {
        result =
            `Keep subtracting 7 from ${calculations.sum}.`;
    }

    else if (stepNumber === 7) {
        result =
            `${calculations.weekdayNumber} = ${calculations.weekday}.`;
    }

    else if (stepNumber === 8) {
        result =
            isLeapYear(date.year)
                ? "Yes, this is a leap year."
                : "No, this is not a leap year.";
    }

    else if (stepNumber === 9) {
        result =
            `The Doomsday date is ${MONTHS[date.month - 1]} ${getDoomsdayDate(date.year, date.month)}.`;
    }

    else if (stepNumber === 10) {
        result =
            `Start at ${MONTHS[date.month - 1]} ${getDoomsdayDate(date.year, date.month)} and move in 7-day increments.`;
    }

    const element =
        document.querySelector(
            `#guided-sidebar-steps .sidebar-step[data-step="${stepNumber}"]`
        );

    if (element) {

        element.classList.remove(
            "hint-available"
        );

        element.classList.add(
            "revealed"
        );

        const resultElement =
            element.querySelector(".sidebar-result");

        if (resultElement) {
            resultElement.textContent = result;
        }

    }

    if (state.guided.hintsLeft === 0) {

        document
            .querySelectorAll("#guided-sidebar-steps .sidebar-step")
            .forEach(step => {
                step.classList.remove(
                    "hint-available"
                );
            });

    }

}


$("guided-submit").addEventListener(
    "click",
    submitGuided
);


function submitGuided() {

    const selected =
        state.guided.selectedAnswer;

    if (selected === null) {

        $("guided-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }

    const correct =
        selected === getWeekday(
            state.guided.date
        );

    if (correct) {

        $("guided-feedback").innerHTML =
            `<span class="correct">Correct!</span>`;

        hide($("guided-submit"));

        setTimeout(() => {

            startGuided();

        }, 900);

    } else {

        $("guided-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

        state.guided.selectedAnswer = null;

        document
            .querySelectorAll("#guided-answer-area .answer-button")
            .forEach(button => {
                button.classList.remove("selected");
            });

    }

}


/* =========================================================
   ENDLESS MODE
========================================================= */

function resetEndless() {

    state.endless = {
        date: null,
        streak: 0,
        selectedAnswer: null,
        answered: false
    };

    $("endless-feedback").innerHTML = "";
    $("endless-answer-area").innerHTML = "";

    $("endless-streak").textContent = "0";

    show($("endless-submit"));
}


function startEndless() {

    resetEndless();

    state.endless.date =
        randomDate(
            GENERAL_MIN_YEAR,
            GENERAL_MAX_YEAR
        );

    showScreen("endless-screen");

    renderEndless();

}


function renderEndless() {

    const date =
        state.endless.date;

    $("endless-date-display").textContent =
        formatDate(date);

    $("endless-answer-area").innerHTML = "";

    $("endless-feedback").innerHTML = "";

    show($("endless-submit"));

    createWeekdayAnswers(
        $("endless-answer-area"),
        getWeekday(date),
        value => {
            state.endless.selectedAnswer = value;
        }
    );

}


$("endless-submit").addEventListener(
    "click",
    submitEndless
);


function submitEndless() {

    const selected =
        state.endless.selectedAnswer;

    if (selected === null) {

        $("endless-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }

    const correct =
        selected === getWeekday(
            state.endless.date
        );

    if (correct) {

        state.endless.streak++;

        $("endless-streak").textContent =
            state.endless.streak;

        $("endless-feedback").innerHTML =
            `<span class="correct">Correct!</span>`;

        setTimeout(() => {

            state.endless.date =
                randomDate(
                    GENERAL_MIN_YEAR,
                    GENERAL_MAX_YEAR
                );

            state.endless.selectedAnswer = null;

            renderEndless();

        }, 500);

    } else {

        $("endless-feedback").innerHTML =
            `<span class="incorrect">Incorrect! Your final streak was ${state.endless.streak}.</span>`;

        hide($("endless-submit"));

        document
            .querySelectorAll("#endless-answer-area .answer-button")
            .forEach(button => {
                button.disabled = true;
            });

    }

}


/* =========================================================
   QUIZ MODE
========================================================= */

function resetQuiz() {

    state.quiz = {
        total: 10,
        current: 0,
        correct: 0,
        date: null,
        selectedAnswer: null,
        answered: false
    };

    show($("quiz-setup"));

    hide($("quiz-question-box"));
    hide($("quiz-results"));

    $("quiz-feedback").innerHTML = "";

    $("quiz-slider").value = 10;
    $("quiz-question-count").textContent = "10";
}


function startQuizSetup() {

    resetQuiz();

    state.currentMode = "quiz";

    showScreen("quiz-screen");

}


$("quiz-slider").addEventListener(
    "input",
    () => {

        $("quiz-question-count").textContent =
            $("quiz-slider").value;

    }
);


$("quiz-start").addEventListener(
    "click",
    () => {

        state.quiz.total =
            Number($("quiz-slider").value);

        state.quiz.current = 0;
        state.quiz.correct = 0;

        hide($("quiz-setup"));
        hide($("quiz-results"));

        show($("quiz-question-box"));

        nextQuizQuestion();

    }
);


function nextQuizQuestion() {

    if (
        state.quiz.current >=
        state.quiz.total
    ) {

        finishQuiz();

        return;
    }

    state.quiz.current++;

    state.quiz.date =
        randomDate(
            GENERAL_MIN_YEAR,
            GENERAL_MAX_YEAR
        );

    state.quiz.selectedAnswer = null;

    $("quiz-progress").textContent =
        `Question ${state.quiz.current} of ${state.quiz.total}`;

    $("quiz-date-display").textContent =
        formatDate(state.quiz.date);

    $("quiz-answer-area").innerHTML = "";

    $("quiz-feedback").innerHTML = "";

    show($("quiz-submit"));

    createWeekdayAnswers(
        $("quiz-answer-area"),
        getWeekday(state.quiz.date),
        value => {
            state.quiz.selectedAnswer = value;
        }
    );

}


$("quiz-submit").addEventListener(
    "click",
    submitQuizAnswer
);


function submitQuizAnswer() {

    const selected =
        state.quiz.selectedAnswer;

    if (selected === null) {

        $("quiz-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }

    const correct =
        selected === getWeekday(
            state.quiz.date
        );

    if (correct) {
        state.quiz.correct++;
    }

    /*
        Do not show the score during the quiz.
    */

    hide($("quiz-submit"));

    setTimeout(() => {

        nextQuizQuestion();

    }, 250);

}


function getQuizGrade(percent) {

    if (percent >= 97) return "A+";
    if (percent >= 93) return "A";
    if (percent >= 90) return "A-";

    if (percent >= 87) return "B+";
    if (percent >= 83) return "B";
    if (percent >= 80) return "B-";

    if (percent >= 77) return "C+";
    if (percent >= 73) return "C";
    if (percent >= 70) return "C-";

    if (percent >= 67) return "D+";
    if (percent >= 63) return "D";
    if (percent >= 60) return "D-";

    return "F";
}


const QUIZ_MESSAGES = {

    "A+": "You should be teaching me!",
    "A": "You're absolutely locked in!",
    "A-": "You aced it!",

    "B+": "Let's go! Almost an A!",
    "B": "Great job!",
    "B-": "Not bad! Keep at it!",

    "C+": "That's pretty good!",
    "C": "C's get degrees!",
    "C-": "You've got the hang of it.",

    "D+": "I smell a crazy glow-up.",
    "D": "There's room for improvement.",
    "D-": "You barely passed, but a win's a win.",

    "F": "It's only failure if you don't try again."

};


function gradeClass(grade) {

    return "grade-" +
        grade
            .toLowerCase()
            .replace("+", "-plus")
            .replace("-", "-minus");
}


function finishQuiz() {

    hide($("quiz-question-box"));
    hide($("quiz-setup"));

    show($("quiz-results"));

    const percent =
        (
            state.quiz.correct /
            state.quiz.total
        ) * 100;

    const grade =
        getQuizGrade(percent);

    const gradeElement =
        $("quiz-grade");

    gradeElement.textContent =
        grade;

    gradeElement.className =
        gradeClass(grade);

    $("quiz-score").textContent =
        `You got ${state.quiz.correct} out of ${state.quiz.total} correct`;

    $("quiz-message").textContent =
        `"${QUIZ_MESSAGES[grade]}"`;

}


$("quiz-again").addEventListener(
    "click",
    () => {

        transitionTo(() => {
            startQuizSetup();
        });

    }
);


/* =========================================================
   PRACTICE MODE
========================================================= */

function resetPractice() {

    state.practice = {
        category: null,
        question: null,
        answered: false
    };

    hide($("practice-question-box"));

    show($("practice-category-menu"));

    hide($("practice-back-category"));

    $("practice-input").value = "";

    $("practice-feedback").innerHTML = "";

    hide($("practice-next"));
}


function startPracticeMenu() {

    resetPractice();

    state.currentMode = "practice";

    showScreen("practice-screen");

}


document
    .querySelectorAll(".practice-category")
    .forEach(button => {

        button.addEventListener("click", () => {

            state.practice.category =
                button.dataset.category;

            hide($("practice-category-menu"));
            show($("practice-question-box"));
            show($("practice-back-category"));

            nextPracticeQuestion();

        });

    });


function nextPracticeQuestion() {

    state.practice.answered = false;

    $("practice-input").value = "";

    $("practice-feedback").innerHTML = "";

    hide($("practice-next"));

    show($("practice-submit"));

    state.practice.question =
        generatePracticeQuestion(
            state.practice.category
        );

    $("practice-question").innerHTML =
        state.practice.question.text;

}


function generatePracticeQuestion(category) {

    /* ---------------------------------------------
       WEEKDAY NUMBERS
    --------------------------------------------- */

    if (category === "weekday") {

        const weekday =
            randomInteger(0, 6);

        return {
            text:
                `What weekday number corresponds to <strong>${WEEKDAYS[weekday]}</strong>?`,
            answer: String(weekday)
        };

    }


    /* ---------------------------------------------
       DOOMSDAY DATES
    --------------------------------------------- */

    if (category === "doomsday") {

        const month =
            randomInteger(1, 12);

        const dates =
            DOOMSDAY_DATES[month];

        const day =
            dates[randomInteger(0, dates.length - 1)];

        return {
            text:
                `What is a Doomsday date for <strong>${MONTHS[month - 1]}</strong>?`,
            answer:
                `${month}/${day}`,
            alternatives:
                dates.map(
                    d => `${month}/${d}`
                )
        };

    }


    /* ---------------------------------------------
       CENTURY ANCHORS
    --------------------------------------------- */

    if (category === "century") {

        const century =
            randomInteger(16, 24);

        const year =
            century * 100;

        const weekday =
            getCenturyAnchor(year);

        return {
            text:
                `What is the century anchor for the <strong>${century}00s</strong>? Give the weekday number.`,
            answer:
                String(weekday)
        };

    }


    /* ---------------------------------------------
       ALGORITHM STEPS
    --------------------------------------------- */

    if (category === "algorithm") {

        const date =
            randomDate(
                GENERAL_MIN_YEAR,
                GENERAL_MAX_YEAR
            );

        const calculations =
            getYearCalculations(date.year);

        const questionType =
            randomInteger(1, 6);

        if (questionType === 1) {

            return {
                text:
                    `For the year <strong>${date.year}</strong>, how many groups of 12 can you make from the last two digits?`,
                answer:
                    String(calculations.groupsOf12)
            };

        }

        if (questionType === 2) {

            return {
                text:
                    `For the year <strong>${date.year}</strong>, what's left over after taking 12 away until you can't anymore?`,
                answer:
                    String(calculations.leftover)
            };

        }

        if (questionType === 3) {

            return {
                text:
                    `For the year <strong>${date.year}</strong>, how many groups of 4 can you make from the leftover?`,
                answer:
                    String(calculations.groupsOf4)
            };

        }

        if (questionType === 4) {

            return {
                text:
                    `What is the century anchor for the <strong>${Math.floor(date.year / 100)}00s</strong>? Give the weekday number.`,
                answer:
                    String(calculations.centuryAnchor)
            };

        }

        if (questionType === 5) {

            return {
                text:
                    `For the year <strong>${date.year}</strong>, what is the sum of the four main results?`,
                answer:
                    String(calculations.sum)
            };

        }

        return {
            text:
                `What is the Doomsday weekday number for <strong>${date.year}</strong>?`,
            answer:
                String(calculations.weekdayNumber)
        };

    }


    return {
        text: "Question",
        answer: ""
    };
}


$("practice-submit").addEventListener(
    "click",
    submitPractice
);


function submitPractice() {

    if (state.practice.answered) {
        return;
    }

    const input =
        $("practice-input")
            .value
            .trim()
            .toLowerCase();

    const question =
        state.practice.question;

    let correct = false;

    if (
        question.alternatives &&
        question.alternatives.includes(input)
    ) {
        correct = true;
    }

    else {

        correct =
            input ===
            String(question.answer)
                .trim()
                .toLowerCase();

    }

    state.practice.answered = true;

    if (correct) {

        $("practice-feedback").innerHTML =
            `<span class="correct">Correct!</span>`;

    } else {

        $("practice-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... The answer was <strong>${question.answer}</strong>.</span>`;

    }

    hide($("practice-submit"));
    show($("practice-next"));

}


$("practice-next").addEventListener(
    "click",
    nextPracticeQuestion
);


$("practice-back-category").addEventListener(
    "click",
    () => {

        resetPractice();

    }
);


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

/*
    Tutorial
*/

$("tutorial-restart").addEventListener(
    "click",
    () => {

        transitionTo(() => {
            startTutorial();
        });

    }
);

$("tutorial-home").addEventListener(
    "click",
    goHome
);


/*
    Guided
*/

$("guided-restart").addEventListener(
    "click",
    () => {

        transitionTo(() => {
            startGuided();
        });

    }
);

$("guided-home").addEventListener(
    "click",
    goHome
);


/*
    Endless
*/

$("endless-restart").addEventListener(
    "click",
    () => {

        transitionTo(() => {
            startEndless();
        });

    }
);

$("endless-home").addEventListener(
    "click",
    goHome
);


/*
    Quiz
*/

$("quiz-home").addEventListener(
    "click",
    goHome
);


/*
    Practice
*/

$("practice-home").addEventListener(
    "click",
    goHome
);


/* =========================================================
   GENERAL UTILITIES
========================================================= */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }

    return array;
}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

$("practice-input").addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            if (
                state.practice.answered
            ) {
                nextPracticeQuestion();
            } else {
                submitPractice();
            }

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

hideAllScreens();

showScreen("home-screen");

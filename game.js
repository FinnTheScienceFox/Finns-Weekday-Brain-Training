/* =========================================================
   FINN'S WEEKDAY BRAIN TRAINING
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


/*
   Standard Doomsday dates.

   January and February have two possible dates because
   leap years use January 4 and February 29.
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

   1800 = Friday = 5
   1900 = Wednesday = 3
   2000 = Tuesday = 2
   2100 = Sunday = 0

   The pattern repeats every 400 years.
*/
const CENTURY_ANCHORS = {
    0: 2,
    1: 0,
    2: 5,
    3: 3
};


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentScreen = "home";

let tutorialDate = null;
let tutorialStep = 1;
let tutorialAnswers = {};
let tutorialSelectedAnswer = null;
let tutorialStep10Part = 1;
let tutorialStep10WeekMove = null;

let endlessDate = null;
let endlessStreak = 0;
let endlessSelectedAnswer = null;

let quizDate = null;
let quizTotalQuestions = 0;
let quizCurrentQuestion = 0;
let quizCorrect = 0;
let quizSelectedAnswer = null;

let guidedDate = null;
let guidedSelectedAnswer = null;
let guidedHints = 3;


/* =========================================================
   GENERAL HELPERS
========================================================= */

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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


function formatDate(date) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}


function generateRandomDate() {
    const year = randomInteger(1800, 2199);
    const month = randomInteger(0, 11);

    const maxDay = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const day = randomInteger(1, maxDay);

    return new Date(year, month, day);
}


function getWeekdayNumber(date) {
    return date.getDay();
}


/* =========================================================
   DOOMSDAY CALCULATIONS
========================================================= */


/*
   Step 1:
   Number of groups of 12 in the last two digits.
*/
function calculateStep1(year) {
    const lastTwo = year % 100;

    return Math.floor(lastTwo / 12);
}


/*
   Step 2:
   Subtract 12 until we cannot anymore.
*/
function calculateStep2(year) {
    const lastTwo = year % 100;

    return lastTwo % 12;
}


/*
   Step 3:
   Number of groups of 4 in Step 2.
*/
function calculateStep3(year) {
    const step2 = calculateStep2(year);

    return Math.floor(step2 / 4);
}


/*
   Step 4:
   Century anchor NUMBER.

   1800 = 5
   1900 = 3
   2000 = 2
   2100 = 0

   This intentionally returns a number rather than
   "Monday", "Tuesday", etc.
*/
function calculateCenturyAnchor(year) {
    const century = Math.floor(year / 100);
    const cyclePosition = ((century % 4) + 4) % 4;

    return CENTURY_ANCHORS[cyclePosition];
}


/*
   Step 5:
   Add Steps 1-4.
*/
function calculateStep5(year) {
    return (
        calculateStep1(year) +
        calculateStep2(year) +
        calculateStep3(year) +
        calculateCenturyAnchor(year)
    );
}


/*
   Step 6:
   Reduce the sum by 7 until below 7.
*/
function calculateStep6(year) {
    return calculateStep5(year) % 7;
}


/*
   Step 7:
   The result is the weekday number of the year's Doomsday.
*/
function calculateYearDoomsday(year) {
    return calculateStep6(year);
}


/* =========================================================
   LEAP YEAR / DOOMSDAY HELPERS
========================================================= */

function getDoomsdayDayForMonth(year, month) {

    const leap = isLeapYear(year);

    if (month === 1) {
        return leap ? 4 : 3;
    }

    if (month === 2) {
        return leap ? 29 : 28;
    }

    return DOOMSDAY_DATES[month][0];
}


function getDoomsdayDateForTarget(date) {

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return getDoomsdayDayForMonth(year, month);
}


function getDateFromDoomsday(year, month, day) {
    return new Date(year, month - 1, day);
}


/* =========================================================
   HOME / SCREEN MANAGEMENT
========================================================= */

const screens = [
    "home-screen",
    "tutorial-screen",
    "endless-screen",
    "quiz-screen",
    "guided-screen",
    "flashcards-screen"
];


function showScreen(screenId) {

    screens.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });


    const target = document.getElementById(screenId);

    if (target) {
        target.classList.remove("hidden");
    }


    currentScreen = screenId;
}


function goHome() {

    resetTutorialSidebar();
    resetTutorialState();

    endlessSelectedAnswer = null;

    quizSelectedAnswer = null;

    guidedSelectedAnswer = null;

    showScreen("home-screen");

    document.getElementById("home-message").textContent = "";
}


/* =========================================================
   MODE BUTTONS
========================================================= */

document.querySelectorAll(".mode-button").forEach(button => {

    button.addEventListener("click", () => {

        const mode = button.dataset.mode;

        if (mode === "tutorial") {
            startTutorial();
        }

        else if (mode === "endless") {
            startEndless();
        }

        else if (mode === "quiz") {
            startQuizSetup();
        }

        else if (mode === "guided") {
            startGuided();
        }

        else if (mode === "flashcards") {
            startFlashcards();
        }

    });

});


/* =========================================================
   TUTORIAL
========================================================= */

function resetTutorialState() {

    tutorialDate = null;
    tutorialStep = 1;
    tutorialAnswers = {};
    tutorialSelectedAnswer = null;
    tutorialStep10Part = 1;
    tutorialStep10WeekMove = null;
}


function resetTutorialSidebar() {

    const sidebarDate = document.getElementById("sidebar-date");

    if (sidebarDate) {
        sidebarDate.textContent = "Date";
    }


    for (let i = 1; i <= 10; i++) {

        const step = document.getElementById(`sidebar-step-${i}`);

        if (!step) {
            continue;
        }

        step.classList.remove(
            "active",
            "completed",
            "revealed"
        );


        const result = step.querySelector(".sidebar-result");

        if (result) {
            result.textContent = "";
        }

    }
}


function startTutorial() {

    resetTutorialState();

    resetTutorialSidebar();

    tutorialDate = generateRandomDate();

    showScreen("tutorial-screen");

    initializeTutorial();
}


function initializeTutorial() {

    resetTutorialSidebar();

    const sidebarDate = document.getElementById("sidebar-date");

    sidebarDate.textContent = formatDate(tutorialDate);

    updateTutorialStep();
}


/* =========================================================
   TUTORIAL SIDEBAR
========================================================= */

function updateTutorialSidebar() {

    for (let i = 1; i <= 10; i++) {

        const stepElement =
            document.getElementById(`sidebar-step-${i}`);

        if (!stepElement) {
            continue;
        }

        stepElement.classList.remove(
            "active",
            "completed"
        );


        if (i === tutorialStep) {
            stepElement.classList.add("active");
        }


        if (
            tutorialAnswers[i] !== undefined &&
            i !== 5
        ) {
            stepElement.classList.add("completed");
        }


        if (tutorialAnswers[i] !== undefined) {

            const result =
                stepElement.querySelector(".sidebar-result");

            if (result) {
                result.textContent =
                    tutorialAnswers[i];
            }

        }

    }
}


/* =========================================================
   TUTORIAL DISPLAY
========================================================= */

function updateTutorialStep() {

    tutorialSelectedAnswer = null;

    tutorialStep10Part = 1;

    tutorialStep10WeekMove = null;


    const submitButton =
        document.getElementById("submit-button");

    const continueButton =
        document.getElementById("continue-button");

    submitButton.classList.add("hidden");
    continueButton.classList.add("hidden");


    document.getElementById("date-display").textContent =
        formatDate(tutorialDate);


    document.getElementById("feedback").textContent = "";


    const answerArea =
        document.getElementById("answer-area");

    answerArea.innerHTML = "";


    updateTutorialSidebar();


    if (tutorialStep === 1) {
        renderTutorialStep1();
    }

    else if (tutorialStep === 2) {
        renderTutorialStep2();
    }

    else if (tutorialStep === 3) {
        renderTutorialStep3();
    }

    else if (tutorialStep === 4) {
        renderTutorialStep4();
    }

    else if (tutorialStep === 5) {
        renderTutorialStep5();
    }

    else if (tutorialStep === 6) {
        renderTutorialStep6();
    }

    else if (tutorialStep === 7) {
        renderTutorialStep7();
    }

    else if (tutorialStep === 8) {
        renderTutorialStep8();
    }

    else if (tutorialStep === 9) {
        renderTutorialStep9();
    }

    else if (tutorialStep === 10) {
        renderTutorialStep10();
    }
}


/* =========================================================
   GENERIC ANSWER BUTTON CREATOR
========================================================= */

function createAnswerButton(
    text,
    value,
    onSelect
) {

    const button = document.createElement("button");

    button.className = "answer-button";

    button.textContent = text;

    button.dataset.value = value;


    button.addEventListener("click", () => {

        const siblings =
            button.parentElement.querySelectorAll(
                ".answer-button"
            );

        siblings.forEach(other => {
            other.classList.remove("selected");
        });


        button.classList.add("selected");

        onSelect(value);

    });


    return button;
}


/* =========================================================
   TUTORIAL STEP 1
========================================================= */

function renderTutorialStep1() {

    document.getElementById("step-counter").textContent =
        "Step 1 of 10";

    document.getElementById("step-title").textContent =
        "Groups of 12";


    const lastTwo =
        String(tutorialDate.getFullYear() % 100)
            .padStart(2, "0");


    document.getElementById("question").textContent =
        `The last two digits of the year are ${lastTwo}. How many groups of 12 can we make out of ${lastTwo}? (Remember this answer!)`;


    const correct =
        calculateStep1(tutorialDate.getFullYear());


    renderNumberChoices(
        correct,
        0,
        8,
        value => {
            tutorialSelectedAnswer = Number(value);
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 2
========================================================= */

function renderTutorialStep2() {

    document.getElementById("step-counter").textContent =
        "Step 2 of 10";

    document.getElementById("step-title").textContent =
        "What's Left Over?";


    const lastTwo =
        String(tutorialDate.getFullYear() % 100)
            .padStart(2, "0");


    document.getElementById("question").textContent =
        `For the last two digits, ${lastTwo}, take 12 away until you can't anymore. What's left over? (Remember this answer!)`;


    const correct =
        calculateStep2(tutorialDate.getFullYear());


    renderNumberChoices(
        correct,
        0,
        11,
        value => {
            tutorialSelectedAnswer = Number(value);
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 3
========================================================= */

function renderTutorialStep3() {

    document.getElementById("step-counter").textContent =
        "Step 3 of 10";

    document.getElementById("step-title").textContent =
        "Groups of 4";


    const previous =
        calculateStep2(tutorialDate.getFullYear());


    document.getElementById("question").textContent =
        `Take the answer from the last step, ${previous}. How many groups of 4 can we make out of ${previous}? (Remember this answer!)`;


    const correct =
        calculateStep3(tutorialDate.getFullYear());


    renderNumberChoices(
        correct,
        0,
        5,
        value => {
            tutorialSelectedAnswer = Number(value);
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 4
========================================================= */

function renderTutorialStep4() {

    document.getElementById("step-counter").textContent =
        "Step 4 of 10";

    document.getElementById("step-title").textContent =
        "Century Anchor";


    const century =
        Math.floor(tutorialDate.getFullYear() / 100);


    document.getElementById("question").textContent =
        `The first two digits of the year are ${century}. Remember the repeating pattern for century anchors: 18 = Friday (5). 19 = Wednesday (3). 20 = Tuesday (2). 21 = Sunday (0). Using the cycle above, what is the century anchor? (Remember this answer!)`;


    const correct =
        calculateCenturyAnchor(
            tutorialDate.getFullYear()
        );


    renderNumberChoices(
        correct,
        0,
        6,
        value => {
            tutorialSelectedAnswer = Number(value);
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 5
========================================================= */

function renderTutorialStep5() {

    document.getElementById("step-counter").textContent =
        "Step 5 of 10";

    document.getElementById("step-title").textContent =
        "Add Them Up";


    /*
       IMPORTANT:
       Steps 1-4 are hidden from the sidebar BEFORE
       the player answers Step 5.
    */
    for (let i = 1; i <= 4; i++) {

        const step =
            document.getElementById(`sidebar-step-${i}`);

        if (step) {
            step.classList.remove(
                "active",
                "completed"
            );

            step.classList.add("revealed");

            step.innerHTML = `
                <strong>${i}.</strong>
                Remembered
            `;
        }

    }


    document.getElementById("question").textContent =
        "Hopefully you've memorized your answers so far! Add these results together... What's the result?";


    const correct =
        calculateStep5(tutorialDate.getFullYear());


    renderNumberChoices(
        correct,
        0,
        30,
        value => {
            tutorialSelectedAnswer = Number(value);
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 6
========================================================= */

function renderTutorialStep6() {

    document.getElementById("step-counter").textContent =
        "Step 6 of 10";

    document.getElementById("step-title").textContent =
        "Reduce by 7";


    const previous =
        calculateStep5(tutorialDate.getFullYear());


    document.getElementById("question").textContent =
        `For last question's sum, ${previous}, take 7 away until you can't anymore. What's left over?`;


    const correct =
        calculateStep6(tutorialDate.getFullYear());


    renderNumberChoices(
        correct,
        0,
        6,
        value => {
            tutorialSelectedAnswer = Number(value);
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 7
========================================================= */

function renderTutorialStep7() {

    document.getElementById("step-counter").textContent =
        "Step 7 of 10";

    document.getElementById("step-title").textContent =
        "What's the Doomsday Weekday?";


    const leftover =
        calculateStep6(tutorialDate.getFullYear());


    document.getElementById("question").textContent =
        `This leftover number, ${leftover}, is the weekday of ${tutorialDate.getFullYear()}'s Doomsday dates! Remember the mnemonic for numbered weekdays: 0 = "NONEday" (Sunday), 1 = "ONEday" (Monday), 2 = "TWOsday" (Tuesday), 3 = THREE syllables (Wednesday), 4 = "FOURsday" (Thursday), 5 = "FIVEday" (Friday), 6 = "SIXurday" (Saturday). Using the mnemonic above, what weekday does this number represent?`;


    const correct =
        WEEKDAYS[leftover];


    renderWeekdayChoices(
        correct,
        value => {
            tutorialSelectedAnswer = value;
            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 8
========================================================= */

function renderTutorialStep8() {

    document.getElementById("step-counter").textContent =
        "Step 8 of 10";

    document.getElementById("step-title").textContent =
        "Is It a Leap Year?";


    const year =
        tutorialDate.getFullYear();

    const lastTwo =
        String(year % 100)
            .padStart(2, "0");


    document.getElementById("question").textContent =
        `Each month has a Doomsday date: 1/3-4, 2/28-29, 3/14, 4/4, 5/9, 6/6, 7/11, 8/8, 9/5, 10/10, 11/7, and 12/12 for each month. This year, take the last two digits, ${lastTwo}. Can we make groups of 4 with NO leftovers?`;


    const correct =
        isLeapYear(year);


    renderTextChoices(
        [
            {
                label: "Yes, it's a leap year",
                value: true
            },
            {
                label: "No, it's not a leap year",
                value: false
            }
        ],
        value => {
            tutorialSelectedAnswer =
                value === "true";

            showTutorialSubmit();
        }
    );
}


/* =========================================================
   TUTORIAL STEP 9
========================================================= */

function renderTutorialStep9() {

    document.getElementById("step-counter").textContent =
        "Step 9 of 10";

    document.getElementById("step-title").textContent =
        "Find the Month's Doomsday";


    const year =
        tutorialDate.getFullYear();

    const month =
        tutorialDate.getMonth() + 1;

    const leap =
        isLeapYear(year);


    const firstOrSecond =
        leap ? "second" : "first";


    const isOrIsNot =
        leap ? "is" : "is not";


    document.getElementById("question").textContent =
        `Each month has a Doomsday date: 1/3-4, 2/28-29, 3/14, 4/4, 5/9, 6/6, 7/11, 8/8, 9/5, 10/10, 11/7, and 12/12 for each month. This year ${isOrIsNot} a leap year, which means the ${firstOrSecond} number for January and February are their Doomsday dates. What is the Doomsday date for ${MONTHS[month - 1]}?`;


    const correctDay =
        getDoomsdayDayForMonth(year, month);


    /*
       Generate ALL possible Doomsday dates as valid
       answer options.

       January:
       1/3
       1/4

       February:
       2/28
       2/29

       Other months:
       their standard date.
    */
    const options = [];

    for (let m = 1; m <= 12; m++) {

        const dates =
            DOOMSDAY_DATES[m];

        dates.forEach(day => {

            options.push({
                label: `${MONTHS[m - 1]} ${day}`,
                value: `${m}-${day}`
            });

        });

    }


    renderTextChoices(
        options,
        value => {
            tutorialSelectedAnswer = value;
            showTutorialSubmit();
        }
    );


    /*
       Store the correct value separately.
    */
    tutorialAnswers._step9Correct =
        `${month}-${correctDay}`;
}


/* =========================================================
   TUTORIAL STEP 10
========================================================= */

function renderTutorialStep10() {

    if (tutorialStep10Part === 1) {
        renderTutorialStep10Part1();
    }
    else {
        renderTutorialStep10Part2();
    }
}


/* ---------------------------------------------------------
   STEP 10 PART 1
--------------------------------------------------------- */

function renderTutorialStep10Part1() {

    document.getElementById("step-counter").textContent =
        "Step 10 of 10";

    document.getElementById("step-title").textContent =
        "Move by Full Weeks";


    const year =
        tutorialDate.getFullYear();

    const month =
        tutorialDate.getMonth() + 1;

    const targetDay =
        tutorialDate.getDate();

    const doomsdayDay =
        getDoomsdayDayForMonth(year, month);

    const doomsdayDate =
        getDateFromDoomsday(
            year,
            month,
            doomsdayDay
        );


    const weekday =
        WEEKDAYS[calculateYearDoomsday(year)];


    document.getElementById("question").textContent =
        `Every 7 days lands on the same weekday. Starting at our Doomsday date ${MONTHS[month - 1]} ${doomsdayDay}, which was a ${weekday}, count forward or back by 7 until you're within one week of the target date. How many full weeks can you move?`;


    /*
       Calculate the number of whole weeks between the
       Doomsday date and target.

       Negative = move backward.
       Positive = move forward.
    */
    const difference =
        Math.floor(
            (tutorialDate - doomsdayDate) /
            (1000 * 60 * 60 * 24)
        );

    const fullWeeks =
        difference >= 0
            ? Math.floor(difference / 7)
            : Math.ceil(difference / 7);


    tutorialStep10WeekMove = fullWeeks;


    /*
       Give a range of possible negative and positive
       answers so backwards movement is represented.
    */
    const min =
        Math.min(-5, fullWeeks - 4);

    const max =
        Math.max(5, fullWeeks + 4);


    renderNumberChoices(
        fullWeeks,
        min,
        max,
        value => {

            tutorialSelectedAnswer =
                Number(value);

            showTutorialSubmit();

        }
    );
}


/* ---------------------------------------------------------
   STEP 10 PART 2
--------------------------------------------------------- */

function renderTutorialStep10Part2() {

    const year =
        tutorialDate.getFullYear();

    const month =
        tutorialDate.getMonth() + 1;

    const targetDay =
        tutorialDate.getDate();

    const doomsdayDay =
        getDoomsdayDayForMonth(year, month);


    const calculatedDate =
        new Date(
            year,
            month - 1,
            doomsdayDay +
            tutorialStep10WeekMove * 7
        );


    const difference =
        Math.round(
            (
                tutorialDate -
                calculatedDate
            ) /
            (1000 * 60 * 60 * 24)
        );


    const direction =
        difference >= 0
            ? "ahead of"
            : "behind";


    const absoluteDifference =
        Math.abs(difference);


    document.getElementById("step-counter").textContent =
        "Step 10 of 10 — Part 2";


    document.getElementById("step-title").textContent =
        "Find the Final Weekday";


    document.getElementById("question").textContent =
        `Great, you've moved ${Math.abs(tutorialStep10WeekMove)} ${Math.abs(tutorialStep10WeekMove) === 1 ? "week" : "weeks"} ${tutorialStep10WeekMove >= 0 ? "forward" : "backward"}! You are now at ${MONTHS[month - 1]} ${calculatedDate.getDate()}, and you are ${absoluteDifference} ${absoluteDifference === 1 ? "day" : "days"} ${direction} your target. Which weekday is the target date?`;


    const correct =
        WEEKDAYS[tutorialDate.getDay()];


    renderWeekdayChoices(
        correct,
        value => {

            tutorialSelectedAnswer =
                value;

            showTutorialSubmit();

        }
    );
}


/* =========================================================
   NUMBER CHOICES
========================================================= */

function renderNumberChoices(
    correct,
    min,
    max,
    onSelect
) {

    const answerArea =
        document.getElementById("answer-area");

    answerArea.innerHTML = "";


    for (let number = min; number <= max; number++) {

        const button =
            createAnswerButton(
                number,
                number,
                onSelect
            );

        answerArea.appendChild(button);
    }
}


/* =========================================================
   TEXT CHOICES
========================================================= */

function renderTextChoices(
    choices,
    onSelect
) {

    const answerArea =
        document.getElementById("answer-area");

    answerArea.innerHTML = "";


    choices.forEach(choice => {

        const button =
            createAnswerButton(
                choice.label,
                choice.value,
                onSelect
            );

        answerArea.appendChild(button);

    });
}


/* =========================================================
   WEEKDAY CHOICES
========================================================= */

function renderWeekdayChoices(
    correct,
    onSelect
) {

    renderTextChoices(
        WEEKDAYS.map(day => ({
            label: day,
            value: day
        })),
        onSelect
    );
}


/* =========================================================
   SHOW SUBMIT
========================================================= */

function showTutorialSubmit() {

    document
        .getElementById("submit-button")
        .classList.remove("hidden");
}


/* =========================================================
   TUTORIAL SUBMIT
========================================================= */

document
    .getElementById("submit-button")
    .addEventListener("click", submitTutorialAnswer);


function submitTutorialAnswer() {

    if (tutorialSelectedAnswer === null) {
        return;
    }


    let correct = false;

    let correctAnswer;


    /*
       Determine the correct answer for the current step.
    */

    if (tutorialStep === 1) {

        correctAnswer =
            calculateStep1(
                tutorialDate.getFullYear()
            );

        correct =
            Number(tutorialSelectedAnswer) ===
            correctAnswer;
    }


    else if (tutorialStep === 2) {

        correctAnswer =
            calculateStep2(
                tutorialDate.getFullYear()
            );

        correct =
            Number(tutorialSelectedAnswer) ===
            correctAnswer;
    }


    else if (tutorialStep === 3) {

        correctAnswer =
            calculateStep3(
                tutorialDate.getFullYear()
            );

        correct =
            Number(tutorialSelectedAnswer) ===
            correctAnswer;
    }


    else if (tutorialStep === 4) {

        correctAnswer =
            calculateCenturyAnchor(
                tutorialDate.getFullYear()
            );

        correct =
            Number(tutorialSelectedAnswer) ===
            correctAnswer;
    }


    else if (tutorialStep === 5) {

        correctAnswer =
            calculateStep5(
                tutorialDate.getFullYear()
            );

        correct =
            Number(tutorialSelectedAnswer) ===
            correctAnswer;
    }


    else if (tutorialStep === 6) {

        correctAnswer =
            calculateStep6(
                tutorialDate.getFullYear()
            );

        correct =
            Number(tutorialSelectedAnswer) ===
            correctAnswer;
    }


    else if (tutorialStep === 7) {

        correctAnswer =
            WEEKDAYS[
                calculateYearDoomsday(
                    tutorialDate.getFullYear()
                )
            ];

        correct =
            tutorialSelectedAnswer ===
            correctAnswer;
    }


    else if (tutorialStep === 8) {

        correctAnswer =
            isLeapYear(
                tutorialDate.getFullYear()
            );

        correct =
            tutorialSelectedAnswer ===
            correctAnswer;
    }


    else if (tutorialStep === 9) {

        correctAnswer =
            tutorialAnswers._step9Correct;

        correct =
            tutorialSelectedAnswer ===
            correctAnswer;
    }


    else if (tutorialStep === 10) {

        if (tutorialStep10Part === 1) {

            correctAnswer =
                tutorialStep10WeekMove;

            correct =
                Number(tutorialSelectedAnswer) ===
                correctAnswer;

        }

        else {

            correctAnswer =
                WEEKDAYS[
                    tutorialDate.getDay()
                ];

            correct =
                tutorialSelectedAnswer ===
                correctAnswer;
        }

    }


    if (correct) {

        handleTutorialCorrect(
            correctAnswer
        );

    }

    else {

        handleTutorialIncorrect(
            correctAnswer
        );

    }
}


/* =========================================================
   TUTORIAL CORRECT
========================================================= */

function handleTutorialCorrect(correctAnswer) {

    const feedback =
        document.getElementById("feedback");

    feedback.className = "correct";

    feedback.textContent =
        "Correct!";


    /*
       STEP 5 is special because Steps 1-4 are intentionally
       removed from the sidebar before the question is answered.
    */
    if (tutorialStep !== 5) {

        tutorialAnswers[tutorialStep] =
            correctAnswer;

    }


    if (tutorialStep === 10) {

        if (tutorialStep10Part === 1) {

            tutorialStep10Part = 2;

            tutorialSelectedAnswer = null;

            document
                .getElementById("submit-button")
                .classList.add("hidden");

            document
                .getElementById("answer-area")
                .innerHTML = "";

            renderTutorialStep10Part2();

            return;
        }


        /*
           Tutorial complete.
        */

        document
            .getElementById("submit-button")
            .classList.add("hidden");

        document
            .getElementById("continue-button")
            .classList.remove("hidden");

        document.getElementById("continue-button")
            .textContent = "Finish";

        return;
    }


    /*
       Step 5 has been completed.
    */
    if (tutorialStep === 5) {

        tutorialAnswers[5] =
            correctAnswer;

    }


    updateTutorialSidebar();


    document
        .getElementById("submit-button")
        .classList.add("hidden");


    document
        .getElementById("continue-button")
        .classList.remove("hidden");
}


/* =========================================================
   TUTORIAL INCORRECT
========================================================= */

function handleTutorialIncorrect(correctAnswer) {

    const feedback =
        document.getElementById("feedback");

    feedback.className = "incorrect";


    if (tutorialStep === 5) {

        const a1 =
            calculateStep1(
                tutorialDate.getFullYear()
            );

        const a2 =
            calculateStep2(
                tutorialDate.getFullYear()
            );

        const a3 =
            calculateStep3(
                tutorialDate.getFullYear()
            );

        const a4 =
            calculateCenturyAnchor(
                tutorialDate.getFullYear()
            );


        feedback.textContent =
            `Sorry, not quite... Your answers were ${a1}, ${a2}, ${a3}, and ${a4}; What do these add to?`;

    }

    else {

        feedback.textContent =
            "Sorry, not quite... Try again!";

    }

}


/* =========================================================
   TUTORIAL CONTINUE
========================================================= */

document
    .getElementById("continue-button")
    .addEventListener("click", () => {

        if (
            tutorialStep === 10 &&
            tutorialStep10Part === 2
        ) {

            tutorialStep = 1;

            document.getElementById("step-title").textContent =
                "Tutorial Complete!";

            document.getElementById("question").textContent =
                `Great work! You successfully calculated the weekday for ${formatDate(tutorialDate)}.`;

            document.getElementById("answer-area").innerHTML = "";

            document
                .getElementById("continue-button")
                .classList.add("hidden");

            return;
        }


        tutorialStep++;

        updateTutorialStep();

    });


/* =========================================================
   TUTORIAL RESTART
========================================================= */

document
    .getElementById("new-date-button")
    .addEventListener("click", () => {

        resetTutorialState();

        resetTutorialSidebar();

        tutorialDate =
            generateRandomDate();

        initializeTutorial();

    });


/* =========================================================
   TUTORIAL HOME
========================================================= */

document
    .getElementById("back-home-button")
    .addEventListener("click", goHome);


/* =========================================================
   ENDLESS MODE
========================================================= */

function startEndless() {

    endlessStreak = 0;

    endlessSelectedAnswer = null;

    showScreen("endless-screen");

    updateEndlessStreak();

    newEndlessQuestion();
}


function newEndlessQuestion() {

    endlessDate =
        generateRandomDate();

    endlessSelectedAnswer = null;


    document
        .getElementById("endless-date-display")
        .textContent =
        formatDate(endlessDate);


    document
        .getElementById("endless-feedback")
        .textContent = "";


    document
        .getElementById("endless-feedback")
        .className = "";


    document
        .getElementById("endless-submit-button")
        .classList.add("hidden");


    renderEndlessAnswers();
}


function renderEndlessAnswers() {

    const area =
        document.getElementById(
            "endless-answer-area"
        );

    area.innerHTML = "";


    WEEKDAYS.forEach(day => {

        const button =
            createAnswerButton(
                day,
                day,
                value => {

                    endlessSelectedAnswer =
                        value;

                    document
                        .getElementById(
                            "endless-submit-button"
                        )
                        .classList.remove("hidden");

                }
            );

        area.appendChild(button);

    });
}


document
    .getElementById("endless-submit-button")
    .addEventListener("click", () => {

        if (endlessSelectedAnswer === null) {
            return;
        }


        const correct =
            WEEKDAYS[
                getWeekdayNumber(endlessDate)
            ];


        const feedback =
            document.getElementById(
                "endless-feedback"
            );


        if (endlessSelectedAnswer === correct) {

            endlessStreak++;

            feedback.className =
                "correct";

            feedback.textContent =
                "Correct!";

            updateEndlessStreak();


            setTimeout(() => {
                newEndlessQuestion();
            }, 700);

        }

        else {

            feedback.className =
                "incorrect";

            feedback.textContent =
                `Incorrect. The answer was ${correct}. Your streak was ${endlessStreak}.`;

            endlessStreak = 0;

            updateEndlessStreak();


            document
                .getElementById(
                    "endless-submit-button"
                )
                .classList.add("hidden");
        }

    });


function updateEndlessStreak() {

    document
        .getElementById("endless-streak")
        .textContent =
        `Streak: ${endlessStreak}`;

}


/* Endless Restart */

document
    .getElementById("endless-restart-button")
    .addEventListener("click", () => {

        endlessStreak = 0;

        updateEndlessStreak();

        newEndlessQuestion();

    });


/* Endless Home */

document
    .getElementById("endless-back-home-button")
    .addEventListener("click", goHome);


/* =========================================================
   QUIZ MODE
========================================================= */

function startQuizSetup() {

    showScreen("quiz-screen");

    document
        .getElementById("quiz-setup")
        .classList.remove("hidden");

    document
        .getElementById("quiz-game")
        .classList.add("hidden");

    document
        .getElementById("quiz-results")
        .classList.add("hidden");
}


document
    .querySelectorAll(".quiz-count-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            quizTotalQuestions =
                Number(button.dataset.count);

            quizCurrentQuestion = 0;

            quizCorrect = 0;

            quizSelectedAnswer = null;


            document
                .getElementById("quiz-setup")
                .classList.add("hidden");

            document
                .getElementById("quiz-results")
                .classList.add("hidden");

            document
                .getElementById("quiz-game")
                .classList.remove("hidden");


            newQuizQuestion();

        });

    });


function newQuizQuestion() {

    quizCurrentQuestion++;

    quizDate =
        generateRandomDate();

    quizSelectedAnswer = null;


    document
        .getElementById("quiz-progress")
        .textContent =
        `Question ${quizCurrentQuestion} of ${quizTotalQuestions}`;


    document
        .getElementById("quiz-score")
        .textContent =
        `Correct: ${quizCorrect}`;


    document
        .getElementById("quiz-date-display")
        .textContent =
        formatDate(quizDate);


    document
        .getElementById("quiz-feedback")
        .textContent = "";


    document
        .getElementById("quiz-submit-button")
        .classList.add("hidden");


    const area =
        document.getElementById(
            "quiz-answer-area"
        );

    area.innerHTML = "";


    WEEKDAYS.forEach(day => {

        const button =
            createAnswerButton(
                day,
                day,
                value => {

                    quizSelectedAnswer =
                        value;

                    document
                        .getElementById(
                            "quiz-submit-button"
                        )
                        .classList.remove("hidden");

                }
            );

        area.appendChild(button);

    });

}


document
    .getElementById("quiz-submit-button")
    .addEventListener("click", () => {

        if (quizSelectedAnswer === null) {
            return;
        }


        const correct =
            WEEKDAYS[
                quizDate.getDay()
            ];


        if (quizSelectedAnswer === correct) {
            quizCorrect++;
        }


        if (
            quizCurrentQuestion >=
            quizTotalQuestions
        ) {

            finishQuiz();

        }

        else {

            newQuizQuestion();

        }

    });


function finishQuiz() {

    const percentage =
        Math.round(
            (quizCorrect /
                quizTotalQuestions) *
            100
        );


    let grade;


    if (percentage >= 97) {
        grade = "A+";
    }

    else if (percentage >= 93) {
        grade = "A";
    }

    else if (percentage >= 90) {
        grade = "A-";
    }

    else if (percentage >= 87) {
        grade = "B+";
    }

    else if (percentage >= 83) {
        grade = "B";
    }

    else if (percentage >= 80) {
        grade = "B-";
    }

    else if (percentage >= 77) {
        grade = "C+";
    }

    else if (percentage >= 73) {
        grade = "C";
    }

    else if (percentage >= 70) {
        grade = "C-";
    }

    else if (percentage >= 60) {
        grade = "D";
    }

    else {
        grade = "F";
    }


    document
        .getElementById("quiz-final-score")
        .textContent =
        `You got ${quizCorrect} out of ${quizTotalQuestions} correct (${percentage}%).`;


    document
        .getElementById("quiz-grade")
        .textContent =
        `Grade: ${grade}`;


    document
        .getElementById("quiz-game")
        .classList.add("hidden");

    document
        .getElementById("quiz-results")
        .classList.remove("hidden");

}


document
    .getElementById("quiz-restart-button")
    .addEventListener("click", startQuizSetup);


document
    .getElementById("quiz-back-home-button")
    .addEventListener("click", goHome);


/* =========================================================
   GUIDED MODE
========================================================= */

function startGuided() {

    guidedHints = 3;

    guidedSelectedAnswer = null;

    guidedDate =
        generateRandomDate();

    showScreen("guided-screen");

    updateGuidedMode();

}


function updateGuidedMode() {

    document
        .getElementById("guided-sidebar-date")
        .textContent =
        formatDate(guidedDate);


    document
        .getElementById("guided-date-display")
        .textContent =
        formatDate(guidedDate);


    document
        .getElementById("guided-hints")
        .textContent =
        `Hints remaining: ${guidedHints}`;


    document
        .getElementById("guided-feedback")
        .textContent = "";


    document
        .getElementById("guided-submit-button")
        .classList.add("hidden");


    const area =
        document.getElementById(
            "guided-answer-area"
        );

    area.innerHTML = "";


    WEEKDAYS.forEach(day => {

        const button =
            createAnswerButton(
                day,
                day,
                value => {

                    guidedSelectedAnswer =
                        value;

                    document
                        .getElementById(
                            "guided-submit-button"
                        )
                        .classList.remove("hidden");

                }
            );

        area.appendChild(button);

    });

}


document
    .getElementById("guided-submit-button")
    .addEventListener("click", () => {

        if (guidedSelectedAnswer === null) {
            return;
        }


        const correct =
            WEEKDAYS[
                guidedDate.getDay()
            ];


        const feedback =
            document.getElementById(
                "guided-feedback"
            );


        if (guidedSelectedAnswer === correct) {

            feedback.className =
                "correct";

            feedback.textContent =
                "Correct!";


            setTimeout(() => {

                guidedDate =
                    generateRandomDate();

                guidedSelectedAnswer = null;

                updateGuidedMode();

            }, 700);

        }

        else {

            feedback.className =
                "incorrect";

            feedback.textContent =
                "Sorry, not quite... Try again!";

        }

    });


document
    .getElementById("guided-hint-button")
    .addEventListener("click", () => {

        if (guidedHints <= 0) {
            return;
        }


        guidedHints--;


        const correct =
            WEEKDAYS[
                guidedDate.getDay()
            ];


        document
            .getElementById("guided-feedback")
            .textContent =
            `Hint: The answer begins with "${correct[0]}".`;


        document
            .getElementById("guided-hints")
            .textContent =
            `Hints remaining: ${guidedHints}`;

    });


document
    .getElementById("guided-restart-button")
    .addEventListener("click", () => {

        guidedHints = 3;

        guidedDate =
            generateRandomDate();

        guidedSelectedAnswer = null;

        updateGuidedMode();

    });


document
    .getElementById("guided-back-home-button")
    .addEventListener("click", goHome);


/* =========================================================
   FLASHCARDS
========================================================= */

let flashcardCategory = null;
let flashcardCards = [];
let flashcardIndex = 0;


const FLASHCARDS = {

    weekdays: [
        ["0", "Sunday"],
        ["1", "Monday"],
        ["2", "Tuesday"],
        ["3", "Wednesday"],
        ["4", "Thursday"],
        ["5", "Friday"],
        ["6", "Saturday"]
    ],

    doomsdays: [
        ["January 3 / January 4", "January's Doomsday"],
        ["February 28 / February 29", "February's Doomsday"],
        ["March 14", "March's Doomsday"],
        ["April 4", "April's Doomsday"],
        ["May 9", "May's Doomsday"],
        ["June 6", "June's Doomsday"],
        ["July 11", "July's Doomsday"],
        ["August 8", "August's Doomsday"],
        ["September 5", "September's Doomsday"],
        ["October 10", "October's Doomsday"],
        ["November 7", "November's Doomsday"],
        ["December 12", "December's Doomsday"]
    ],

    centuries: [
        ["1800s", "Friday (5)"],
        ["1900s", "Wednesday (3)"],
        ["2000s", "Tuesday (2)"],
        ["2100s", "Sunday (0)"],
        ["2200s", "Friday (5)"],
        ["2300s", "Wednesday (3)"]
    ]

};


function startFlashcards() {

    showScreen("flashcards-screen");

    document
        .getElementById("flashcard-category-area")
        .classList.remove("hidden");

    document
        .getElementById("flashcard-area")
        .classList.add("hidden");

}


document
    .querySelectorAll(".flashcard-category-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            flashcardCategory =
                button.dataset.category;

            flashcardCards =
                [...FLASHCARDS[flashcardCategory]];

            flashcardIndex = 0;

            document
                .getElementById("flashcard-category-area")
                .classList.add("hidden");

            document
                .getElementById("flashcard-area")
                .classList.remove("hidden");

            showFlashcard();

        });

    });


function showFlashcard() {

    const card =
        flashcardCards[flashcardIndex];


    document
        .getElementById("flashcard-prompt")
        .textContent =
        card[0];


    document
        .getElementById("flashcard-answer")
        .textContent =
        card[1];


    document
        .getElementById("flashcard-answer")
        .classList.add("hidden");


    document
        .getElementById("flashcard-show-answer-button")
        .classList.remove("hidden");

    document
        .getElementById("flashcard-next-button")
        .classList.add("hidden");

}


document
    .getElementById("flashcard-show-answer-button")
    .addEventListener("click", () => {

        document
            .getElementById("flashcard-answer")
            .classList.remove("hidden");

        document
            .getElementById("flashcard-show-answer-button")
            .classList.add("hidden");

        document
            .getElementById("flashcard-next-button")
            .classList.remove("hidden");

    });


document
    .getElementById("flashcard-next-button")
    .addEventListener("click", () => {

        flashcardIndex++;

        if (
            flashcardIndex >=
            flashcardCards.length
        ) {
            flashcardIndex = 0;
        }

        showFlashcard();

    });


document
    .getElementById("flashcards-back-home-button")
    .addEventListener("click", goHome);


/* =========================================================
   INITIAL STATE
========================================================= */

showScreen("home-screen");

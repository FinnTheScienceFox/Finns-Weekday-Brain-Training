// ========================================
// FINN'S WEEKDAY BRAIN TRAINING!
// ========================================


// ========================================
// BASIC DATA
// ========================================

const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const months = [
    "",
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


// ========================================
// CENTURY ANCHORS
// ========================================
//
// 1800s = Friday    = 5
// 1900s = Wednesday = 3
// 2000s = Tuesday   = 2
// 2100s = Sunday    = 0
//
// This pattern repeats every four centuries.
//
// The key represents the century number
// modulo 4.
//
// 18 % 4 = 2 → 5
// 19 % 4 = 3 → 3
// 20 % 4 = 0 → 2
// 21 % 4 = 1 → 0
//

const centuryAnchors = {
    0: 2,
    1: 0,
    2: 5,
    3: 3
};


// ========================================
// DOM ELEMENTS
// ========================================

const homeScreen =
    document.getElementById("home-screen");

const tutorialScreen =
    document.getElementById("tutorial-screen");

const homeMessage =
    document.getElementById("home-message");

const stepCounter =
    document.getElementById("step-counter");

const stepTitle =
    document.getElementById("step-title");

const dateDisplay =
    document.getElementById("date-display");

const sidebarDate =
    document.getElementById("sidebar-date");

const question =
    document.getElementById("question");

const answerArea =
    document.getElementById("answer-area");

const feedback =
    document.getElementById("feedback");

const continueButton =
    document.getElementById("continue-button");

const newDateButton =
    document.getElementById("new-date-button");

const backHomeButton =
    document.getElementById("back-home-button");


// ========================================
// DATE FORMATTING
// ========================================

function formatDate(month, day) {

    return `${months[month]} ${day}`;
}


// ========================================
// RANDOM NUMBER
// ========================================

function randomInteger(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


// ========================================
// RANDOM DATE GENERATION
// ========================================

function generateRandomDate() {

    const year =
        randomInteger(1800, 2199);

    const month =
        randomInteger(1, 12);

    const daysInMonth =
        new Date(
            year,
            month,
            0
        ).getDate();

    const day =
        randomInteger(
            1,
            daysInMonth
        );

    return {
        year,
        month,
        day
    };
}


// ========================================
// STEP 1
// ========================================
//
// Take the last two digits of the year.
// How many groups of 12?
//

function step1(year) {

    const lastTwoDigits =
        year % 100;

    const groupsOf12 =
        Math.floor(
            lastTwoDigits / 12
        );

    return {
        lastTwoDigits,
        groupsOf12
    };
}


// ========================================
// STEP 2
// ========================================
//
// Take 12 away until you can't.
// What's left over?
//

function step2(year) {

    const lastTwoDigits =
        year % 100;

    const leftover =
        lastTwoDigits % 12;

    return {
        leftover
    };
}


// ========================================
// STEP 3
// ========================================
//
// How many groups of 4 can we make
// out of the Step 2 answer?
//

function step3(year) {

    const leftover =
        step2(year).leftover;

    const groupsOf4 =
        Math.floor(
            leftover / 4
        );

    return {
        leftover,
        groupsOf4
    };
}


// ========================================
// STEP 4
// ========================================
//
// Century anchor.
//
// 18 = Friday (5)
// 19 = Wednesday (3)
// 20 = Tuesday (2)
// 21 = Sunday (0)
//
// The answer stored here is always
// a numerical weekday value.
//

function step4(year) {

    const century =
        Math.floor(year / 100);

    const anchor =
        centuryAnchors[
            century % 4
        ];

    return {
        century,
        anchor,
        weekday:
            weekdays[anchor]
    };
}


// ========================================
// STEP 5
// ========================================
//
// Add the results of Steps 1-4.
//

function step5(year) {

    const s1 =
        step1(year);

    const s2 =
        step2(year);

    const s3 =
        step3(year);

    const s4 =
        step4(year);

    const sum =
        s1.groupsOf12 +
        s2.leftover +
        s3.groupsOf4 +
        s4.anchor;

    return {
        sum
    };
}


// ========================================
// STEP 6
// ========================================
//
// Take 7 away until you can't.
//

function step6(year) {

    const sum =
        step5(year).sum;

    const leftover =
        sum % 7;

    return {
        sum,
        leftover
    };
}


// ========================================
// STEP 7
// ========================================
//
// The leftover number corresponds to
// the weekday of that year's Doomsday.
//

function step7(year) {

    const weekdayNumber =
        step6(year).leftover;

    return {
        weekdayNumber,

        weekdayName:
            weekdays[weekdayNumber]
    };
}


// ========================================
// LEAP YEAR
// ========================================
//
// Normal rule:
// Last two digits must divide evenly by 4.
//
// Special century rule:
// If the last two digits are 00,
// use the first two digits instead.
//
// This follows the simplified system
// being taught by the tutorial.
//

function isLeapYear(year) {

    const lastTwoDigits =
        year % 100;

    if (lastTwoDigits === 0) {

        const firstTwoDigits =
            Math.floor(year / 100);

        return (
            firstTwoDigits % 4 === 0
        );
    }

    return (
        lastTwoDigits % 4 === 0
    );
}


// ========================================
// STEP 8
// ========================================

function step8(year) {

    const lastTwoDigits =
        year % 100;

    let numberBeingTested;

    if (lastTwoDigits === 0) {

        numberBeingTested =
            Math.floor(year / 100);

    } else {

        numberBeingTested =
            lastTwoDigits;
    }

    return {

        numberBeingTested,

        leapYear:
            isLeapYear(year)
    };
}


// ========================================
// STEP 9
// ========================================
//
// Find the Doomsday date for the month.
//
// January:
// Non-leap = 3
// Leap = 4
//
// February:
// Non-leap = 28
// Leap = 29
//
// Other months use the memorized dates.
//

function step9(month, year) {

    const leapYear =
        isLeapYear(year);

    if (month === 1) {

        return {
            doomsdayDate:
                leapYear ? 4 : 3,

            leapYear
        };
    }

    if (month === 2) {

        return {
            doomsdayDate:
                leapYear ? 29 : 28,

            leapYear
        };
    }

    const doomsdayDates = {

        3: 14,
        4: 4,
        5: 9,
        6: 6,
        7: 11,
        8: 8,
        9: 5,
        10: 10,
        11: 7,
        12: 12
    };

    return {

        doomsdayDate:
            doomsdayDates[month],

        leapYear
    };
}


// ========================================
// STEP 10
// ========================================
//
// Find how many complete weeks separate
// the target date from its month's Doomsday.
//
// Positive = forward
// Negative = backward
//

function step10(month, day, year) {

    const yearDoomsday =
        step7(year);

    const monthDoomsday =
        step9(month, year);

    const difference =
        day -
        monthDoomsday.doomsdayDate;

    const absoluteDifference =
        Math.abs(difference);

    const positiveFullWeeks =
        Math.floor(
            absoluteDifference / 7
        );

    const fullWeeks =
        difference >= 0
            ? positiveFullWeeks
            : -positiveFullWeeks;

    const remainingDays =
        absoluteDifference % 7;

    const finalWeekday =
        (
            yearDoomsday.weekdayNumber +
            difference +
            7
        ) % 7;

    return {

        doomsdayDate:
            monthDoomsday.doomsdayDate,

        doomsdayWeekday:
            yearDoomsday.weekdayNumber,

        difference,

        absoluteDifference,

        fullWeeks,

        remainingDays,

        finalWeekday,

        finalWeekdayName:
            weekdays[finalWeekday]
    };
}


// ========================================
// SOLVE ENTIRE DATE
// ========================================

function solveDate(
    month,
    day,
    year
) {

    return {

        date: {
            month,
            day,
            year
        },

        step1:
            step1(year),

        step2:
            step2(year),

        step3:
            step3(year),

        step4:
            step4(year),

        step5:
            step5(year),

        step6:
            step6(year),

        step7:
            step7(year),

        step8:
            step8(year),

        step9:
            step9(
                month,
                year
            ),

        step10:
            step10(
                month,
                day,
                year
            )
    };
}


// ========================================
// GAME STATE
// ========================================

// Shared date/solution state.

let currentDate;

let solution;


// Tutorial state.

let currentStep = 1;


// Endless state.

let endlessStreak = 0;

let endlessBestStreak = 0;

let endlessGameOver = false;


// ========================================
// MODE SELECTION
// ========================================

const modeButtons =
    document.querySelectorAll(
        ".mode-button"
    );

modeButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const mode =
                    button.dataset.mode;

                selectMode(mode);
            }
        );
    }
);


function selectMode(mode) {

    homeMessage.textContent = "";

    if (mode === "tutorial") {

        startTutorial();

        return;
    }

    if (mode === "endless") {

        startEndless();

        return;
    }

    homeMessage.textContent =
        `${capitalize(mode)} mode is coming soon!`;
}


function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


// ========================================
// TUTORIAL
// ========================================

function startTutorial() {

    homeScreen.classList.add(
        "hidden"
    );

    tutorialScreen.classList.remove(
        "hidden"
    );

    // Generate a fresh random date.

    currentDate =
        generateRandomDate();

    // Calculate every answer.

    solution =
        solveDate(
            currentDate.month,
            currentDate.day,
            currentDate.year
        );

    currentStep = 1;

    updateDateDisplay();

    resetSidebar();

    showCurrentStep();
}


// ========================================
// UPDATE DATE DISPLAY
// ========================================

function updateDateDisplay() {

    const text =
        `${formatDate(
            currentDate.month,
            currentDate.day
        )}, ${currentDate.year}`;

    dateDisplay.textContent =
        text;

    sidebarDate.textContent =
        text;
}


// ========================================
// RESET SIDEBAR
// ========================================

function resetSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (!sidebar) return;

    // Remove all existing step entries.

    const oldSteps =
        sidebar.querySelectorAll(
            ".sidebar-step"
        );

    oldSteps.forEach(
        function(step) {

            step.remove();
        }
    );


    // Recreate the ten tutorial steps.

    const stepNames = [

        "Groups of 12",

        "What's Left Over?",

        "Groups of 4",

        "Century Anchor",

        "Add Everything",

        "Reduce by 7",

        "Year's Doomsday",

        "Leap Year",

        "Month's Doomsday",

        "Count by Weeks"
    ];


    stepNames.forEach(
        function(name, index) {

            const stepNumber =
                index + 1;

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "sidebar-step";

            item.id =
                `sidebar-step-${stepNumber}`;

            item.innerHTML =
                `<strong>${stepNumber}.</strong>
                ${name}
                <span class="sidebar-result"></span>`;

            sidebar.appendChild(
                item
            );
        }
    );
}


// ========================================
// SIDEBAR ACTIVE STEP
// ========================================

function setSidebarActive(step) {

    const item =
        document.getElementById(
            `sidebar-step-${step}`
        );

    if (item) {

        item.classList.add(
            "active"
        );
    }
}


// ========================================
// COMPLETE SIDEBAR STEP
// ========================================

function completeSidebarStep(
    step,
    resultText
) {

    const item =
        document.getElementById(
            `sidebar-step-${step}`
        );

    if (!item) return;

    item.classList.remove(
        "active"
    );

    item.classList.add(
        "completed"
    );

    const result =
        item.querySelector(
            ".sidebar-result"
        );

    if (result) {

        result.textContent =
            resultText;
    }
}


// ========================================
// REMOVE STEPS 1-4
// ========================================

function permanentlyRemoveSteps1to4() {

    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        const item =
            document.getElementById(
                `sidebar-step-${i}`
            );

        if (item) {

            item.remove();
        }
    }
}


// ========================================
// SHOW CURRENT TUTORIAL STEP
// ========================================

function showCurrentStep() {

    const displayedStep =
        currentStep <= 10
            ? currentStep
            : 10;

    stepCounter.textContent =
        `Step ${displayedStep} of 10`;

    answerArea.innerHTML = "";

    feedback.textContent = "";

    feedback.className = "";

    continueButton.classList.add(
        "hidden"
    );


    setSidebarActive(
        Math.min(
            currentStep,
            10
        )
    );


    switch (currentStep) {

        case 1:
            showStep1();
            break;

        case 2:
            showStep2();
            break;

        case 3:
            showStep3();
            break;

        case 4:
            showStep4();
            break;

        case 5:
            showStep5();
            break;

        case 6:
            showStep6();
            break;

        case 7:
            showStep7();
            break;

        case 8:
            showStep8();
            break;

        case 9:
            showStep9();
            break;

        case 10:
            showStep10Part1();
            break;

        case 11:
            showStep10Part2();
            break;

        case 12:
            showCompletion();
            break;
    }
}


// ========================================
// TUTORIAL STEP 1
// ========================================

function showStep1() {

    stepTitle.textContent =
        "Step 1: Groups of 12";

    const result =
        solution.step1;

    question.innerHTML =
        `The last two digits of the year are
        <strong>${result.lastTwoDigits}</strong>.
        How many groups of 12 can we make
        out of ${result.lastTwoDigits}?

        <br><br>

        <em>(Remember this answer!)</em>`;

    createNumberButtons(
        0,
        8,
        result.groupsOf12
    );
}


// ========================================
// TUTORIAL STEP 2
// ========================================

function showStep2() {

    stepTitle.textContent =
        "Step 2: What's Left Over?";

    const result =
        solution.step2;

    const lastTwo =
        solution.step1.lastTwoDigits;

    question.innerHTML =
        `For the last two digits,
        <strong>${lastTwo}</strong>,
        take 12 away until you can't anymore.
        What's left over?

        <br><br>

        <em>(Remember this answer!)</em>`;

    createNumberButtons(
        0,
        11,
        result.leftover
    );
}


// ========================================
// TUTORIAL STEP 3
// ========================================

function showStep3() {

    stepTitle.textContent =
        "Step 3: Groups of 4";

    const result =
        solution.step3;

    question.innerHTML =
        `Take the answer from the last step,
        <strong>${result.leftover}</strong>.
        How many groups of 4 can we make
        out of ${result.leftover}?

        <br><br>

        <em>(Remember this answer!)</em>`;

    createNumberButtons(
        0,
        3,
        result.groupsOf4
    );
}


// ========================================
// TUTORIAL STEP 4
// ========================================

function showStep4() {

    stepTitle.textContent =
        "Step 4: Century Anchor";

    const result =
        solution.step4;

    question.innerHTML =
        `The first two digits of the year are
        <strong>${result.century}</strong>.

        <br><br>

        Remember the repeating pattern for
        <em>century anchors</em>:

        <br><br>

        18 = Friday (5).<br>
        19 = Wednesday (3).<br>
        20 = Tuesday (2).<br>
        21 = Sunday (0).

        <br><br>

        Using the cycle above, what is the
        <em>century anchor</em>?

        <br><br>

        <em>(Remember this answer!)</em>`;

    createNumberButtons(
        0,
        6,
        result.anchor
    );
}


// ========================================
// TUTORIAL STEP 5
// ========================================

function showStep5() {

    // Steps 1-4 disappear BEFORE the
    // player answers this question.

    permanentlyRemoveSteps1to4();

    stepTitle.textContent =
        "Step 5: Add Everything";

    const result =
        solution.step5;

    question.innerHTML =
        `Hopefully you've memorized your
        answers so far!

        <br><br>

        Add these results together...
        What's the result?`;

    createNumberButtons(
        0,
        30,
        result.sum
    );
}


// ========================================
// TUTORIAL STEP 6
// ========================================

function showStep6() {

    stepTitle.textContent =
        "Step 6: Reduce by 7";

    const result =
        solution.step6;

    question.innerHTML =
        `For last question's sum,
        <strong>${result.sum}</strong>,
        take 7 away until you can't anymore.
        What's left over?`;

    createNumberButtons(
        0,
        6,
        result.leftover
    );
}


// ========================================
// TUTORIAL STEP 7
// ========================================

function showStep7() {

    stepTitle.textContent =
        "Step 7: Find the Year's Doomsday";

    const result =
        solution.step7;

    question.innerHTML =
        `This leftover number,
        <strong>${result.weekdayNumber}</strong>,
        is the weekday of
        ${currentDate.year}'s Doomsday dates!

        <br><br>

        Remember the mnemonic for numbered
        weekdays:

        <br><br>

        0 = "NONEday" (Sunday)<br>
        1 = "ONEday" (Monday)<br>
        2 = "TWOsday" (Tuesday)<br>
        3 = THREE syllables (Wednesday)<br>
        4 = "FOURsday" (Thursday)<br>
        5 = "FIVEday" (Friday)<br>
        6 = "SIXurday" (Saturday).

        <br><br>

        Using the mnemonic above, what weekday
        does this number represent?`;

    createWeekdayButtons(
        result.weekdayNumber
    );
}


// ========================================
// TUTORIAL STEP 8
// ========================================

function showStep8() {

    stepTitle.textContent =
        "Step 8: Is It a Leap Year?";

    const result =
        solution.step8;

    const lastTwo =
        currentDate.year % 100;

    let numberText;


    if (lastTwo === 0) {

        const firstTwo =
            Math.floor(
                currentDate.year / 100
            );

        numberText =
            `The last two digits are
            <strong>00</strong>.

            <br><br>

            In this special case, use the
            first two digits instead:
            <strong>${firstTwo}</strong>.`;

    } else {

        numberText =
            `The last two digits of the year are
            <strong>${lastTwo}</strong>.`;
    }


    question.innerHTML =
        `${numberText}

        <br><br>

        Can you make groups of 4 with
        <strong>NO leftovers</strong>?`;

    createYesNoButtons(
        result.leapYear
    );
}


// ========================================
// TUTORIAL STEP 9
// ========================================

function showStep9() {

    stepTitle.textContent =
        "Step 9: Find the Month's Doomsday";

    const result =
        solution.step9;

    const leapText =
        result.leapYear
            ? "is"
            : "is not";

    const numberText =
        result.leapYear
            ? "second"
            : "first";


    question.innerHTML =
        `Each month has a Doomsday date:

        <br><br>

        1/3-4, 2/28-29, 3/14, 4/4,
        5/9, 6/6, 7/11, 8/8,
        9/5, 10/10, 11/7, and 12/12.

        <br><br>

        This year
        <strong>${leapText}</strong>
        a leap year, which means the
        <strong>${numberText}</strong>
        number for January and February
        is their Doomsday date.

        <br><br>

        What is the Doomsday date for
        <strong>${months[currentDate.month]}</strong>?`;

    createMonthDoomsdayButtons(
        currentDate.month,
        result.doomsdayDate
    );
}


// ========================================
// TUTORIAL STEP 10 — PART 1
// ========================================

function showStep10Part1() {

    stepTitle.textContent =
        "Step 10: Count by Weeks";

    const result =
        solution.step10;

    const doomsdayText =
        formatDate(
            currentDate.month,
            result.doomsdayDate
        );


    question.innerHTML =
        `Every 7 days lands on the same weekday.

        <br><br>

        Starting at our Doomsday date
        <strong>${doomsdayText}</strong>,
        which was a
        <strong>${solution.step7.weekdayName}</strong>,

        count forward or back by 7 until you're
        within one week of the target date.

        <br><br>

        <strong>
        How many full weeks can you move?
        </strong>`;


    // Negative numbers represent going backward.

    createNumberButtons(
        -4,
        4,
        result.fullWeeks
    );
}


// ========================================
// TUTORIAL STEP 10 — PART 2
// ========================================

function showStep10Part2() {

    stepTitle.textContent =
        "Step 10: Find the Weekday";

    const result =
        solution.step10;


    const direction =
        result.fullWeeks >= 0
            ? "forward"
            : "backward";


    const weeks =
        Math.abs(
            result.fullWeeks
        ) === 1
            ? "week"
            : "weeks";


    const days =
        result.remainingDays === 1
            ? "day"
            : "days";


    let targetPosition;

    if (
        result.difference > 0
    ) {

        targetPosition =
            "ahead of";

    } else if (
        result.difference < 0
    ) {

        targetPosition =
            "behind";

    } else {

        targetPosition =
            "exactly on";
    }


    const intermediateDay =
        result.doomsdayDate +
        (
            result.fullWeeks * 7
        );


    const intermediateDateText =
        formatDate(
            currentDate.month,
            intermediateDay
        );


    question.innerHTML =
        `Great, you've moved
        <strong>${Math.abs(
            result.fullWeeks
        )}</strong>
        ${weeks} ${direction}!

        <br><br>

        You are now at
        <strong>${intermediateDateText}</strong>,

        and your target is
        <strong>${result.remainingDays}</strong>
        ${days}
        ${targetPosition} your current date.

        <br><br>

        <strong>
        Which weekday is the target date?
        </strong>`;


    createWeekdayButtons(
        result.finalWeekday
    );
}


// ========================================
// NUMBER BUTTONS
// ========================================

function createNumberButtons(
    min,
    max,
    correctAnswer
) {

    for (
        let number = min;
        number <= max;
        number++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "answer-button";

        button.textContent =
            number;


        button.addEventListener(
            "click",
            function() {

                checkAnswer(
                    number,
                    correctAnswer
                );
            }
        );


        answerArea.appendChild(
            button
        );
    }
}


// ========================================
// WEEKDAY BUTTONS
// ========================================

function createWeekdayButtons(
    correctAnswer
) {

    weekdays.forEach(
        function(weekday, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer-button";

            button.textContent =
                weekday;


            button.addEventListener(
                "click",
                function() {

                    checkAnswer(
                        index,
                        correctAnswer
                    );
                }
            );


            answerArea.appendChild(
                button
            );
        }
    );
}


// ========================================
// YES / NO BUTTONS
// ========================================

function createYesNoButtons(
    correctAnswer
) {

    const yesButton =
        document.createElement(
            "button"
        );

    yesButton.className =
        "answer-button";

    yesButton.textContent =
        "Yes — leap year";


    yesButton.addEventListener(
        "click",
        function() {

            checkAnswer(
                true,
                correctAnswer
            );
        }
    );


    const noButton =
        document.createElement(
            "button"
        );

    noButton.className =
        "answer-button";

    noButton.textContent =
        "No — not a leap year";


    noButton.addEventListener(
        "click",
        function() {

            checkAnswer(
                false,
                correctAnswer
            );
        }
    );


    answerArea.appendChild(
        yesButton
    );

    answerArea.appendChild(
        noButton
    );
}


// ========================================
// DOOMSDAY DATE BUTTONS
// ========================================
//
// Every memorized Doomsday date is offered.
//
// January:
// 1/3
// 1/4
//
// February:
// 2/28
// 2/29
//
// etc.
//

function createMonthDoomsdayButtons(
    month,
    correctAnswer
) {

    const doomsdayDates = [

        {
            month: 1,
            day: 3
        },

        {
            month: 1,
            day: 4
        },

        {
            month: 2,
            day: 28
        },

        {
            month: 2,
            day: 29
        },

        {
            month: 3,
            day: 14
        },

        {
            month: 4,
            day: 4
        },

        {
            month: 5,
            day: 9
        },

        {
            month: 6,
            day: 6
        },

        {
            month: 7,
            day: 11
        },

        {
            month: 8,
            day: 8
        },

        {
            month: 9,
            day: 5
        },

        {
            month: 10,
            day: 10
        },

        {
            month: 11,
            day: 7
        },

        {
            month: 12,
            day: 12
        }
    ];


    doomsdayDates.forEach(
        function(doomsday) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer-button";

            button.textContent =
                `${doomsday.month}/${doomsday.day}`;


            button.addEventListener(
                "click",
                function() {

                    const playerAnswer =
                        `${doomsday.month}/${doomsday.day}`;

                    const correctAnswerString =
                        `${month}/${correctAnswer}`;


                    checkAnswer(
                        playerAnswer,
                        correctAnswerString
                    );
                }
            );


            answerArea.appendChild(
                button
            );
        }
    );
}


// ========================================
// NORMAL TUTORIAL ANSWER CHECKING
// ========================================

function checkAnswer(
    playerAnswer,
    correctAnswer
) {

    if (
        playerAnswer ===
        correctAnswer
    ) {

        handleCorrectAnswer();

    } else {

        handleIncorrectAnswer();
    }
}


// ========================================
// CORRECT TUTORIAL ANSWER
// ========================================

function handleCorrectAnswer() {

    feedback.className =
        "correct";

    feedback.innerHTML =
        getCorrectExplanation();


    disableAnswerButtons();


    recordSidebarResult();


    continueButton.classList.remove(
        "hidden"
    );
}


// ========================================
// INCORRECT TUTORIAL ANSWER
// ========================================

function handleIncorrectAnswer() {

    feedback.className =
        "incorrect";


    // Step 5 gets a custom message
    // showing the four numbers the player
    // should have remembered.

    if (
        currentStep === 5
    ) {

        const a =
            solution.step1.groupsOf12;

        const b =
            solution.step2.leftover;

        const c =
            solution.step3.groupsOf4;

        const d =
            solution.step4.anchor;


        feedback.innerHTML =
            `Sorry, not quite...

            <br><br>

            Your answers were
            <strong>${a}, ${b}, ${c}, and ${d}</strong>.

            <br><br>

            What do these add to?`;

        return;
    }


    // Default incorrect-answer message.

    feedback.textContent =
        "Sorry, not quite... Try again!";
}


// ========================================
// SIDEBAR RESULT RECORDING
// ========================================

function recordSidebarResult() {

    switch (currentStep) {

        case 1:

            completeSidebarStep(
                1,
                solution.step1.groupsOf12
            );

            break;


        case 2:

            completeSidebarStep(
                2,
                solution.step2.leftover
            );

            break;


        case 3:

            completeSidebarStep(
                3,
                solution.step3.groupsOf4
            );

            break;


        case 4:

            completeSidebarStep(
                4,
                solution.step4.anchor
            );

            break;


        case 5:

            completeSidebarStep(
                5,
                solution.step5.sum
            );

            break;


        case 6:

            completeSidebarStep(
                6,
                solution.step6.leftover
            );

            break;


        case 7:

            completeSidebarStep(
                7,
                solution.step7.weekdayName
            );

            break;


        case 8:

            completeSidebarStep(
                8,
                solution.step8.leapYear
                    ? "Yes"
                    : "No"
            );

            break;


        case 9:

            completeSidebarStep(
                9,
                `${currentDate.month}/${solution.step9.doomsdayDate}`
            );

            break;


        case 10:

            completeSidebarStep(
                10,
                solution.step10.fullWeeks
            );

            break;
    }
}


// ========================================
// CORRECT ANSWER EXPLANATIONS
// ========================================

function getCorrectExplanation() {

    switch (currentStep) {

        case 1:

            return `
                ✓ Correct! Remember:
                ${solution.step1.groupsOf12}.
            `;


        case 2:

            return `
                ✓ Correct! What's left over is
                ${solution.step2.leftover}.
            `;


        case 3:

            return `
                ✓ Correct! Remember:
                ${solution.step3.groupsOf4}.
            `;


        case 4:

            return `
                ✓ Correct! The century anchor is
                ${solution.step4.anchor}.
            `;


        case 5:

            return `
                ✓ Correct!

                ${solution.step1.groupsOf12}
                +
                ${solution.step2.leftover}
                +
                ${solution.step3.groupsOf4}
                +
                ${solution.step4.anchor}
                =
                ${solution.step5.sum}.
            `;


        case 6:

            return `
                ✓ Correct! What's left over is
                ${solution.step6.leftover}.
            `;


        case 7:

            return `
                ✓ Correct!

                ${solution.step7.weekdayNumber}
                =
                ${solution.step7.weekdayName}.
            `;


        case 8:

            return solution.step8.leapYear
                ? "✓ Correct! This is a leap year."
                : "✓ Correct! This is not a leap year.";


        case 9:

            return `
                ✓ Correct!

                ${formatDate(
                    currentDate.month,
                    solution.step9.doomsdayDate
                )}

                is this month's Doomsday.
            `;


        case 10:

            return `
                ✓ Correct! You can move
                ${Math.abs(
                    solution.step10.fullWeeks
                )}
                full week(s).
            `;


        case 11:

            return `
                ✓ Correct!

                ${formatDate(
                    currentDate.month,
                    currentDate.day
                )}

                is a
                ${solution.step10.finalWeekdayName}.
            `;
    }

    return "";
}


// ========================================
// DISABLE ANSWER BUTTONS
// ========================================

function disableAnswerButtons() {

    const buttons =
        document.querySelectorAll(
            ".answer-button"
        );

    buttons.forEach(
        function(button) {

            button.disabled = true;
        }
    );
}


// ========================================
// TUTORIAL CONTINUE BUTTON
// ========================================

continueButton.addEventListener(
    "click",
    function() {

        // Step 10 Part 1 → Part 2

        if (
            currentStep === 10
        ) {

            currentStep = 11;

            answerArea.innerHTML = "";

            feedback.textContent = "";

            feedback.className = "";

            continueButton.classList.add(
                "hidden"
            );

            showCurrentStep();

            return;
        }


        // Step 10 Part 2 → completion

        if (
            currentStep === 11
        ) {

            currentStep = 12;

            answerArea.innerHTML = "";

            feedback.textContent = "";

            feedback.className = "";

            continueButton.classList.add(
                "hidden"
            );

            showCurrentStep();

            return;
        }


        // Normal tutorial progression.

        currentStep++;

        answerArea.innerHTML = "";

        showCurrentStep();
    }
);


// ========================================
// TUTORIAL COMPLETION
// ========================================

function showCompletion() {

    stepCounter.textContent =
        "Tutorial Complete!";

    stepTitle.textContent =
        "You solved it!";


    question.innerHTML =
        `The day of the week for

        <strong>
        ${formatDate(
            currentDate.month,
            currentDate.day
        )}, ${currentDate.year}
        </strong>

        is:`;


    answerArea.innerHTML =
        `
        <div style="
            font-size: 36px;
            font-weight: bold;
            color: #55dd77;
            width: 100%;
        ">
            ${solution.step10.finalWeekdayName}
        </div>
        `;


    feedback.innerHTML =
        "You completed all 10 steps!";


    continueButton.classList.add(
        "hidden"
    );


    completeSidebarStep(
        10,
        solution.step10.finalWeekdayName
    );
}


// ========================================
// ENDLESS MODE
// ========================================

function startEndless() {

    homeScreen.classList.add(
        "hidden"
    );

    tutorialScreen.classList.remove(
        "hidden"
    );


    endlessStreak = 0;

    endlessGameOver = false;


    startEndlessRound();
}


// ========================================
// START NEW ENDLESS ROUND
// ========================================

function startEndlessRound() {

    currentDate =
        generateRandomDate();


    solution =
        solveDate(
            currentDate.month,
            currentDate.day,
            currentDate.year
        );


    endlessGameOver = false;


    showEndlessRound();
}


// ========================================
// SHOW ENDLESS ROUND
// ========================================

function showEndlessRound() {

    stepCounter.textContent =
        `Endless • Streak: ${endlessStreak}`;


    stepTitle.textContent =
        "Endless Mode";


    dateDisplay.textContent =
        `${formatDate(
            currentDate.month,
            currentDate.day
        )}, ${currentDate.year}`;


    sidebarDate.textContent =
        "No assistance in Endless Mode";


    question.innerHTML =
        `<strong>
        What day of the week is this date?
        </strong>`;


    answerArea.innerHTML = "";

    feedback.textContent = "";

    feedback.className = "";


    continueButton.classList.add(
        "hidden"
    );


    // Endless provides no tutorial assistance.

    hideEndlessSidebar();


    createEndlessWeekdayButtons();
}


// ========================================
// HIDE ENDLESS SIDEBAR STEPS
// ========================================

function hideEndlessSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (!sidebar) return;


    const steps =
        sidebar.querySelectorAll(
            ".sidebar-step"
        );


    steps.forEach(
        function(step) {

            step.classList.add(
                "hidden"
            );
        }
    );
}


// ========================================
// ENDLESS WEEKDAY BUTTONS
// ========================================

function createEndlessWeekdayButtons() {

    weekdays.forEach(
        function(weekday, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer-button";

            button.textContent =
                weekday;


            button.addEventListener(
                "click",
                function() {

                    handleEndlessAnswer(
                        index
                    );
                }
            );


            answerArea.appendChild(
                button
            );
        }
    );
}


// ========================================
// HANDLE ENDLESS ANSWER
// ========================================

function handleEndlessAnswer(
    playerAnswer
) {

    const correctAnswer =
        solution.step10.finalWeekday;


    if (
        playerAnswer ===
        correctAnswer
    ) {

        handleEndlessCorrect();

    } else {

        handleEndlessIncorrect();
    }
}


// ========================================
// ENDLESS CORRECT
// ========================================

function handleEndlessCorrect() {

    endlessStreak++;


    if (
        endlessStreak >
        endlessBestStreak
    ) {

        endlessBestStreak =
            endlessStreak;
    }


    feedback.className =
        "correct";


    feedback.innerHTML =
        "✓ Correct!";


    disableAnswerButtons();


    // Wait briefly so the player can see
    // the feedback before the next date.

    setTimeout(
        function() {

            if (
                !endlessGameOver
            ) {

                startEndlessRound();
            }

        },
        700
    );
}


// ========================================
// ENDLESS INCORRECT
// ========================================

function handleEndlessIncorrect() {

    endlessGameOver = true;


    disableAnswerButtons();


    const correctWeekday =
        solution.step10.finalWeekdayName;


    feedback.className =
        "incorrect";


    feedback.innerHTML =
        `✗ Sorry, not quite!

        <br><br>

        <strong>
        ${formatDate(
            currentDate.month,
            currentDate.day
        )}, ${currentDate.year}
        </strong>

        was a
        <strong>${correctWeekday}</strong>.

        <br><br>

        Your final streak:
        <strong>${endlessStreak}</strong>`;


    showEndlessGameOverButtons();
}


// ========================================
// ENDLESS GAME OVER BUTTONS
// ========================================

function showEndlessGameOverButtons() {

    answerArea.innerHTML = "";


    const tryAgainButton =
        document.createElement(
            "button"
        );

    tryAgainButton.className =
        "answer-button";

    tryAgainButton.textContent =
        "Try Again";


    tryAgainButton.addEventListener(
        "click",
        function() {

            endlessStreak = 0;

            startEndlessRound();
        }
    );


    const homeButton =
        document.createElement(
            "button"
        );

    homeButton.className =
        "answer-button";

    homeButton.textContent =
        "Back to Home";


    homeButton.addEventListener(
        "click",
        function() {

            returnToHome();
        }
    );


    answerArea.appendChild(
        tryAgainButton
    );

    answerArea.appendChild(
        homeButton
    );
}


// ========================================
// NEW DATE BUTTON
// ========================================
//
// In Tutorial mode, this starts a completely
// fresh tutorial.
//
// This also rebuilds the sidebar.
//

if (newDateButton) {

    newDateButton.addEventListener(
        "click",
        function() {

            startTutorial();
        }
    );
}


// ========================================
// BACK HOME BUTTON
// ========================================

if (backHomeButton) {

    backHomeButton.addEventListener(
        "click",
        function() {

            returnToHome();
        }
    );
}


// ========================================
// RETURN TO HOME
// ========================================

function returnToHome() {

    tutorialScreen.classList.add(
        "hidden"
    );

    homeScreen.classList.remove(
        "hidden"
    );


    homeMessage.textContent = "";


    endlessGameOver = false;

    endlessStreak = 0;


    // Clear the game area so the next mode
    // starts cleanly.

    answerArea.innerHTML = "";

    feedback.textContent = "";

    feedback.className = "";

    continueButton.classList.add(
        "hidden"
    );
}


// ========================================
// INITIAL SCREEN
// ========================================

homeScreen.classList.remove(
    "hidden"
);

tutorialScreen.classList.add(
    "hidden"
);

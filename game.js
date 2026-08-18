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


// Century anchors.
// The actual answer we teach the player is
// 1, 2, 3, 4, or 5:
//
// 18 = Friday = 5
// 19 = Wednesday = 3
// 20 = Tuesday = 2
// 21 = Sunday = 0
//
// The century number itself cycles every 4 centuries.
//
// We use these as the actual weekday numbers
// internally, but Step 4 displays the numerical
// anchor value.

const centuryAnchors = {
    0: 2, // 2000s
    1: 0, // 2100s
    2: 5, // 2200s
    3: 3  // 2300s
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
// DATE GENERATION
// ========================================

function randomInteger(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


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
// CENTURY ANCHOR
// ========================================

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

function isLeapYear(year) {

    const lastTwoDigits =
        year % 100;

    if (lastTwoDigits === 0) {

        const firstTwoDigits =
            Math.floor(year / 100);

        return firstTwoDigits % 4 === 0;
    }

    return lastTwoDigits % 4 === 0;
}


// ========================================
// STEP 8
// LEAP YEAR
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
// MONTH'S DOOMSDAY
// ========================================

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

    const fullWeeks =
        Math.floor(
            absoluteDifference / 7
        );

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
// COMPLETE SOLUTION
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
            step9(month, year),

        step10:
            step10(
                month,
                day,
                year
            )
    };
}


// ========================================
// TUTORIAL STATE
// ========================================

let currentDate;

let solution;

let currentStep = 1;

// Step 10 has two parts.
let step10Part = 0;

// Used to prevent repeatedly hiding/showing
// Step 1-4 during Step 5.
let step5HelpShown = false;


// ========================================
// MENU
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
// START TUTORIAL
// ========================================

function startTutorial() {

    homeScreen.classList.add(
        "hidden"
    );

    tutorialScreen.classList.remove(
        "hidden"
    );

    currentDate =
        generateRandomDate();

    solution =
        solveDate(
            currentDate.month,
            currentDate.day,
            currentDate.year
        );

    currentStep = 1;

    step10Part = 0;

    step5HelpShown = false;

    updateDateDisplay();

    resetSidebar();

    showCurrentStep();
}


// ========================================
// DATE DISPLAY
// ========================================

function updateDateDisplay() {

    const text =
        `${months[currentDate.month]} ` +
        `${currentDate.day}, ` +
        `${currentDate.year}`;

    dateDisplay.textContent =
        text;

    sidebarDate.textContent =
        text;
}


// ========================================
// SIDEBAR
// ========================================

function resetSidebar() {

    for (
        let i = 1;
        i <= 10;
        i++
    ) {

        const item =
            document.getElementById(
                `sidebar-step-${i}`
            );

        item.classList.remove(
            "active",
            "completed",
            "revealed",
            "hidden"
        );

        const result =
            item.querySelector(
                ".sidebar-result"
            );

        result.textContent = "";
    }
}


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

    result.textContent =
        resultText;
}


// ========================================
// PERMANENTLY REMOVE STEPS 1-4
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
// SHOW CURRENT STEP
// ========================================

function showCurrentStep() {

    stepCounter.textContent =
        `Step ${currentStep} of 10`;

    answerArea.innerHTML = "";

    feedback.textContent = "";

    feedback.className = "";

    continueButton.classList.add(
        "hidden"
    );

    setSidebarActive(
        currentStep
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
// STEP 1
// ========================================

function showStep1() {

    stepTitle.textContent =
        "Step 1: Groups of 12";

    const result =
        solution.step1;

    question.innerHTML =
        `The last two digits of the year are
        <strong>${result.lastTwoDigits}</strong>.<br><br>

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
// STEP 2
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

        <br><br>

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
// STEP 3
// ========================================

function showStep3() {

    stepTitle.textContent =
        "Step 3: Groups of 4";

    const result =
        solution.step3;

    question.innerHTML =
        `Take the answer from the last step,
        <strong>${result.leftover}</strong>.

        <br><br>

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
// STEP 4
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

        18 = Friday (5)<br>
        19 = Wednesday (3)<br>
        20 = Tuesday (2)<br>
        21 = Sunday (0)

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
// STEP 5
// ========================================

function showStep5() {

    stepTitle.textContent =
        "Step 5: Add Everything";

    const result =
        solution.step5;

    question.innerHTML =
        `Hopefully you've memorized your
        answers so far!

        <br><br>

        Add these results together...

        <br><br>

        <strong>What's the result?</strong>`;

    createNumberButtons(
        0,
        30,
        result.sum
    );
}


// ========================================
// STEP 6
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

        <br><br>

        What's left over?`;

    createNumberButtons(
        0,
        6,
        result.leftover
    );
}


// ========================================
// STEP 7
// ========================================

function showStep7() {

    stepTitle.textContent =
        "Step 7: Find the Year's Doomsday";

    const result =
        solution.step7;

    question.innerHTML =
        `This leftover number is the weekday
        of ${currentDate.year}'s Doomsday dates!

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
        6 = "SIXurday" (Saturday)

        <br><br>

        Using the mnemonic above, what weekday
        does this number represent?`;

    createWeekdayButtons(
        result.weekdayNumber
    );
}


// ========================================
// STEP 8
// LEAP YEAR
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
// STEP 9
// MONTH'S DOOMSDAY
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
        9/5, 10/10, 11/7, and 12/12

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

    // Only show valid dates for this month.
    // For example, March should offer 14,
    // rather than every possible day.

    createMonthDoomsdayButtons(
        currentDate.month,
        result.doomsdayDate
    );
}


// ========================================
// STEP 10 PART 1
// ========================================

function showStep10Part1() {

    stepTitle.textContent =
        "Step 10: Count by Weeks";

    const result =
        solution.step10;

    const direction =
        result.difference >= 0
            ? "forward"
            : "back";

    question.innerHTML =
        `Every 7 days lands on the same weekday.

        <br><br>

        Starting at our Doomsday date
        <strong>
        ${months[currentDate.month]}
        ${result.doomsdayDate}
        </strong>,

        which was a
        <strong>
        ${solution.step7.weekdayName}
        </strong>,

        count ${direction} by 7 until you're
        within one week of the target date.

        <br><br>

        <strong>
        How many full weeks can you move?
        </strong>`;

    createNumberButtons(
        0,
        4,
        result.fullWeeks
    );
}


// ========================================
// STEP 10 PART 2
// ========================================

function showStep10Part2() {

    stepTitle.textContent =
        "Step 10: Find the Weekday";

    const result =
        solution.step10;

    const direction =
        result.difference >= 0
            ? "forward"
            : "backward";

    const aheadBehind =
        result.difference >= 0
            ? "ahead of"
            : "behind";

    const weeks =
        result.fullWeeks === 1
            ? "week"
            : "weeks";

    const days =
        result.remainingDays === 1
            ? "day"
            : "days";

    // Determine the date after moving
    // the full weeks.

    let intermediateDay =
        result.doomsdayDate;

    if (result.difference >= 0) {

        intermediateDay +=
            result.fullWeeks * 7;

    } else {

        intermediateDay -=
            result.fullWeeks * 7;
    }

    question.innerHTML =
        `Great, you've moved
        <strong>${result.fullWeeks}</strong>
        ${weeks} ${direction}!

        <br><br>

        You are now at
        <strong>
        ${months[currentDate.month]}
        ${intermediateDay}
        </strong>,

        and are
        <strong>${result.remainingDays}</strong>
        ${days} ${aheadBehind} your target.

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
// MONTH DOOMSDAY BUTTONS
// ========================================

function createMonthDoomsdayButtons(
    month,
    correctAnswer
) {

    let dates = [];

    if (month === 1) {

        dates = [3, 4];

    } else if (month === 2) {

        dates = [28, 29];

    } else {

        const standardDates = {

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

        dates = [
            standardDates[month]
        ];
    }

    dates.forEach(
        function(date) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer-button";

            button.textContent =
                `${month}/${date}`;

            button.addEventListener(
                "click",
                function() {

                    checkAnswer(
                        date,
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
// ANSWER CHECKING
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
// CORRECT ANSWER
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

    // Step 5 is the moment where the
    // memory prompts disappear forever.

    if (currentStep === 5) {

        permanentlyRemoveSteps1to4();
    }
}


// ========================================
// INCORRECT ANSWER
// ========================================

function handleIncorrectAnswer() {

    feedback.className =
        "incorrect";

    feedback.textContent =
        "Not quite! Try again.";

    // Step 5 deliberately does NOT reveal
    // Steps 1-4 anymore.
    //
    // They are now permanently hidden after
    // Step 5 has been reached.
}


// ========================================
// SIDEBAR RESULTS
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
                solution.step9.doomsdayDate
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
// CORRECT EXPLANATIONS
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
                ${months[currentDate.month]}
                ${solution.step9.doomsdayDate}
                is this month's Doomsday.
            `;


        case 10:

            return `
                ✓ Correct! You can move
                ${solution.step10.fullWeeks}
                full week(s).
            `;


        case 11:

            return `
                ✓ Correct!
                ${months[currentDate.month]}
                ${currentDate.day}
                is a
                ${solution.step10.finalWeekday}.
            `;
    }
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
// CONTINUE BUTTON
// ========================================

continueButton.addEventListener(
    "click",
    function() {

        // Step 10 Part 1 → Part 2
        if (currentStep === 10) {

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
        if (currentStep === 11) {

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

        // Normal progression
        currentStep++;

        answerArea.innerHTML = "";

        showCurrentStep();
    }
);


// ========================================
// COMPLETION
// ========================================

function showCompletion() {

    stepCounter.textContent =
        "Tutorial Complete!";

    stepTitle.textContent =
        "You solved it!";

    question.innerHTML =
        `The day of the week for

        <strong>
        ${months[currentDate.month]}
        ${currentDate.day},
        ${currentDate.year}
        </strong>

        is:`;

    answerArea.innerHTML = `
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
        `You completed all 10 steps!`;

    continueButton.classList.add(
        "hidden"
    );

    completeSidebarStep(
        10,
        solution.step10.finalWeekdayName
    );
}


// ========================================
// NEW DATE
// ========================================

newDateButton.addEventListener(
    "click",
    function() {

        startTutorial();
    }
);


// ========================================
// BACK HOME
// ========================================

backHomeButton.addEventListener(
    "click",
    function() {

        tutorialScreen.classList.add(
            "hidden"
        );

        homeScreen.classList.remove(
            "hidden"
        );

        homeMessage.textContent = "";
    }
);


// ========================================
// INITIAL SCREEN
// ========================================

homeScreen.classList.remove(
    "hidden"
);

tutorialScreen.classList.add(
    "hidden"
);

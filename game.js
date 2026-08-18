// ========================================
// DOOMSDAY TRAINER
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

    const remainder =
        lastTwoDigits % 12;

    return {
        remainder
    };
}


// ========================================
// STEP 3
// ========================================

function step3(year) {

    const remainder =
        step2(year).remainder;

    const groupsOf4 =
        Math.floor(
            remainder / 4
        );

    return {
        remainder,
        groupsOf4
    };
}


// ========================================
// STEP 4 - CENTURY ANCHOR
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
        weekday: weekdays[anchor]
    };
}


// ========================================
// STEP 5
// ========================================

function step5(year) {

    const s1 = step1(year);
    const s2 = step2(year);
    const s3 = step3(year);
    const s4 = step4(year);

    const sum =
        s1.groupsOf12 +
        s2.remainder +
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

    const remainder =
        sum % 7;

    return {
        sum,
        remainder
    };
}


// ========================================
// STEP 7
// ========================================

function step7(year) {

    const weekdayNumber =
        step6(year).remainder;

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
// MONTH'S DOOMSDAY
// ========================================

function step8(month, year) {

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
// STEP 9
// LEAP YEAR CHECK
// ========================================

function step9(year) {

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

    const groupsOf4 =
        Math.floor(
            numberBeingTested / 4
        );

    const remainder =
        numberBeingTested % 4;

    return {
        numberBeingTested,
        groupsOf4,
        remainder,
        leapYear:
            remainder === 0
    };
}


// ========================================
// STEP 10
// ========================================

function step10(month, day, year) {

    const yearDoomsday =
        step7(year);

    const monthDoomsday =
        step8(month, year);

    const difference =
        day -
        monthDoomsday.doomsdayDate;

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

        finalWeekday,

        finalWeekdayName:
            weekdays[finalWeekday]
    };
}


// ========================================
// COMPLETE SOLUTION
// ========================================

function solveDate(month, day, year) {

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
            step8(month, year),

        step9:
            step9(year),

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
let currentStep;


// Used specifically for Step 5.
// This lets us temporarily reveal the
// sidebar when the player needs help.

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

    return text.charAt(0).toUpperCase() +
        text.slice(1);
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
            "revealed"
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

    item.classList.add("active");
}


function completeSidebarStep(
    step,
    resultText
) {

    const item =
        document.getElementById(
            `sidebar-step-${step}`
        );

    item.classList.remove("active");

    item.classList.add("completed");

    const result =
        item.querySelector(
            ".sidebar-result"
        );

    result.textContent =
        resultText;
}


function revealSidebarStep(step) {

    const item =
        document.getElementById(
            `sidebar-step-${step}`
        );

    item.classList.add(
        "revealed"
    );
}


function hideSidebarSteps1to4() {

    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        const item =
            document.getElementById(
                `sidebar-step-${i}`
            );

        item.classList.add(
            "hidden"
        );
    }
}


function showSidebarSteps1to4() {

    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        const item =
            document.getElementById(
                `sidebar-step-${i}`
            );

        item.classList.remove(
            "hidden"
        );
    }
}


// ========================================
// SHOW STEP
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

    // Reset temporary Step 5 help.
    if (currentStep !== 5) {

        step5HelpShown = false;

        showSidebarSteps1to4();
    }


    // Mark current sidebar step active.
    setSidebarActive(currentStep);


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
            showStep10();
            break;

        case 11:
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
        `Take the last two digits of the year.<br><br>
         How many times can 12 fit into
         <strong>${result.lastTwoDigits}</strong>?`;

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
        "Step 2: Find the Remainder";

    const result =
        solution.step2;

    const lastTwo =
        solution.step1.lastTwoDigits;

    question.innerHTML =
        `Take away 12 from
         <strong>${lastTwo}</strong>
         until you can't anymore.<br><br>
         What is left over?`;

    createNumberButtons(
        0,
        11,
        result.remainder
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
        `Take the remainder from Step 2:
         <strong>${result.remainder}</strong>.<br><br>
         How many times can 4 fit into it?`;

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
         <strong>${result.century}</strong>.<br><br>
         What is the century anchor?`;

    createWeekdayButtons(
        result.anchor
    );
}


// ========================================
// STEP 5
// ========================================

function showStep5() {

    stepTitle.textContent =
        "Step 5: Add Everything";

    // Hide Steps 1-4 to force recall.
    hideSidebarSteps1to4();

    const s1 =
        solution.step1.groupsOf12;

    const s2 =
        solution.step2.remainder;

    const s3 =
        solution.step3.groupsOf4;

    const s4 =
        solution.step4.anchor;

    question.innerHTML =
        `Now remember the four results
         you just calculated.<br><br>
         Add them together.<br><br>
         <strong>What is the total?</strong>`;

    createNumberButtons(
        0,
        30,
        solution.step5.sum
    );
}


// ========================================
// STEP 6
// ========================================

function showStep6() {

    stepTitle.textContent =
        "Step 6: Reduce by 7";

    const sum =
        solution.step5.sum;

    question.innerHTML =
        `Take away 7 repeatedly from
         <strong>${sum}</strong>.<br><br>
         What is the remainder?`;

    createNumberButtons(
        0,
        6,
        solution.step6.remainder
    );
}


// ========================================
// STEP 7
// ========================================

function showStep7() {

    stepTitle.textContent =
        "Step 7: Find the Doomsday";

    const answer =
        solution.step7.weekdayNumber;

    question.innerHTML =
        `Use your weekday mnemonic.<br><br>
         What weekday is number
         <strong>${answer}</strong>?`;

    createWeekdayButtons(
        answer
    );
}


// ========================================
// STEP 8
// ========================================

function showStep8() {

    stepTitle.textContent =
        "Step 8: Find the Month's Doomsday";

    const month =
        currentDate.month;

    const answer =
        solution.step8.doomsdayDate;

    let prompt =
        `What is the memorized Doomsday date
         for <strong>${months[month]}</strong>?`;

    // For January/February, explain that
    // there are two possibilities and Step 9
    // will determine which one applies.

    if (
        month === 1 ||
        month === 2
    ) {

        prompt += `
            <br><br>
            Remember: January and February
            have different dates in leap years.
        `;
    }

    question.innerHTML =
        prompt;

    createNumberButtons(
        1,
        new Date(
            currentDate.year,
            month,
            0
        ).getDate(),
        answer
    );
}


// ========================================
// STEP 9
// ========================================

function showStep9() {

    stepTitle.textContent =
        "Step 9: Check for a Leap Year";

    const result =
        solution.step9;

    let explanation;

    if (
        result.numberBeingTested ===
        0
    ) {

        explanation =
            `Use the century's first two digits.`;

    } else {

        explanation =
            `Use the last two digits:
             <strong>
             ${result.numberBeingTested}
             </strong>.`;
    }

    question.innerHTML =
        `${explanation}<br><br>
         Can you divide it by 4
         with no remainder?`;

    createYesNoButtons(
        result.leapYear
    );
}


// ========================================
// STEP 10 - PART 1
// ========================================

function showStep10() {

    stepTitle.textContent =
        "Step 10: Find the Final Date";

    const result =
        solution.step10;

    question.innerHTML =
        `First, let's figure out how far the
         target date is from the month's
         Doomsday.<br><br>

         The month's Doomsday is
         <strong>
         ${months[currentDate.month]}
         ${result.doomsdayDate}
         </strong>.<br><br>

         How many days away is the target date?`;

    createNumberButtons(
        -31,
        31,
        result.difference
    );
}


// ========================================
// STEP 10 - PART 2
// ========================================

function showStep10Part2() {

    stepTitle.textContent =
        "Step 10: Count by Weeks";

    const result =
        solution.step10;

    const difference =
        result.difference;

    const direction =
        difference >= 0
            ? "forward"
            : "backward";

    const absoluteDifference =
        Math.abs(difference);

    question.innerHTML =
        `Now use the fact that every 7 days
         lands on the same weekday.<br><br>

         Start at
         <strong>
         ${months[currentDate.month]}
         ${result.doomsdayDate}
         </strong>,
         which was a
         <strong>
         ${solution.step7.weekdayName}
         </strong>.<br><br>

         Count ${direction} in increments of
         7 until you're within one week of
         the target date.<br><br>

         How many full weeks can you move?`;

    const fullWeeks =
        Math.floor(
            absoluteDifference / 7
        );

    createNumberButtons(
        0,
        4,
        fullWeeks
    );
}


// ========================================
// STEP 10 - PART 3
// ========================================

function showStep10Part3() {

    stepTitle.textContent =
        "Step 10: Finish the Count";

    const result =
        solution.step10;

    const difference =
        result.difference;

    const absoluteDifference =
        Math.abs(difference);

    const fullWeeks =
        Math.floor(
            absoluteDifference / 7
        );

    const remainingDays =
        absoluteDifference % 7;

    const direction =
        difference >= 0
            ? "forward"
            : "backward";

    let intermediateDate =
        result.doomsdayDate;

    if (difference >= 0) {

        intermediateDate +=
            fullWeeks * 7;

    } else {

        intermediateDate -=
            fullWeeks * 7;
    }

    question.innerHTML =
        `Excellent.<br><br>

         You moved ${fullWeeks} full week(s)
         ${direction}.<br><br>

         Now you're at
         <strong>
         ${months[currentDate.month]}
         ${intermediateDate}
         </strong>.<br><br>

         You are ${remainingDays} day(s)
         away from the target.<br><br>

         Which weekday is the target date?`;

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
}


// ========================================
// INCORRECT ANSWER
// ========================================

function handleIncorrectAnswer() {

    feedback.className =
        "incorrect";

    feedback.textContent =
        "Not quite! Try again.";

    // Special Step 5 behavior:
    // reveal Steps 1-4 when the player
    // needs help remembering them.

    if (
        currentStep === 5 &&
        !step5HelpShown
    ) {

        step5HelpShown = true;

        showSidebarSteps1to4();

        for (
            let i = 1;
            i <= 4;
            i++
        ) {

            revealSidebarStep(i);
        }

        feedback.innerHTML =
            `Not quite!<br>
             I've revealed your previous
             four results. Use them to
             calculate the sum, then try again.`;
    }
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
                solution.step2.remainder
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
                `${solution.step4.weekday}
                 (${solution.step4.anchor})`
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
                solution.step6.remainder
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
                solution.step8.doomsdayDate
            );

            break;


        case 9:

            completeSidebarStep(
                9,
                solution.step9.leapYear
                    ? "Yes"
                    : "No"
            );

            break;


        case 10:

            completeSidebarStep(
                10,
                solution.step10.finalWeekdayName
            );

            break;
    }
}


// ========================================
// CORRECT EXPLANATIONS
// ========================================

function getCorrectExplanation() {

    switch (currentStep) {

        case 1: {

            const r =
                solution.step1;

            return `
                ✓ Correct! ${r.lastTwoDigits}
                contains ${r.groupsOf12}
                group(s) of 12.
            `;
        }


        case 2: {

            return `
                ✓ Correct! The remainder is
                ${solution.step2.remainder}.
            `;
        }


        case 3: {

            const r =
                solution.step3;

            return `
                ✓ Correct! ${r.remainder}
                contains ${r.groupsOf4}
                group(s) of 4.
            `;
        }


        case 4: {

            const r =
                solution.step4;

            return `
                ✓ Correct!
                The century anchor is
                ${r.weekday} (${r.anchor}).
            `;
        }


        case 5: {

            const s1 =
                solution.step1.groupsOf12;

            const s2 =
                solution.step2.remainder;

            const s3 =
                solution.step3.groupsOf4;

            const s4 =
                solution.step4.anchor;

            const total =
                solution.step5.sum;

            return `
                ✓ Correct!<br>
                ${s1} + ${s2} + ${s3} + ${s4}
                = ${total}.
            `;
        }


        case 6: {

            return `
                ✓ Correct!
                ${solution.step5.sum}
                reduced by 7 leaves
                ${solution.step6.remainder}.
            `;
        }


        case 7: {

            return `
                ✓ Correct!
                ${solution.step7.weekdayNumber}
                = ${solution.step7.weekdayName}.<br>
                This year's Doomsday is
                ${solution.step7.weekdayName}.
            `;
        }


        case 8: {

            return `
                ✓ Correct!
                ${months[currentDate.month]}
                ${solution.step8.doomsdayDate}
                is the month's Doomsday.
            `;
        }


        case 9: {

            return solution.step9.leapYear
                ? "✓ Correct! This is a leap year."
                : "✓ Correct! This is not a leap year.";
        }


        case 10: {

            return `
                ✓ Correct! You are
                ${solution.step10.difference >= 0
                    ? "forward"
                    : "backward"}
                from the month's Doomsday.
            `;
        }
    }
}


// ========================================
// DISABLE ANSWERS
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

        // Step 10 has three parts.
        if (currentStep === 10) {

            if (
                !document
                    .getElementById(
                        "step10-part2"
                    )
            ) {

                currentStep = 10;

                showStep10Part2();

                return;
            }
        }

        // We need to distinguish the three
        // Step 10 screens with a state variable.
    }
);


// ========================================
// STEP 10 SUB-STATE
// ========================================

let step10Part = 0;


function advanceTutorial() {

    if (currentStep === 10) {

        if (step10Part === 0) {

            step10Part = 1;

            showStep10Part2();

            return;
        }

        if (step10Part === 1) {

            step10Part = 2;

            showStep10Part3();

            return;
        }

        if (step10Part === 2) {

            currentStep = 11;

            step10Part = 0;

            showCurrentStep();

            return;
        }
    }

    currentStep++;

    showCurrentStep();
}


// Replace the initial Continue listener
// with the actual progression function.

continueButton.onclick =
    function() {

        advanceTutorial();
    };


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

    // Mark final sidebar item.
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
// START ON HOME SCREEN
// ========================================

homeScreen.classList.remove(
    "hidden"
);

tutorialScreen.classList.add(
    "hidden"
);

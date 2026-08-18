// ========================================
// DOOMSDAY TRAINER
// Interactive Tutorial Prototype
// ========================================


// ----------------------------------------
// BASIC DATA
// ----------------------------------------

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


// Century anchors:
//
// 1800s = Friday = 5
// 1900s = Wednesday = 3
// 2000s = Tuesday = 2
// 2100s = Sunday = 0
//
// The pattern repeats every four centuries.

const centuryAnchors = {
    0: 2,
    1: 0,
    2: 5,
    3: 3
};


// ----------------------------------------
// RANDOM DATE
// ----------------------------------------

function generateRandomDate() {

    // For now, keep the range relatively familiar.
    // We can expand this later.
    const year = randomInteger(1800, 2199);

    const month = randomInteger(1, 12);

    const daysInThisMonth = new Date(
        year,
        month,
        0
    ).getDate();

    const day = randomInteger(1, daysInThisMonth);

    return {
        year: year,
        month: month,
        day: day
    };
}


function randomInteger(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


// ----------------------------------------
// STEP 1
// How many groups of 12?
// ----------------------------------------

function step1(year) {

    const lastTwoDigits = year % 100;

    const groupsOf12 =
        Math.floor(lastTwoDigits / 12);

    return {
        lastTwoDigits: lastTwoDigits,
        groupsOf12: groupsOf12
    };
}


// ----------------------------------------
// STEP 2
// What's left after removing 12s?
// ----------------------------------------

function step2(year) {

    const lastTwoDigits = year % 100;

    const remainder =
        lastTwoDigits % 12;

    return {
        remainder: remainder
    };
}


// ----------------------------------------
// STEP 3
// How many groups of 4?
// ----------------------------------------

function step3(year) {

    const remainder =
        step2(year).remainder;

    const groupsOf4 =
        Math.floor(remainder / 4);

    return {
        remainder: remainder,
        groupsOf4: groupsOf4
    };
}


// ----------------------------------------
// STEP 4
// CENTURY ANCHOR
// ----------------------------------------

function step4(year) {

    const century =
        Math.floor(year / 100);

    const anchor =
        centuryAnchors[century % 4];

    return {
        century: century,
        anchor: anchor,
        weekday: weekdays[anchor]
    };
}


// ----------------------------------------
// STEP 5
// Add everything together
// ----------------------------------------

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
        sum: sum
    };
}


// ----------------------------------------
// STEP 6
// Reduce by 7
// ----------------------------------------

function step6(year) {

    const sum =
        step5(year).sum;

    const remainder =
        sum % 7;

    return {
        sum: sum,
        remainder: remainder
    };
}


// ----------------------------------------
// STEP 7
// Weekday of the year's Doomsday
// ----------------------------------------

function step7(year) {

    const weekdayNumber =
        step6(year).remainder;

    return {
        weekdayNumber: weekdayNumber,
        weekdayName: weekdays[weekdayNumber]
    };
}


// ----------------------------------------
// LEAP YEAR
// ----------------------------------------

function isLeapYear(year) {

    const lastTwoDigits =
        year % 100;

    // If the year ends in 00,
    // use the first two digits.
    if (lastTwoDigits === 0) {

        const firstTwoDigits =
            Math.floor(year / 100);

        return firstTwoDigits % 4 === 0;
    }

    return lastTwoDigits % 4 === 0;
}


// ----------------------------------------
// STEP 8
// Month's Doomsday date
// ----------------------------------------

function step8(month, year) {

    const leapYear =
        isLeapYear(year);

    if (month === 1) {

        return {
            doomsdayDate: leapYear ? 4 : 3,
            leapYear: leapYear
        };
    }

    if (month === 2) {

        return {
            doomsdayDate: leapYear ? 29 : 28,
            leapYear: leapYear
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
        doomsdayDate: doomsdayDates[month],
        leapYear: leapYear
    };
}


// ----------------------------------------
// STEP 9
// Leap year check
// ----------------------------------------

function step9(year) {

    const leap =
        isLeapYear(year);

    const lastTwoDigits =
        year % 100;

    let groupsOf4;
    let remainder;

    if (lastTwoDigits === 0) {

        const firstTwoDigits =
            Math.floor(year / 100);

        groupsOf4 =
            Math.floor(firstTwoDigits / 4);

        remainder =
            firstTwoDigits % 4;

    } else {

        groupsOf4 =
            Math.floor(lastTwoDigits / 4);

        remainder =
            lastTwoDigits % 4;
    }

    return {
        leapYear: leap,
        groupsOf4: groupsOf4,
        remainder: remainder
    };
}


// ----------------------------------------
// STEP 10
// Count from the month's Doomsday
// to the target date.
// ----------------------------------------

function step10(month, day, year) {

    const doomsday =
        step7(year);

    const monthDoomsday =
        step8(month, year);

    const difference =
        day - monthDoomsday.doomsdayDate;

    const finalWeekday =
        (doomsday.weekdayNumber +
            difference +
            7) % 7;

    return {
        doomsdayDate:
            monthDoomsday.doomsdayDate,

        doomsdayWeekday:
            doomsday.weekdayNumber,

        difference:
            difference,

        finalWeekday:
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
            month: month,
            day: day,
            year: year
        },

        step1: step1(year),

        step2: step2(year),

        step3: step3(year),

        step4: step4(year),

        step5: step5(year),

        step6: step6(year),

        step7: step7(year),

        step8: step8(month, year),

        step9: step9(year),

        step10: step10(
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


// ----------------------------------------
// HTML ELEMENTS
// ----------------------------------------

const stepCounter =
    document.getElementById("step-counter");

const stepTitle =
    document.getElementById("step-title");

const dateDisplay =
    document.getElementById("date-display");

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


// ========================================
// START TUTORIAL
// ========================================

function startTutorial() {

    currentDate =
        generateRandomDate();

    solution =
        solveDate(
            currentDate.month,
            currentDate.day,
            currentDate.year
        );

    currentStep = 1;

    updateDateDisplay();

    showCurrentStep();
}


// ----------------------------------------
// Display the date
// ----------------------------------------

function updateDateDisplay() {

    dateDisplay.textContent =
        `${months[currentDate.month]} ` +
        `${currentDate.day}, ` +
        `${currentDate.year}`;
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

    continueButton.classList.add("hidden");

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
    }
}


// ========================================
// STEP 1 UI
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
// STEP 2 UI
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
// STEP 3 UI
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
// STEP 4 UI
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
// STEP 5 UI
// ========================================

function showStep5() {

    stepTitle.textContent =
        "Step 5: Add Everything";

    const s1 =
        solution.step1.groupsOf12;

    const s2 =
        solution.step2.remainder;

    const s3 =
        solution.step3.groupsOf4;

    const s4 =
        solution.step4.anchor;

    const answer =
        solution.step5.sum;

    question.innerHTML =
        `${s1} + ${s2} + ${s3} + ${s4}
         = ?`;

    createNumberButtons(
        0,
        30,
        answer
    );
}


// ========================================
// STEP 6 UI
// ========================================

function showStep6() {

    stepTitle.textContent =
        "Step 6: Reduce by 7";

    const sum =
        solution.step5.sum;

    const answer =
        solution.step6.remainder;

    question.innerHTML =
        `Take away 7 repeatedly from
         <strong>${sum}</strong>.<br><br>
         What is the remainder?`;

    createNumberButtons(
        0,
        6,
        answer
    );
}


// ========================================
// STEP 7 UI
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
// STEP 8 UI
// ========================================

function showStep8() {

    stepTitle.textContent =
        "Step 8: Find the Month's Doomsday";

    const month =
        currentDate.month;

    const answer =
        solution.step8.doomsdayDate;

    question.innerHTML =
        `What is the memorized Doomsday date
         for <strong>${months[month]}</strong>?`;

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
// STEP 9 UI
// ========================================

function showStep9() {

    stepTitle.textContent =
        "Step 9: Check for a Leap Year";

    const year =
        currentDate.year;

    const lastTwo =
        year % 100;

    let explanation;

    if (lastTwo === 0) {

        const firstTwo =
            Math.floor(year / 100);

        explanation =
            `Since the last two digits are 00,
             use the first two digits:
             <strong>${firstTwo}</strong>.`;

    } else {

        explanation =
            `Use the last two digits:
             <strong>${lastTwo}</strong>.`;
    }

    question.innerHTML =
        `${explanation}<br><br>
         Can you make groups of 4
         with no remainder?`;

    createYesNoButtons(
        solution.step9.leapYear
    );
}


// ========================================
// STEP 10 UI
// ========================================

function showStep10() {

    stepTitle.textContent =
        "Step 10: Find the Final Day";

    const result =
        solution.step10;

    const doomsdayDate =
        result.doomsdayDate;

    const difference =
        result.difference;

    question.innerHTML =
        `The month's Doomsday is
         <strong>${months[currentDate.month]}
         ${doomsdayDate}</strong>.<br><br>
         It is a
         <strong>${solution.step7.weekdayName}</strong>.<br><br>
         How many days away is your target date?`;

    createNumberButtons(
        -31,
        31,
        difference
    );
}


// ========================================
// BUTTON CREATION
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
            document.createElement("button");

        button.className =
            "answer-button";

        button.textContent =
            number;

        button.addEventListener(
            "click",
            function () {

                checkAnswer(
                    number,
                    correctAnswer
                );
            }
        );

        answerArea.appendChild(button);
    }
}


// ----------------------------------------
// Weekday buttons
// ----------------------------------------

function createWeekdayButtons(
    correctAnswer
) {

    weekdays.forEach(
        function (weekday, index) {

            const button =
                document.createElement("button");

            button.className =
                "answer-button";

            button.textContent =
                weekday;

            button.addEventListener(
                "click",
                function () {

                    checkAnswer(
                        index,
                        correctAnswer
                    );
                }
            );

            answerArea.appendChild(button);
        }
    );
}


// ----------------------------------------
// Yes / No buttons
// ----------------------------------------

function createYesNoButtons(
    correctAnswer
) {

    const yesButton =
        document.createElement("button");

    yesButton.className =
        "answer-button";

    yesButton.textContent =
        "Yes — it's a leap year";

    yesButton.addEventListener(
        "click",
        function () {

            checkAnswer(
                true,
                correctAnswer
            );
        }
    );


    const noButton =
        document.createElement("button");

    noButton.className =
        "answer-button";

    noButton.textContent =
        "No — it's not a leap year";

    noButton.addEventListener(
        "click",
        function () {

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
// CHECK ANSWER
// ========================================

function checkAnswer(
    playerAnswer,
    correctAnswer
) {

    if (playerAnswer === correctAnswer) {

        feedback.className =
            "correct";

        feedback.innerHTML =
            getCorrectExplanation();

        disableAnswerButtons();

        continueButton.classList.remove(
            "hidden"
        );

    } else {

        feedback.className =
            "incorrect";

        feedback.textContent =
            "Not quite! Try again.";
    }
}


// ========================================
// EXPLANATIONS AFTER CORRECT ANSWERS
// ========================================

function getCorrectExplanation() {

    switch (currentStep) {

        case 1: {

            const r =
                solution.step1;

            return `
                ✓ Correct! ${r.lastTwoDigits}
                ÷ 12 gives ${r.groupsOf12}
                group(s), with a remainder.
            `;
        }


        case 2: {

            const r =
                solution.step2;

            return `
                ✓ Correct! The remainder is
                ${r.remainder}.
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
                ✓ Correct! The century anchor
                is ${r.weekday} (${r.anchor}).
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

            const sum =
                solution.step5.sum;

            const remainder =
                solution.step6.remainder;

            return `
                ✓ Correct! ${sum} reduced
                by 7 leaves ${remainder}.
            `;
        }


        case 7: {

            const r =
                solution.step7;

            return `
                ✓ Correct!
                ${r.weekdayNumber}
                = ${r.weekdayName}.<br>
                Therefore, this year's
                Doomsday is ${r.weekdayName}.
            `;
        }


        case 8: {

            const r =
                solution.step8;

            return `
                ✓ Correct! The month's Doomsday
                date is the ${r.doomsdayDate}.
            `;
        }


        case 9: {

            if (solution.step9.leapYear) {

                return `
                    ✓ Correct! This IS a leap year.
                `;

            } else {

                return `
                    ✓ Correct! This is NOT a leap year.
                `;
            }
        }


        case 10: {

            const r =
                solution.step10;

            return `
                ✓ Correct! The target date is
                <strong>${r.finalWeekdayName}</strong>.
            `;
        }
    }
}


// ========================================
// DISABLE BUTTONS AFTER CORRECT ANSWER
// ========================================

function disableAnswerButtons() {

    const buttons =
        document.querySelectorAll(
            ".answer-button"
        );

    buttons.forEach(
        function (button) {
            button.disabled = true;
        }
    );
}


// ========================================
// CONTINUE
// ========================================

continueButton.addEventListener(
    "click",
    function () {

        currentStep++;

        if (currentStep <= 10) {

            showCurrentStep();

        } else {

            showCompletion();
        }
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
}


// ========================================
// NEW DATE
// ========================================

newDateButton.addEventListener(
    "click",
    function () {

        startTutorial();
    }
);


// ========================================
// START!
// ========================================

startTutorial();

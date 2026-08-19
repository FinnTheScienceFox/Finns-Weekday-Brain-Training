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
    leap years use the second date.
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

    These are represented numerically according to the
    user's system:

    1600s = Tuesday (2)
    1700s = Sunday (0)
    1800s = Friday (5)
    1900s = Wednesday (3)
    2000s = Tuesday (2)
    2100s = Sunday (0)
    etc.
*/

const CENTURY_ANCHORS = {
    0: 2,
    1: 0,
    2: 5,
    3: 3
};


/* =========================================================
   CORRECT MESSAGES
========================================================= */

const CORRECT_MESSAGES = [
    "Correct! 🎉",
    "Good Job! 🎉",
    "Spot On! 🎉",
    "Nice One! 🎉",
    "Perfect! 🎉",
    "Awesome! 🎉",
    "Keep It Up! 🎉"
];


function randomCorrectMessage() {
    return CORRECT_MESSAGES[
        Math.floor(Math.random() * CORRECT_MESSAGES.length)
    ];
}


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    currentMode: null,

    tutorial: {
        date: null,
        step: 0,
        answers: {},
        selectedAnswer: null,
        answered: false
    },

    endless: {
        date: null,
        streak: 0,
        selectedAnswer: null,
        answered: false
    },

    guided: {
        date: null,
        hintsRemaining: 3,
        usedHints: [],
        selectedAnswer: null,
        answered: false
    },

    quiz: {
        total: 10,
        current: 0,
        correct: 0,
        date: null,
        selectedAnswer: null,
        answered: false,
        timer: null,
        seconds: 0
    },

    practice: {
        category: null,
        question: null,
        answer: null,
        answered: false
    }

};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
    });

    $("home-screen").classList.add("hidden");

    $(id).classList.remove("hidden");
}


function showHome() {

    transitionTo(() => {

        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.add("hidden");
        });

        $("home-screen").classList.remove("hidden");

        resetTutorialCompletely();
        resetEndless();
        resetGuided();
        resetPractice();

    });

}


function transitionTo(callback) {

    const transition = $("screen-transition");

    transition.style.transition = "opacity 0.15s ease-in";

    transition.style.opacity = "1";

    setTimeout(() => {

        callback();

        transition.style.transition = "opacity 0.2s ease-out";

        transition.style.opacity = "0";

    }, 150);
}


/* =========================================================
   DATE HELPERS
========================================================= */

function randomDate(minYear, maxYear) {

    const year =
        Math.floor(
            Math.random() * (maxYear - minYear + 1)
        ) + minYear;

    const month =
        Math.floor(Math.random() * 12) + 1;

    const daysInMonth =
        new Date(year, month, 0).getDate();

    const day =
        Math.floor(Math.random() * daysInMonth) + 1;

    return {
        year,
        month,
        day
    };
}


function formatDate(date) {

    return `${MONTHS[date.month - 1]} ${date.day}, ${date.year}`;
}


function formatMonthDay(month, day) {

    return `${MONTHS[month - 1]} ${day}`;
}


function dateToJS(date) {

    return new Date(
        date.year,
        date.month - 1,
        date.day
    );
}


function daysBetween(a, b) {

    const oneDay = 1000 * 60 * 60 * 24;

    return Math.round(
        (dateToJS(b) - dateToJS(a)) / oneDay
    );
}


/* =========================================================
   DOOMSDAY ALGORITHM
========================================================= */

function isLeapYear(year) {

    if (year % 400 === 0) {
        return true;
    }

    if (year % 100 === 0) {
        return false;
    }

    return year % 4 === 0;
}


/*
    Step 1:
    How many groups of 12 fit in the final two digits?
*/

function step1(year) {

    const lastTwo = year % 100;

    return Math.floor(lastTwo / 12);
}


/*
    Step 2:
    Take away 12 until you can't.

    This is simply the leftover after dividing by 12.
*/

function step2(year) {

    const lastTwo = year % 100;

    return lastTwo % 12;
}


/*
    Step 3:
    How many groups of 4 fit into Step 2?
*/

function step3(year) {

    return Math.floor(step2(year) / 4);
}


/*
    Step 4:
    Century anchor number.

    The pattern cycles:

    1800 -> 5
    1900 -> 3
    2000 -> 2
    2100 -> 0
    2200 -> 5
    etc.

    We use the actual century number rather than a
    weekday string.
*/

function step4(year) {

    const century = Math.floor(year / 100);

    const cycleIndex =
        ((century % 4) + 4) % 4;

    return CENTURY_ANCHORS[cycleIndex];
}


/*
    Step 5
*/

function step5(year) {

    return (
        step1(year) +
        step2(year) +
        step3(year) +
        step4(year)
    );
}


/*
    Step 6
*/

function step6(year) {

    return step5(year) % 7;
}


/*
    Step 7
*/

function step7(year) {

    return step6(year);
}


/*
    Get the Doomsday date for a particular month.
*/

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


/*
    Find the weekday for a complete date.
*/

function calculateWeekday(date) {

    const doomsday = step7(date.year);

    const doomDate =
        getDoomsdayDate(date.year, date.month);

    const difference =
        date.day - doomDate;

    return (
        (doomsday + difference) % 7 + 7
    ) % 7;
}


/* =========================================================
   ANSWER BUTTONS
========================================================= */

function createAnswerButtons(
    container,
    answers,
    selectedValueCallback
) {

    container.innerHTML = "";

    answers.forEach(answer => {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.textContent = answer.label;

        button.dataset.value = answer.value;

        button.addEventListener("click", () => {

            container
                .querySelectorAll(".answer-button")
                .forEach(btn => {
                    btn.classList.remove("selected");
                });

            button.classList.add("selected");

            selectedValueCallback(answer.value);

        });

        container.appendChild(button);

    });
}


function numericAnswers(min, max, plusPositive = false) {

    const answers = [];

    for (let i = min; i <= max; i++) {

        let label = String(i);

        if (plusPositive && i > 0) {
            label = "+" + i;
        }

        answers.push({
            value: i,
            label
        });
    }

    return answers;
}


function weekdayAnswers() {

    return WEEKDAYS.map((day, index) => ({
        value: index,
        label: day
    }));

}


/* =========================================================
   SENTENCE FORMATTING
========================================================= */

function setSentences(element, text) {

    element.innerHTML = "";

    const sentences =
        text
            .match(/[^.!?]+[.!?]+/g) || [text];

    sentences.forEach(sentence => {

        const div =
            document.createElement("div");

        div.className = "sentence";

        div.textContent = sentence.trim();

        element.appendChild(div);

    });
}


/*
    Question text always goes in the question box.

    Explanatory sentences always go in the main box.
*/

function setTutorialContent(info, question) {

    setSentences(
        $("tutorial-main-text"),
        info
    );

    $("tutorial-question").textContent =
        question;
}


/* =========================================================
   SIDEBAR
========================================================= */

function resetTutorialSidebar() {

    for (let i = 1; i <= 10; i++) {

        const item =
            $(`sidebar-step-${i}`);

        item.classList.remove(
            "active",
            "completed"
        );

        item.querySelector(
            ".sidebar-result"
        ).textContent = "";

    }

}


function updateTutorialSidebar() {

    for (let i = 1; i <= 10; i++) {

        const item =
            $(`sidebar-step-${i}`);

        item.classList.remove(
            "active",
            "completed"
        );

        const result =
            item.querySelector(
                ".sidebar-result"
            );

        result.textContent = "";

        if (state.tutorial.answers[i] !== undefined) {

            item.classList.add("completed");

            result.textContent =
                state.tutorial.answers[i];

        }

        if (state.tutorial.step === i) {
            item.classList.add("active");
        }

    }

}


/* =========================================================
   TUTORIAL RESET
========================================================= */

function resetTutorialCompletely() {

    state.tutorial.date = null;
    state.tutorial.step = 0;
    state.tutorial.answers = {};
    state.tutorial.selectedAnswer = null;
    state.tutorial.answered = false;

    resetTutorialSidebar();

}


function startTutorial() {

    resetTutorialCompletely();

    state.currentMode = "tutorial";

    state.tutorial.date =
        randomDate(1800, 2200);

    $("sidebar-date").textContent =
        formatDate(state.tutorial.date);

    $("tutorial-date-display").textContent =
        formatDate(state.tutorial.date);

    showScreen("tutorial-screen");

    renderTutorialStep();

}


/* =========================================================
   TUTORIAL STEP RENDERING
========================================================= */

function renderTutorialStep() {

    const step =
        state.tutorial.step;

    state.tutorial.selectedAnswer = null;
    state.tutorial.answered = false;

    $("tutorial-submit").classList.add("hidden");
    $("tutorial-continue").classList.add("hidden");

    $("tutorial-feedback").innerHTML = "";

    $("tutorial-answer-area").innerHTML = "";

    $("tutorial-step-counter").textContent =
        `Step ${step}`;

    $("tutorial-date-display").textContent =
        formatDate(state.tutorial.date);

    updateTutorialSidebar();


    /* -----------------------------------------
       STEP 0
    ----------------------------------------- */

    if (step === 0) {

        $("tutorial-step-title").textContent =
            "Let's Begin!";

        const dateText =
            formatDate(state.tutorial.date);

        setSentences(
            $("tutorial-main-text"),
            `Hello! I'm Finn, the little guy in the corner cheering you on, and I'm happy you decided to check out my game. For this tutorial, we will be finding the weekday of ${dateText}. Guided questions will help teach the simple step-by-step process, with this date as an example. Press "Continue" if you're ready!`
        );

        $("tutorial-question").textContent = "";

        $("tutorial-continue")
            .classList.remove("hidden");

        $("tutorial-continue").onclick =
            () => {

                state.tutorial.step = 1;

                renderTutorialStep();

            };

        return;
    }


    /* -----------------------------------------
       STEP 1
    ----------------------------------------- */

    if (step === 1) {

        const lastTwo =
            state.tutorial.date.year % 100;

        $("tutorial-step-title").textContent =
            "Step 1";

        setTutorialContent(
            `The last two digits of the year are ${String(lastTwo).padStart(2, "0")}. How many groups of 12 can we make out of ${lastTwo}? (Remember this answer!)`,
            `The last two digits of the year are ${String(lastTwo).padStart(2, "0")}. How many groups of 12 can we make out of ${lastTwo}?`
        );

        renderNumericTutorialAnswers(
            0,
            8,
            1
        );

        return;
    }


    /* -----------------------------------------
       STEP 2
    ----------------------------------------- */

    if (step === 2) {

        const lastTwo =
            state.tutorial.date.year % 100;

        $("tutorial-step-title").textContent =
            "Step 2";

        setTutorialContent(
            `For the last two digits, ${lastTwo}, take 12 away until you can't anymore. What's left over? (Remember this answer!)`,
            `For the last two digits, ${lastTwo}, take 12 away until you can't anymore. What's left over?`
        );

        renderNumericTutorialAnswers(
            0,
            3,
            2
        );

        return;
    }


    /* -----------------------------------------
       STEP 3
    ----------------------------------------- */

    if (step === 3) {

        const answer2 =
            state.tutorial.answers[2];

        $("tutorial-step-title").textContent =
            "Step 3";

        setTutorialContent(
            `Take the answer from the last step, ${answer2}. How many groups of 4 can we make out of ${answer2}? (Remember this answer!)`,
            `Take the answer from the last step, ${answer2}. How many groups of 4 can we make out of ${answer2}?`
        );

        renderNumericTutorialAnswers(
            0,
            3,
            3
        );

        return;
    }


    /* -----------------------------------------
       STEP 4
    ----------------------------------------- */

    if (step === 4) {

        const century =
            Math.floor(
                state.tutorial.date.year / 100
            );

        $("tutorial-step-title").textContent =
            "Step 4";

        setTutorialContent(
            `The first two digits of the year are ${century}. Remember the repeating pattern for century anchors: 18 = Friday (5). 19 = Wednesday (3). 20 = Tuesday (2). 21 = Sunday (0). Using the cycle above, what is the century anchor? (Remember this answer!)`,
            `The first two digits of the year are ${century}. Using the century-anchor cycle, what is the century anchor?`
        );

        renderNumericTutorialAnswers(
            0,
            5,
            4
        );

        return;
    }


    /* -----------------------------------------
       STEP 5
    ----------------------------------------- */

    if (step === 5) {

        $("tutorial-step-title").textContent =
            "Step 5";

        setTutorialContent(
            `Hopefully you've memorized your answers so far! Add these results together. What's the result?`,
            `Hopefully you've memorized your answers so far! Add these results together. What's the result?`
        );

        renderNumericTutorialAnswers(
            0,
            20,
            5
        );

        return;
    }


    /* -----------------------------------------
       STEP 6
    ----------------------------------------- */

    if (step === 6) {

        const sum =
            state.tutorial.answers[5];

        $("tutorial-step-title").textContent =
            "Step 6";

        setTutorialContent(
            `For last question's sum, ${sum}, take 7 away until you can't anymore. What's left over?`,
            `For last question's sum, ${sum}, take 7 away until you can't anymore. What's left over?`
        );

        renderNumericTutorialAnswers(
            0,
            6,
            6
        );

        return;
    }


    /* -----------------------------------------
       STEP 7
    ----------------------------------------- */

    if (step === 7) {

        const leftover =
            state.tutorial.answers[6];

        const year =
            state.tutorial.date.year;

        $("tutorial-step-title").textContent =
            "Step 7";

        setTutorialContent(
            `This leftover number, ${leftover}, is the weekday of ${year}'s Doomsday dates! Remember the mnemonic for numbered weekdays: 0 = "NONEday" (Sunday), 1 = "ONEday" (Monday), 2 = "TWOsday" (Tuesday), 3 = THREE syllables (Wednesday), 4 = "FOURsday" (Thursday), 5 = "FIVEday" (Friday), 6 = "SIXurday" (Saturday).`,
            `Using the mnemonic above, what weekday does this number represent?`
        );

        createAnswerButtons(
            $("tutorial-answer-area"),
            weekdayAnswers(),
            value => {

                state.tutorial.selectedAnswer =
                    Number(value);

                $("tutorial-submit")
                    .classList.remove("hidden");

            }
        );

        return;
    }


    /* -----------------------------------------
       STEP 8
    ----------------------------------------- */

    if (step === 8) {

        $("tutorial-step-title").textContent =
            "Step 8";

        const year =
            state.tutorial.date.year;

        const lastTwo =
            year % 100;

        setTutorialContent(
            `Now, we need to check if this year is a leap year. Take the last two digits of the year, ${lastTwo}. Can you make groups of 4 with NO leftovers?`,
            `Is ${year} a leap year?`
        );

        createAnswerButtons(
            $("tutorial-answer-area"),
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
            value => {

                state.tutorial.selectedAnswer =
                    value === true ||
                    value === "true";

                $("tutorial-submit")
                    .classList.remove("hidden");

            }
        );

        return;
    }


    /* -----------------------------------------
       STEP 9
    ----------------------------------------- */

    if (step === 9) {

        const year =
            state.tutorial.date.year;

        const month =
            state.tutorial.date.month;

        const leap =
            isLeapYear(year);

        $("tutorial-step-title").textContent =
            "Step 9";

        setTutorialContent(
            `Each month has a Doomsday date: 1/3-4, 2/28-29, 3/14, 4/4, 5/9, 6/6, 7/11, 8/8, 9/5, 10/10, 11/7, and 12/12 for each month. This year ${leap ? "is" : "is not"} a leap year, which means the ${leap ? "second" : "first"} number for January and February are their Doomsday dates.`,
            `What is the Doomsday date for ${MONTHS[month - 1]}?`
        );

        const options = [];

        /*
            Generate every valid Doomsday date for the year.
            January and February both get BOTH options.
        */

        for (let m = 1; m <= 12; m++) {

            const dates =
                DOOMSDAY_DATES[m];

            dates.forEach(day => {

                options.push({
                    value: `${m}-${day}`,
                    label: `${m}/${day}`
                });

            });

        }

        createAnswerButtons(
            $("tutorial-answer-area"),
            options,
            value => {

                state.tutorial.selectedAnswer =
                    value;

                $("tutorial-submit")
                    .classList.remove("hidden");

            }
        );

        return;
    }


    /* -----------------------------------------
       STEP 10
    ----------------------------------------- */

    if (step === 10) {

        renderStep10Part1();

        return;
    }

}


/* =========================================================
   TUTORIAL NUMERIC ANSWERS
========================================================= */

function renderNumericTutorialAnswers(
    min,
    max,
    stepNumber
) {

    createAnswerButtons(
        $("tutorial-answer-area"),
        numericAnswers(min, max),
        value => {

            state.tutorial.selectedAnswer =
                Number(value);

            $("tutorial-submit")
                .classList.remove("hidden");

        }
    );

    $("tutorial-submit").onclick =
        () => submitTutorialAnswer(stepNumber);

}


/* =========================================================
   TUTORIAL SUBMISSION
========================================================= */

$("tutorial-submit").addEventListener(
    "click",
    () => {

        submitTutorialAnswer(
            state.tutorial.step
        );

    }
);


function submitTutorialAnswer(step) {

    if (state.tutorial.selectedAnswer === null) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }


    let correct = false;
    let correctAnswer;


    /* -----------------------------------------
       STEPS 1–7
    ----------------------------------------- */

    if (step >= 1 && step <= 7) {

        correctAnswer =
            getTutorialCorrectAnswer(step);

        correct =
            Number(state.tutorial.selectedAnswer) ===
            Number(correctAnswer);

    }


    /* -----------------------------------------
       STEP 8
    ----------------------------------------- */

    else if (step === 8) {

        correctAnswer =
            isLeapYear(
                state.tutorial.date.year
            );

        correct =
            Boolean(
                state.tutorial.selectedAnswer
            ) === correctAnswer;

    }


    /* -----------------------------------------
       STEP 9
    ----------------------------------------- */

    else if (step === 9) {

        const month =
            state.tutorial.date.month;

        const correctDay =
            getDoomsdayDate(
                state.tutorial.date.year,
                month
            );

        correctAnswer =
            `${month}-${correctDay}`;

        correct =
            state.tutorial.selectedAnswer ===
            correctAnswer;

    }


    /* -----------------------------------------
       STEP 10
    ----------------------------------------- */

    else if (step === 10) {

        return submitStep10();

    }


    if (correct) {

        state.tutorial.answers[step] =
            correctAnswer;

        $("tutorial-feedback").innerHTML =
            `<span class="correct">${randomCorrectMessage()}</span>`;

        $("tutorial-submit")
            .classList.add("hidden");

        /*
            Answers remain selected, but the question is
            now locked until Next is pressed.
        */

        $("tutorial-answer-area")
            .querySelectorAll("button")
            .forEach(button => {
                button.disabled = true;
            });

        showTutorialNextButton();

    } else {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

    }

}


function getTutorialCorrectAnswer(step) {

    const year =
        state.tutorial.date.year;

    switch (step) {

        case 1:
            return step1(year);

        case 2:
            return step2(year);

        case 3:
            return step3(year);

        case 4:
            return step4(year);

        case 5:
            return step5(year);

        case 6:
            return step6(year);

        case 7:
            return step7(year);

        default:
            return null;
    }

}


/* =========================================================
   TUTORIAL NEXT
========================================================= */

function showTutorialNextButton() {

    $("tutorial-continue").classList.remove("hidden");

    $("tutorial-continue").textContent =
        state.tutorial.step === 10
            ? "Finish"
            : "Next";

    $("tutorial-continue").onclick =
        () => {

            if (state.tutorial.step === 10) {

                finishTutorial();

                return;
            }

            state.tutorial.step++;

            renderTutorialStep();

        };

}


function finishTutorial() {

    /*
        Remove the answer box only AFTER Step 10 has
        actually been answered.
    */

    $("tutorial-answer-area").innerHTML = "";

    $("tutorial-submit").classList.add("hidden");

    $("tutorial-question").textContent =
        "You did it! 🎉";

    $("tutorial-main-text").innerHTML =
        `<div class="sentence">You just walked through the entire Doomsday Algorithm!</div>`;

    $("tutorial-continue").classList.add("hidden");

}


/* =========================================================
   STEP 10
========================================================= */

function renderStep10Part1() {

    $("tutorial-step-title").textContent =
        "Step 10";

    const month =
        state.tutorial.date.month;

    const doomDay =
        getDoomsdayDate(
            state.tutorial.date.year,
            month
        );

    const doomWeekday =
        step7(
            state.tutorial.date.year
        );

    setTutorialContent(
        `Every 7 days lands on the same weekday. Starting at our Doomsday date ${formatMonthDay(month, doomDay)}, which was a ${WEEKDAYS[doomWeekday]}, count forward or back by 7 until you're within one week of the target date.`,
        `How many full weeks can you move?`
    );

    createAnswerButtons(
        $("tutorial-answer-area"),
        numericAnswers(-4, 4, true),
        value => {

            state.tutorial.selectedAnswer =
                Number(value);

            $("tutorial-submit")
                .classList.remove("hidden");

        }
    );

    $("tutorial-submit").onclick =
        submitStep10Part1;

}


function submitStep10Part1() {

    if (state.tutorial.selectedAnswer === null) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }

    const weeks =
        Number(state.tutorial.selectedAnswer);

    const date =
        state.tutorial.date;

    const doomDay =
        getDoomsdayDate(
            date.year,
            date.month
        );

    const startingDate = {
        year: date.year,
        month: date.month,
        day: doomDay
    };

    const movedDate =
        new Date(
            dateToJS(startingDate).getTime() +
            weeks * 7 * 24 * 60 * 60 * 1000
        );

    const calculatedDate = {
        year: movedDate.getFullYear(),
        month: movedDate.getMonth() + 1,
        day: movedDate.getDate()
    };

    const difference =
        date.day -
        calculatedDate.day;

    /*
        Since the question is intentionally restricted to
        the same month, this is sufficient for the generated
        tutorial problem.
    */

    const correctWeeks =
        Math.floor(
            (date.day - doomDay) / 7
        );

    if (weeks !== correctWeeks) {

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

        return;
    }

    state.tutorial.answers[10] = weeks;

    $("tutorial-feedback").innerHTML =
        `<span class="correct">${randomCorrectMessage()}</span>`;

    $("tutorial-answer-area")
        .querySelectorAll("button")
        .forEach(button => {
            button.disabled = true;
        });

    $("tutorial-submit").classList.add("hidden");

    renderStep10Part2(
        calculatedDate
    );

}


function renderStep10Part2(calculatedDate) {

    const target =
        state.tutorial.date;

    const dayDifference =
        target.day -
        calculatedDate.day;

    let direction;

    if (dayDifference > 0) {
        direction = "ahead of";
    } else if (dayDifference < 0) {
        direction = "behind";
    } else {
        direction = "on";
    }

    const absoluteDifference =
        Math.abs(dayDifference);

    $("tutorial-step-title").textContent =
        "Step 10 — Final Step";

    setTutorialContent(
        `Great, you've moved ${formatSignedWeeks(state.tutorial.answers[10])}! You are now at ${formatMonthDay(calculatedDate.month, calculatedDate.day)}, and you're ${absoluteDifference} ${absoluteDifference === 1 ? "day" : "days"} ${direction} your target.`,
        `Which weekday is the target date?`
    );

    $("tutorial-answer-area").innerHTML = "";

    createAnswerButtons(
        $("tutorial-answer-area"),
        weekdayAnswers(),
        value => {

            state.tutorial.selectedAnswer =
                Number(value);

            $("tutorial-submit")
                .classList.remove("hidden");

        }
    );

    $("tutorial-submit").onclick =
        () => {

            const correct =
                Number(
                    state.tutorial.selectedAnswer
                ) ===
                calculateWeekday(target);

            if (!correct) {

                $("tutorial-feedback").innerHTML =
                    `<span class="incorrect">Sorry, not quite... Try again!</span>`;

                return;

            }

            $("tutorial-feedback").innerHTML =
                `<span class="correct">${randomCorrectMessage()}</span>`;

            $("tutorial-submit")
                .classList.add("hidden");

            $("tutorial-answer-area")
                .querySelectorAll("button")
                .forEach(button => {
                    button.disabled = true;
                });

            showTutorialNextButton();

        };

}


function formatSignedWeeks(weeks) {

    if (weeks > 0) {
        return `+${weeks} ${weeks === 1 ? "week" : "weeks"} forward`;
    }

    if (weeks < 0) {
        const n = Math.abs(weeks);

        return `${n} ${n === 1 ? "week" : "weeks"} backward`;
    }

    return "0 weeks";
}


/* =========================================================
   ENDLESS MODE
========================================================= */

function resetEndless() {

    state.endless.date = null;
    state.endless.streak = 0;
    state.endless.selectedAnswer = null;
    state.endless.answered = false;

}


function startEndless() {

    resetEndless();

    state.currentMode = "endless";

    showScreen("endless-screen");

    nextEndlessQuestion();

}


function nextEndlessQuestion() {

    state.endless.date =
        randomDate(1600, 2499);

    state.endless.selectedAnswer = null;
    state.endless.answered = false;

    $("endless-date").textContent =
        formatDate(state.endless.date);

    $("endless-feedback").innerHTML = "";

    $("endless-submit").classList.add("hidden");

    createAnswerButtons(
        $("endless-answer-area"),
        weekdayAnswers(),
        value => {

            state.endless.selectedAnswer =
                Number(value);

            $("endless-submit")
                .classList.remove("hidden");

        }
    );

}


$("endless-submit").addEventListener(
    "click",
    submitEndless
);


function submitEndless() {

    if (state.endless.selectedAnswer === null) {

        $("endless-feedback").innerHTML =
            "Please choose an answer first.";

        return;
    }

    const correct =
        state.endless.selectedAnswer ===
        calculateWeekday(
            state.endless.date
        );

    if (correct) {

        state.endless.streak++;

        $("endless-streak").textContent =
            `Streak: ${state.endless.streak}`;

        $("endless-feedback").innerHTML =
            `<span class="correct">${randomCorrectMessage()}</span>`;

        $("endless-submit").classList.add("hidden");

        $("endless-answer-area")
            .querySelectorAll("button")
            .forEach(button => {
                button.disabled = true;
            });

        const next =
            document.createElement("button");

        next.className =
            "primary-button";

        next.textContent =
            "Next";

        next.id =
            "endless-next";

        next.onclick = () => {

            next.remove();

            nextEndlessQuestion();

        };

        $("endless-submit")
            .parentNode
            .appendChild(next);

    } else {

        $("endless-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite! Your streak was ${state.endless.streak}.</span>`;

        state.endless.streak = 0;

        $("endless-streak").textContent =
            "Streak: 0";

        $("endless-submit").classList.add("hidden");

        $("endless-answer-area")
            .querySelectorAll("button")
            .forEach(button => {
                button.disabled = true;
            });

        const restart =
            document.createElement("button");

        restart.className =
            "primary-button";

        restart.textContent =
            "Restart";

        restart.onclick =
            nextEndlessQuestion;

        $("endless-submit")
            .parentNode
            .appendChild(restart);

    }

}


$("endless-restart").onclick =
    startEndless;


/* =========================================================
   GUIDED MODE
========================================================= */

function resetGuided() {

    state.guided.date = null;
    state.guided.hintsRemaining = 3;
    state.guided.usedHints = [];
    state.guided.selectedAnswer = null;
    state.guided.answered = false;

}


function startGuided() {

    resetGuided();

    state.currentMode = "guided";

    showScreen("guided-screen");

    nextGuidedQuestion();

}


function nextGuidedQuestion() {

    state.guided.date =
        randomDate(1600, 2499);

    state.guided.hintsRemaining = 3;
    state.guided.usedHints = [];
    state.guided.selectedAnswer = null;
    state.guided.answered = false;

    $("guided-date").textContent =
        formatDate(state.guided.date);

    $("guided-feedback").innerHTML = "";

    $("guided-submit").classList.add("hidden");

    updateGuidedHints();

    createAnswerButtons(
        $("guided-answer-area"),
        weekdayAnswers(),
        value => {

            state.guided.selectedAnswer =
                Number(value);

            $("guided-submit")
                .classList.remove("hidden");

        }
    );

}


function updateGuidedHints() {

    $("guided-hint-count").textContent =
        `${state.guided.hintsRemaining} ${
            state.guided.hintsRemaining === 1
                ? "hint"
                : "hints"
        } remaining`;

    document
        .querySelectorAll(".hint-button")
        .forEach(button => {

            const step =
                Number(
                    button.dataset.hintStep
                );

            button.disabled =
                state.guided.hintsRemaining <= 0 ||
                state.guided.usedHints.includes(step);

        });

}


document
    .querySelectorAll(".hint-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (state.guided.hintsRemaining <= 0) {
                    return;
                }

                const step =
                    Number(
                        button.dataset.hintStep
                    );

                if (
                    state.guided.usedHints
                        .includes(step)
                ) {
                    return;
                }

                state.guided.usedHints.push(step);

                state.guided.hintsRemaining--;

                $("guided-feedback").innerHTML =
                    `<span>${getGuidedHint(step)}</span>`;

                updateGuidedHints();

            }
        );

    });


function getGuidedHint(step) {

    const year =
        state.guided.date.year;

    switch (step) {

        case 1:
            return `The last two digits are ${year % 100}.`;

        case 2:
            return `Take 12 away from ${year % 100} until you can't anymore.`;

        case 3:
            return `Look at how many groups of 4 fit into the leftover from Step 2.`;

        case 4:
            return `The century anchor follows the repeating 4-century pattern.`;

        case 5:
            return `Add the results from Steps 1–4 together.`;

        case 6:
            return `Take 7 away from the Step 5 sum until you can't anymore.`;

        case 7:
            return `Your leftover number corresponds to a weekday from 0–6.`;

        case 8:
            return isLeapYear(year)
                ? "This year is a leap year."
                : "This year is not a leap year.";

        case 9:
            return `Find the Doomsday date for ${MONTHS[state.guided.date.month - 1]}.`;

        case 10:
            return `Compare your target date with the month's Doomsday date.`;

        default:
            return "Think through the algorithm one step at a time.";
    }

}


$("guided-submit").addEventListener(
    "click",
    submitGuided
);


function submitGuided() {

    if (state.guided.selectedAnswer === null) {

        $("guided-feedback").innerHTML =
            "Please choose an answer first.";

        return;
    }

    const correct =
        state.guided.selectedAnswer ===
        calculateWeekday(
            state.guided.date
        );

    if (correct) {

        $("guided-feedback").innerHTML =
            `<span class="correct">${randomCorrectMessage()}</span>`;

        $("guided-submit").classList.add("hidden");

        $("guided-answer-area")
            .querySelectorAll("button")
            .forEach(button => {
                button.disabled = true;
            });

        const next =
            document.createElement("button");

        next.className =
            "primary-button";

        next.textContent =
            "Next";

        next.onclick =
            () => {

                next.remove();

                nextGuidedQuestion();

            };

        $("guided-submit")
            .parentNode
            .appendChild(next);

    } else {

        $("guided-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

    }

}


$("guided-restart").onclick =
    startGuided;


/* =========================================================
   PRACTICE MODE
========================================================= */

function resetPractice() {

    state.practice.category = null;
    state.practice.question = null;
    state.practice.answer = null;
    state.practice.answered = false;

}


function startPractice() {

    resetPractice();

    state.currentMode = "practice";

    showScreen("practice-screen");

    $("practice-category-area")
        .classList.remove("hidden");

    $("practice-question-area")
        .classList.add("hidden");

}


document
    .querySelectorAll(".category-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                state.practice.category =
                    button.dataset.category;

                $("practice-category-area")
                    .classList.add("hidden");

                $("practice-question-area")
                    .classList.remove("hidden");

                nextPracticeQuestion();

            }
        );

    });


function nextPracticeQuestion() {

    state.practice.answered = false;

    $("practice-feedback").innerHTML = "";

    $("practice-next")
        .classList.add("hidden");

    $("practice-input").value = "";

    generatePracticeQuestion();

}


function generatePracticeQuestion() {

    const category =
        state.practice.category;


    /* WEEKDAY */

    if (category === "weekday") {

        const weekday =
            Math.floor(Math.random() * 7);

        state.practice.question =
            `What number represents ${WEEKDAYS[weekday]}?`;

        state.practice.answer =
            weekday;

    }


    /* DOOMSDAY */

    else if (category === "doomsday") {

        const entries = [];

        Object.entries(DOOMSDAY_DATES)
            .forEach(([month, dates]) => {

                dates.forEach(day => {

                    entries.push({
                        month: Number(month),
                        day
                    });

                });

            });

        const chosen =
            entries[
                Math.floor(
                    Math.random() * entries.length
                )
            ];

        state.practice.question =
            `What is the Doomsday date for ${MONTHS[chosen.month - 1]}?`;

        state.practice.answer =
            `${chosen.month}/${chosen.day}`;

    }


    /* CENTURY */

    else if (category === "century") {

        const century =
            16 +
            Math.floor(Math.random() * 9);

        const anchor =
            step4(century * 100);

        state.practice.question =
            `What is the century anchor for the ${century}00s?`;

        state.practice.answer =
            anchor;

    }


    /* ALGORITHM */

    else {

        const year =
            1600 +
            Math.floor(
                Math.random() * 900
            );

        const step =
            Math.floor(Math.random() * 6) + 1;

        const answers = {
            1: step1(year),
            2: step2(year),
            3: step3(year),
            4: step4(year),
            5: step5(year),
            6: step6(year)
        };

        state.practice.question =
            `For the year ${year}, what is the answer to Step ${step}?`;

        state.practice.answer =
            answers[step];

    }


    $("practice-question").textContent =
        state.practice.question;

}


$("practice-submit").onclick =
    submitPractice;


function submitPractice() {

    const input =
        $("practice-input")
            .value
            .trim()
            .toLowerCase();

    if (!input) {

        $("practice-feedback").textContent =
            "Please enter an answer first.";

        return;
    }

    const correctAnswer =
        String(state.practice.answer)
            .toLowerCase();

    if (input === correctAnswer) {

        $("practice-feedback").innerHTML =
            `<span class="correct">${randomCorrectMessage()}</span>`;

        $("practice-submit")
            .classList.add("hidden");

        $("practice-next")
            .classList.remove("hidden");

    } else {

        $("practice-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite... Try again!</span>`;

    }

}


$("practice-next").onclick =
    () => {

        $("practice-submit")
            .classList.remove("hidden");

        nextPracticeQuestion();

    };


$("practice-restart").onclick =
    startPractice;


/* =========================================================
   QUIZ MODE
========================================================= */

function startQuizSetup() {

    showScreen("quiz-setup-screen");

}


$("quiz-count-slider").addEventListener(
    "input",
    event => {

        $("quiz-count-value").textContent =
            event.target.value;

    }
);


$("start-quiz-button").onclick =
    startQuiz;


function startQuiz() {

    state.quiz.total =
        Number(
            $("quiz-count-slider").value
        );

    state.quiz.current = 0;
    state.quiz.correct = 0;
    state.quiz.selectedAnswer = null;
    state.quiz.answered = false;
    state.quiz.seconds = 0;

    showScreen("quiz-screen");

    startQuizTimer();

    nextQuizQuestion();

}


function startQuizTimer() {

    clearInterval(state.quiz.timer);

    state.quiz.seconds = 0;

    updateQuizTimer();

    state.quiz.timer =
        setInterval(() => {

            state.quiz.seconds++;

            updateQuizTimer();

        }, 1000);

}


function updateQuizTimer() {

    const minutes =
        Math.floor(
            state.quiz.seconds / 60
        );

    const seconds =
        String(
            state.quiz.seconds % 60
        ).padStart(2, "0");

    $("quiz-timer").textContent =
        `${minutes}:${seconds}`;

}


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
        randomDate(1600, 2499);

    state.quiz.selectedAnswer = null;
    state.quiz.answered = false;

    $("quiz-question-number").textContent =
        `${state.quiz.current} / ${state.quiz.total}`;

    $("quiz-date").textContent =
        formatDate(state.quiz.date);

    $("quiz-feedback").innerHTML = "";

    $("quiz-submit").classList.add("hidden");

    createAnswerButtons(
        $("quiz-answer-area"),
        weekdayAnswers(),
        value => {

            state.quiz.selectedAnswer =
                Number(value);

            $("quiz-submit")
                .classList.remove("hidden");

        }
    );

}


$("quiz-submit").onclick =
    submitQuiz;


function submitQuiz() {

    if (state.quiz.selectedAnswer === null) {

        $("quiz-feedback").textContent =
            "Please choose an answer first.";

        return;
    }

    const correct =
        state.quiz.selectedAnswer ===
        calculateWeekday(
            state.quiz.date
        );

    if (correct) {

        state.quiz.correct++;

        $("quiz-feedback").innerHTML =
            `<span class="correct">${randomCorrectMessage()}</span>`;

    } else {

        $("quiz-feedback").innerHTML =
            `<span class="incorrect">Sorry, not quite!</span>`;

    }

    $("quiz-submit").classList.add("hidden");

    $("quiz-answer-area")
        .querySelectorAll("button")
        .forEach(button => {
            button.disabled = true;
        });

    const next =
        document.createElement("button");

    next.className =
        "primary-button";

    next.textContent =
        state.quiz.current === state.quiz.total
            ? "Finish"
            : "Next";

    next.onclick =
        () => {

            next.remove();

            nextQuizQuestion();

        };

    $("quiz-submit")
        .parentNode
        .appendChild(next);

}


/* =========================================================
   QUIZ GRADING
========================================================= */

function getQuizGrade(percent) {

    if (percent === 100) return "A+";
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


const QUIZ_GRADE_COLORS = {

    "A+": "#29CC57",
    "A": "#29CC57",
    "A-": "#29CC57",

    "B+": "#BAE52D",
    "B": "#BAE52D",
    "B-": "#BAE52D",

    "C+": "#FFC926",
    "C": "#FFC926",
    "C-": "#FFC926",

    "D+": "#FF8D23",
    "D": "#FF8D23",
    "D-": "#FF8D23",

    "F": "#FF5D5D"

};


function finishQuiz() {

    clearInterval(state.quiz.timer);

    const percent =
        Math.round(
            (state.quiz.correct /
                state.quiz.total) *
            100
        );

    const grade =
        getQuizGrade(percent);

    $("quiz-grade").textContent =
        grade;

    $("quiz-grade").style.color =
        QUIZ_GRADE_COLORS[grade];

    $("quiz-score").textContent =
        `You got ${state.quiz.correct} out of ${state.quiz.total} correct`;

    $("quiz-message").textContent =
        `"${QUIZ_MESSAGES[grade]}"`;

    showScreen("quiz-results-screen");

}


$("quiz-again").onclick =
    startQuizSetup;


/* =========================================================
   HOME BUTTONS
========================================================= */

document
    .querySelectorAll(".mode-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.mode;

                transitionTo(() => {

                    if (mode === "tutorial") {
                        startTutorial();
                    }

                    else if (mode === "practice") {
                        startPractice();
                    }

                    else if (mode === "guided") {
                        startGuided();
                    }

                    else if (mode === "quiz") {
                        startQuizSetup();
                    }

                    else if (mode === "endless") {
                        startEndless();
                    }

                });

            }
        );

    });


/* =========================================================
   HOME NAVIGATION
========================================================= */

document
    .querySelectorAll(".back-home-generic")
    .forEach(button => {

        button.addEventListener(
            "click",
            showHome
        );

    });


$("tutorial-home").onclick =
    showHome;


/* =========================================================
   TUTORIAL RESTART
========================================================= */

$("tutorial-restart").onclick =
    () => {

        transitionTo(() => {

            /*
                This is deliberately a complete reset.

                It clears:
                - current step
                - selected answer
                - all sidebar results
                - feedback
                - date
                - answer buttons
            */

            resetTutorialCompletely();

            state.tutorial.date =
                randomDate(1800, 2200);

            $("sidebar-date").textContent =
                formatDate(state.tutorial.date);

            $("tutorial-date-display").textContent =
                formatDate(state.tutorial.date);

            state.tutorial.step = 0;

            renderTutorialStep();

        });

    };


/* =========================================================
   INITIALIZATION
========================================================= */

resetTutorialCompletely();
resetEndless();
resetGuided();
resetPractice();

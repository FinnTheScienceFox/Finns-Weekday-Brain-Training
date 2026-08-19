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

const DOOMSDAY_DATES = {
    1: 3,
    2: 28,
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


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentScreen = "home";

let tutorialDate = null;
let tutorialStep = 0;
let tutorialAnswers = {};
let tutorialSelectedAnswer = null;

let endlessStreak = 0;


/* =========================================================
   BASIC UTILITIES
   ========================================================= */

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function randomDate(minYear, maxYear) {
    const year = randomInt(minYear, maxYear);
    const month = randomInt(0, 11);

    const maxDay = new Date(year, month + 1, 0).getDate();
    const day = randomInt(1, maxDay);

    return new Date(year, month, day);
}


function formatDate(date) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}


function formatMonthDay(date) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
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
    return date.getDay();
}


/* =========================================================
   DOOMSDAY CALCULATION
   ========================================================= */

function getCenturyAnchor(century) {
    const anchors = {
        18: 5,
        19: 3,
        20: 2,
        21: 0
    };

    /*
       The anchor cycle repeats every 4 centuries.

       18 -> 5
       19 -> 3
       20 -> 2
       21 -> 0
    */

    const index = ((century - 18) % 4 + 4) % 4;

    return [5, 3, 2, 0][index];
}


function calculateDoomsday(year) {

    const lastTwo = year % 100;
    const century = Math.floor(year / 100);

    const groupsOf12 = Math.floor(lastTwo / 12);

    const leftoverAfter12 = lastTwo % 12;

    const groupsOf4 = Math.floor(leftoverAfter12 / 4);

    const centuryAnchor = getCenturyAnchor(century);

    const sum =
        groupsOf12 +
        leftoverAfter12 +
        groupsOf4 +
        centuryAnchor;

    const doomsday = sum % 7;

    return {
        groupsOf12,
        leftoverAfter12,
        groupsOf4,
        century,
        centuryAnchor,
        sum,
        doomsday
    };
}


/* =========================================================
   DOOMSDAY DATE
   ========================================================= */

function getDoomsdayDate(year, month) {

    if (month === 0) {

        return isLeapYear(year)
            ? 4
            : 3;
    }

    if (month === 1) {

        return isLeapYear(year)
            ? 29
            : 28;
    }

    return DOOMSDAY_DATES[month + 1];
}


/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */

function hideAllScreens() {

    document.querySelectorAll(".game-screen").forEach(screen => {
        screen.classList.add("hidden");
    });

    document
        .getElementById("home-screen")
        .classList.add("hidden");
}


function showScreen(screenId) {

    hideAllScreens();

    const screen = document.getElementById(screenId);

    if (screen) {
        screen.classList.remove("hidden");
    }

    currentScreen = screenId;
}


function goHome() {

    resetTutorial();

    resetEndless();

    hideAllScreens();

    document
        .getElementById("home-screen")
        .classList.remove("hidden");

    currentScreen = "home";
}


/* =========================================================
   HOME MENU
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

        else if (mode === "practice") {
            startPractice();
        }

    });

});


/* =========================================================
   TUTORIAL
   ========================================================= */

function resetTutorial() {

    tutorialDate = null;

    tutorialStep = 0;

    tutorialAnswers = {};

    tutorialSelectedAnswer = null;

    const feedback = document.getElementById("feedback");

    if (feedback) {
        feedback.innerHTML = "";
    }

    const answerArea = document.getElementById("answer-area");

    if (answerArea) {
        answerArea.innerHTML = "";
    }

    const question = document.getElementById("question");

    if (question) {
        question.innerHTML = "";
    }

    const counter = document.getElementById("step-counter");

    if (counter) {
        counter.textContent = "Step 0";
    }

    resetTutorialSidebar();
}


function resetTutorialSidebar() {

    const sidebarDate =
        document.getElementById("sidebar-date");

    if (sidebarDate) {
        sidebarDate.textContent = "Date";
    }

    for (let i = 1; i <= 10; i++) {

        const step =
            document.getElementById(`sidebar-step-${i}`);

        if (!step) {
            continue;
        }

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
    }
}


function startTutorial() {

    resetTutorial();

    tutorialDate = randomDate(1800, 2200);

    const sidebarDate =
        document.getElementById("sidebar-date");

    sidebarDate.textContent =
        formatDate(tutorialDate);

    showScreen("tutorial-screen");

    renderTutorialStep();
}


/* =========================================================
   TUTORIAL RENDERING
   ========================================================= */

function renderTutorialStep() {

    tutorialSelectedAnswer = null;

    const answerArea =
        document.getElementById("answer-area");

    const feedback =
        document.getElementById("feedback");

    const question =
        document.getElementById("question");

    const counter =
        document.getElementById("step-counter");

    const dateDisplay =
        document.getElementById("date-display");


    /* Clear previous question */

    answerArea.innerHTML = "";

    feedback.innerHTML = "";


    /* Reset the question's visual state */

    counter.textContent =
        tutorialStep === 10.2
            ? "Step 10"
            : `Step ${tutorialStep}`;


    dateDisplay.textContent =
        formatDate(tutorialDate);


    /* =====================================================
       STEP 0
       ===================================================== */

    if (tutorialStep === 0) {

        question.innerHTML = `
            Hello! <strong>I'm Finn</strong>, the little guy in the
            corner cheering you on, and I'm so happy you decided
            to check out my game.<br><br>

            For this tutorial, we will be finding the weekday of
            <strong>${formatDate(tutorialDate)}</strong>.
            Guided questions will help teach the simple
            step-by-step process, with this date as an example.
            It gets easier the more we practice!<br><br>

            Press <strong>Continue</strong> when you're ready.
        `;

        const continueButton =
            document.createElement("button");

        continueButton.className = "answer-button";

        continueButton.textContent = "Continue";

        continueButton.addEventListener("click", () => {

            tutorialStep = 1;

            renderTutorialStep();

        });

        answerArea.appendChild(continueButton);

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       CALCULATION
       ===================================================== */

    const year = tutorialDate.getFullYear();

    const calc = calculateDoomsday(year);

    const lastTwo =
        String(year % 100).padStart(2, "0");

    const century =
        Math.floor(year / 100);

    const centuryText =
        String(century).padStart(2, "0");


    /* =====================================================
       STEP 1
       ===================================================== */

    if (tutorialStep === 1) {

        question.innerHTML = `
            Let's look at the <strong>last two digits of the year</strong>.
            In this case, the last two digits of ${year} are
            <strong>${lastTwo}</strong>.<br><br>

            Our first step is to divide ${lastTwo} by 12, which just means
            we need to <strong>count how many groups of 12 are in
            ${lastTwo}</strong>.
        `;

        createAnswerButtons(
            [0,1,2,3,4,5,6,7,8],
            calc.groupsOf12,
            answer => {

                tutorialAnswers[1] = answer;

                setSidebarResult(1, answer);

            },
            `Sorry, that isn't it. Imagine ${lastTwo} objects that you divide into groups of 12, then count the number of groups!`
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 2
       ===================================================== */

    if (tutorialStep === 2) {

        question.innerHTML = `
            Great, <strong>${tutorialAnswers[1]} is our first number!</strong>
            Remember the next 3 numbers as well, because they'll all
            be important in Step 5.<br><br>

            Now, with ${tutorialAnswers[1]} groups of 12,
            <strong>think about what's still remaining...</strong>
        `;

        createAnswerButtons(
            [0,1,2,3,4,5,6,7,8,9,10,11],
            calc.leftoverAfter12,
            answer => {

                tutorialAnswers[2] = answer;

                setSidebarResult(2, answer);

            },
            `Sorry, not quite. You can also think about it like this: If you start with ${lastTwo} and keep taking away 12, eventually you'll reach a number that's less than 12...`
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 3
       ===================================================== */

    if (tutorialStep === 3) {

        question.innerHTML = `
            <strong>${tutorialAnswers[2]} is our second number!</strong><br><br>

            We have to do some more counting to find the third.
            This time, we have to count
            <strong>how many groups of 4 are in ${tutorialAnswers[2]}.</strong>
        `;

        createAnswerButtons(
            [0,1,2,3],
            calc.groupsOf4,
            answer => {

                tutorialAnswers[3] = answer;

                setSidebarResult(3, answer);

            },
            "Not quite. Try again!"
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 4
       ===================================================== */

    if (tutorialStep === 4) {

        question.innerHTML = `
            Nice, <strong>${tutorialAnswers[3]} is our third number!</strong>
            Finding the fourth number is a bit trickier, but it's the
            last number we need for now.<br><br>

            Let's look at the <strong>first two digits of the year</strong>
            instead, which for ${year} is ${centuryText}.
            This represents the <em>century</em>, and each century has
            a <em>century anchor</em>...<br><br>

            18 = <strong>5</strong>.<br>
            19 = <strong>3</strong>.<br>
            20 = <strong>2</strong>.<br>
            21 = <strong>0</strong>.<br><br>

            This <strong>5-3-2-0 pattern</strong> continues forward and
            backward in a loop forever, so knowing the anchor for just
            one century means you know the anchor for every century!<br><br>

            Remember that <strong>our century is ${centuryText}</strong>
            for this example...
        `;

        createAnswerButtons(
            [0,2,3,5],
            calc.centuryAnchor,
            answer => {

                tutorialAnswers[4] = answer;

                setSidebarResult(4, answer);

            },
            "Sorry, that isn't it... Remember to use the table if you're having trouble; memorization will come with time!"
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 5
       ===================================================== */

    if (tutorialStep === 5) {

        question.innerHTML = `
            Perfect, <strong>the <em>century anchor</em> is our fourth
            and final number!</strong> Let's put it all together.<br><br>

            Hopefully you <strong>remember all four numbers</strong>,
            because we need to add them together now!<br><br>

            It's okay if you don't remember; the four numbers have
            been written in the sidebar if you need help. But if you
            want to do this on the fly, <strong>you'll need to remember
            them without help in the future.</strong>
        `;

        createAnswerButtons(
            Array.from({length: 21}, (_, i) => i),
            calc.sum,
            () => {},
            `Sorry, that isn't it! What's the sum of ${tutorialAnswers[1]}, ${tutorialAnswers[2]}, ${tutorialAnswers[3]}, and ${tutorialAnswers[4]}?`
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 6
       ===================================================== */

    if (tutorialStep === 6) {

        question.innerHTML = `
            For the last question's sum
            (<strong>${calc.sum}</strong> in our case),
            <strong>take 7 away from that number until we have a result
            lower than 7.</strong>
        `;

        createAnswerButtons(
            [0,1,2,3,4,5,6],
            calc.doomsday,
            () => {},
            `Not quite! From another angle, this is very similar to the grouping exercise from earlier; How many groups of 7 are in ${calc.sum}? More importantly, what's left over?`
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 7
       ===================================================== */

    if (tutorialStep === 7) {

        question.innerHTML = `
            <strong>This leftover number, ${calc.doomsday}, represents
            a weekday!</strong> Zero (0) is Sunday, One (1) is Monday,
            and so on...<br><br>

            There's a fun mnemonic to help you remember this pattern:<br>

            <strong>0</strong> is "NONEday," which sounds like
            <strong>Sunday</strong>,<br>

            <strong>1</strong> is "ONEday," which sounds like
            <strong>Monday</strong>,<br>

            <strong>2</strong> is "TWOSday," which sounds like
            <strong>Tuesday</strong>,<br>

            <strong>3</strong> is "three syllables," which is the amount
            that <strong>Wednesday</strong> has,<br>

            <strong>4</strong> is "FOURsday," which sounds like
            <strong>Thursday</strong>,<br>

            <strong>5</strong> is "FIVEday," which sounds like
            <strong>Friday</strong>,<br>

            <strong>6</strong> is "SIXturday," which sounds like
            <strong>Saturday</strong>.
        `;

        createAnswerButtons(
            WEEKDAYS,
            WEEKDAYS[calc.doomsday],
            () => {},
            "That's not it. Try again!"
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 8
       ===================================================== */

    if (tutorialStep === 8) {

        const leap =
            isLeapYear(year);

        question.innerHTML = `
            Now, before we get to calculating the date, we need to
            <strong>check if ${year} is a leap year</strong> or not.
            Take the last two digits of the year
            (${lastTwo} in our case), and make groups of 4.<br><br>

            If we can make groups of four with <strong>no leftovers</strong>,
            then <strong>${year} is a leap year</strong>. If we can't,
            then <strong>${year} is not a leap year</strong>.<br><br>

            (If the <strong>last two digits are "00,"</strong> then use
            the first two digits instead. That would be ${centuryText}
            for us.)
        `;

        createAnswerButtons(
            ["Yes", "No"],
            leap ? "Yes" : "No",
            () => {},
            `Sorry, but that's not correct: ${year} ${leap ? "is" : "isn't"} a leap year.`
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 9
       ===================================================== */

    if (tutorialStep === 9) {

        const weekday =
            WEEKDAYS[calc.doomsday];

        const month =
            tutorialDate.getMonth();

        const doomsdayDay =
            getDoomsdayDate(year, month);

        question.innerHTML = `
            The most important step has come!<br><br>

            This step-by-step process is called the
            <strong>Doomsday Algorithm</strong>. It sounds scary,
            but it isn't; It's called that because there are certain
            <strong>Doomsday dates</strong> that always share the same
            weekday... and the weekday we calculated in Step 7,
            <strong>${weekday}</strong>, is the weekday they all share!<br><br>

            Each month has exactly one Doomsday date:<br><br>

            January <strong>3</strong> (January <strong>4</strong> on
            <strong>leap years</strong>),<br>
            February <strong>28</strong> (February <strong>29</strong>
            on <strong>leap years</strong>),<br>
            March <strong>14</strong>,<br>
            April <strong>4</strong>,<br>
            May <strong>9</strong>,<br>
            June <strong>6</strong>,<br>
            July <strong>11</strong>,<br>
            August <strong>8</strong>,<br>
            September <strong>5</strong>,<br>
            October <strong>10</strong>,<br>
            November <strong>7</strong>,<br>
            December <strong>12</strong>.<br><br>

            There are also some rules and fun mnemonics to make
            remembering these dates easy!<br><br>

            1. <strong>Even months</strong> (except February) share their
            Doomsday date with their month number: 4/4, 6/6, 8/8,
            10/10, 12/12.<br><br>

            2. <strong>"I work 9-5 at 7-11"</strong> is a fun mnemonic
            that covers 5/9, 7/11, 9/5, and 11/7.<br><br>

            3. <strong>"Every 4 years, it's the 4th"</strong> helps
            remember that January 4th is the Doomsday date every leap
            year instead of the typical January 3rd. February's is simply
            the last day of February.<br><br>

            4. March's Doomsday date is <strong>Pi Day</strong>,
            March 14! (3/14).<br><br>

            That's probably a lot to digest! Take your time memorizing
            these dates, and <strong>go to Practice mode after this to
            help learn them</strong> more efficiently.
        `;

        const options = [
            "Jan. 3",
            "Jan. 4",
            "Feb. 28",
            "Feb. 29",
            "Mar. 14",
            "Apr. 4",
            "May 9",
            "Jun. 6",
            "Jul. 11",
            "Aug. 8",
            "Sep. 5",
            "Oct. 10",
            "Nov. 7",
            "Dec. 12"
        ];

        const correct =
            options.find(option => {

                const parts =
                    option.replace(".", "").split(" ");

                const monthName =
                    parts[0];

                const day =
                    Number(parts[1]);

                return (
                    MONTHS.findIndex(
                        m => m.startsWith(monthName)
                    ) === month &&
                    day === doomsdayDay
                );

            });

        createAnswerButtons(
            options,
            correct,
            () => {},
            `Sorry, but that isn't it! For a big hint, you can simply match the month of our target date, ${MONTHS[month]}, with the Doomsday date's month. Don't forget about leap years!`
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 10.1
       ===================================================== */

    if (tutorialStep === 10.1) {

        const month =
            tutorialDate.getMonth();

        const day =
            getDoomsdayDate(year, month);

        const doomsdayDate =
            new Date(year, month, day);

        const weekday =
            WEEKDAYS[calc.doomsday];

        question.innerHTML = `
            Finally, we can begin calculating the weekday of our
            target date!<br><br>

            We found that our Doomsday date is
            <strong>${formatDate(doomsdayDate)}</strong>, which we know
            now was a <strong>${weekday}</strong>. From here, all we need
            to do is start counting the days before or after this date
            to get to our target.<br><br>

            <strong>Every 7 days, the week repeats.</strong> This simple
            fact will help us out a lot with counting! Count forward or
            backward from <strong>${formatMonthDay(doomsdayDate)}</strong>
            by 7 days until you're within one week of the target date.
        `;

        const difference =
            Math.round(
                (tutorialDate - doomsdayDate) /
                (1000 * 60 * 60 * 24)
            );

        let correctWeeks;

        if (difference >= 0) {
            correctWeeks =
                Math.floor(difference / 7);
        }
        else {
            correctWeeks =
                Math.ceil(difference / 7);
        }

        const options =
            [-4,-3,-2,-1,0,1,2,3,4];

        createAnswerButtons(
            options.map(n => n > 0 ? `+${n}` : `${n}`),
            correctWeeks > 0
                ? `+${correctWeeks}`
                : `${correctWeeks}`,
            () => {},
            "Not quite. Remembering the amount of days in the months might help! \"30 days hath September, April, June, and November\" is a mnemonic I personally like."
        );

        updateTutorialSidebar();

        return;
    }


    /* =====================================================
       STEP 10.2
       ===================================================== */

    if (tutorialStep === 10.2) {

        const month =
            tutorialDate.getMonth();

        const doomsdayDay =
            getDoomsdayDate(year, month);

        const doomsdayDate =
            new Date(year, month, doomsdayDay);

        const difference =
            Math.round(
                (tutorialDate - doomsdayDate) /
                (1000 * 60 * 60 * 24)
            );

        const weeks =
            tutorialAnswers["10.1"];

        const numericWeeks =
            Number(String(weeks).replace("+", ""));

        const movedDate =
            new Date(doomsdayDate);

        movedDate.setDate(
            movedDate.getDate() +
            numericWeeks * 7
        );

        const remaining =
            Math.abs(
                Math.round(
                    (tutorialDate - movedDate) /
                    (1000 * 60 * 60 * 24)
                )
            );

        const direction =
            tutorialDate > movedDate
                ? "ahead of"
                : tutorialDate < movedDate
                    ? "behind"
                    : "exactly on";

        const weekText =
            Math.abs(numericWeeks) === 1
                ? "week"
                : "weeks";

        const movement =
            numericWeeks > 0
                ? "forward"
                : numericWeeks < 0
                    ? "backward"
                    : "neither forward nor backward";

        question.innerHTML = `
            Great! You've now moved
            <strong>${Math.abs(numericWeeks)} ${weekText}
            ${movement}</strong>.<br><br>

            We are now at <strong>${formatMonthDay(movedDate)}</strong>,
            which is <strong>${remaining} ${remaining === 1 ? "day" : "days"}
            ${direction} your target</strong>.<br><br>

            Now, our last step is to count forward and backward from
            <strong>${WEEKDAYS[movedDate.getDay()]},
            ${formatDate(movedDate)}</strong> to our target date
            <strong>${formatDate(tutorialDate)}</strong>.
        `;

        createAnswerButtons(
            WEEKDAYS,
            WEEKDAYS[tutorialDate.getDay()],
            () => {},
            "That's not it! Try again."
        );

        updateTutorialSidebar();

        return;
    }
}


/* =========================================================
   ANSWER BUTTON SYSTEM
   ========================================================= */

function createAnswerButtons(
    options,
    correctAnswer,
    onCorrect,
    customIncorrect
) {

    const answerArea =
        document.getElementById("answer-area");

    answerArea.innerHTML = "";

    tutorialSelectedAnswer = null;


    /* Question text is already above the answer area.
       These buttons only represent answers. */

    options.forEach(option => {

        const button =
            document.createElement("button");

        button.className =
            "answer-button";

        button.textContent =
            option;

        button.dataset.answer =
            option;

        button.addEventListener("click", () => {

            /* Don't answer immediately. */

            tutorialSelectedAnswer =
                option;

            /* Remove selection from all buttons. */

            document
                .querySelectorAll("#answer-area .answer-button")
                .forEach(btn => {

                    btn.classList.remove("selected");

                });

            /* Select this answer. */

            button.classList.add("selected");


            /* Show Submit. */

            showTutorialSubmit();

        });

        answerArea.appendChild(button);

    });


    /*
       Store what the correct answer actually is.
       This allows the Submit button to perform the check later.
    */

    answerArea.dataset.correctAnswer =
        String(correctAnswer);

    answerArea.dataset.customIncorrect =
        customIncorrect || "";

    answerArea.dataset.hasAnswered =
        "false";

    answerArea.dataset.correctCallback =
        "";


    /*
       Store callback in global state because DOM dataset
       cannot store functions.
    */

    window.currentTutorialCorrectCallback =
        onCorrect;
}


/* =========================================================
   SHOW SUBMIT
   ========================================================= */

function showTutorialSubmit() {

    let submitButton =
        document.getElementById("submit-button");


    if (!submitButton) {

        submitButton =
            document.createElement("button");

        submitButton.id =
            "submit-button";

        submitButton.className =
            "submit-button";

        submitButton.textContent =
            "Submit";

        submitButton.addEventListener(
            "click",
            submitTutorialAnswer
        );

        document
            .getElementById("answer-area")
            .appendChild(submitButton);
    }


    submitButton.classList.remove("hidden");
}


/* =========================================================
   SUBMIT TUTORIAL ANSWER
   ========================================================= */

function submitTutorialAnswer() {

    if (tutorialSelectedAnswer === null) {

        document.getElementById("feedback").innerHTML =
            `<span class="incorrect">Please choose an answer first.</span>`;

        return;
    }


    const answerArea =
        document.getElementById("answer-area");


    const correctAnswer =
        answerArea.dataset.correctAnswer;


    const customIncorrect =
        answerArea.dataset.customIncorrect;


    const submitted =
        String(tutorialSelectedAnswer);


    const correct =
        submitted === correctAnswer;


    /* Disable answer buttons after submission. */

    document
        .querySelectorAll("#answer-area .answer-button")
        .forEach(button => {

            button.disabled = true;

        });


    const submitButton =
        document.getElementById("submit-button");

    if (submitButton) {
        submitButton.remove();
    }


    /* =====================================================
       CORRECT
       ===================================================== */

    if (correct) {

        const messages = [
            "Correct! 🎉",
            "Good Job! 🎉",
            "Spot On! 🎉",
            "Nice One! 🎉",
            "Perfect! 🎉",
            "Awesome! 🎉",
            "Keep It Up! 🎉"
        ];

        const message =
            messages[
                randomInt(0, messages.length - 1)
            ];


        document.getElementById("feedback").innerHTML =
            `<span class="correct">${message}</span>`;


        if (typeof window.currentTutorialCorrectCallback === "function") {

            window.currentTutorialCorrectCallback(
                tutorialSelectedAnswer
            );

        }


        updateTutorialSidebar();


        /*
           Instead of automatically moving forward,
           show Next.
        */

        showTutorialNextButton();

    }


    /* =====================================================
       INCORRECT
       ===================================================== */

    else {

        const message =
            customIncorrect ||
            "Sorry, not quite... Try again!";


        document.getElementById("feedback").innerHTML =
            `<span class="incorrect">${message}</span>`;


        /*
           Allow the player to try again.

           Re-enable the answer buttons.
        */

        document
            .querySelectorAll("#answer-area .answer-button")
            .forEach(button => {

                button.disabled = false;

            });


        tutorialSelectedAnswer = null;


        /*
           Remove the selection.
        */

        document
            .querySelectorAll("#answer-area .answer-button")
            .forEach(button => {

                button.classList.remove("selected");

            });


        /*
           Submit button is recreated when the user
           chooses another answer.
        */

        updateTutorialSidebar();
    }
}


/* =========================================================
   NEXT BUTTON
   ========================================================= */

function showTutorialNextButton() {

    let nextButton =
        document.getElementById("tutorial-next-button");


    if (!nextButton) {

        nextButton =
            document.createElement("button");

        nextButton.id =
            "tutorial-next-button";

        nextButton.className =
            "submit-button";

        nextButton.textContent =
            "Next";

        nextButton.addEventListener(
            "click",
            advanceTutorial
        );

        document
            .getElementById("answer-area")
            .appendChild(nextButton);
    }

    nextButton.classList.remove("hidden");
}


/* =========================================================
   ADVANCE TUTORIAL
   ========================================================= */

function advanceTutorial() {

    if (tutorialStep === 10.1) {

        tutorialAnswers["10.1"] =
            tutorialSelectedAnswer;

        tutorialStep = 10.2;

    }

    else if (tutorialStep === 10.2) {

        tutorialStep = 11;

    }

    else {

        tutorialStep++;
    }


    if (tutorialStep === 11) {

        finishTutorial();

        return;
    }


    renderTutorialStep();
}


/* =========================================================
   FINISH TUTORIAL
   ========================================================= */

function finishTutorial() {

    const calc =
        calculateDoomsday(
            tutorialDate.getFullYear()
        );

    const weekday =
        WEEKDAYS[
            tutorialDate.getDay()
        ];


    tutorialStep = 11;

    document.getElementById("step-counter")
        .textContent = "Finished";


    document.getElementById("date-display")
        .textContent =
            formatDate(tutorialDate);


    document.getElementById("question").innerHTML = `
        Congratulations! With simple mental math, we figured out that
        <strong>${formatDate(tutorialDate)}</strong> was a
        <strong>${weekday}</strong>.<br><br>

        Once you've got those steps down, it's smooth sailing from here.<br><br>

        If you feel like restudying this process to learn more about it,
        feel free to come back to the <strong>Tutorial!</strong>
        If you want to get more efficient with these steps, try
        <strong>Practice</strong> or <strong>Guided</strong> next!
        Once you've really got it down, challenge yourself with
        <strong>Quiz</strong> and <strong>Endless</strong>!<br><br>

        Thanks for playing, and have fun training!
        <em>-Finn</em> 🦊
    `;


    document.getElementById("answer-area").innerHTML = "";


    const restart =
        document.getElementById("new-date-button");

    restart.textContent =
        "Restart";


    updateTutorialSidebar();
}


/* =========================================================
   TUTORIAL SIDEBAR
   ========================================================= */

function setSidebarResult(step, result) {

    const element =
        document.getElementById(
            `sidebar-step-${step}`
        );

    if (!element) {
        return;
    }

    const resultElement =
        element.querySelector(".sidebar-result");

    if (resultElement) {
        resultElement.textContent =
            result;
    }

    element.classList.add("completed");
}


function updateTutorialSidebar() {

    for (let i = 1; i <= 10; i++) {

        const element =
            document.getElementById(
                `sidebar-step-${i}`
            );

        if (!element) {
            continue;
        }

        element.classList.remove("active");

    }


    /*
       Steps 1-10 correspond to tutorialStep.
       Step 10.1 and 10.2 both highlight Step 10.
    */

    let activeStep =
        tutorialStep;

    if (tutorialStep === 10.1 ||
        tutorialStep === 10.2) {

        activeStep = 10;

    }


    if (activeStep >= 1 && activeStep <= 10) {

        const active =
            document.getElementById(
                `sidebar-step-${activeStep}`
            );

        if (active) {
            active.classList.add("active");
        }

    }


    /*
       Completed steps.
    */

    for (let i = 1; i <= 10; i++) {

        const element =
            document.getElementById(
                `sidebar-step-${i}`
            );

        if (!element) {
            continue;
        }

        if (i < activeStep) {
            element.classList.add("completed");
        }

    }
}


/* =========================================================
   TUTORIAL BUTTONS
   ========================================================= */

document
    .getElementById("new-date-button")
    .addEventListener("click", () => {

        startTutorial();

    });


document
    .getElementById("back-home-button")
    .addEventListener("click", () => {

        goHome();

    });


/* =========================================================
   ENDLESS
   ========================================================= */

function resetEndless() {

    endlessStreak = 0;

    const streak =
        document.getElementById("endless-streak");

    if (streak) {
        streak.textContent = "🔥0 Streak";
    }
}


function startEndless() {

    resetEndless();

    showScreen("endless-screen");

    loadEndlessQuestion();
}


function loadEndlessQuestion() {

    const date =
        randomDate(1600, 2499);

    const dateElement =
        document.getElementById("endless-date");

    const question =
        document.getElementById("endless-question");

    const answerArea =
        document.getElementById(
            "endless-answer-area"
        );

    const feedback =
        document.getElementById(
            "endless-feedback"
        );

    const submit =
        document.getElementById(
            "endless-submit"
        );

    const next =
        document.getElementById(
            "endless-next"
        );


    dateElement.textContent =
        formatDate(date);

    question.textContent =
        "Which weekday is this date?";


    answerArea.innerHTML = "";

    feedback.innerHTML = "";

    submit.classList.add("hidden");

    next.classList.add("hidden");


    let selected = null;


    WEEKDAYS.forEach(day => {

        const button =
            document.createElement("button");

        button.className =
            "answer-button";

        button.textContent =
            day;

        button.addEventListener("click", () => {

            selected = day;

            document
                .querySelectorAll(
                    "#endless-answer-area .answer-button"
                )
                .forEach(btn => {

                    btn.classList.remove(
                        "selected"
                    );

                });

            button.classList.add(
                "selected"
            );

            submit.classList.remove(
                "hidden"
            );

        });

        answerArea.appendChild(button);

    });


    submit.onclick = () => {

        if (selected === null) {
            return;
        }

        const correct =
            WEEKDAYS[date.getDay()];


        document
            .querySelectorAll(
                "#endless-answer-area .answer-button"
            )
            .forEach(button => {

                button.disabled = true;

            });


        submit.classList.add("hidden");


        if (selected === correct) {

            endlessStreak++;

            document.getElementById(
                "endless-streak"
            ).textContent =
                `🔥${endlessStreak} Streak`;

            feedback.innerHTML =
                `<span class="correct">Correct! 🎉</span>`;

            next.classList.remove(
                "hidden"
            );

        }

        else {

            feedback.innerHTML =
                `<span class="incorrect">
                    Sorry, not quite! The answer was ${correct}.
                </span>`;

            endlessStreak = 0;

            document.getElementById(
                "endless-streak"
            ).textContent =
                "🔥0 Streak";

            next.classList.add(
                "hidden"
            );

        }

    };


    next.onclick = () => {

        loadEndlessQuestion();

    };
}


document
    .getElementById("endless-restart")
    .addEventListener("click", startEndless);


document
    .getElementById("endless-home")
    .addEventListener("click", goHome);


/* =========================================================
   PRACTICE PLACEHOLDER
   ========================================================= */

function startPractice() {

    showScreen("practice-screen");

    document.getElementById(
        "practice-content"
    ).innerHTML = `
        <p>Practice mode is coming soon!</p>
    `;
}


document
    .getElementById("practice-home")
    .addEventListener("click", goHome);


document
    .getElementById("practice-restart")
    .addEventListener("click", startPractice);


/* =========================================================
   GUIDED PLACEHOLDER
   ========================================================= */

function startGuided() {

    showScreen("guided-screen");

    document.getElementById(
        "guided-date"
    ).textContent =
        formatDate(
            randomDate(1600, 2499)
        );

    document.getElementById(
        "guided-question"
    ).textContent =
        "Guided mode is coming soon!";
}


document
    .getElementById("guided-home")
    .addEventListener("click", goHome);


document
    .getElementById("guided-restart")
    .addEventListener("click", startGuided);


/* =========================================================
   QUIZ PLACEHOLDER
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
    .getElementById("quiz-question-slider")
    .addEventListener("input", event => {

        document.getElementById(
            "quiz-question-count"
        ).textContent =
            event.target.value;

    });


document
    .getElementById("quiz-setup-home")
    .addEventListener("click", goHome);


document
    .getElementById("quiz-end")
    .addEventListener("click", goHome);


document
    .getElementById("quiz-restart")
    .addEventListener("click", startQuizSetup);


document
    .getElementById("quiz-results-home")
    .addEventListener("click", goHome);


/* =========================================================
   INITIAL SCREEN
   ========================================================= */

hideAllScreens();

document
    .getElementById("home-screen")
    .classList.remove("hidden");

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

const SHORT_MONTHS = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec."
];


/*
 * Doomsday dates.
 *
 * January and February are handled separately because
 * leap years change their dates.
 */
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


/*
 * Century anchor pattern.
 *
 * 18 -> 5
 * 19 -> 3
 * 20 -> 2
 * 21 -> 0
 *
 * It repeats every four centuries.
 */
const CENTURY_ANCHORS = {
    0: 2,
    1: 0,
    2: 5,
    3: 3
};


const CORRECT_MESSAGES = [
    "Correct! 🎉",
    "Good Job! 🎉",
    "Spot On! 🎉",
    "Nice One! 🎉",
    "Perfect! 🎉",
    "Awesome! 🎉",
    "Keep It Up! 🎉"
];


const DATE_RANGES = {
    normal: {
        min: new Date(1600, 0, 1),
        max: new Date(2499, 11, 31)
    },

    tutorial: {
        min: new Date(1800, 0, 1),
        max: new Date(2200, 11, 31)
    }
};


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentMode = null;


/* =========================================================
   TUTORIAL STATE
========================================================= */

let tutorial = {
    date: null,
    step: 0,

    selectedAnswer: null,
    submitted: false,

    values: {
        step1: null,
        step2: null,
        step3: null,
        step4: null,
        step5: null,
        step6: null,
        step7: null,
        step8: null,
        step9: null,
        step10_1: null,
        step10_2: null
    },

    doomsdayDate: null,
    targetWeekday: null
};


/* =========================================================
   GUIDED STATE
========================================================= */

let guided = {
    date: null,
    selectedAnswer: null,
    submitted: false,
    hintsUsed: 0,
    values: null
};


/* =========================================================
   ENDLESS STATE
========================================================= */

let endless = {
    date: null,
    streak: 0,
    selectedAnswer: null,
    submitted: false
};


/* =========================================================
   PRACTICE STATE
========================================================= */

let practice = {
    category: null,
    question: null,
    answer: null,
    submitted: false
};


/* =========================================================
   QUIZ STATE
========================================================= */

let quiz = {
    total: 10,
    current: 0,
    correct: 0,

    questions: [],

    selectedAnswer: null,
    submitted: false,

    startTime: null,
    timerInterval: null
};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function pad(number) {
    return String(number).padStart(2, "0");
}


/* =========================================================
   SIMPLE MARKDOWN
========================================================= */

function formatText(text) {

    if (!text) {
        return "";
    }

    /*
     * We control all of the strings passed into this function,
     * so these replacements are safe for our purposes.
     */

    let html = text;

    html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    html = html.replace(/\n/g, "<br>");

    /*
     * Tabs are intentionally preserved as visual indentation.
     */
    html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

    return html;
}


/* =========================================================
   DATE HELPERS
========================================================= */

function randomDate(range = "normal") {

    const min = DATE_RANGES[range].min.getTime();
    const max = DATE_RANGES[range].max.getTime();

    const timestamp = randomInteger(min, max);

    const date = new Date(timestamp);

    /*
     * Constructing a new Date from the random timestamp is
     * enough here because all ranges are local-calendar dates.
     */

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function formatDate(date) {

    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}


function formatShortDate(month, day) {

    return `${SHORT_MONTHS[month - 1]} ${day}`;
}


function formatFullShortDate(date) {

    return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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


function addDays(date, amount) {

    const result = new Date(date);

    result.setDate(result.getDate() + amount);

    return result;
}


function daysBetween(a, b) {

    const oneDay = 24 * 60 * 60 * 1000;

    const aUTC = Date.UTC(
        a.getFullYear(),
        a.getMonth(),
        a.getDate()
    );

    const bUTC = Date.UTC(
        b.getFullYear(),
        b.getMonth(),
        b.getDate()
    );

    return Math.round((bUTC - aUTC) / oneDay);
}


/* =========================================================
   DOOMSDAY ALGORITHM
========================================================= */

function centuryAnchor(century) {

    /*
     * JavaScript's % can be negative, so normalize it.
     */
    const cycle = ((century % 4) + 4) % 4;

    return CENTURY_ANCHORS[cycle];
}


function calculateDoomsday(year) {

    const century = Math.floor(year / 100);

    const anchor = centuryAnchor(century);

    const lastTwo = year % 100;

    const groupsOf12 = Math.floor(lastTwo / 12);

    const leftover = lastTwo % 12;

    const groupsOf4 = Math.floor(leftover / 4);

    return (
        anchor +
        groupsOf12 +
        leftover +
        groupsOf4
    ) % 7;
}


function calculateWeekday(date) {

    /*
     * This is used to verify the game internally.
     *
     * The player's interface still teaches the Doomsday
     * algorithm rather than exposing this calculation.
     */
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ).getDay();
}


function getDoomsdayDate(month, year) {

    let day = DOOMSDAY_DATES[month];

    if (month === 1 && isLeapYear(year)) {
        day = 4;
    }

    if (month === 2 && isLeapYear(year)) {
        day = 29;
    }

    return new Date(year, month - 1, day);
}


/* =========================================================
   TRANSITIONS
========================================================= */

function transitionTo(screenId, callback) {

    const flash = $("screen-flash");

    flash.style.transition = "opacity 0.18s ease";
    flash.style.opacity = "1";

    setTimeout(() => {

        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.add("hidden");
        });

        $(screenId).classList.remove("hidden");

        if (callback) {
            callback();
        }

        requestAnimationFrame(() => {
            flash.style.transition = "opacity 0.25s ease";
            flash.style.opacity = "0";
        });

    }, 180);
}


/* =========================================================
   RESET EVERYTHING
========================================================= */

function resetTutorialState() {

    tutorial = {
        date: null,
        step: 0,
        selectedAnswer: null,
        submitted: false,

        values: {
            step1: null,
            step2: null,
            step3: null,
            step4: null,
            step5: null,
            step6: null,
            step7: null,
            step8: null,
            step9: null,
            step10_1: null,
            step10_2: null
        },

        doomsdayDate: null,
        targetWeekday: null
    };

    resetTutorialSidebar();

    $("tutorial-answer-box").classList.remove("hidden");
    $("tutorial-next").classList.remove("hidden");
    $("tutorial-next").textContent = "Continue";

    $("tutorial-feedback").innerHTML = "";

    $("tutorial-submit").classList.add("hidden");
}


function resetTutorialSidebar() {

    const sidebar = $("tutorial-sidebar-steps");

    sidebar.innerHTML = "";

    const labels = [
        "Introduction",
        "Groups of 12",
        "Left over",
        "Groups of 4",
        "Century Anchor",
        "Add Them Up",
        "Reduce by 7",
        "Year's Doomsday",
        "Leap Year?",
        "Month's Doomsday",
        "Final Date"
    ];

    labels.forEach((label, index) => {

        const div = document.createElement("div");

        div.className = "sidebar-step";

        div.id = `tutorial-sidebar-step-${index}`;

        div.innerHTML = `
            <strong>${index}.</strong>
            ${label}
            <span class="sidebar-result"></span>
        `;

        sidebar.appendChild(div);
    });
}


function resetGuidedState() {

    guided = {
        date: null,
        selectedAnswer: null,
        submitted: false,
        hintsUsed: 0,
        values: null
    };

    $("guided-feedback").innerHTML = "";
    $("guided-submit").classList.add("hidden");
    $("guided-next").classList.add("hidden");

    buildGuidedSidebar();
}


function resetEndlessState() {

    endless = {
        date: null,
        streak: 0,
        selectedAnswer: null,
        submitted: false
    };

    $("endless-streak").textContent = "🔥0 Streak";
    $("endless-feedback").innerHTML = "";
    $("endless-submit").classList.add("hidden");
    $("endless-next").classList.add("hidden");
}


function resetPracticeState() {

    practice = {
        category: null,
        question: null,
        answer: null,
        submitted: false
    };

    $("practice-category-box").classList.remove("hidden");
    $("practice-question-box").classList.add("hidden");
    $("practice-feedback").innerHTML = "";
    $("practice-next").classList.add("hidden");
}


function stopQuizTimer() {

    if (quiz.timerInterval) {
        clearInterval(quiz.timerInterval);
        quiz.timerInterval = null;
    }
}


function resetQuizState() {

    stopQuizTimer();

    quiz = {
        total: 10,
        current: 0,
        correct: 0,
        questions: [],
        selectedAnswer: null,
        submitted: false,
        startTime: null,
        timerInterval: null
    };

    $("quiz-setup").classList.remove("hidden");
    $("quiz-play").classList.add("hidden");
    $("quiz-results").classList.add("hidden");
}


/* =========================================================
   HOME
========================================================= */

function goHome() {

    /*
     * Reset every mode when returning home.
     */
    resetTutorialState();
    resetGuidedState();
    resetEndlessState();
    resetPracticeState();
    resetQuizState();

    currentMode = null;

    transitionTo("home-screen");
}


/* =========================================================
   GENERIC ANSWER BUTTONS
========================================================= */

function createAnswerButtons(container, answers, onSelect) {

    container.innerHTML = "";

    answers.forEach(answer => {

        const button = document.createElement("button");

        button.className = "answer-button";

        button.textContent = answer;

        button.dataset.answer = answer;

        button.addEventListener("click", () => {

            container
                .querySelectorAll(".answer-button")
                .forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");

            onSelect(answer);
        });

        container.appendChild(button);
    });
}


function disableAnswerButtons(container) {

    container
        .querySelectorAll(".answer-button")
        .forEach(button => {
            button.disabled = true;
        });
}


function enableAnswerButtons(container) {

    container
        .querySelectorAll(".answer-button")
        .forEach(button => {
            button.disabled = false;
        });
}


function randomCorrectMessage() {

    return randomItem(CORRECT_MESSAGES);
}


/* =========================================================
   TUTORIAL SIDEBAR
========================================================= */

function updateTutorialSidebar() {

    const values = tutorial.values;

    const resultMap = {
        1: values.step1,
        2: values.step2,
        3: values.step3,
        4: values.step4,
        5: values.step5,
        6: values.step6,
        7: values.step7,
        8: values.step8,
        9: values.step9,
        10: values.step10_2
    };

    for (let i = 0; i <= 10; i++) {

        const element = $(`tutorial-sidebar-step-${i}`);

        if (!element) {
            continue;
        }

        element.classList.remove(
            "active",
            "completed",
            "remembered"
        );

        const result = element.querySelector(".sidebar-result");

        result.textContent = "";

        if (i === tutorial.step) {
            element.classList.add("active");
        }

        if (i >= 1 && i <= 4 && values[`step${i}`] !== null) {

            element.classList.add("remembered");

            result.textContent = "Remembered";
        }
        else if (resultMap[i] !== null && resultMap[i] !== undefined) {

            element.classList.add("completed");

            result.textContent = resultMap[i];
        }
    }
}


/* =========================================================
   TUTORIAL START
========================================================= */

function startTutorial() {

    currentMode = "tutorial";

    resetTutorialState();

    tutorial.date = randomDate("tutorial");
    tutorial.targetWeekday = calculateWeekday(tutorial.date);

    $("tutorial-date").textContent = formatDate(tutorial.date);
    $("tutorial-sidebar-date").textContent = formatDate(tutorial.date);

    $("tutorial-step-counter").textContent = "Step 0 of 10";

    transitionTo(
        "tutorial-screen",
        () => renderTutorialStep()
    );
}


/* =========================================================
   TUTORIAL STEP RENDERING
========================================================= */

function renderTutorialStep() {

    tutorial.selectedAnswer = null;
    tutorial.submitted = false;

    $("tutorial-feedback").innerHTML = "";

    $("tutorial-answer-box").classList.remove("hidden");

    $("tutorial-submit").classList.add("hidden");

    $("tutorial-next").classList.add("hidden");

    $("tutorial-next").textContent = "Continue";

    $("tutorial-answers").innerHTML = "";

    $("tutorial-question").innerHTML = "";

    updateTutorialSidebar();

    $("tutorial-step-counter").textContent =
        `Step ${tutorial.step} of 10`;

    /*
     * STEP 0
     */
    if (tutorial.step === 0) {

        $("tutorial-main-text").innerHTML = formatText(
            `Hello! **I'm Finn**, the little guy in the corner cheering you on, and I'm so happy you decided to check out my game.\nFor this tutorial, we will be finding the weekday of **${formatDate(tutorial.date)}**. Guided questions will help teach the simple step-by-step process, with this date as an example. It gets easier the more we practice!\nPress **Continue** when you're ready.`
        );

        $("tutorial-answer-box").classList.remove("hidden");

        $("tutorial-question").innerHTML = "";

        $("tutorial-next").classList.remove("hidden");

        return;
    }


    /*
     * STEP 1
     */
    if (tutorial.step === 1) {

        const year = tutorial.date.getFullYear();
        const yy = String(year).slice(-2);

        $("tutorial-main-text").innerHTML = formatText(
            `Let's look at the **last two digits of the year**. In this case, the last two digits of ${year} are **${yy}**.\nOur first step is to divide ${yy} by 12, which just means we need to **count how many groups of 12 are in ${yy}**.`
        );

        $("tutorial-question").textContent =
            `How many groups of 12 are in ${yy}?`;

        createAnswerButtons(
            $("tutorial-answers"),
            [0,1,2,3,4,5,6,7,8],
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 2
     */
    if (tutorial.step === 2) {

        const year = tutorial.date.getFullYear();
        const yy = Number(String(year).slice(-2));

        $("tutorial-main-text").innerHTML = formatText(
            `Great, **${tutorial.values.step1} is our first number!** Remember the next 3 numbers as well, because they'll all be important in Step 5.\nNow, with ${tutorial.values.step1} groups of 12, **think about what's still remaining...**`
        );

        $("tutorial-question").textContent =
            `What amount is left over, outside of the groups of 12?`;

        createAnswerButtons(
            $("tutorial-answers"),
            [0,1,2,3,4,5,6,7,8,9,10,11],
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 3
     */
    if (tutorial.step === 3) {

        $("tutorial-main-text").innerHTML = formatText(
            `**${tutorial.values.step2} is our second number!**\nWe have to do some more counting to find the third. This time, we have to count **how many groups of 4 are in ${tutorial.values.step2}.**`
        );

        $("tutorial-question").textContent =
            `How many groups of 4 are in ${tutorial.values.step2}?`;

        createAnswerButtons(
            $("tutorial-answers"),
            [0,1,2,3],
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 4
     */
    if (tutorial.step === 4) {

        const year = tutorial.date.getFullYear();
        const century = Math.floor(year / 100);

        $("tutorial-main-text").innerHTML = formatText(
            `Nice, **${tutorial.values.step3} is our third number!** Finding the fourth number is a bit trickier, but it's the last number we need for now.\nLet's look at the **first two digits of the year** instead, which for ${year} is ${century}. This represents the *century*, and each century has a *century anchor*...\n\t18 = **5**.\n\t19 = **3**.\n\t20 = **2**.\n\t21 = **0**.\nThis **5-3-2-0 pattern** continues forward and backward in a loop forever, so knowing the anchor for just one century means you know the anchor for every century!\nRemember that **our century is ${century}** for this example...`
        );

        $("tutorial-question").textContent =
            `What is the century anchor for ${century}?`;

        createAnswerButtons(
            $("tutorial-answers"),
            [0,2,3,5],
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 5
     */
    if (tutorial.step === 5) {

        $("tutorial-main-text").innerHTML = formatText(
            `Perfect, **the** ***century anchor*** **is our fourth and final number!** Let's put it all together.\nHopefully you **remember all four numbers**, because we need to add them together now!\nIt's okay if you don't remember; the four numbers have been written in the sidebar if you need help. But if you want to do this on the fly, **you'll need to remember them without help in the future.**`
        );

        $("tutorial-question").textContent =
            `What's the result of adding all four numbers together?`;

        createAnswerButtons(
            $("tutorial-answers"),
            Array.from({ length: 21 }, (_, i) => i),
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 6
     */
    if (tutorial.step === 6) {

        $("tutorial-main-text").innerHTML = formatText(
            `For the last question's sum (${tutorial.values.step5} in our case), **take 7 away from that number until we have a result lower than 7.**`
        );

        $("tutorial-question").textContent =
            `What's left over?`;

        createAnswerButtons(
            $("tutorial-answers"),
            [0,1,2,3,4,5,6],
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 7
     */
    if (tutorial.step === 7) {

        $("tutorial-main-text").innerHTML = formatText(
            `**This leftover number, ${tutorial.values.step6}, represents a weekday!** Zero (0) is Sunday, One (1) is Monday, and so on...\nThere's a fun mnemonic to help you remember this pattern:\n**0** is "NONEday," which sounds like **Sunday**,\n**1** is "ONEday," which sounds like **Monday**,\n**2** is "TWOSday," which sounds like **Tuesday**,\n**3** is "three syllables," which is the amount that **Wednesday** has,\n**4** is "FOURsday," which sounds like **Thursday**,\n**5** is "FIVEday," which sounds like **Friday**,\n**6** is "SIXturday," which sounds like **Saturday**.`
        );

        $("tutorial-question").textContent =
            `Using the mnemonic above, which weekday does ${tutorial.values.step6} represent?`;

        createAnswerButtons(
            $("tutorial-answers"),
            WEEKDAYS,
            answer => tutorial.selectedAnswer = answer
        );

        return;
    }


    /*
     * STEP 8
     */
    if (tutorial.step === 8) {

        const year = tutorial.date.getFullYear();
        const yy = String(year).slice(-2);

        $("tutorial-main-text").innerHTML = formatText(
            `Now, before we get to calculating the date, we need to **check if ${year} is a leap year** or not. Take the last two digits of the year (${yy} in our case), and make groups of 4.\nIf we can make groups of four with **no leftovers**, then **${year} is a leap year**. If we can't, then **${year} is not a leap year**.\n(If the **last two digits are "00,"** then use the first two digits instead. That would be ${Math.floor(year / 100)} for us.)`
        );

        $("tutorial-question").textContent =
            `Is ${year} a leap year?`;

        createAnswerButtons(
            $("tutorial-answers"),
            ["Yes", "No"],
            answer => tutorial.selectedAnswer = answer
        );

        return;
    }


    /*
     * STEP 9
     */
    if (tutorial.step === 9) {

        const year = tutorial.date.getFullYear();
        const month = tutorial.date.getMonth() + 1;
        const weekday = tutorial.values.step7;

        const doomsdayDates = getAllDoomsdayOptions(year);

        $("tutorial-main-text").innerHTML = formatText(
            `The most important step has come!\nThis step-by-step process is called the **Doomsday Algorithm**. It sounds scary, but it isn't; It's called that because there are certain **Doomsday dates** **that always share the same weekday**... and the weekday we calculated in Step 7, **${weekday}**, is the weekday they all share!\nEach month has exactly one Doomsday date:\nJanuary **3** (January **4** on **leap years**),\nFebruary **28** (February **29** on **leap years**),\nMarch **14**,\nApril **4**,\nMay **9**,\nJune **6**,\nJuly **11**,\nAugust **8**,\nSeptember **5**,\nOctober **10**,\nNovember **7**,\nDecember **12**.\nThere are also some rules and fun mnemonics to make remembering these dates easy!\n1. **Even months (Except February) share their Doomsday date with their month number:** 4/4, 6/6, 8/8, 10/10, 12/12.\n2. **"I work 9-5 at 7-11"** is a fun mnemonic that covers 5/9, 7/11, 9/5, and 11/7.\n3. **"Every 4 years, it's the 4th"** to remember that January 4th is the Doomsday date every leap year instead of the typical January 3rd. February's is simply **the last day of February**, whether that be the 28th or 29th.\n4. March's Doomsday date is **Pi Day**, March 14! (3/14).\nThat's probably a lot to digest! Take your time memorizing these dates, and **go to Practice mode after this to help learn them** more efficiently.`
        );

        $("tutorial-question").textContent =
            `So, given the rules above, what is the closest Doomsday date to our target date?`;

        createAnswerButtons(
            $("tutorial-answers"),
            doomsdayDates,
            answer => tutorial.selectedAnswer = answer
        );

        return;
    }


    /*
     * STEP 10
     *
     * Part 1
     */
    if (tutorial.step === 10) {

        const doomsday = getDoomsdayDate(
            tutorial.date.getMonth() + 1,
            tutorial.date.getFullYear()
        );

        tutorial.doomsdayDate = doomsday;

        $("tutorial-main-text").innerHTML = formatText(
            `Finally, we can begin calculating the weekday of our target date!\nWe found that our Doomsday date is **${formatDate(doomsday)}**, which we know now was a **${WEEKDAYS[tutorial.values.step7]}**. From here, all we need to do is start counting the days before or after this date to get to our target.\n**Every 7 days, the week repeats.** This simple fact will help us out a lot with counting! Count forward or backward from **${formatShortDate(doomsday.getMonth() + 1, doomsday.getDate())}** by 7 days until you're within one week of the target date.`
        );

        $("tutorial-question").textContent =
            `How many full weeks, backward or forward, will we move?`;

        createAnswerButtons(
            $("tutorial-answers"),
            [-4,-3,-2,-1,0,1,2,3,4].map(n =>
                n > 0 ? `+${n}` : String(n)
            ),
            answer => tutorial.selectedAnswer = Number(answer)
        );

        return;
    }


    /*
     * STEP 10.2
     */
    if (tutorial.step === 11) {

        renderTutorialFinalCounting();

        return;
    }


    /*
     * END
     */
    if (tutorial.step === 12) {

        $("tutorial-main-text").innerHTML = formatText(
            `Congratulations! With simple mental math, we figured out that **${formatDate(tutorial.date)}** was a **${WEEKDAYS[tutorial.targetWeekday]}**. Once you've got those steps down, it's smooth sailing from here.\nIf you feel like restudying this process to learn more about it, feel free to come back to the **Tutorial!** If you want to get more efficient with these steps, try **Practice** or **Guided** next! Once you've really got it down, challenge yourself with **Quiz** and **Endless**!\nThanks for playing, and have fun training! *-Finn* 🦊`
        );

        $("tutorial-answer-box").classList.add("hidden");

        $("tutorial-feedback").innerHTML = "";

        $("tutorial-next").classList.remove("hidden");
        $("tutorial-next").textContent = "Finish";

        return;
    }
}


/* =========================================================
   DOOMSDAY OPTIONS
========================================================= */

function getAllDoomsdayOptions(year) {

    const options = [];

    for (let month = 1; month <= 12; month++) {

        const day = getDoomsdayDate(month, year).getDate();

        options.push(`${SHORT_MONTHS[month - 1]} ${day}`);
    }

    /*
     * The user specifically wants BOTH possible January and
     * February dates as selectable options.
     */
    options.splice(1, 0, `Jan. ${isLeapYear(year) ? 3 : 4}`);
    options.splice(3, 0, `Feb. ${isLeapYear(year) ? 28 : 29}`);

    /*
     * Remove duplicates while keeping both Jan/Feb choices.
     */
    return [
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
}


/* =========================================================
   TUTORIAL SUBMISSION
========================================================= */

$("tutorial-submit").addEventListener("click", submitTutorialAnswer);


function submitTutorialAnswer() {

    if (tutorial.selectedAnswer === null) {

        $("tutorial-feedback").innerHTML =
            "Please choose an answer first.";

        return;
    }

    const step = tutorial.step;

    let correct = false;

    let expected = null;

    if (step === 1) {

        const yy = Number(
            String(tutorial.date.getFullYear()).slice(-2)
        );

        expected = Math.floor(yy / 12);

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 2) {

        const yy = Number(
            String(tutorial.date.getFullYear()).slice(-2)
        );

        expected = yy % 12;

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 3) {

        expected = Math.floor(tutorial.values.step2 / 4);

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 4) {

        const century =
            Math.floor(tutorial.date.getFullYear() / 100);

        expected = centuryAnchor(century);

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 5) {

        expected =
            tutorial.values.step1 +
            tutorial.values.step2 +
            tutorial.values.step3 +
            tutorial.values.step4;

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 6) {

        expected = tutorial.values.step5 % 7;

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 7) {

        expected = WEEKDAYS[tutorial.values.step6];

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 8) {

        expected = isLeapYear(tutorial.date.getFullYear())
            ? "Yes"
            : "No";

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 9) {

        const targetMonth =
            tutorial.date.getMonth() + 1;

        const correctDate =
            getDoomsdayDate(
                targetMonth,
                tutorial.date.getFullYear()
            );

        expected =
            `${SHORT_MONTHS[targetMonth - 1]} ${correctDate.getDate()}`;

        correct = tutorial.selectedAnswer === expected;
    }

    else if (step === 10) {

        expected = calculateWeekMovement();

        correct = tutorial.selectedAnswer === expected;

        if (correct) {
            tutorial.values.step10_1 = expected;
        }
    }

    else if (step === 11) {

        expected = WEEKDAYS[tutorial.targetWeekday];

        correct = tutorial.selectedAnswer === expected;

        if (correct) {
            tutorial.values.step10_2 = expected;
        }
    }


    if (correct) {

        saveTutorialStepResult(expected);

        $("tutorial-feedback").innerHTML =
            `<span class="correct">${randomCorrectMessage()}</span>`;

        tutorial.submitted = true;

        disableAnswerButtons($("tutorial-answers"));

        $("tutorial-submit").classList.add("hidden");

        $("tutorial-next").classList.remove("hidden");

        $("tutorial-next").textContent =
            step === 11 ? "Finish" : "Next";

    }
    else {

        let message = getTutorialIncorrectMessage(step);

        $("tutorial-feedback").innerHTML =
            `<span class="incorrect">${formatText(message)}</span>`;

        /*
         * Allow the user to change their answer after an incorrect
         * submission.
         */
        enableAnswerButtons($("tutorial-answers"));

        $("tutorial-submit").classList.remove("hidden");
    }
}


function saveTutorialStepResult(value) {

    if (tutorial.step === 1) {
        tutorial.values.step1 = value;
    }

    if (tutorial.step === 2) {
        tutorial.values.step2 = value;
    }

    if (tutorial.step === 3) {
        tutorial.values.step3 = value;
    }

    if (tutorial.step === 4) {
        tutorial.values.step4 = value;
    }

    if (tutorial.step === 5) {
        tutorial.values.step5 = value;
    }

    if (tutorial.step === 6) {
        tutorial.values.step6 = value;
    }

    if (tutorial.step === 7) {
        tutorial.values.step7 = value;
    }

    if (tutorial.step === 8) {
        tutorial.values.step8 = value;
    }

    if (tutorial.step === 9) {

        tutorial.values.step9 = value;

        const targetMonth =
            tutorial.date.getMonth() + 1;

        tutorial.doomsdayDate =
            getDoomsdayDate(
                targetMonth,
                tutorial.date.getFullYear()
            );
    }

    updateTutorialSidebar();
}


/* =========================================================
   TUTORIAL INCORRECT MESSAGES
========================================================= */

function getTutorialIncorrectMessage(step) {

    const year = tutorial.date.getFullYear();

    const yy = String(year).slice(-2);

    switch (step) {

        case 1:
            return `Sorry, that isn't it. Imagine ${yy} objects that you divide into groups of 12, then count the number of groups!`;

        case 2:
            return `Sorry, not quite. You can also think about it like this: If you start with ${yy} and keep taking away 12, eventually you'll reach a number that's less than 12...`;

        case 3:
            return "Not quite. Try again!";

        case 4:
            return "Sorry, that isn't it... Remember to use the table if you're having trouble; memorization will come with time!";

        case 5:
            return `Sorry, that isn't it! What's the sum of ${tutorial.values.step1}, ${tutorial.values.step2}, ${tutorial.values.step3}, and ${tutorial.values.step4}?`;

        case 6:
            return `Not quite! From another angle, this is very similar to the grouping exercise from earlier; How many groups of 7 are in ${tutorial.values.step5}? More importantly, what's left over?`;

        case 7:
            return "That's not it. Try again!";

        case 8: {

            const leap = isLeapYear(year);

            const yyNumber = Number(yy);

            const divisor = yyNumber === 0
                ? Math.floor(year / 100)
                : yyNumber;

            const leftOver = divisor % 4;

            return `Sorry, but that's not correct: ${year} ${leap ? "is" : "isn't"} a leap year, because ${divisor} divided by 4 leaves a remainder of ${leftOver}.`;
        }

        case 9:

            return `Sorry, but that isn't it! For a big hint, you can simply match the month of our target date, ${MONTHS[tutorial.date.getMonth()]}, with the Doomsday date's month. Don't forget about leap years!`;

        case 10:

            return `Not quite. Remembering the amount of days in the months might help! "30 days hath September, April, June, and November" is a mnemonic I personally like).`;

        case 11:

            return "That's not it! Try again.";

        default:

            return "Sorry, not quite... Try again!";
    }
}


/* =========================================================
   TUTORIAL NEXT
========================================================= */

$("tutorial-next").addEventListener("click", () => {

    if (tutorial.step === 0) {

        tutorial.step = 1;
        renderTutorialStep();
        return;
    }

    if (tutorial.step >= 1 && tutorial.step <= 9) {

        tutorial.step++;

        renderTutorialStep();

        return;
    }

    if (tutorial.step === 10) {

        tutorial.step = 11;

        renderTutorialStep();

        return;
    }

    if (tutorial.step === 11) {

        tutorial.step = 12;

        renderTutorialStep();

        return;
    }

    if (tutorial.step === 12) {

        /*
         * Finish should behave like restarting the Tutorial,
         * so the button becomes Continue again immediately.
         */
        resetTutorialState();

        tutorial.date = randomDate("tutorial");

        tutorial.targetWeekday =
            calculateWeekday(tutorial.date);

        $("tutorial-date").textContent =
            formatDate(tutorial.date);

        $("tutorial-sidebar-date").textContent =
            formatDate(tutorial.date);

        $("tutorial-next").textContent = "Continue";

        tutorial.step = 0;

        renderTutorialStep();
    }
});


/* =========================================================
   STEP 10 CALCULATION
========================================================= */

function calculateWeekMovement() {

    const doomsday = tutorial.doomsdayDate;

    const difference =
        daysBetween(
            doomsday,
            tutorial.date
        );

    /*
     * We want the number of complete 7-day movements that
     * brings us within seven days of the target.
     */
    return Math.trunc(difference / 7);
}


function renderTutorialFinalCounting() {

    const movement =
        tutorial.values.step10_1;

    const movedDate =
        addDays(
            tutorial.doomsdayDate,
            movement * 7
        );

    const remaining =
        Math.abs(
            daysBetween(
                movedDate,
                tutorial.date
            )
        );

    const direction =
        movement >= 0
            ? "forward"
            : "backward";

    const weekWord =
        Math.abs(movement) === 1
            ? "week"
            : "weeks";

    const position =
        daysBetween(
            movedDate,
            tutorial.date
        );

    const relation =
        position >= 0
            ? "ahead of"
            : "behind";

    const dayWord =
        remaining === 1
            ? "day"
            : "days";

    $("tutorial-main-text").innerHTML = formatText(
        `Great; You've now moved **${Math.abs(movement)} ${weekWord} ${direction}**.\nWe are now at **${formatDate(movedDate)}**, which is **${remaining} ${dayWord} ${relation} your target.** Now, our last step is to **count forward and backward from ${WEEKDAYS[calculateWeekday(movedDate)]}, ${formatDate(movedDate)} to our target date ${formatDate(tutorial.date)}:**`
    );

    $("tutorial-question").textContent =
        `Final question... Which weekday is the target date?`;

    createAnswerButtons(
        $("tutorial-answers"),
        WEEKDAYS,
        answer => tutorial.selectedAnswer = answer
    );

    $("tutorial-submit").classList.add("hidden");

    $("tutorial-next").classList.add("hidden");
}


/* =========================================================
   TUTORIAL RESTART / HOME
========================================================= */

$("tutorial-restart").addEventListener("click", () => {

    resetTutorialState();

    tutorial.date = randomDate("tutorial");

    tutorial.targetWeekday =
        calculateWeekday(tutorial.date);

    $("tutorial-date").textContent =
        formatDate(tutorial.date);

    $("tutorial-sidebar-date").textContent =
        formatDate(tutorial.date);

    tutorial.step = 0;

    renderTutorialStep();
});


$("tutorial-home").addEventListener("click", goHome);


/* =========================================================
   GUIDED
========================================================= */

function startGuided() {

    currentMode = "guided";

    resetGuidedState();

    guided.date = randomDate("normal");

    $("guided-date").textContent =
        formatDate(guided.date);

    $("guided-sidebar-date").textContent =
        formatDate(guided.date);

    guided.values = getAlgorithmValues(guided.date);

    transitionTo(
        "guided-screen",
        () => renderGuided()
    );
}


function getAlgorithmValues(date) {

    const year = date.getFullYear();

    const lastTwo =
        Number(String(year).slice(-2));

    const step1 =
        Math.floor(lastTwo / 12);

    const step2 =
        lastTwo % 12;

    const step3 =
        Math.floor(step2 / 4);

    const step4 =
        centuryAnchor(Math.floor(year / 100));

    const step5 =
        step1 + step2 + step3 + step4;

    const step6 =
        step5 % 7;

    const step7 =
        WEEKDAYS[step6];

    const leap =
        isLeapYear(year);

    const doomsdayDate =
        getDoomsdayDate(
            date.getMonth() + 1,
            year
        );

    return {
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        leap,
        doomsdayDate
    };
}


function buildGuidedSidebar() {

    const labels = [
        "Groups of 12",
        "Left over",
        "Groups of 4",
        "Century Anchor",
        "Add Them Up",
        "Reduce by 7",
        "Year's Doomsday",
        "Leap Year?",
        "Month's Doomsday",
        "Final Date"
    ];

    const container =
        $("guided-hint-list");

    container.innerHTML = "";

    labels.forEach((label, index) => {

        const button =
            document.createElement("button");

        button.className = "guided-hint";

        button.textContent =
            `${index + 1}. ${label}`;

        button.addEventListener("click", () => {

            useGuidedHint(index + 1, button);

        });

        container.appendChild(button);
    });
}


function useGuidedHint(step, button) {

    if (guided.hintsUsed >= 3) {
        return;
    }

    if (button.classList.contains("used")) {
        return;
    }

    guided.hintsUsed++;

    button.classList.add("used");

    const value = guided.values;

    let message = "";

    /*
     * First hint: vague.
     * Second hint: precise.
     * Third hint: essentially answer.
     */

    const hintLevel = guided.hintsUsed;

    if (step === 1) {

        if (hintLevel === 1) {
            message = "Think about how many groups of 12 fit into the last two digits.";
        }
        else if (hintLevel === 2) {
            message = `The last two digits are ${String(guided.date.getFullYear()).slice(-2)}.`;
        }
        else {
            message = `The answer is ${value.step1}.`;
        }
    }

    else if (step === 2) {

        if (hintLevel === 1) {
            message = "After making groups of 12, think about what is still left.";
        }
        else if (hintLevel === 2) {
            message = `Start with ${String(guided.date.getFullYear()).slice(-2)} and take away 12 repeatedly.`;
        }
        else {
            message = `The answer is ${value.step2}.`;
        }
    }

    else if (step === 3) {

        if (hintLevel === 1) {
            message = "Now divide the leftover amount into groups of 4.";
        }
        else if (hintLevel === 2) {
            message = `How many complete groups of 4 fit into ${value.step2}?`;
        }
        else {
            message = `The answer is ${value.step3}.`;
        }
    }

    else if (step === 4) {

        if (hintLevel === 1) {
            message = "Think about the repeating 5-3-2-0 century-anchor pattern.";
        }
        else if (hintLevel === 2) {
            message = `The century is ${Math.floor(guided.date.getFullYear() / 100)}.`;
        }
        else {
            message = `The answer is ${value.step4}.`;
        }
    }

    else if (step === 5) {

        if (hintLevel === 1) {
            message = "Add the four numbers you calculated.";
        }
        else if (hintLevel === 2) {
            message =
                `${value.step1} + ${value.step2} + ${value.step3} + ${value.step4}.`;
        }
        else {
            message = `The answer is ${value.step5}.`;
        }
    }

    else if (step === 6) {

        if (hintLevel === 1) {
            message = "Keep taking away 7 until the result is below 7.";
        }
        else if (hintLevel === 2) {
            message = `Start with ${value.step5}.`;
        }
        else {
            message = `The answer is ${value.step6}.`;
        }
    }

    else if (step === 7) {

        if (hintLevel === 1) {
            message = "Use the numbered weekday mnemonic.";
        }
        else if (hintLevel === 2) {
            message = `${value.step6} is the weekday number you need.`;
        }
        else {
            message = `The answer is ${value.step7}.`;
        }
    }

    else if (step === 8) {

        if (hintLevel === 1) {
            message = "Check whether the year can be evenly divided by 4.";
        }
        else if (hintLevel === 2) {
            message = `The year is ${guided.date.getFullYear()}.`;
        }
        else {
            message = `The answer is ${value.leap ? "Yes" : "No"}.`;
        }
    }

    else if (step === 9) {

        if (hintLevel === 1) {
            message = "Look for the Doomsday date in the same month as your target.";
        }
        else if (hintLevel === 2) {
            message = `Your target month is ${MONTHS[guided.date.getMonth()]}.`;
        }
        else {
            message =
                `The answer is ${formatShortDate(
                    guided.date.getMonth() + 1,
                    value.doomsdayDate.getDate()
                )}.`;
        }
    }

    else if (step === 10) {

        if (hintLevel === 1) {
            message = "Compare the target date with its month's Doomsday date.";
        }
        else if (hintLevel === 2) {
            message =
                `The Doomsday date is ${formatDate(value.doomsdayDate)}.`;
        }
        else {
            message =
                `The target weekday is ${calculateWeekday(guided.date) === 0 ? "Sunday" : WEEKDAYS[calculateWeekday(guided.date)]}.`;
        }
    }

    alert(message);
}


function renderGuided() {

    guided.selectedAnswer = null;
    guided.submitted = false;

    $("guided-feedback").innerHTML = "";

    $("guided-submit").classList.add("hidden");
    $("guided-next").classList.add("hidden");

    $("guided-question").textContent =
        "Which weekday is this date?";

    $("guided-main-text").innerHTML =
        `Use the hints on the left if you need help. You have <strong>3 hints</strong> available for this question.`;

    createAnswerButtons(
        $("guided-answers"),
        WEEKDAYS,
        answer => {
            guided.selectedAnswer = answer;
            $("guided-submit").classList.remove("hidden");
        }
    );
}


$("guided-submit").addEventListener("click", () => {

    if (guided.selectedAnswer === null) {

        $("guided-feedback").textContent =
            "Please choose an answer first.";

        return;
    }

    const correct =
        guided.selectedAnswer ===
        WEEKDAYS[calculateWeekday(guided.date)];

    disableAnswerButtons($("guided-answers"));

    $("guided-submit").classList.add("hidden");

    if (correct) {

        $("guided-feedback").textContent =
            randomCorrectMessage();

    }
    else {

        $("guided-feedback").textContent =
            "Sorry, not quite... Try again!";
    }

    $("guided-next").classList.remove("hidden");
});


$("guided-next").addEventListener("click", () => {

    guided.date = randomDate("normal");

    $("guided-date").textContent =
        formatDate(guided.date);

    $("guided-sidebar-date").textContent =
        formatDate(guided.date);

    guided.values = getAlgorithmValues(guided.date);

    guided.hintsUsed = 0;

    buildGuidedSidebar();

    renderGuided();
});


$("guided-restart").addEventListener("click", startGuided);

$("guided-home").addEventListener("click", goHome);


/* =========================================================
   ENDLESS
========================================================= */

function startEndless() {

    currentMode = "endless";

    resetEndlessState();

    nextEndlessQuestion();

    transitionTo(
        "endless-screen"
    );
}


function nextEndlessQuestion() {

    endless.date = randomDate("normal");

    endless.selectedAnswer = null;
    endless.submitted = false;

    $("endless-date").textContent =
        formatDate(endless.date);

    $("endless-feedback").innerHTML = "";

    $("endless-submit").classList.add("hidden");

    $("endless-next").classList.add("hidden");

    createAnswerButtons(
        $("endless-answers"),
        WEEKDAYS,
        answer => {
            endless.selectedAnswer = answer;
            $("endless-submit").classList.remove("hidden");
        }
    );
}


$("endless-submit").addEventListener("click", () => {

    if (endless.selectedAnswer === null) {

        $("endless-feedback").textContent =
            "Please choose an answer first.";

        return;
    }

    const correct =
        endless.selectedAnswer ===
        WEEKDAYS[calculateWeekday(endless.date)];

    disableAnswerButtons($("endless-answers"));

    $("endless-submit").classList.add("hidden");

    if (correct) {

        endless.streak++;

        $("endless-streak").textContent =
            `🔥${endless.streak} Streak`;

        $("endless-feedback").textContent =
            randomCorrectMessage();

        $("endless-next").classList.remove("hidden");

    }
    else {

        $("endless-feedback").textContent =
            `Sorry, not quite! Your streak was ${endless.streak}.`;

        /*
         * The player can restart, but not continue after an
         * incorrect answer.
         */
    }
});


$("endless-next").addEventListener("click", () => {

    nextEndlessQuestion();

});


$("endless-restart").addEventListener("click", startEndless);

$("endless-home").addEventListener("click", goHome);


/* =========================================================
   PRACTICE
========================================================= */

const PRACTICE_CATEGORIES = {

    weekdays: {

        title: "Weekday Numbers",

        generate() {

            const weekday =
                randomInteger(0, 6);

            return {
                question:
                    `What number represents ${WEEKDAYS[weekday]}?`,
                answer:
                    String(weekday)
            };
        }
    },


    doomsdays: {

        title: "Doomsday Dates",

        generate() {

            const year =
                randomInteger(1600, 2499);

            const month =
                randomInteger(1, 12);

            const date =
                getDoomsdayDate(month, year);

            return {
                question:
                    `What is the Doomsday date for ${MONTHS[month - 1]}?`,
                answer:
                    `${SHORT_MONTHS[month - 1]} ${date.getDate()}`
            };
        }
    },


    anchors: {

        title: "Century Anchors",

        generate() {

            const century =
                randomInteger(16, 24);

            const anchor =
                centuryAnchor(century);

            return {
                question:
                    `What is the century anchor for the ${century}00s?`,
                answer:
                    String(anchor)
            };
        }
    },


    algorithm: {

        title: "Algorithm Steps",

        generate() {

            const date =
                randomDate("normal");

            const values =
                getAlgorithmValues(date);

            const questions = [
                {
                    question:
                        `For ${formatDate(date)}, how many groups of 12 are in the last two digits?`,
                    answer:
                        String(values.step1)
                },
                {
                    question:
                        `For ${formatDate(date)}, what is left over after taking 12 away from the last two digits?`,
                    answer:
                        String(values.step2)
                },
                {
                    question:
                        `How many groups of 4 are in ${values.step2}?`,
                    answer:
                        String(values.step3)
                },
                {
                    question:
                        `What is the century anchor for ${Math.floor(date.getFullYear() / 100)}?`,
                    answer:
                        String(values.step4)
                },
                {
                    question:
                        `What weekday is ${formatDate(date)}?`,
                    answer:
                        WEEKDAYS[calculateWeekday(date)]
                }
            ];

            return randomItem(questions);
        }
    }
};


function startPractice() {

    currentMode = "practice";

    resetPracticeState();

    transitionTo(
        "practice-screen"
    );
}


function startPracticeCategory(category) {

    practice.category = category;

    $("practice-category-box").classList.add("hidden");

    $("practice-question-box").classList.remove("hidden");

    $("practice-category-title").textContent =
        PRACTICE_CATEGORIES[category].title;

    nextPracticeQuestion();
}


function nextPracticeQuestion() {

    const generated =
        PRACTICE_CATEGORIES[practice.category].generate();

    practice.question =
        generated.question;

    practice.answer =
        generated.answer;

    practice.submitted = false;

    $("practice-question").textContent =
        practice.question;

    $("practice-input").value = "";

    $("practice-feedback").innerHTML = "";

    $("practice-next").classList.add("hidden");

    $("practice-input").focus();
}


$("practice-submit").addEventListener("click", submitPractice);


function submitPractice() {

    const answer =
        $("practice-input").value.trim();

    if (!answer) {

        $("practice-feedback").textContent =
            "Please enter an answer first.";

        return;
    }

    const normalized =
        answer.toLowerCase();

    const expected =
        practice.answer.toLowerCase();

    if (normalized === expected) {

        $("practice-feedback").textContent =
            randomCorrectMessage();

    }
    else {

        $("practice-feedback").textContent =
            `Sorry, not quite... The answer was ${practice.answer}.`;
    }

    $("practice-next").classList.remove("hidden");
}


$("practice-next").addEventListener(
    "click",
    nextPracticeQuestion
);


document.querySelectorAll(".category-button").forEach(button => {

    button.addEventListener("click", () => {

        startPracticeCategory(
            button.dataset.category
        );

    });

});


$("practice-restart").addEventListener(
    "click",
    startPractice
);

$("practice-home").addEventListener(
    "click",
    goHome
);


/* =========================================================
   QUIZ
========================================================= */

$("quiz-count").addEventListener("input", () => {

    $("quiz-count-display").textContent =
        $("quiz-count").value;

});


function startQuiz() {

    quiz.total =
        Number($("quiz-count").value);

    quiz.current = 0;
    quiz.correct = 0;

    quiz.questions = [];

    for (let i = 0; i < quiz.total; i++) {

        quiz.questions.push(
            randomDate("normal")
        );
    }

    quiz.startTime =
        Date.now();

    $("quiz-setup").classList.add("hidden");
    $("quiz-results").classList.add("hidden");
    $("quiz-play").classList.remove("hidden");

    startQuizTimer();

    renderQuizQuestion();
}


function startQuizTimer() {

    stopQuizTimer();

    quiz.timerInterval =
        setInterval(() => {

            const elapsed =
                Math.floor(
                    (Date.now() - quiz.startTime) / 1000
                );

            const minutes =
                Math.floor(elapsed / 60);

            const seconds =
                elapsed % 60;

            $("quiz-timer").textContent =
                `${pad(minutes)}:${pad(seconds)}`;

        }, 250);
}


function renderQuizQuestion() {

    quiz.selectedAnswer = null;
    quiz.submitted = false;

    const date =
        quiz.questions[quiz.current];

    $("quiz-date").textContent =
        formatDate(date);

    $("quiz-progress").textContent =
        `Question ${quiz.current + 1} of ${quiz.total}`;

    $("quiz-submit").classList.add("hidden");

    createAnswerButtons(
        $("quiz-answers"),
        WEEKDAYS,
        answer => {

            quiz.selectedAnswer = answer;

            $("quiz-submit").classList.remove("hidden");
        }
    );
}


$("quiz-submit").addEventListener("click", () => {

    if (quiz.selectedAnswer === null) {

        return;
    }

    const date =
        quiz.questions[quiz.current];

    const correct =
        quiz.selectedAnswer ===
        WEEKDAYS[calculateWeekday(date)];

    /*
     * IMPORTANT:
     *
     * We do NOT tell the player whether this was correct.
     * We simply record the result and advance.
     */

    if (correct) {
        quiz.correct++;
    }

    quiz.current++;

    if (quiz.current >= quiz.total) {

        finishQuiz();

    }
    else {

        renderQuizQuestion();

    }
});


function finishQuiz() {

    stopQuizTimer();

    $("quiz-play").classList.add("hidden");

    $("quiz-results").classList.remove("hidden");

    const percentage =
        (quiz.correct / quiz.total) * 100;

    const grade =
        getGrade(percentage);

    const color =
        getGradeColor(grade);

    $("quiz-grade").textContent =
        grade;

    $("quiz-grade").style.color =
        color;

    $("quiz-score").textContent =
        `You got ${quiz.correct} out of ${quiz.total} correct`;

    $("quiz-message").textContent =
        `"${getGradeMessage(grade)}"`;
}


/* =========================================================
   QUIZ GRADES
========================================================= */

function getGrade(percentage) {

    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";

    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";

    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";

    if (percentage >= 67) return "D+";
    if (percentage >= 63) return "D";
    if (percentage >= 60) return "D-";

    return "F";
}


function getGradeColor(grade) {

    if (grade.startsWith("A")) {
        return "#29CC57";
    }

    if (grade.startsWith("B")) {
        return "#BAE52D";
    }

    if (grade.startsWith("C")) {
        return "#FFC926";
    }

    if (grade.startsWith("D")) {
        return "#FF8D23";
    }

    return "#FF5D5D";
}


function getGradeMessage(grade) {

    const messages = {

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

    return messages[grade];
}


$("quiz-start").addEventListener(
    "click",
    startQuiz
);


/*
 * This is the new "end quiz early" behavior.
 */
$("quiz-end-early").addEventListener(
    "click",
    goHome
);


$("quiz-results-home").addEventListener(
    "click",
    goHome
);


/* =========================================================
   HOME MODE BUTTONS
========================================================= */

document.querySelectorAll(".mode-card").forEach(button => {

    button.addEventListener("click", () => {

        const mode =
            button.dataset.mode;

        if (mode === "tutorial") {
            startTutorial();
        }

        else if (mode === "guided") {
            startGuided();
        }

        else if (mode === "practice") {
            startPractice();
        }

        else if (mode === "quiz") {
            resetQuizState();

            currentMode = "quiz";

            transitionTo(
                "quiz-screen"
            );
        }

        else if (mode === "endless") {
            startEndless();
        }

    });

});


/* =========================================================
   INITIALIZATION
========================================================= */

resetTutorialSidebar();
buildGuidedSidebar();
resetQuizState();

$("tutorial-next").textContent = "Continue";

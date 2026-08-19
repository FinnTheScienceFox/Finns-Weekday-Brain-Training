/* =========================================================
   FINN'S WEEKDAY BRAIN TRAINING!
   Main Game Script
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

const MONTH_SHORT = [
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

const CORRECT_MESSAGES = [
    "Correct! 🎉",
    "Good Job! 🎉",
    "Spot On! 🎉",
    "Nice One! 🎉",
    "Perfect! 🎉",
    "Awesome! 🎉",
    "Keep It Up! 🎉"
];

const GRADE_MESSAGES = {
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


/* =========================================================
   DOM HELPERS
========================================================= */

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


/* =========================================================
   MARKDOWN-LIKE TEXT
========================================================= */

function formatText(text) {
    if (!text) return "";

    let html = text;

    // Escape HTML first.
    html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Bold.
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italics.
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // New lines.
    html = html.replace(/\n/g, "<br>");

    return html;
}


/* =========================================================
   DATE FUNCTIONS
========================================================= */

function randomDate(minYear, maxYear) {
    const year =
        Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

    const month = Math.floor(Math.random() * 12);

    const maxDay = new Date(year, month + 1, 0).getDate();

    const day =
        Math.floor(Math.random() * maxDay) + 1;

    return new Date(year, month, day);
}

function randomTutorialDate() {
    return randomDate(1800, 2200);
}

function randomGameDate() {
    return randomDate(1600, 2499);
}

function isLeapYear(year) {
    return (
        year % 4 === 0 &&
        (year % 100 !== 0 || year % 400 === 0)
    );
}

function formatDate(date, includeYear = true) {
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return includeYear
        ? `${month} ${day}, ${year}`
        : `${month} ${day}`;
}

function formatShortDate(date) {
    return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}


/* =========================================================
   DOOMSDAY
========================================================= */

const DOOMSDAY_NORMAL = {
    0: 3,
    1: 28,
    2: 14,
    3: 4,
    4: 9,
    5: 6,
    6: 11,
    7: 8,
    8: 5,
    9: 10,
    10: 7,
    11: 12
};

function centuryAnchor(year) {
    const century = Math.floor(year / 100);

    /*
       Known:
       18 = 5
       19 = 3
       20 = 2
       21 = 0

       Formula:
       (5 * (c % 4) + 2) % 7

       This produces the repeating
       5, 3, 2, 0 pattern.
    */

    const cycle = ((century % 4) + 4) % 4;

    const values = [2, 0, 5, 3];

    return values[cycle];
}

function calculateDoomsday(year) {
    const yy = year % 100;

    const a = Math.floor(yy / 12);
    const b = yy % 12;
    const c = Math.floor(b / 4);
    const d = centuryAnchor(year);

    return (a + b + c + d) % 7;
}

function monthDoomsday(month, year) {
    if (month === 0) {
        return isLeapYear(year) ? 4 : 3;
    }

    if (month === 1) {
        return isLeapYear(year) ? 29 : 28;
    }

    return DOOMSDAY_NORMAL[month];
}

function doomsdayDate(month, year) {
    return new Date(
        year,
        month,
        monthDoomsday(month, year)
    );
}


/* =========================================================
   TUTORIAL STATE
========================================================= */

let tutorial = {
    date: null,
    step: 0,

    answers: {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10_1: null,
        10_2: null
    },

    selectedAnswer: null,
    finished: false
};


/* =========================================================
   GENERAL GAME STATE
========================================================= */

let currentMode = null;

let endless = {
    date: null,
    streak: 0,
    selectedAnswer: null
};

let guided = {
    date: null,
    selectedAnswer: null,
    hintsUsed: 0
};

let practice = {
    category: null,
    date: null,
    selectedAnswer: null
};

let quiz = {
    date: null,
    questionNumber: 0,
    totalQuestions: 10,
    correct: 0,
    selectedAnswer: null,
    timer: null,
    timeLeft: 60,
    questions: []
};


/* =========================================================
   SCREEN TRANSITIONS
========================================================= */

function transitionTo(screenId, callback) {
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
    qsa(".screen").forEach(screen => {
        hide(screen);
    });

    const target = $(screenId);

    if (target) {
        show(target);
    }
}

function goHome() {
    stopQuizTimer();

    currentMode = null;

    resetTutorialSidebar();
    resetGuidedSidebar();

    transitionTo("home-screen", () => {
        showScreen("home-screen");
    });
}


/* =========================================================
   HOME BUTTONS
========================================================= */

function setupHomeButtons() {
    qsa(".mode-card").forEach(button => {
        button.addEventListener("click", () => {
            const mode = button.dataset.mode;

            if (!mode) return;

            transitionTo(`${mode}-screen`, () => {
                startMode(mode);
            });
        });
    });
}


/* =========================================================
   START MODES
========================================================= */

function startMode(mode) {
    currentMode = mode;

    showScreen(`${mode}-screen`);

    switch (mode) {
        case "tutorial":
            startTutorial();
            break;

        case "endless":
            startEndless();
            break;

        case "guided":
            startGuided();
            break;

        case "practice":
            startPractice();
            break;

        case "quiz":
            setupQuiz();
            break;
    }
}


/* =========================================================
   COMMON ANSWER BUTTON CREATION
========================================================= */

function createAnswerButtons(container, answers, onSelect) {
    if (!container) return;

    container.innerHTML = "";

    answers.forEach(answer => {
        const button = document.createElement("button");

        button.className = "answer-button";
        button.type = "button";
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

    const existing = qs(".submit-button", container);

    if (existing) {
        existing.remove();
    }

    const button = document.createElement("button");

    button.type = "button";
    button.className = "submit-button";
    button.textContent = "Submit";

    button.addEventListener("click", onSubmit);

    container.appendChild(button);

    return button;
}


/* =========================================================
   FEEDBACK
========================================================= */

function randomCorrectMessage() {
    return CORRECT_MESSAGES[
        Math.floor(Math.random() * CORRECT_MESSAGES.length)
    ];
}

function displayFeedback(element, correct, message) {
    if (!element) return;

    element.className = "feedback";

    if (correct) {
        element.classList.add("correct");
    } else {
        element.classList.add("incorrect");
    }

    element.textContent = message;
}


/* =========================================================
   TUTORIAL SIDEBAR
========================================================= */

function resetTutorialSidebar() {
    qsa("#tutorial-sidebar .sidebar-step").forEach(step => {
        step.classList.remove(
            "active",
            "completed",
            "remembered"
        );

        const result = qs(".sidebar-result", step);

        if (result) {
            result.textContent = "";
        }
    });

    setText(
        $("tutorial-sidebar-date"),
        "Date"
    );
}

function updateTutorialSidebar() {
    const sidebar = $("tutorial-sidebar");

    if (!sidebar) return;

    const date = tutorial.date;

    setText(
        $("tutorial-sidebar-date"),
        date ? formatDate(date) : "Date"
    );

    for (let i = 1; i <= 10; i++) {
        const element = $(`tutorial-sidebar-step-${i}`);

        if (!element) continue;

        element.classList.remove(
            "active",
            "completed",
            "remembered"
        );

        const result = qs(".sidebar-result", element);

        if (result) {
            result.textContent = "";
        }

        if (i < tutorial.step) {
            element.classList.add("completed");
        }

        if (i === tutorial.step) {
            element.classList.add("active");
        }

        const answer = tutorial.answers[i];

        if (answer !== null && answer !== undefined) {
            if (result) {
                result.textContent = answer;
            }
        }
    }

    /*
       Steps 1-4 are remembered after completion.
    */

    for (let i = 1; i <= 4; i++) {
        const element = $(`tutorial-sidebar-step-${i}`);

        if (
            element &&
            tutorial.answers[i] !== null &&
            tutorial.answers[i] !== undefined
        ) {
            element.classList.add("remembered");
        }
    }
}


/* =========================================================
   TUTORIAL START / RESET
========================================================= */

function startTutorial() {
    tutorial = {
        date: randomTutorialDate(),
        step: 0,

        answers: {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null,
            8: null,
            9: null,
            10_1: null,
            10_2: null
        },

        selectedAnswer: null,
        finished: false
    };

    resetTutorialSidebar();

    show($("tutorial-sidebar"));

    updateTutorialSidebar();

    renderTutorialStep();
}

function restartTutorial() {
    startTutorial();
}


/* =========================================================
   TUTORIAL ELEMENT HELPERS
========================================================= */

function tutorialMainText(text) {
    const element = $("tutorial-main-text");

    if (element) {
        element.innerHTML = formatText(text);
    }
}

function tutorialQuestion(text) {
    const element = $("tutorial-question");

    if (element) {
        element.innerHTML = formatText(text);
    }
}

function clearTutorialAnswerArea() {
    const area = $("tutorial-answers");

    if (area) {
        area.innerHTML = "";
    }
}

function tutorialDateDisplay() {
    const element = $("tutorial-date");

    if (element && tutorial.date) {
        element.textContent = formatDate(tutorial.date);
    }
}


/* =========================================================
   TUTORIAL STEP RENDERING
========================================================= */

function renderTutorialStep() {
    tutorial.selectedAnswer = null;

    tutorialDateDisplay();
    updateTutorialSidebar();

    const feedback = $("tutorial-feedback");

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
    }

    const answerBox = $("tutorial-answer-box");
    const answers = $("tutorial-answers");

    if (answers) {
        answers.innerHTML = "";
    }

    if (answerBox) {
        show(answerBox);
    }

    switch (tutorial.step) {
        case 0:
            renderTutorialStep0();
            break;

        case 1:
            renderTutorialStep1();
            break;

        case 2:
            renderTutorialStep2();
            break;

        case 3:
            renderTutorialStep3();
            break;

        case 4:
            renderTutorialStep4();
            break;

        case 5:
            renderTutorialStep5();
            break;

        case 6:
            renderTutorialStep6();
            break;

        case 7:
            renderTutorialStep7();
            break;

        case 8:
            renderTutorialStep8();
            break;

        case 9:
            renderTutorialStep9();
            break;

        case 10:
            renderTutorialStep10_1();
            break;

        case 11:
            renderTutorialStep10_2();
            break;

        case 12:
            renderTutorialEnd();
            break;
    }
}


/* =========================================================
   TUTORIAL CONTINUE BUTTON
========================================================= */

function createTutorialContinue(text = "Continue", callback) {
    const area = $("tutorial-answers");

    if (!area) return;

    area.innerHTML = "";

    const button = document.createElement("button");

    button.className = "black-button";
    button.type = "button";
    button.textContent = text;

    button.addEventListener("click", callback);

    area.appendChild(button);
}


/* =========================================================
   TUTORIAL QUESTION
========================================================= */

function renderTutorialQuestion(
    question,
    options,
    correctAnswer,
    incorrectMessage
) {
    tutorialQuestion(question);

    const area = $("tutorial-answers");

    if (!area) return;

    createAnswerButtons(
        area,
        options,
        answer => {
            tutorial.selectedAnswer = answer;
        }
    );

    createSubmitButton(area, () => {
        if (
            tutorial.selectedAnswer === null ||
            tutorial.selectedAnswer === undefined
        ) {
            displayFeedback(
                $("tutorial-feedback"),
                false,
                "Please choose an answer first."
            );

            return;
        }

        const correct =
            String(tutorial.selectedAnswer) ===
            String(correctAnswer);

        if (!correct) {
            displayFeedback(
                $("tutorial-feedback"),
                false,
                incorrectMessage
            );

            return;
        }

        displayFeedback(
            $("tutorial-feedback"),
            true,
            randomCorrectMessage()
        );

        tutorial.answers[tutorial.step] =
            tutorial.selectedAnswer;

        updateTutorialSidebar();

        qsa(".answer-button", area).forEach(button => {
            button.disabled = true;
        });

        const submit = qs(".submit-button", area);

        if (submit) {
            submit.remove();
        }

        const next = document.createElement("button");

        next.className = "black-button";
        next.type = "button";
        next.textContent =
            tutorial.step === 11
                ? "Finish"
                : "Next";

        next.addEventListener("click", () => {
            tutorial.step++;
            renderTutorialStep();
        });

        area.appendChild(next);
    });
}


/* =========================================================
   STEP 0
========================================================= */

function renderTutorialStep0() {
    tutorialMainText(
        `Hello! **I'm Finn**, the little guy in the corner cheering you on, and I'm so happy you decided to check out my game.
For this tutorial, we will be finding the weekday of **${formatDate(tutorial.date)}**. Guided questions will help teach the simple step-by-step process, with this date as an example. It gets easier the more we practice!
Press **Continue** when you're ready.`
    );

    tutorialQuestion("");

    createTutorialContinue(
        "Continue",
        () => {
            tutorial.step = 1;
            renderTutorialStep();
        }
    );
}


/* =========================================================
   STEP 1
========================================================= */

function renderTutorialStep1() {
    const year = tutorial.date.getFullYear();
    const yy = year % 100;

    const answer = Math.floor(yy / 12);

    tutorialMainText(
        `Let's look at the **last two digits of the year**. In this case, the last two digits of ${year} are **${String(yy).padStart(2, "0")}**.
Our first step is to divide ${String(yy).padStart(2, "0")} by 12, which just means we need to **count how many groups of 12 are in ${String(yy).padStart(2, "0")}**.`
    );

    renderTutorialQuestion(
        `How many groups of 12 are in ${String(yy).padStart(2, "0")}?`,
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        answer,
        `Sorry, that isn't it. Imagine ${String(yy).padStart(2, "0")} objects that you divide into groups of 12, then count the number of groups!`
    );
}


/* =========================================================
   STEP 2
========================================================= */

function renderTutorialStep2() {
    const year = tutorial.date.getFullYear();
    const yy = year % 100;

    const first = tutorial.answers[1];
    const answer = yy % 12;

    tutorialMainText(
        `Great, **${first} is our first number!** Remember the next 3 numbers as well, because they'll all be important in Step 5.
Now, with ${first} groups of 12, **think about what's still remaining...**`
    );

    renderTutorialQuestion(
        `What amount is left over, outside of the groups of 12?`,
        Array.from({ length: 12 }, (_, i) => i),
        answer,
        `Sorry, not quite. You can also think about it like this: If you start with ${String(yy).padStart(2, "0")} and keep taking away 12, eventually you'll reach a number that's less than 12...`
    );
}


/* =========================================================
   STEP 3
========================================================= */

function renderTutorialStep3() {
    const second = tutorial.answers[2];
    const answer = Math.floor(second / 4);

    tutorialMainText(
        `**${second} is our second number!**
We have to do some more counting to find the third. This time, we have to count **how many groups of 4 are in ${second}.**`
    );

    renderTutorialQuestion(
        `How many groups of 4 are in ${second}?`,
        [0, 1, 2, 3],
        answer,
        "Not quite. Try again!"
    );
}


/* =========================================================
   STEP 4
========================================================= */

function renderTutorialStep4() {
    const year = tutorial.date.getFullYear();
    const century = Math.floor(year / 100);

    const answer = centuryAnchor(year);

    tutorialMainText(
        `Nice, **${tutorial.answers[3]} is our third number!** Finding the fourth number is a bit trickier, but it's the last number we need for now.
Let's look at the **first two digits of the year** instead, which for ${year} is ${century}. This represents the *century*, and each century has a *century anchor*...
\t18 = **5**.
\t19 = **3**.
\t20 = **2**.
\t21 = **0**.
This **5-3-2-0 pattern** continues forward and backward in a loop forever, so knowing the anchor for just one century means you know the anchor for every century!
Remember that **our century is ${century}** for this example...`
    );

    renderTutorialQuestion(
        `What is the century anchor for ${century}?`,
        [0, 2, 3, 5],
        answer,
        "Sorry, that isn't it... Remember to use the table if you're having trouble; memorization will come with time!"
    );
}


/* =========================================================
   STEP 5
========================================================= */

function renderTutorialStep5() {
    const a = tutorial.answers[1];
    const b = tutorial.answers[2];
    const c = tutorial.answers[3];
    const d = tutorial.answers[4];

    const answer = a + b + c + d;

    tutorialMainText(
        `Perfect, **the** ***century anchor*** **is our fourth and final number!** Let's put it all together.
Hopefully you **remember all four numbers**, because we need to add them together now!
It's okay if you don't remember; the four numbers have been written in the sidebar if you need help. But if you want to do this on the fly, **you'll need to remember them without help in the future.**`
    );

    renderTutorialQuestion(
        "What's the result of adding all four numbers together?",
        Array.from({ length: 21 }, (_, i) => i),
        answer,
        `Sorry, that isn't it! What's the sum of ${a}, ${b}, ${c}, and ${d}?`
    );
}


/* =========================================================
   STEP 6
========================================================= */

function renderTutorialStep6() {
    const sum = tutorial.answers[5];
    const answer = sum % 7;

    tutorialMainText(
        `For the last question's sum (${sum} in our case), **take 7 away from that number until we have a result lower than 7.**`
    );

    renderTutorialQuestion(
        "What's left over?",
        [0, 1, 2, 3, 4, 5, 6],
        answer,
        `Not quite! From another angle, this is very similar to the grouping exercise from earlier; How many groups of 7 are in ${sum}? More importantly, what's left over?`
    );
}


/* =========================================================
   STEP 7
========================================================= */

function renderTutorialStep7() {
    const answer = tutorial.answers[6];

    tutorialMainText(
        `**This leftover number, ${answer}, represents a weekday!** Zero (0) is Sunday, One (1) is Monday, and so on...
There's a fun mnemonic to help you remember this pattern:
**0** is "NONEday," which sounds like **Sunday**,
**1** is "ONEday," which sounds like **Monday**,
**2** is "TWOSday," which sounds like **Tuesday**,
**3** is "three syllables," which is the amount that **Wednesday** has,
**4** is "FOURsday," which sounds like **Thursday**,
**5** is "FIVEday," which sounds like **Friday**,
**6** is "SIXturday," which sounds like **Saturday**.`
    );

    renderTutorialQuestion(
        `Using the mnemonic above, which weekday does ${answer} represent?`,
        WEEKDAYS,
        WEEKDAYS[answer],
        "That's not it. Try again!"
    );
}


/* =========================================================
   STEP 8
========================================================= */

function renderTutorialStep8() {
    const year = tutorial.date.getFullYear();

    const rawYY = year % 100;

    const value =
        rawYY === 0
            ? Math.floor(year / 100)
            : rawYY;

    const leap = isLeapYear(year);

    tutorialMainText(
        `Now, before we get to calculating the date, we need to **check if ${year} is a leap year** or not. Take the last two digits of the year (${String(rawYY).padStart(2, "0")} in our case), and make groups of 4.
If we can make groups of four with **no leftovers**, then **${year} is a leap year**. If we can't, then **${year} is not a leap year**.
(If the **last two digits are "00,"** then use the first two digits instead. That would be ${Math.floor(year / 100)} for us.)`
    );

    renderTutorialQuestion(
        `Is ${year} a leap year?`,
        ["Yes", "No"],
        leap ? "Yes" : "No",
        `Sorry, but that's not correct: ${year} ${leap ? "is" : "isn't"} a leap year, because ${value} divided by 4 leaves a leftover of ${value % 4}.`
    );
}


/* =========================================================
   STEP 9
========================================================= */

function renderTutorialStep9() {
    const year = tutorial.date.getFullYear();
    const targetMonth = tutorial.date.getMonth();

    const weekday = WEEKDAYS[calculateDoomsday(year)];

    const doomsday = monthDoomsday(targetMonth, year);

    const correct = `${MONTH_SHORT[targetMonth]} ${doomsday}`;

    tutorialMainText(
        `The most important step has come!
This step-by-step process is called the **Doomsday Algorithm**. It sounds scary, but it isn't; It's called that because there are certain **Doomsday dates** **that always share the same weekday**... and the weekday we calculated in Step 7, **${weekday}**, is the weekday they all share!
Each month has exactly one Doomsday date:
January **3** (January **4** on **leap years**),
February **28** (February **29** on **leap years**),
March **14**,
April **4**,
May **9**,
June **6**,
July **11**,
August **8**,
September **5**,
October **10**,
November **7**,
December **12**.
There are also some rules and fun mnemonics to make remembering these dates easy!
1. **Even months (Except February) share their Doomsday date with their month number:** 4/4, 6/6, 8/8, 10/10, 12/12.
2. **"I work 9-5 at 7-11"** is a fun mnemonic that covers 5/9, 7/11, 9/5, and 11/7.
3. **"Every 4 years, it's the 4th"** to remember that January 4th is the Doomsday date every leap year instead of the typical January 3rd. February's is simply **the last day of February**, whether that be the 28th or 29th.
4. March's Doomsday date is **Pi Day**, March 14! (3/14).
That's probably a lot to digest! Take your time memorizing these dates, and **go to Practice mode after this to help learn them** more efficiently.`
    );

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

    renderTutorialQuestion(
        "So, given the rules above, what is the closest Doomsday date to our target date?",
        options,
        correct,
        `Sorry, but that isn't it! For a big hint, you can simply match the month of our target date, ${MONTHS[targetMonth]}, with the Doomsday date's month. Don't forget about leap years!`
    );
}


/* =========================================================
   STEP 10.1
========================================================= */

function renderTutorialStep10_1() {
    const year = tutorial.date.getFullYear();

    const target = tutorial.date;

    const month = target.getMonth();

    const dd = monthDoomsday(month, year);

    const doomDate = new Date(year, month, dd);

    const doomWeekday =
        WEEKDAYS[calculateDoomsday(year)];

    const difference =
        Math.round(
            (target - doomDate) / 86400000
        );

    const weeks = Math.trunc(difference / 7);

    tutorial._doomDate = doomDate;
    tutorial._dayDifference = difference;
    tutorial._weeks = weeks;

    tutorialMainText(
        `Finally, we can begin calculating the weekday of our target date!
We found that our Doomsday date is **${formatDate(doomDate)}**, which we know now was a **${doomWeekday}**. From here, all we need to do is start counting the days before or after this date to get to our target.
**Every 7 days, the week repeats.** This simple fact will help us out a lot with counting! Count forward or backward from **${formatShortDate(doomDate)}** by 7 days until you're within one week of the target date.`
    );

    const options = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

    renderTutorialQuestion(
        "How many full weeks, backward or forward, will we move?",
        options.map(n => n > 0 ? `+${n}` : String(n)),
        weeks,
        `Not quite. Remembering the amount of days in the months might help! "30 days hath September, April, June, and November" is a mnemonic I personally like.`
    );
}


/* =========================================================
   STEP 10.2
========================================================= */

function renderTutorialStep10_2() {
    const weeks = tutorial.answers["10_1"];

    const doomDate = tutorial._doomDate;

    const movedDate = new Date(
        doomDate.getTime() +
        weeks * 7 * 86400000
    );

    const difference =
        Math.round(
            (tutorial.date - movedDate) / 86400000
        );

    const absDifference = Math.abs(difference);

    let direction;

    if (difference > 0) {
        direction = "ahead of";
    } else if (difference < 0) {
        direction = "behind";
    } else {
        direction = "on";
    }

    const weekWord =
        Math.abs(weeks) === 1
            ? "week"
            : "weeks";

    const movement =
        weeks > 0
            ? "forward"
            : weeks < 0
                ? "backward"
                : "nowhere";

    const finalWeekday =
        WEEKDAYS[tutorial.date.getDay()];

    tutorialMainText(
        `Great; You've now moved **${Math.abs(weeks)} ${weekWord} ${movement}**.
We are now at **${formatShortDate(movedDate)}**, which is **${absDifference} ${absDifference === 1 ? "day" : "days"} ${direction} your target.** Now, our last step is to **count forward and backward from ${WEEKDAYS[movedDate.getDay()]}, ${formatDate(movedDate)} to our target date ${formatDate(tutorial.date)}:**`
    );

    renderTutorialQuestion(
        "Final question... Which weekday is the target date?",
        WEEKDAYS,
        finalWeekday,
        "That's not it! Try again."
    );
}


/* =========================================================
   TUTORIAL END
========================================================= */

function renderTutorialEnd() {
    tutorial.finished = true;

    tutorialMainText(
        `Congratulations! With simple mental math, we figured out that **${formatDate(tutorial.date)}** was a **${WEEKDAYS[tutorial.date.getDay()]}**. Once you've got those steps down, it's smooth sailing from here.
If you feel like restudying this process to learn more about it, feel free to come back to the **Tutorial!** If you want to get more efficient with these steps, try **Practice** or **Guided** next! Once you've really got it down, challenge yourself with **Quiz** and **Endless**!
Thanks for playing, and have fun training! *-Finn* 🦊`
    );

    tutorialQuestion("");

    const area = $("tutorial-answers");

    if (area) {
        area.innerHTML = "";

        /*
           The answer box is removed ONLY after
           successfully finishing the tutorial.
        */

        const answerBox = $("tutorial-answer-box");

        if (answerBox) {
            hide(answerBox);
        }
    }

    /*
       Make sure Finish/Continue is reset on restart
       by not using the old global continue button.
    */

    updateTutorialSidebar();
}


/* =========================================================
   TUTORIAL BUTTONS
========================================================= */

function setupTutorialControls() {
    const restart = $("tutorial-restart");

    if (restart) {
        restart.addEventListener("click", restartTutorial);
    }

    const home = $("tutorial-home");

    if (home) {
        home.addEventListener("click", goHome);
    }
}


/* =========================================================
   ENDLESS
========================================================= */

function startEndless() {
    endless.streak = 0;

    newEndlessQuestion();
}

function newEndlessQuestion() {
    endless.date = randomGameDate();
    endless.selectedAnswer = null;

    setText(
        $("endless-date"),
        formatDate(endless.date)
    );

    setText(
        $("endless-streak"),
        `🔥${endless.streak} Streak`
    );

    const correct =
        WEEKDAYS[endless.date.getDay()];

    const answers = [...WEEKDAYS];

    renderModeQuestion(
        "endless",
        `What weekday is ${formatDate(endless.date)}?`,
        answers,
        correct
    );
}

function submitEndless() {
    if (endless.selectedAnswer === null) {
        displayFeedback(
            $("endless-feedback"),
            false,
            "Please choose an answer first."
        );
        return;
    }

    const correct =
        WEEKDAYS[endless.date.getDay()];

    if (
        String(endless.selectedAnswer) ===
        String(correct)
    ) {
        endless.streak++;

        displayFeedback(
            $("endless-feedback"),
            true,
            randomCorrectMessage()
        );

        setText(
            $("endless-streak"),
            `🔥${endless.streak} Streak`
        );

        setTimeout(newEndlessQuestion, 500);

    } else {
        displayFeedback(
            $("endless-feedback"),
            false,
            "Sorry, not quite!"
        );

        setTimeout(() => {
            endless.streak = 0;
            newEndlessQuestion();
        }, 900);
    }
}


/* =========================================================
   GUIDED
========================================================= */

function startGuided() {
    guided.hintsUsed = 0;
    guided.selectedAnswer = null;
    guided.date = randomGameDate();

    resetGuidedSidebar();

    updateGuidedSidebar();

    renderGuidedQuestion();
}

function resetGuidedSidebar() {
    const sidebar = $("guided-sidebar");

    if (!sidebar) return;

    qsa(".sidebar-step", sidebar).forEach(step => {
        step.classList.remove(
            "active",
            "completed",
            "remembered"
        );
    });

    qsa(".guided-hint", sidebar).forEach(hint => {
        hint.classList.remove("used");
    });
}

function updateGuidedSidebar() {
    const dateElement = $("guided-sidebar-date");

    if (dateElement && guided.date) {
        dateElement.textContent =
            formatDate(guided.date);
    }
}

function renderGuidedQuestion() {
    const correct =
        WEEKDAYS[guided.date.getDay()];

    setText(
        $("guided-date"),
        formatDate(guided.date)
    );

    renderModeQuestion(
        "guided",
        `What weekday is ${formatDate(guided.date)}?`,
        WEEKDAYS,
        correct
    );

    setupGuidedHints();
}

function setupGuidedHints() {
    const buttons =
        qsa(".guided-hint");

    buttons.forEach(button => {
        button.classList.remove("used");
    });

    buttons.forEach(button => {
        button.onclick = () => {
            const hintNumber =
                Number(button.dataset.hint);

            if (
                hintNumber !==
                guided.hintsUsed + 1
            ) {
                return;
            }

            guided.hintsUsed++;

            button.classList.add("used");

            showGuidedHint(hintNumber);
        };
    });
}

function showGuidedHint(level) {
    const correct =
        WEEKDAYS[guided.date.getDay()];

    let message = "";

    if (level === 1) {
        message =
            "Hint 1: Start by calculating the year's Doomsday.";
    }

    if (level === 2) {
        const doom =
            calculateDoomsday(
                guided.date.getFullYear()
            );

        message =
            `Hint 2: This year's Doomsday is ${WEEKDAYS[doom]}. Use the Doomsday date for ${MONTHS[guided.date.getMonth()]}.`;
    }

    if (level === 3) {
        message =
            `Hint 3: The answer is ${correct}.`;
    }

    const feedback =
        $("guided-feedback");

    if (feedback) {
        feedback.textContent = message;
        feedback.className = "feedback";
    }
}


/* =========================================================
   GENERIC MODE QUESTION
========================================================= */

function renderModeQuestion(
    mode,
    question,
    answers,
    correct
) {
    const questionElement =
        $(`${mode}-question`);

    const answersElement =
        $(`${mode}-answers`);

    const feedback =
        $(`${mode}-feedback`);

    if (!questionElement || !answersElement) {
        return;
    }

    questionElement.innerHTML =
        formatText(question);

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
    }

    let selected = null;

    createAnswerButtons(
        answersElement,
        answers,
        answer => {
            selected = answer;

            if (mode === "endless") {
                endless.selectedAnswer = answer;
            }

            if (mode === "guided") {
                guided.selectedAnswer = answer;
            }

            if (mode === "quiz") {
                quiz.selectedAnswer = answer;
            }
        }
    );

    const submit =
        createSubmitButton(
            answersElement,
            () => {
                if (selected === null) {
                    if (feedback) {
                        displayFeedback(
                            feedback,
                            false,
                            "Please choose an answer first."
                        );
                    }

                    return;
                }

                if (mode === "endless") {
                    submitEndless();
                    return;
                }

                if (mode === "guided") {
                    submitGuided();
                    return;
                }

                if (mode === "quiz") {
                    submitQuizAnswer();
                }
            }
        );

    return submit;
}


/* =========================================================
   GUIDED SUBMIT
========================================================= */

function submitGuided() {
    const correct =
        WEEKDAYS[guided.date.getDay()];

    const feedback =
        $("guided-feedback");

    if (guided.selectedAnswer === null) {
        displayFeedback(
            feedback,
            false,
            "Please choose an answer first."
        );
        return;
    }

    if (
        String(guided.selectedAnswer) ===
        String(correct)
    ) {
        displayFeedback(
            feedback,
            true,
            randomCorrectMessage()
        );

        const answers =
            $("guided-answers");

        if (answers) {
            qsa(".answer-button", answers)
                .forEach(button => {
                    button.disabled = true;
                });

            const submit =
                qs(".submit-button", answers);

            if (submit) {
                submit.remove();
            }

            const next =
                document.createElement("button");

            next.className = "black-button";
            next.textContent = "Next";

            next.onclick = () => {
                startGuided();
            };

            answers.appendChild(next);
        }

    } else {
        displayFeedback(
            feedback,
            false,
            "Sorry, not quite... Try again!"
        );
    }
}


/* =========================================================
   PRACTICE
========================================================= */

const PRACTICE_CATEGORIES = {
    groups12: "Groups of 12",
    leftovers: "Leftovers",
    groups4: "Groups of 4",
    century: "Century Anchors",
    doomsdays: "Doomsday Dates",
    weekdays: "Weekdays"
};

function startPractice() {
    practice.category = null;

    const categories =
        $("practice-categories");

    const questionArea =
        $("practice-question-area");

    if (categories) {
        show(categories);
    }

    if (questionArea) {
        hide(questionArea);
    }
}

function setupPracticeCategories() {
    qsa(".category-button").forEach(button => {
        button.onclick = () => {
            practice.category =
                button.dataset.category;

            showPracticeQuestion();
        };
    });
}

function showPracticeQuestion() {
    const categories =
        $("practice-categories");

    const questionArea =
        $("practice-question-area");

    if (categories) hide(categories);
    if (questionArea) show(questionArea);

    practice.date = randomGameDate();
    practice.selectedAnswer = null;

    const category =
        practice.category;

    let question = "";
    let answer = null;
    let options = null;

    const year =
        practice.date.getFullYear();

    const yy = year % 100;

    switch (category) {
        case "groups12":
            question =
                `How many groups of 12 are in ${yy}?`;

            answer =
                Math.floor(yy / 12);

            options =
                Array.from(
                    { length: 9 },
                    (_, i) => i
                );
            break;

        case "leftovers":
            question =
                `What is left over when ${yy} is divided into groups of 12?`;

            answer =
                yy % 12;

            options =
                Array.from(
                    { length: 12 },
                    (_, i) => i
                );
            break;

        case "groups4":
            question =
                `How many groups of 4 are in a number from 0 to 11?`;

            {
                const n =
                    Math.floor(Math.random() * 12);

                practice._number = n;

                question =
                    `How many groups of 4 are in ${n}?`;

                answer =
                    Math.floor(n / 4);
            }

            options = [0, 1, 2, 3];
            break;

        case "century":
            {
                const century =
                    16 +
                    Math.floor(Math.random() * 9);

                practice._century =
                    century;

                question =
                    `What is the century anchor for the ${century}00s?`;

                answer =
                    centuryAnchor(
                        century * 100
                    );

                options = [0, 2, 3, 5];
            }
            break;

        case "doomsdays":
            {
                const month =
                    Math.floor(
                        Math.random() * 12
                    );

                practice._month =
                    month;

                question =
                    `What is the Doomsday date for ${MONTHS[month]}?`;

                answer =
                    monthDoomsday(
                        month,
                        year
                    );

                practice._leap =
                    isLeapYear(year);

                options = [];

                for (let m = 0; m < 12; m++) {
                    options.push(
                        `${MONTH_SHORT[m]} ${monthDoomsday(m, year)}`
                    );
                }
            }
            break;

        case "weekdays":
            {
                const n =
                    Math.floor(
                        Math.random() * 7
                    );

                question =
                    `Which weekday corresponds to ${n}?`;

                answer =
                    WEEKDAYS[n];

                options =
                    [...WEEKDAYS];
            }
            break;
    }

    setText(
        $("practice-category-title"),
        PRACTICE_CATEGORIES[category]
    );

    const questionElement =
        $("practice-question");

    if (questionElement) {
        questionElement.textContent =
            question;
    }

    const input =
        $("practice-input");

    if (input) {
        input.value = "";
    }

    const feedback =
        $("practice-feedback");

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
    }

    practice._answer = answer;

    const answers =
        $("practice-answers");

    if (answers) {
        answers.innerHTML = "";

        /*
           Practice is open-ended.
        */

        if (input) {
            show(input);
        }

        const submit =
            createSubmitButton(
                answers,
                checkPracticeAnswer
            );

        submit.textContent = "Submit";
    }
}

function checkPracticeAnswer() {
    const input =
        $("practice-input");

    if (!input) return;

    const entered =
        input.value.trim();

    if (!entered) {
        displayFeedback(
            $("practice-feedback"),
            false,
            "Please enter an answer first."
        );
        return;
    }

    const correct =
        String(entered).toLowerCase() ===
        String(practice._answer).toLowerCase();

    if (correct) {
        displayFeedback(
            $("practice-feedback"),
            true,
            randomCorrectMessage()
        );
    } else {
        displayFeedback(
            $("practice-feedback"),
            false,
            "Sorry, not quite... Try again!"
        );
    }
}


/* =========================================================
   QUIZ
========================================================= */

function setupQuiz() {
    stopQuizTimer();

    const setup =
        $("quiz-setup");

    const game =
        $("quiz-game");

    const results =
        $("quiz-results");

    if (setup) show(setup);
    if (game) hide(game);
    if (results) hide(results);

    const slider =
        $("quiz-count");

    const display =
        $("quiz-count-display");

    if (slider && display) {
        display.textContent =
            slider.value;

        slider.oninput = () => {
            display.textContent =
                slider.value;
        };
    }
}

function startQuiz() {
    const slider =
        $("quiz-count");

    quiz.totalQuestions =
        slider
            ? Number(slider.value)
            : 10;

    quiz.questionNumber = 0;
    quiz.correct = 0;
    quiz.selectedAnswer = null;
    quiz.questions = [];

    for (
        let i = 0;
        i < quiz.totalQuestions;
        i++
    ) {
        quiz.questions.push(
            randomGameDate()
        );
    }

    hide($("quiz-setup"));
    hide($("quiz-results"));
    show($("quiz-game"));

    quiz.timeLeft =
        Math.max(
            30,
            quiz.totalQuestions * 8
        );

    updateQuizTimer();

    stopQuizTimer();

    quiz.timer =
        setInterval(() => {
            quiz.timeLeft--;

            updateQuizTimer();

            if (quiz.timeLeft <= 0) {
                finishQuiz();
            }
        }, 1000);

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const date =
        quiz.questions[
            quiz.questionNumber
        ];

    quiz.date = date;
    quiz.selectedAnswer = null;

    setText(
        $("quiz-progress"),
        `Question ${quiz.questionNumber + 1} of ${quiz.totalQuestions}`
    );

    setText(
        $("quiz-date"),
        formatDate(date)
    );

    const question =
        $("quiz-question");

    if (question) {
        question.textContent =
            `What weekday is ${formatDate(date)}?`;
    }

    const answers =
        $("quiz-answers");

    if (answers) {
        answers.innerHTML = "";
    }

    createAnswerButtons(
        answers,
        WEEKDAYS,
        answer => {
            quiz.selectedAnswer = answer;
        }
    );

    createSubmitButton(
        answers,
        submitQuizAnswer
    );

    /*
       Quiz never displays correct/incorrect
       feedback here.
    */

    const feedback =
        $("quiz-feedback");

    if (feedback) {
        feedback.textContent = "";
    }
}

function submitQuizAnswer() {
    if (quiz.selectedAnswer === null) {
        return;
    }

    const correct =
        WEEKDAYS[quiz.date.getDay()];

    if (
        String(quiz.selectedAnswer) ===
        String(correct)
    ) {
        quiz.correct++;
    }

    quiz.questionNumber++;

    if (
        quiz.questionNumber >=
        quiz.totalQuestions
    ) {
        finishQuiz();
    } else {
        renderQuizQuestion();
    }
}

function stopQuizTimer() {
    if (quiz.timer) {
        clearInterval(quiz.timer);
        quiz.timer = null;
    }
}

function updateQuizTimer() {
    const timer =
        $("quiz-timer");

    if (!timer) return;

    const minutes =
        Math.floor(quiz.timeLeft / 60);

    const seconds =
        quiz.timeLeft % 60;

    timer.textContent =
        `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function finishQuiz() {
    stopQuizTimer();

    const setup =
        $("quiz-setup");

    const game =
        $("quiz-game");

    const results =
        $("quiz-results");

    if (setup) hide(setup);
    if (game) hide(game);
    if (results) show(results);

    const grade =
        calculateGrade(
            quiz.correct,
            quiz.totalQuestions
        );

    const gradeElement =
        $("quiz-grade");

    if (gradeElement) {
        gradeElement.textContent =
            grade;

        gradeElement.style.color =
            gradeColor(grade);
    }

    setText(
        $("quiz-score"),
        `You got ${quiz.correct} out of ${quiz.totalQuestions} correct`
    );

    setText(
        $("quiz-message"),
        `"${GRADE_MESSAGES[grade]}"`
    );
}

function calculateGrade(correct, total) {
    const percentage =
        total === 0
            ? 0
            : correct / total;

    if (percentage >= 0.97) return "A+";
    if (percentage >= 0.93) return "A";
    if (percentage >= 0.90) return "A-";

    if (percentage >= 0.87) return "B+";
    if (percentage >= 0.83) return "B";
    if (percentage >= 0.80) return "B-";

    if (percentage >= 0.77) return "C+";
    if (percentage >= 0.73) return "C";
    if (percentage >= 0.70) return "C-";

    if (percentage >= 0.67) return "D+";
    if (percentage >= 0.63) return "D";
    if (percentage >= 0.60) return "D-";

    return "F";
}

function gradeColor(grade) {
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

function setupQuizControls() {
    const start =
        $("quiz-start");

    if (start) {
        start.onclick = startQuiz;
    }

    const home =
        $("quiz-home");

    if (home) {
        home.onclick = goHome;
    }

    const endEarly =
        $("quiz-end-early");

    if (endEarly) {
        endEarly.onclick = finishQuiz;
    }

    const restart =
        $("quiz-restart");

    if (restart) {
        restart.onclick = setupQuiz;
    }
}


/* =========================================================
   ENDLESS / GUIDED / PRACTICE CONTROLS
========================================================= */

function setupGameControls() {
    const endlessRestart =
        $("endless-restart");

    if (endlessRestart) {
        endlessRestart.onclick =
            startEndless;
    }

    const endlessHome =
        $("endless-home");

    if (endlessHome) {
        endlessHome.onclick =
            goHome;
    }

    const guidedRestart =
        $("guided-restart");

    if (guidedRestart) {
        guidedRestart.onclick =
            startGuided;
    }

    const guidedHome =
        $("guided-home");

    if (guidedHome) {
        guidedHome.onclick =
            goHome;
    }

    const practiceHome =
        $("practice-home");

    if (practiceHome) {
        practiceHome.onclick =
            goHome;
    }

    const practiceBack =
        $("practice-back");

    if (practiceBack) {
        practiceBack.onclick =
            startPractice;
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {
    setupHomeButtons();

    setupTutorialControls();

    setupGameControls();

    setupQuizControls();

    setupPracticeCategories();

    /*
       Make sure every screen starts hidden except Home.
    */

    qsa(".screen").forEach(screen => {
        hide(screen);
    });

    showScreen("home-screen");

    resetTutorialSidebar();
    resetGuidedSidebar();
}

document.addEventListener(
    "DOMContentLoaded",
    initialize
);

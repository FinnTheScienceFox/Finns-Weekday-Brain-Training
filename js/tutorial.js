/* Tutorial mode */

let tutorial = createTutorialState();

function createTutorialState() {
    return {
        date: null,
        step: 0,
        answers: {
            1: null, 2: null, 3: null, 4: null, 5: null,
            6: null, 7: null, 8: null, 9: null,
            "10_1": null, "10_2": null
        },
        selectedAnswer: null,
        finished: false,
        _doomDate: null,
        _dayDifference: null,
        _weeks: null
    };
}

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


function renderTutorialStep() {
    tutorial.selectedAnswer = null;

    setText($("tutorial-step-counter"), `Step ${tutorial.step}`);
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


function createTutorialContinue(text = "Continue", callback) {
    const area = $("tutorial-answers");
    if (!area) return;

    area.innerHTML = "";

    const actionArea = clearActionArea(area);
    if (!actionArea) return;

    const button = document.createElement("button");
    button.className = "black-button";
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", callback);
    actionArea.appendChild(button);
}


function renderTutorialQuestion(
    question,
    options,
    correctAnswer,
    incorrectMessage
) {
    tutorialQuestion(question);

    const area = $("tutorial-answers");
    if (!area) return;

    tutorial.selectedAnswer = null;

    createAnswerButtons(
        area,
        options,
        answer => {
            tutorial.selectedAnswer = answer;
            showSubmitButton(area);
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

        tutorial.answers[tutorial.step] = tutorial.selectedAnswer;
        updateTutorialSidebar();

        qsa(".answer-button", area).forEach(button => {
            button.disabled = true;
        });

        createNextButton(
            area,
            tutorial.step === 11 ? "Finish" : "Next",
            () => {
                tutorial.step++;
                renderTutorialStep();
            }
        );
    });
}

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


function setupTutorialControls() {
    $("tutorial-restart")?.addEventListener("click", () => {
        transitionTo(startTutorial);
    });

    $("tutorial-home")?.addEventListener("click", goHome);
}


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



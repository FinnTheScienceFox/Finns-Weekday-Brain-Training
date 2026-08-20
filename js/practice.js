/* Practice mode */

const PRACTICE_CATEGORIES = {
    groups12: "Groups of 12",
    leftover: "Leftover",
    groups4: "Groups of 4",
    century: "Century Anchors",
    doomsday: "Doomsday Dates",
    weekdays: "Weekdays"
};

let practice = {
    category: null,
    date: null,
    answer: null,
    _number: null,
    _century: null,
    _month: null,
    _leap: false
};

function startPractice() {
    practice.category = null;
    practice.date = null;
    practice.answer = null;

    show($("practice-category-grid"));
    show($("practice-category-home"));
    hide($("practice-game"));

    setText($("practice-category-title"), "Choose a Category");
    setText($("practice-feedback"), "");
}

function setupPracticeCategories() {
    qsa(".category-button").forEach(button => {
        button.onclick = () => {
            practice.category = button.dataset.category;
            showPracticeQuestion();
        };
    });
}

function showPracticeQuestion() {
    hide($("practice-category-grid"));
    hide($("practice-category-home"));
    show($("practice-game"));

    practice.date = randomGameDate();

    const category = practice.category;
    const year = practice.date.getFullYear();
    const yy = year % 100;

    let question = "";
    let answer = null;

    switch (category) {
        case "groups12":
            question = `How many groups of 12 are in ${yy}?`;
            answer = Math.floor(yy / 12);
            break;

        case "leftover":
            question = `What is left over when ${yy} is divided into groups of 12?`;
            answer = yy % 12;
            break;

        case "groups4": {
            const number = Math.floor(Math.random() * 12);
            practice._number = number;
            question = `How many groups of 4 are in ${number}?`;
            answer = Math.floor(number / 4);
            break;
        }

        case "century": {
            const century = 16 + Math.floor(Math.random() * 9);
            practice._century = century;
            question = `What is the century anchor for the ${century}00s?`;
            answer = centuryAnchor(century * 100);
            break;
        }

        case "doomsday": {
            const month = Math.floor(Math.random() * 12);
            practice._month = month;
            practice._leap = isLeapYear(year);
            question = `What is the Doomsday date for ${MONTHS[month]}?`;
            answer = `${MONTH_SHORT[month]} ${monthDoomsday(month, year)}`;
            break;
        }

        case "weekdays": {
            const number = Math.floor(Math.random() * 7);
            question = `Which weekday corresponds to ${number}?`;
            answer = WEEKDAYS[number];
            break;
        }

        default:
            question = "Choose a category to begin.";
    }

    practice.answer = answer;

    setText($("practice-category-title"), PRACTICE_CATEGORIES[category] ?? "Practice");
    setText($("practice-date"), formatDate(practice.date));
    setText($("practice-main-text"), "");
    setText($("practice-question"), question);
    setText($("practice-feedback"), "");

    const input = $("practice-input");
    if (input) {
        input.value = "";
        input.focus();
    }
}

function normalizePracticeAnswer(value) {
    return String(value).trim().toLowerCase();
}

function checkPracticeAnswer() {
    const input = $("practice-input");
    if (!input) return;

    const entered = normalizePracticeAnswer(input.value);

    if (!entered) {
        displayFeedback($("practice-feedback"), false, "Please enter an answer first.");
        return;
    }

    if (entered === normalizePracticeAnswer(practice.answer)) {
        displayFeedback($("practice-feedback"), true, randomCorrectMessage());
    } else {
        displayFeedback($("practice-feedback"), false, "Sorry, not quite... Try again!");
    }
}

function setupPracticeControls() {
    setupPracticeCategories();

    $("practice-submit")?.addEventListener("click", checkPracticeAnswer);
    $("practice-input")?.addEventListener("keydown", event => {
        if (event.key === "Enter") checkPracticeAnswer();
    });

    $("practice-restart")?.addEventListener("click", () => {
        transitionTo(startPractice);
    });

    $("practice-home")?.addEventListener("click", goHome);
    $("practice-category-home")?.addEventListener("click", goHome);
}

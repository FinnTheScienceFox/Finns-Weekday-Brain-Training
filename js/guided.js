/* Guided mode */

let guided = {
    date: null,
    selectedAnswer: null,
    hintsUsed: 0
};

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

    qsa(".guided-hint", sidebar).forEach(hint => {
        hint.classList.remove("used");
    });
}

function updateGuidedSidebar() {
    setText(
        $("guided-sidebar-date"),
        guided.date ? formatDate(guided.date) : "Date"
    );
}

function renderGuidedQuestion() {
    const correct = WEEKDAYS[guided.date.getDay()];

    setText($("guided-date"), formatDate(guided.date));

    renderModeQuestion(
        "guided",
        `What weekday is ${formatDate(guided.date)}?`,
        WEEKDAYS,
        answer => {
            guided.selectedAnswer = answer;
        },
        submitGuided
    );

    setupGuidedHints();
}

function setupGuidedHints() {
    qsa(".guided-hint").forEach(button => {
        button.classList.remove("used");
        button.onclick = () => {
            const hintNumber = Number(button.dataset.hint);

            if (hintNumber !== guided.hintsUsed + 1) return;

            guided.hintsUsed++;
            button.classList.add("used");
            showGuidedHint(hintNumber);
        };
    });
}

function showGuidedHint(level) {
    const correct = WEEKDAYS[guided.date.getDay()];
    let message = "";

    if (level === 1) {
        message = "Hint 1: Start by calculating the year's Doomsday.";
    } else if (level === 2) {
        const doom = calculateDoomsday(guided.date.getFullYear());
        message = `Hint 2: This year's Doomsday is ${WEEKDAYS[doom]}. Use the Doomsday date for ${MONTHS[guided.date.getMonth()]}.`;
    } else if (level === 3) {
        message = `Hint 3: The answer is ${correct}.`;
    }

    const feedback = $("guided-feedback");
    if (feedback) {
        feedback.textContent = message;
        feedback.className = "feedback";
    }
}

function submitGuided() {
    const correct = WEEKDAYS[guided.date.getDay()];
    const feedback = $("guided-feedback");

    if (guided.selectedAnswer === null) {
        displayFeedback(feedback, false, "Please choose an answer first.");
        return;
    }

    if (String(guided.selectedAnswer) !== String(correct)) {
        displayFeedback(feedback, false, "Sorry, not quite... Try again!");
        return;
    }

    displayFeedback(feedback, true, randomCorrectMessage());

    const answers = $("guided-answers");
    if (!answers) return;

    qsa(".answer-button", answers).forEach(button => {
        button.disabled = true;
    });

    createNextButton(answers, "Next", startGuided);
}

function setupGuidedControls() {
    $("guided-restart")?.addEventListener("click", () => {
        transitionTo(startGuided);
    });

    $("guided-home")?.addEventListener("click", goHome);
}

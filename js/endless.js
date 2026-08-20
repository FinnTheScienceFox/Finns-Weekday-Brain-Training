/* Endless mode */

let endless = {
    date: null,
    streak: 0,
    selectedAnswer: null
};

function startEndless() {
    endless.streak = 0;
    newEndlessQuestion();
}

function updateEndlessStreak() {
    setText($('endless-streak-number'), endless.streak);
}

function newEndlessQuestion() {
    endless.date = randomGameDate();
    endless.selectedAnswer = null;

    setText($("endless-date"), formatDate(endless.date));
    updateEndlessStreak();

    renderModeQuestion(
        "endless",
        `What weekday is ${formatDate(endless.date)}?`,
        WEEKDAYS,
        answer => {
            endless.selectedAnswer = answer;
        },
        submitEndless
    );
}

function submitEndless() {
    const feedback = $("endless-feedback");

    if (endless.selectedAnswer === null) {
        displayFeedback(feedback, false, "Please choose an answer first.");
        return;
    }

    const correct = WEEKDAYS[endless.date.getDay()];

    if (String(endless.selectedAnswer) === String(correct)) {
        endless.streak++;
        updateEndlessStreak();

        displayFeedback(feedback, true, randomCorrectMessage());

        setTimeout(newEndlessQuestion, 500);
    } else {
        displayFeedback(feedback, false, "Sorry, not quite!");

        setTimeout(() => {
            endless.streak = 0;
            updateEndlessStreak();
            newEndlessQuestion();
        }, 900);
    }
}

function setupEndlessControls() {
    $("endless-restart")?.addEventListener("click", () => {
        transitionTo(startEndless);
    });

    $("endless-home")?.addEventListener("click", goHome);
}

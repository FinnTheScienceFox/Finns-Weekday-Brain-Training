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



function setupEndlessControls() {
    $("endless-restart")?.addEventListener("click", startEndless);
    $("endless-home")?.addEventListener("click", goHome);
}

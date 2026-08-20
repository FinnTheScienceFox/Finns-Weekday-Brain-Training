/* Quiz mode */

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
    $("quiz-start")?.addEventListener("click", startQuiz);
    $("quiz-setup-home")?.addEventListener("click", goHome);
    $("quiz-results-home")?.addEventListener("click", goHome);
    $("quiz-end-early")?.addEventListener("click", finishQuiz);
    $("quiz-restart")?.addEventListener("click", setupQuiz);
}

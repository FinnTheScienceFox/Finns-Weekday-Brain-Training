/* Title screen and mode selection */

function setupTitleScreen() {
    qsa(".mode-card").forEach(button => {
        button.addEventListener("click", () => {
            const mode = button.dataset.mode;
            if (!mode) return;

            transitionTo(() => startMode(mode));
        });
    });
}

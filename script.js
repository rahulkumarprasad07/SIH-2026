// ============================================================
// OLDONEOUT - SCRIPT.JS
// ============================================================


// ============================================================
// GAME DATA
// ============================================================

const gameData = {

    assam: {
        answers: [0, 1, 2, 3, 0, 1, 2, 3, 1, 2],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    manipur: {
        answers: [1, 3, 2, 1, 0, 0, 3, 2, 1, 3],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    meghalaya: {
        answers: [2, 3, 0, 1, 2, 3, 1, 0, 3, 2],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    mizoram: {
        answers: [2, 1, 0, 3, 3, 2, 0, 1, 3, 1],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    nagaland: {
        answers: [0, 1, 2, 3, 0, 1, 3, 2, 1, 3],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    tripura: {
        answers: [2, 3, 0, 2, 1, 1, 3, 0, 2, 1],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    // Arunachal Pradesh → Tripura questions/answers
    arunachalPradesh: {
        answers: [2, 3, 0, 2, 1, 1, 3, 0, 2, 1],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    },

    // Sikkim → Mizoram questions/answers
    sikkim: {
        answers: [2, 1, 0, 3, 3, 2, 0, 1, 3, 1],
        difficulties: [
            "easy", "easy", "medium", "medium", "hard",
            "hard", "medium", "medium", "hard", "hard"
        ]
    }

};


// ============================================================
// CREATE QUESTIONS AUTOMATICALLY
// ============================================================

Object.keys(gameData).forEach(function (state) {

    const data = gameData[state];

    const questions = {};

    // Arunachal uses Tripura images
    // Sikkim uses Mizoram images
    let imageState = state;

    if (state === "arunachalPradesh") {
        imageState = "tripura";
    }

    if (state === "sikkim") {
        imageState = "mizoram";
    }

    for (let i = 0; i < 10; i++) {

        const q = i + 1;

        questions["q" + q] = {

            images: [
                "assets/states/" + imageState + "/q" + q + "/img1.jpg",
                "assets/states/" + imageState + "/q" + q + "/img2.jpg",
                "assets/states/" + imageState + "/q" + q + "/img3.jpg",
                "assets/states/" + imageState + "/q" + q + "/img4.jpg"
            ],

            answer: data.answers[i],

            difficulty: data.difficulties[i]

        };

    }

    gameData[state] = questions;

});


// ============================================================
// LANGUAGE → STATE
// ============================================================

const gameLanguageStateMap = {

    en: "assam",
    hi: "assam",
    as: "assam",
    brx: "assam",

    mni: "manipur",

    kha: "meghalaya",
    garo: "meghalaya",

    lus: "mizoram",

    nag: "nagaland",

    kok: "tripura",

    // Additional states
    arunachalPradesh: "arunachalPradesh",
    sikkim: "sikkim"

};

// ============================================================
// CONSTANTS
// ============================================================

const TOTAL_QUESTIONS = 10;


// ============================================================
// GAME VARIABLES
// ============================================================

let currentQuestion = 1;
let currentQuestionKey = "q1";

let currentDifficulty = "easy";

let score = 0;

let usedQuestions = [];

let gameRunning = false;

let answerLocked = false;
let gameStartTime = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

let screen1;
let screen2;
let screen3;
let screen4;
let screen5;

let winPopup;


// ============================================================
// LANGUAGE
// ============================================================

function getSelectedLanguage() {

    const saved =
        localStorage.getItem("selectedLanguage");

    if (
        typeof translations !== "undefined" &&
        translations[saved]
    ) {
        return saved;
    }

    return "en";

}


function getTranslation() {

    if (typeof translations === "undefined") {

        console.error(
            "ERROR: language.js is not loaded before script.js"
        );

        return {};

    }

    return (
        translations[getSelectedLanguage()] ||
        translations.en
    );

}


function getSelectedState() {

    const stateSelector =
        document.getElementById("stateSelector");

    if (stateSelector && stateSelector.value) {

        const selectedState =
            stateSelector.value;

        console.log(
            "Selected State:",
            selectedState
        );

        return selectedState;
    }

    // Fallback:
    // Agar state selector available nahi hai,
    // to language ke according state select hoga.

    const language =
        getSelectedLanguage();

    const state =
        gameLanguageStateMap[language] ||
        "assam";

    console.log(
        "Selected Language:",
        language
    );

    console.log(
        "Selected State:",
        state
    );

    return state;
}


// ============================================================
// SCREEN CONTROL
// ============================================================

function showOnlyScreen(screen) {

    const screens = [
        screen1,
        screen2,
        screen3,
        screen4,
        screen5
    ];

    screens.forEach(function (s) {

        if (s) {
            s.style.display = "none";
        }

    });


    if (screen) {
        screen.style.display = "flex";
    }

}


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {

    currentQuestion = 1;

    currentQuestionKey = "q1";

    currentDifficulty = "easy";

    score = 0;

    usedQuestions = [];

    gameRunning = false;

    answerLocked = false;

}


// ============================================================
// SHOW QUESTION
// ============================================================

function showQuestion(questionData) {

    if (!questionData) {

        console.error(
            "Question not found:",
            currentQuestionKey
        );

        return;

    }


    const imageElements = [

        document.querySelector(".o1 img"),
        document.querySelector(".o2 img"),
        document.querySelector(".o3 img"),
        document.querySelector(".o4 img")

    ];


    imageElements.forEach(function (img, index) {

        if (!img) {
            return;
        }


        img.src =
            questionData.images[index];


        img.alt =
            "Option " + (index + 1);


        img.onerror = function () {

            console.error(
                "Image not found:",
                questionData.images[index]
            );

        };

    });


    const t =
        getTranslation();


const questionCounter =
    document.querySelector(".quesNo p");

if (questionCounter) {

    const language =
        getSelectedLanguage();

    if (language === "en") {

        questionCounter.textContent =
            `Question ${currentQuestion} of ${TOTAL_QUESTIONS}`;

    } else if (language === "hi") {

        questionCounter.textContent =
            `प्रश्न ${currentQuestion} में से ${TOTAL_QUESTIONS}`;

    } else {

        questionCounter.textContent =
            `${currentQuestion} / ${TOTAL_QUESTIONS}`;

    }

}


    const questionText =
        document.querySelector(".question");


    if (questionText) {

        questionText.textContent =
            t.findDifferent ||
            "Find the one that is different";

    }


    const hearText =
        document.querySelector(
            "#hear-question-btn span"
        );


    if (hearText) {

        hearText.textContent =
            t.hearQuestion ||
            "HEAR QUESTION";

    }


    document
        .querySelectorAll(".option")
        .forEach(function (option) {

            option.classList.remove(
                "correct",
                "wrong",
                "selected"
            );

        });


    answerLocked = false;

}


// ============================================================
// START FIRST QUESTION
// ============================================================

function startFirstQuestion() {

    const state =
        getSelectedState();


    const questions =
        gameData[state];


    if (!questions) {

        console.error(
            "State data not found:",
            state
        );

        return false;

    }


    const firstQuestion =
        questions.q1;


    if (!firstQuestion) {

        console.error(
            "Q1 not found for:",
            state
        );

        return false;

    }


    currentQuestion = 1;

    currentQuestionKey = "q1";

    currentDifficulty =
        firstQuestion.difficulty;


    usedQuestions = ["q1"];

gameRunning = true;

answerLocked = false;

gameStartTime = Date.now();


    showQuestion(
        firstQuestion
    );


    console.log(
        "Game started:",
        state
    );


    return true;

}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    stopSpeech();

    resetGame();


    if (winPopup) {

        winPopup.style.display =
            "none";

    }


    const started =
        startFirstQuestion();


    if (!started) {

        console.error(
            "GAME COULD NOT START"
        );

        showOnlyScreen(screen2);

        return;

    }


    showOnlyScreen(screen3);

}


// ============================================================
// NEXT ADAPTIVE QUESTION
// ============================================================

function getNextAdaptiveQuestion() {

    const state =
        getSelectedState();


    const questions =
        gameData[state];


    if (!questions) {
        return null;
    }


    const available =
        Object.keys(questions)
            .filter(function (key) {

                return !usedQuestions.includes(key);

            });


    if (!available.length) {
        return null;
    }


    let matching =
        available.filter(function (key) {

            return (
                questions[key].difficulty ===
                currentDifficulty
            );

        });


    if (!matching.length) {

        matching = available;

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            matching.length
        );


    const nextKey =
        matching[randomIndex];


    usedQuestions.push(
        nextKey
    );


    currentQuestionKey =
        nextKey;


    return questions[nextKey];

}


// ============================================================
// ANSWER HANDLING
// ============================================================

function handleAnswer(selectedIndex) {

    if (
        !gameRunning ||
        answerLocked
    ) {
        return;
    }


    answerLocked = true;


    const state =
        getSelectedState();


    const questions =
        gameData[state];


    const question =
        questions[currentQuestionKey];


    if (!question) {

        console.error(
            "Current question missing"
        );

        answerLocked = false;

        return;

    }


    const isCorrect =
        selectedIndex ===
        question.answer;


    const options =
        document.querySelectorAll(
            ".option"
        );


    if (options[selectedIndex]) {

        options[selectedIndex]
            .classList.add(
                isCorrect
                    ? "correct"
                    : "wrong"
            );

    }


    // ========================================================
    // DIFFICULTY
    // ========================================================

    if (isCorrect) {

        score++;


        if (currentDifficulty === "easy") {

            currentDifficulty =
                "medium";

        }

        else if (
            currentDifficulty === "medium"
        ) {

            currentDifficulty =
                "hard";

        }

    }

    else {

        if (currentDifficulty === "hard") {

            currentDifficulty =
                "medium";

        }

        else if (
            currentDifficulty === "medium"
        ) {

            currentDifficulty =
                "easy";

        }

    }


    console.log(
        isCorrect
            ? "Correct"
            : "Wrong",
        "| Score:",
        score,
        "| Difficulty:",
        currentDifficulty
    );


    // ========================================================
    // LAST QUESTION
    // ========================================================

    if (
        currentQuestion ===
        TOTAL_QUESTIONS
    ) {

        setTimeout(
            finishGame,
            500
        );

        return;

    }


    // ========================================================
    // NEXT QUESTION
    // ========================================================

    currentQuestion++;


    // Q2, Q3, Q4 fixed

    if (
        currentQuestion <= 4
    ) {

        const nextKey =
            "q" + currentQuestion;


        const nextQuestion =
            questions[nextKey];


        if (!nextQuestion) {

            console.error(
                "Question missing:",
                nextKey
            );

            answerLocked = false;

            return;

        }


        currentQuestionKey =
            nextKey;


        if (
            !usedQuestions.includes(
                nextKey
            )
        ) {

            usedQuestions.push(
                nextKey
            );

        }


        setTimeout(
            function () {

                showQuestion(
                    nextQuestion
                );

            },
            500
        );


        return;

    }


    // Q5-Q10 adaptive

    const nextQuestion =
        getNextAdaptiveQuestion();


    if (!nextQuestion) {

        console.error(
            "No next question available"
        );

        finishGame();

        return;

    }


    setTimeout(
        function () {

            showQuestion(
                nextQuestion
            );

        },
        500
    );

}


// ============================================================
// FINISH GAME
// ============================================================

function finishGame() {

    stopSpeech();

    gameRunning = false;
    answerLocked = true;

    const accuracy = Math.round(
        (score / TOTAL_QUESTIONS) * 100
    );

    // ================================
    // GAME TIME
    // ================================

    let gameTime = 0;

    if (gameStartTime) {
        gameTime = Math.round(
            (Date.now() - gameStartTime) / 1000
        );
    }

    // ================================
    // GET OLD PROGRESS
    // ================================

    const oldProgress = JSON.parse(
        localStorage.getItem("gameProgress")
    ) || {
        gamesPlayed: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        bestScore: 0,
        totalTime: 0
    };

    // ================================
    // UPDATE PROGRESS
    // ================================

    oldProgress.gamesPlayed++;

    oldProgress.totalCorrect += score;

    oldProgress.totalQuestions += TOTAL_QUESTIONS;

    oldProgress.totalTime += gameTime;

    if (score > oldProgress.bestScore) {
        oldProgress.bestScore = score;
    }

    // ================================
    // SAVE PROGRESS
    // ================================

    localStorage.setItem(
        "gameProgress",
        JSON.stringify(oldProgress)
    );

    // ================================
    // SHOW WIN POPUP
    // ================================

    if (!winPopup) {
        console.error("Win popup not found");
        return;
    }

    const scoreElement =
        winPopup.querySelector(
            ".score p:last-child"
        );

    const accuracyElement =
        winPopup.querySelector(
            ".accuracy p:last-child"
        );

    if (scoreElement) {
        scoreElement.textContent =
            score + "/" + TOTAL_QUESTIONS;
    }

    if (accuracyElement) {
        accuracyElement.textContent =
            accuracy + "%";
    }

    winPopup.style.display = "flex";

    winPopup.setAttribute(
        "aria-hidden",
        "false"
    );

    console.log(
        "GAME FINISHED",
        "Score:", score,
        "Accuracy:", accuracy + "%",
        "Time:", gameTime + " sec"
    );
}

// ============================================================
// PLAY GAME BUTTON
// ============================================================

function setupPlayGame() {

    const playGame =
        document.getElementById(
            "play-game"
        );


    if (!playGame) {

        console.error(
            "#play-game NOT FOUND"
        );

        return;

    }


    playGame.addEventListener(
        "click",
        function () {

            console.log(
                "PLAY GAME CLICKED"
            );

            startGame();

        }
    );


    playGame.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                startGame();

            }

        }
    );

}


// ============================================================
// START BUTTON
// ============================================================

function setupStartButton() {

    const startBtn =
        document.getElementById(
            "startBtn"
        );


    if (!startBtn) {

        console.error(
            "#startBtn NOT FOUND"
        );

        return;

    }


    startBtn.addEventListener(
        "click",
        function () {

            stopSpeech();

            showOnlyScreen(
                screen2
            );

        }
    );

}


// ============================================================
// OPTIONS
// ============================================================

function setupOptions() {

    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(
        function (option, index) {

            option.addEventListener(
                "click",
                function () {

                    handleAnswer(
                        index
                    );

                }
            );


            option.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        handleAnswer(
                            index
                        );

                    }

                }
            );

        }
    );

}


// ============================================================
// PLAY AGAIN
// ============================================================

function setupPlayAgain() {

    const button =
        document.querySelector(
            ".play-again"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            startGame();

        }
    );

}


// ============================================================
// GO HOME
// ============================================================

function setupGoHome() {

    const button =
        document.querySelector(
            ".go-home"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            stopSpeech();

            resetGame();


            if (winPopup) {

                winPopup.style.display =
                    "none";

                winPopup.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }


            showOnlyScreen(
                screen2
            );

        }
    );

}


// ============================================================
// PROGRESS
// ============================================================

function setupProgress() {

    const button =
        document.getElementById("progress");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            stopSpeech();

            updateProgressScreen();

            showOnlyScreen(screen4);

        }
    );

}
function updateProgressScreen() {

    const progress = JSON.parse(
        localStorage.getItem("gameProgress")
    ) || {
        gamesPlayed: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        bestScore: 0,
        totalTime: 0
    };


    // ================================
    // ACCURACY
    // ================================

    let accuracy = 0;

    if (progress.totalQuestions > 0) {

        accuracy = Math.round(
            (progress.totalCorrect /
                progress.totalQuestions) * 100
        );

    }


    // ================================
    // AVERAGE TIME
    // ================================

    let avgTime = 0;

    if (progress.gamesPlayed > 0) {

        avgTime = Math.round(
            progress.totalTime /
            progress.gamesPlayed
        );

    }


    // ================================
    // UPDATE HTML VALUES
    // ================================

    const gamesPlayed =
        document.getElementById(
            "games-played-value"
        );

    const accuracyElement =
        document.getElementById(
            "accuracy-value"
        );

    const bestScore =
        document.getElementById(
            "best-score-value"
        );

    const avgTimeElement =
        document.getElementById(
            "avg-time-value"
        );


    if (gamesPlayed) {

        gamesPlayed.textContent =
            progress.gamesPlayed;

    }


    if (accuracyElement) {

        accuracyElement.textContent =
            accuracy + "%";

    }


    if (bestScore) {

        bestScore.textContent =
            progress.bestScore + "/" +
            TOTAL_QUESTIONS;

    }


    if (avgTimeElement) {

        avgTimeElement.textContent =
            avgTime + " sec";

    }

}
// ============================================================
// SETTINGS
// ============================================================

function setupSettings() {

    const button =
        document.getElementById(
            "settings"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            stopSpeech();

            showOnlyScreen(
                screen5
            );

        }
    );

}


// ============================================================
// HOME ICON
// ============================================================

function setupHome() {

    const homeIcon =
        document.getElementById(
            "home-icon"
        );


    if (homeIcon) {

        homeIcon.addEventListener(
            "click",
            function () {

                stopSpeech();

                resetGame();

                showOnlyScreen(
                    screen2
                );

            }
        );

    }


    const homeNav =
        document.getElementById(
            "home-nav"
        );


    if (homeNav) {

        homeNav.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                stopSpeech();

                showOnlyScreen(
                    screen2
                );

            }
        );

    }

}


// ============================================================
// EXIT POPUPS
// ============================================================

function setupExitPopups() {

    const endButtons =
        document.querySelectorAll(
            ".end"
        );


    endButtons.forEach(
        function (button) {

            const screen =
                button.closest(
                    ".screen"
                );


            if (!screen) {
                return;
            }


            const popup =
                screen.querySelector(
                    ".exitPopup"
                );


            if (!popup) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    popup.style.display =
                        "flex";

                    popup.setAttribute(
                        "aria-hidden",
                        "false"
                    );

                }
            );


            const cancel =
                popup.querySelector(
                    ".cancelExit"
                );


            const confirm =
                popup.querySelector(
                    ".confirmExit"
                );


            if (cancel) {

                cancel.addEventListener(
                    "click",
                    function () {

                        popup.style.display =
                            "none";

                        popup.setAttribute(
                            "aria-hidden",
                            "true"
                        );

                    }
                );

            }


            if (confirm) {

                confirm.addEventListener(
                    "click",
                    function () {

                        popup.style.display =
                            "none";

                        popup.setAttribute(
                            "aria-hidden",
                            "true"
                        );


                        stopSpeech();

                        resetGame();


                        if (winPopup) {

                            winPopup.style.display =
                                "none";

                        }


                        showOnlyScreen(
                            screen2
                        );

                    }
                );

            }

        }
    );

}


// ============================================================
// TEXT TO SPEECH
// ============================================================

const speechLanguages = {

    en: ["en-US", "en-IN"],
    hi: ["hi-IN", "hi"],
    as: ["as-IN", "bn-IN", "hi-IN"],
    mni: ["mni-IN", "hi-IN"],
    brx: ["brx-IN", "hi-IN"],
    kha: ["kha-IN", "en-IN"],
    lus: ["lus-IN", "en-IN"],
    kok: ["kok-IN", "hi-IN"],
    nag: ["nag-IN", "en-IN"],
    garo: ["grt-IN", "en-IN"]

};


let speechIndex = 0;

let speechState = "stopped";

let speechMode = null;


// ============================================================
// GET VOICE
// ============================================================

function getBestVoice(language) {

    if (
        typeof speechSynthesis ===
        "undefined"
    ) {

        return null;

    }


    const voices =
        speechSynthesis.getVoices();


    if (!voices.length) {

        return null;

    }


    const wanted =
        speechLanguages[language] ||
        ["en-US"];


    for (
        const lang of wanted
    ) {

        const exact =
            voices.find(
                function (voice) {

                    return (
                        voice.lang.toLowerCase() ===
                        lang.toLowerCase()
                    );

                }
            );


        if (exact) {
            return exact;
        }

    }


    for (
        const lang of wanted
    ) {

        const prefix =
            lang
                .split("-")[0]
                .toLowerCase();


        const similar =
            voices.find(
                function (voice) {

                    return voice.lang
                        .toLowerCase()
                        .startsWith(prefix);

                }
            );


        if (similar) {
            return similar;
        }

    }


    return voices[0];

}


// ============================================================
// REMOVE VOICE HIGHLIGHTS
// ============================================================

function removeVoiceHighlights() {

    document
        .querySelectorAll(
            ".voice-highlight"
        )
        .forEach(
            function (element) {

                element.classList.remove(
                    "voice-highlight"
                );

            }
        );

}


// ============================================================
// STOP SPEECH
// ============================================================

function stopSpeech() {

    if (
        typeof speechSynthesis !==
        "undefined"
    ) {

        speechSynthesis.cancel();

    }


    speechIndex = 0;

    speechState = "stopped";

    speechMode = null;

    removeVoiceHighlights();


    const voiceButton =
        document.getElementById(
            "voice-btn"
        );


    if (voiceButton) {

        voiceButton.innerHTML =
            '<i class="fa-solid fa-volume-high"></i>';

    }

}


// ============================================================
// SCREEN 2 SPEECH
// ============================================================

function speakScreen2Next() {

    const elements = [

        document.getElementById(
            "game-title"
        ),

        document.getElementById(
            "game-subtitle"
        ),

        document.getElementById(
            "play-game"
        ),

        document.getElementById(
            "progress"
        ),

        document.getElementById(
            "settings"
        )

    ];


    if (
        speechIndex >=
        elements.length
    ) {

        stopSpeech();

        return;

    }


    const element =
        elements[speechIndex];


    if (!element) {

        speechIndex++;

        speakScreen2Next();

        return;

    }


    removeVoiceHighlights();


    element.classList.add(
        "voice-highlight"
    );


    const language =
        getSelectedLanguage();


    const utterance =
        new SpeechSynthesisUtterance(
            element.innerText
        );


    const voice =
        getBestVoice(language);


    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang;

    }


    utterance.rate =
        0.85;


    utterance.onend =
        function () {

            element.classList.remove(
                "voice-highlight"
            );


            speechIndex++;


            if (
                speechState ===
                "speaking"
            ) {

                speakScreen2Next();

            }

        };


    utterance.onerror =
        function () {

            element.classList.remove(
                "voice-highlight"
            );


            speechIndex++;


            if (
                speechState ===
                "speaking"
            ) {

                speakScreen2Next();

            }

        };


    speechSynthesis.speak(
        utterance
    );

}


// ============================================================
// VOICE BUTTON
// ============================================================

function setupVoiceButton() {

    const button =
        document.getElementById(
            "voice-btn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            if (
                speechState ===
                "speaking"
            ) {

                speechSynthesis.pause();

                speechState =
                    "paused";


                button.innerHTML =
                    '<i class="fa-solid fa-play"></i>';

                return;

            }


            if (
                speechState ===
                "paused"
            ) {

                speechSynthesis.resume();

                speechState =
                    "speaking";


                button.innerHTML =
                    '<i class="fa-solid fa-pause"></i>';

                return;

            }


            stopSpeech();


            speechIndex = 0;

            speechMode = "menu";

            speechState =
                "speaking";


            button.innerHTML =
                '<i class="fa-solid fa-pause"></i>';


            speakScreen2Next();

        }
    );

}


// ============================================================
// HEAR QUESTION
// ============================================================

function setupHearQuestion() {

    const button =
        document.getElementById(
            "hear-question-btn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            if (
                speechState ===
                    "speaking" &&
                speechMode ===
                    "question"
            ) {

                speechSynthesis.pause();

                speechState =
                    "paused";

                return;

            }


            if (
                speechState ===
                    "paused" &&
                speechMode ===
                    "question"
            ) {

                speechSynthesis.resume();

                speechState =
                    "speaking";

                return;

            }


            stopSpeech();


            const question =
                document.querySelector(
                    ".question"
                );


            if (!question) {
                return;
            }


            const language =
                getSelectedLanguage();


            const utterance =
                new SpeechSynthesisUtterance(
                    question.innerText
                );


            const voice =
                getBestVoice(language);


            if (voice) {

                utterance.voice =
                    voice;

                utterance.lang =
                    voice.lang;

            }


            utterance.rate =
                0.85;


            speechMode =
                "question";


            speechState =
                "speaking";


            button.classList.add(
                "voice-highlight"
            );


            utterance.onend =
                function () {

                    button.classList.remove(
                        "voice-highlight"
                    );

                    speechState =
                        "stopped";

                    speechMode =
                        null;

                };


            utterance.onerror =
                function () {

                    button.classList.remove(
                        "voice-highlight"
                    );

                    speechState =
                        "stopped";

                    speechMode =
                        null;

                };


            speechSynthesis.speak(
                utterance
            );

        }
    );

}


// ============================================================
// CHANGE LANGUAGE
// ============================================================

function changeLanguage(lang) {

    if (
        typeof translations ===
        "undefined"
    ) {

        console.error(
            "language.js is not loaded."
        );

        return;

    }


    const t =
        translations[lang];


    if (!t) {

        console.error(
            "Translation not found:",
            lang
        );

        return;

    }


    stopSpeech();


    localStorage.setItem(
        "selectedLanguage",
        lang
    );


    // ========================================================
    // SCREEN 1
    // ========================================================

    const logoTitle =
        document.querySelector(
            ".logoText h3"
        );


    const tagline =
        document.querySelectorAll(
            ".logoText p"
        );


    const startButton =
        document.getElementById(
            "startBtn"
        );


    if (logoTitle) {

        logoTitle.textContent =
            t.oddOneOut;

    }


    if (tagline.length >= 2) {

        tagline[0].textContent =
            t.tagline1;

        tagline[1].textContent =
            t.tagline2;

    }


    if (startButton) {

        startButton.textContent =
            t.getStarted;

    }


    // ========================================================
    // SCREEN 2
    // ========================================================

    const home =
        document.querySelector(
            "#top-bar a:first-child p"
        );


    const brainTrain =
        document.querySelector(
            "#top-bar h3"
        );


    const help =
        document.querySelector(
            "#top-bar a:last-child p"
        );


    const gameTitle =
        document.getElementById(
            "game-title"
        );


    const gameSubtitle =
        document.getElementById(
            "game-subtitle"
        );


    const playGame =
        document.querySelector(
            ".b1 h3"
        );


    const progress =
        document.querySelector(
            ".b2 h3"
        );


    const settings =
        document.querySelector(
            ".b3 h3"
        );


    if (home) {
        home.textContent = t.home;
    }


    if (brainTrain) {
        brainTrain.textContent =
            t.brainTrain;
    }


    if (help) {
        help.textContent = t.help;
    }


    if (gameTitle) {
        gameTitle.textContent =
            t.oddOneOut;
    }


    if (gameSubtitle) {
        gameSubtitle.textContent =
            t.selectOption;
    }


    if (playGame) {
        playGame.textContent =
            t.playGame;
    }


    if (progress) {
        progress.textContent =
            t.myProgress;
    }


    if (settings) {
        settings.textContent =
            t.settings;
    }


    // ========================================================
// SCREEN 3
// ========================================================

const questionText =
    document.querySelector(
        ".question"
    );

const hearQuestion =
    document.querySelector(
        "#hear-question-btn span"
    );



if (questionText) {

    questionText.textContent =
        t.findDifferent;

}


if (hearQuestion) {

    hearQuestion.textContent =
        t.hearQuestion;

}




    // ========================================================
    // EXIT
    // ========================================================

    document
        .querySelectorAll(".end span")
        .forEach(function (element) {

            element.textContent =
                t.exit;

        });


    document
        .querySelectorAll(".popup-box h3")
        .forEach(function (element) {

            element.textContent =
                t.exitGame;

        });


    document
        .querySelectorAll(".popup-box > p")
        .forEach(function (element) {

            element.textContent =
                t.leaveGame;

        });


    document
        .querySelectorAll(".cancelExit")
        .forEach(function (element) {

            element.textContent =
                t.cancel;

        });


    document
        .querySelectorAll(".confirmExit")
        .forEach(function (element) {

            element.textContent =
                t.exit;

        });


    // ========================================================
    // WIN POPUP
    // ========================================================

    if (winPopup) {

        const title =
            winPopup.querySelector("h3");


        const description =
            winPopup.querySelector(
                ":scope > p"
            );


        const scoreLabel =
            winPopup.querySelector(
                ".score p:first-child"
            );


        const accuracyLabel =
            winPopup.querySelector(
                ".accuracy p:first-child"
            );


        const playAgain =
            winPopup.querySelector(
                ".play-again span"
            );


        const homeButton =
            winPopup.querySelector(
                ".go-home span"
            );


        if (title) {
            title.textContent =
                t.greatJob;
        }


        if (description) {
            description.textContent =
                t.completedChallenge;
        }


        if (scoreLabel) {
            scoreLabel.textContent =
                t.score;
        }


        if (accuracyLabel) {
            accuracyLabel.textContent =
                t.accuracy;
        }


        if (playAgain) {
            playAgain.textContent =
                t.playAgain;
        }


        if (homeButton) {
            homeButton.textContent =
                t.winHome;
        }

    }


    // ========================================================
    // SCREEN 4
    // ========================================================

    const progressHeader =
        document.querySelector(
            ".s4 .header h3"
        );


    const yourProgress =
        document.querySelector(
            ".slogans h3"
        );


    const trackProgress =
        document.querySelector(
            ".slogans p"
        );


    const gamesPlayed =
        document.querySelector(
            ".i1 p"
        );


    const accuracy =
        document.querySelector(
            ".i2 p"
        );


    const bestScore =
        document.querySelector(
            ".i3 p"
        );


    const avgTime =
        document.querySelector(
            ".i4 p"
        );


    if (progressHeader) {
        progressHeader.textContent =
            t.progress;
    }


    if (yourProgress) {
        yourProgress.textContent =
            t.yourProgress;
    }


    if (trackProgress) {
        trackProgress.textContent =
            t.trackProgress;
    }


    if (gamesPlayed) {
        gamesPlayed.textContent =
            t.gamesPlayed;
    }


    if (accuracy) {
        accuracy.textContent =
            t.accuracy;
    }


    if (bestScore) {
        bestScore.textContent =
            t.bestScore;
    }


    if (avgTime) {
        avgTime.textContent =
            t.avgTime;
    }


    // ========================================================
    // UPDATE CURRENT QUESTION
    // ========================================================

    if (
        gameRunning &&
        screen3 &&
        screen3.style.display !== "none"
    ) {

        const questions =
            gameData[
                getSelectedState()
            ];


        if (questions) {

            const currentData =
                questions[
                    currentQuestionKey
                ];


            if (currentData) {

                showQuestion(
                    currentData
                );

            }

        }

    }

}


// ============================================================
// LANGUAGE SELECTOR
// ============================================================

function setupLanguageSelector() {

    const selector =
        document.getElementById(
            "languageSelector"
        );


    if (!selector) {
        return;
    }


    selector.addEventListener(
        "change",
        function () {

            changeLanguage(
                this.value
            );

        }
    );


    const saved =
        localStorage.getItem(
            "selectedLanguage"
        ) || "en";


    const language =
        (
            typeof translations !== "undefined" &&
            translations[saved]
        )
            ? saved
            : "en";


    selector.value =
        language;


    changeLanguage(
        language
    );

}


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Screens

        screen1 =
            document.querySelector(".s1");

        screen2 =
            document.querySelector(".s2");

        screen3 =
            document.querySelector(".s3");

        screen4 =
            document.querySelector(".s4");

        screen5 =
            document.querySelector(".s5");


        // Popup

        winPopup =
            document.querySelector(
                ".win-popUp"
            );


        // Setup

        setupStartButton();

        setupPlayGame();

        setupOptions();

        setupPlayAgain();

        setupGoHome();

        setupProgress();

        setupSettings();

        setupHome();

        setupExitPopups();

        setupVoiceButton();

        setupHearQuestion();

        setupLanguageSelector();


        // Start on screen 1

        showOnlyScreen(
            screen1
        );


        console.log(
            "OLDONEout loaded successfully"
        );

    }
);


// ============================================================
// SPEECH VOICES
// ============================================================

if (
    typeof speechSynthesis !==
    "undefined"
) {

    speechSynthesis.onvoiceschanged =
        function () {

            speechSynthesis.getVoices();

        };

}
const stateSelector =
    document.getElementById("stateSelector");

if (stateSelector) {

    const savedState =
        localStorage.getItem("selectedState");

    if (savedState) {
        stateSelector.value = savedState;
    }

    stateSelector.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "selectedState",
                this.value
            );

            console.log(
                "State changed to:",
                this.value
            );
        }
    );
}
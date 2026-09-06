// ==========================================
// SCREEN ELEMENTS
// ==========================================

const startBtn = document.getElementById("startBtn");

const screen1 = document.querySelector(".s1");
const screen2 = document.querySelector(".s2");
const screen3 = document.querySelector(".s3");
const screen4 = document.querySelector(".s4");
const screen5 = document.querySelector(".s5");


// ==========================================
// SCREEN 1 → SCREEN 2
// ==========================================

startBtn.addEventListener("click", function () {

    screen1.style.display = "none";
    screen2.style.display = "flex";

});


// ==========================================
// SCREEN 2 → SCREEN 3
// PLAY GAME
// ==========================================

const playGame = document.querySelector("#play-game");

playGame.addEventListener("click", function () {

    screen2.style.display = "none";
    screen3.style.display = "flex";

    // Stop any voice from Screen 2
    stopSpeech();

    console.log("Game started");

});


// ==========================================
// SCREEN 2 → SCREEN 4
// PROGRESS
// ==========================================

const progressBtn = document.querySelector("#progress");

progressBtn.addEventListener("click", function () {

    screen2.style.display = "none";
    screen4.style.display = "flex";

    // Stop voice
    stopSpeech();

});


// ==========================================
// SCREEN 2 → SCREEN 5
// SETTINGS
// ==========================================

const settingsBtn = document.querySelector("#settings");

settingsBtn.addEventListener("click", function () {

    screen2.style.display = "none";
    screen5.style.display = "flex";

    // Stop voice
    stopSpeech();

});


// ==========================================
// EXIT POPUP
// ==========================================

const endBtns = document.querySelectorAll(".end");
const exitPopups = document.querySelectorAll(".exitPopup");

const cancelExits = document.querySelectorAll(".cancelExit");
const confirmExits = document.querySelectorAll(".confirmExit");


// OPEN POPUP
endBtns.forEach((btn, index) => {

    btn.addEventListener("click", function () {

        exitPopups[index].style.display = "flex";

    });

});


// CANCEL EXIT
cancelExits.forEach((btn, index) => {

    btn.addEventListener("click", function () {

        exitPopups[index].style.display = "none";

    });

});


// CONFIRM EXIT
confirmExits.forEach((btn, index) => {

    btn.addEventListener("click", function () {

        exitPopups[index].style.display = "none";

        stopSpeech();

        screen1.style.display = "none";
        screen3.style.display = "none";
        screen4.style.display = "none";
        screen5.style.display = "none";

        screen2.style.display = "flex";

    });

});


// ==========================================
// TEXT TO SPEECH
// ==========================================

const voiceBtn = document.getElementById("voice-btn");


// Screen 2 elements
const voiceElements = [

    document.getElementById("game-title"),

    document.getElementById("game-subtitle"),

    document.getElementById("play-game"),

    document.getElementById("progress"),

    document.getElementById("settings")

];


// Screen 3 Hear Question
const hearQuestionBtn =
    document.getElementById("hear-question-btn");


// ==========================================
// SPEECH VARIABLES
// ==========================================

let speechIndex = 0;

let voiceState = "stopped";

// stopped
// speaking
// paused

let currentUtterance = null;


// ==========================================
// LANGUAGE → SPEECH LANGUAGE
// ==========================================

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


// ==========================================
// GET SELECTED LANGUAGE
// ==========================================

function getSelectedLanguage() {

    return localStorage.getItem("selectedLanguage") || "en";

}


// ==========================================
// GET AVAILABLE BROWSER VOICE
// ==========================================

function getBestVoice(lang) {

    const voices = speechSynthesis.getVoices();

    if (!voices.length) {
        return null;
    }

    const possibleLanguages =
        speechLanguages[lang] || ["en-US"];

    
    // Exact match
    for (const language of possibleLanguages) {

        const exactVoice = voices.find(voice =>
            voice.lang.toLowerCase() === language.toLowerCase()
        );

        if (exactVoice) {
            return exactVoice;
        }

    }


    // Same language family
    for (const language of possibleLanguages) {

        const languageCode =
            language.split("-")[0].toLowerCase();

        const similarVoice = voices.find(voice =>
            voice.lang.toLowerCase().startsWith(languageCode)
        );

        if (similarVoice) {
            return similarVoice;
        }

    }


    // Final fallback
    return voices.find(voice =>
        voice.lang.toLowerCase().startsWith("en")
    ) || voices[0];

}


// ==========================================
// REMOVE HIGHLIGHTS
// ==========================================

function removeVoiceHighlights() {

    voiceElements.forEach(element => {

        if (element) {
            element.classList.remove("voice-highlight");
        }

    });

}


// ==========================================
// STOP SPEECH
// ==========================================

function stopSpeech() {

    speechSynthesis.cancel();

    currentUtterance = null;

    removeVoiceHighlights();

    speechIndex = 0;

    voiceState = "stopped";


    if (voiceBtn) {

        voiceBtn.innerHTML =
            '<i class="fa-solid fa-volume-high"></i>';

    }

}


// ==========================================
// UPDATE VOICE BUTTON
// ==========================================

function showPauseIcon() {

    if (voiceBtn) {

        voiceBtn.innerHTML =
            '<i class="fa-solid fa-pause"></i>';

    }

}


function showPlayIcon() {

    if (voiceBtn) {

        voiceBtn.innerHTML =
            '<i class="fa-solid fa-play"></i>';

    }

}


function showVolumeIcon() {

    if (voiceBtn) {

        voiceBtn.innerHTML =
            '<i class="fa-solid fa-volume-high"></i>';

    }

}


// ==========================================
// SPEAK SCREEN 2 ELEMENTS
// ==========================================

function speakNext() {

    // Everything finished
    if (speechIndex >= voiceElements.length) {

        removeVoiceHighlights();

        speechIndex = 0;

        voiceState = "stopped";

        currentUtterance = null;

        showVolumeIcon();

        return;

    }


    const element = voiceElements[speechIndex];

    if (!element) {

        speechIndex++;

        speakNext();

        return;

    }


    removeVoiceHighlights();

    element.classList.add("voice-highlight");


    const selectedLanguage =
        getSelectedLanguage();


    const utterance =
        new SpeechSynthesisUtterance(
            element.innerText
        );


    currentUtterance = utterance;


    // Select browser voice
    const selectedVoice =
        getBestVoice(selectedLanguage);


    if (selectedVoice) {

        utterance.voice = selectedVoice;

        utterance.lang = selectedVoice.lang;

    } else {

        utterance.lang =
            speechLanguages[selectedLanguage]?.[0]
            || "en-US";

    }


    // Elder-friendly speech speed
    utterance.rate = 0.85;

    utterance.pitch = 1;


    // When speech finishes
    utterance.onend = function () {

        element.classList.remove("voice-highlight");

        currentUtterance = null;

        speechIndex++;


        if (voiceState === "speaking") {

            speakNext();

        }

    };


    // If speech has an error
    utterance.onerror = function () {

        element.classList.remove("voice-highlight");

        currentUtterance = null;

        speechIndex++;


        if (voiceState === "speaking") {

            speakNext();

        }

    };


    speechSynthesis.speak(utterance);

}


// ==========================================
// SCREEN 2 VOICE BUTTON
// ==========================================

voiceBtn.addEventListener("click", function () {


    // =========================
    // SPEAKING → PAUSE
    // =========================

    if (voiceState === "speaking") {

        speechSynthesis.pause();

        voiceState = "paused";

        showPlayIcon();

        return;

    }


    // =========================
    // PAUSED → RESUME
    // =========================

    if (voiceState === "paused") {

        speechSynthesis.resume();

        voiceState = "speaking";

        showPauseIcon();

        return;

    }


    // =========================
    // STOPPED → START
    // =========================

    speechSynthesis.cancel();

    removeVoiceHighlights();

    speechIndex = 0;

    voiceState = "speaking";

    showPauseIcon();

    speakNext();

});


// ==========================================
// SCREEN 3 — HEAR QUESTION
// ==========================================

if (hearQuestionBtn) {

    hearQuestionBtn.addEventListener("click", function () {


        // If currently speaking → pause
        if (voiceState === "speaking") {

            speechSynthesis.pause();

            voiceState = "paused";

            hearQuestionBtn.classList.add(
                "voice-highlight"
            );

            return;

        }


        // If paused → resume
        if (voiceState === "paused") {

            speechSynthesis.resume();

            voiceState = "speaking";

            return;

        }


        // Start question
        speechSynthesis.cancel();

        removeVoiceHighlights();

        speechIndex = 0;

        voiceState = "speaking";


        const selectedLanguage =
            getSelectedLanguage();


        const questionText =
            document.querySelector(".question").innerText;


        const utterance =
            new SpeechSynthesisUtterance(
                questionText
            );


        currentUtterance = utterance;


        const selectedVoice =
            getBestVoice(selectedLanguage);


        if (selectedVoice) {

            utterance.voice = selectedVoice;

            utterance.lang = selectedVoice.lang;

        } else {

            utterance.lang =
                speechLanguages[selectedLanguage]?.[0]
                || "en-US";

        }


        utterance.rate = 0.85;

        utterance.pitch = 1;


        hearQuestionBtn.classList.add(
            "voice-highlight"
        );


        utterance.onend = function () {

            hearQuestionBtn.classList.remove(
                "voice-highlight"
            );

            currentUtterance = null;

            voiceState = "stopped";

        };


        utterance.onerror = function () {

            hearQuestionBtn.classList.remove(
                "voice-highlight"
            );

            currentUtterance = null;

            voiceState = "stopped";

        };


        speechSynthesis.speak(utterance);

    });

}


// ==========================================
// LOAD SPEECH VOICES
// ==========================================

// Some browsers load voices asynchronously.
speechSynthesis.onvoiceschanged = function () {

    speechSynthesis.getVoices();

};
// ==========================================
// ML DIFFICULTY API CALL
// ==========================================
async function getRecommendedDifficulty(accuracy, responseTime, streak) {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accuracy: accuracy,
        response_time: responseTime,
        streak: streak
      })
    });

    const data = await response.json();
    console.log("ML recommended difficulty:", data.difficulty);
    return data.difficulty; // "Easy", "Medium", or "Hard"
  } catch (error) {
    console.error("ML Server connection failed, defaulting to Medium:", error);
    return "Medium";
  }
}

// ==========================================
// ODD ONE OUT GAME ENGINE
// ==========================================
let currentQNum = 1;
const totalQuestions = 10;
let correctHits = 0;
let streak = 0;
let questionStartTime = Date.now();
let currentDifficulty = "Medium";

// Puzzles by difficulty level (using icons/emojis for odd items)
const gameData = {
  Easy: [
    { prompt: "Find the odd leaf/item", items: ["🍂", "🍂", "🍁", "🍂"], oddIndex: 2 },
    { prompt: "Find the odd shape", items: ["⭐", "⭐", "⭐", "🔵"], oddIndex: 3 }
  ],
  Medium: [
    { prompt: "Find the different color/shape", items: ["🍎", "🍎", "🍏", "🍎"], oddIndex: 2 },
    { prompt: "Find the odd symbol", items: ["🔶", "🔷", "🔷", "🔷"], oddIndex: 0 }
  ],
  Hard: [
    { prompt: "Find the subtle difference", items: ["🟤", "🟤", "⚫", "🟤"], oddIndex: 2 },
    { prompt: "Find the reversed angle", items: ["🔺", "🔻", "🔺", "🔺"], oddIndex: 1 }
  ]
};

function displayCurrentQuestion() {
  const quesCounter = document.querySelector(".quesNo p");
  if (quesCounter) quesCounter.innerText = `Question ${currentQNum} of ${totalQuestions} (${currentDifficulty})`;

  const pool = gameData[currentDifficulty] || gameData["Medium"];
  const puzzle = pool[(currentQNum - 1) % pool.length];

  const optionCards = document.querySelectorAll(".s3 .option");

  optionCards.forEach((card, index) => {
    // Render the visual item directly inside the option box
    card.innerHTML = `<span style="font-size: 3rem; display: block; pointer-events: none;">${puzzle.items[index]}</span>`;
    card.style.cursor = "pointer";

    // Clean old listeners by re-cloning
    const freshCard = card.cloneNode(true);
    card.parentNode.replaceChild(freshCard, card);

    freshCard.addEventListener("click", () => handleCardClick(index, puzzle.oddIndex));
  });

  questionStartTime = Date.now();
}

async function handleCardClick(selectedIndex, correctIndex) {
  const responseTimeSec = Math.max(1, (Date.now() - questionStartTime) / 1000);

  if (selectedIndex === correctIndex) {
    correctHits++;
    streak++;
    alert("Correct! Well done.");
  } else {
    streak = 0;
    alert("Incorrect! Keep going.");
  }

  const accuracy = correctHits / currentQNum;

  // Ask Python ML model for the next question's difficulty
  currentDifficulty = await getRecommendedDifficulty(accuracy, responseTimeSec, streak);

  currentQNum++;
  if (currentQNum <= totalQuestions) {
    displayCurrentQuestion();
  } else {
    alert(`Game Finished! Final Score: ${correctHits}/${totalQuestions}`);
    // Return to Screen 2
    screen3.style.display = "none";
    screen2.style.display = "flex";
  }
}

// Start game on 'PLAY GAME' click
playGame.addEventListener("click", function () {
  currentQNum = 1;
  correctHits = 0;
  streak = 0;
  currentDifficulty = "Medium";
  displayCurrentQuestion();
});

// Home icon inside Screen 3 returns to Screen 2
document.getElementById("home-icon")?.addEventListener("click", function () {
  screen3.style.display = "none";
  screen2.style.display = "flex";
});

// ML Test button listener
document.getElementById("test-ml-btn")?.addEventListener("click", async () => {
  const result = await getRecommendedDifficulty(0.9, 2.5, 5);
  alert(`ML Server Connected! Predicted Difficulty: ${result}`);
});
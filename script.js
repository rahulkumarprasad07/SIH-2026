// ============================================================
// OLDONEOUT - SCRIPT.JS (INTEGRATED WITH ML ENGINE)
// ============================================================

// ============================================================
// GAME DATA & REGIONAL STATE QUESTION DATASETS
// ============================================================
const gameData = {
  assam: {
    answers: [0, 1, 2, 3, 0, 1, 2, 3, 1, 2],
    difficulties: ["easy", "easy", "medium", "medium", "hard", "hard", "medium", "medium", "hard", "hard"]
  },
  manipur: {
    answers: [1, 3, 2, 1, 0, 0, 3, 2, 1, 3],
    difficulties: ["easy", "easy", "medium", "medium", "hard", "hard", "medium", "medium", "hard", "hard"]
  },
  meghalaya: {
    answers: [2, 3, 0, 1, 2, 3, 1, 0, 3, 2],
    difficulties: ["easy", "easy", "medium", "medium", "hard", "hard", "medium", "medium", "hard", "hard"]
  },
  mizoram: {
    answers: [2, 1, 0, 3, 3, 2, 0, 1, 3, 1],
    difficulties: ["easy", "easy", "medium", "medium", "hard", "hard", "medium", "medium", "hard", "hard"]
  },
  nagaland: {
    answers: [0, 1, 2, 3, 0, 1, 3, 2, 1, 3],
    difficulties: ["easy", "easy", "medium", "medium", "hard", "hard", "medium", "medium", "hard", "hard"]
  },
  tripura: {
    answers: [2, 3, 0, 2, 1, 1, 3, 0, 2, 1],
    difficulties: ["easy", "easy", "medium", "medium", "hard", "hard", "medium", "medium", "hard", "hard"]
  }
};

// ============================================================
// CREATE QUESTIONS AUTOMATICALLY
// ============================================================
Object.keys(gameData).forEach(function (state) {
  const data = gameData[state];
  const questions = {};

  for (let i = 0; i < 10; i++) {
    const q = i + 1;
    questions["q" + q] = {
      images: [
        "assets/states/" + state + "/q" + q + "/img1.jpg",
        "assets/states/" + state + "/q" + q + "/img2.jpg",
        "assets/states/" + state + "/q" + q + "/img3.jpg",
        "assets/states/" + state + "/q" + q + "/img4.jpg"
      ],
      answer: data.answers[i],
      difficulty: data.difficulties[i]
    };
  }
  gameData[state] = questions;
});

// ============================================================
// LANGUAGE → STATE MAPPING
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
  kok: "tripura"
};

// ============================================================
// CONSTANTS & GAME STATE VARIABLES
// ============================================================
const TOTAL_QUESTIONS = 10;

let currentQuestion = 1;
let currentQuestionKey = "q1";
let currentDifficulty = "easy";
let score = 0;
let streak = 0;
let usedQuestions = [];
let gameRunning = false;
let answerLocked = false;
let gameStartTime = null;
let questionStartTime = null;

// ============================================================
// DOM ELEMENTS
// ============================================================
let screen1, screen2, screen3, screen4, screen5;
let winPopup;

// ============================================================
// ML DIFFICULTY API CALL
// ============================================================
async function getRecommendedDifficulty(accuracy, responseTime, streakCount) {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_type: "odd_one_out",
        accuracy: accuracy,
        response_time: responseTime,
        streak: streakCount
      })
    });

    const data = await response.json();
    console.log("ML recommended difficulty:", data.difficulty);
    return data.difficulty.toLowerCase(); // "easy", "medium", or "hard"
  } catch (error) {
    console.warn("ML Server offline, using fallback difficulty logic:", error);
    return null;
  }
}

// ============================================================
// LANGUAGE & TRANSLATION HELPERS
// ============================================================
function getSelectedLanguage() {
  const saved = localStorage.getItem("selectedLanguage");
  if (typeof translations !== "undefined" && translations[saved]) {
    return saved;
  }
  return "en";
}

function getTranslation() {
  if (typeof translations === "undefined") {
    console.error("ERROR: language.js is not loaded before script.js");
    return {};
  }
  return translations[getSelectedLanguage()] || translations.en;
}

function getSelectedState() {
  const language = getSelectedLanguage();
  return gameLanguageStateMap[language] || "assam";
}

// ============================================================
// SCREEN CONTROL
// ============================================================
function showOnlyScreen(screen) {
  const screens = [screen1, screen2, screen3, screen4, screen5];
  screens.forEach(s => {
    if (s) s.style.display = "none";
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
  streak = 0;
  usedQuestions = [];
  gameRunning = false;
  answerLocked = false;
}

// ============================================================
// SHOW QUESTION
// ============================================================
function showQuestion(questionData) {
  if (!questionData) {
    console.error("Question not found:", currentQuestionKey);
    return;
  }

  const imageElements = [
    document.querySelector(".o1 img"),
    document.querySelector(".o2 img"),
    document.querySelector(".o3 img"),
    document.querySelector(".o4 img")
  ];

  imageElements.forEach((img, index) => {
    if (!img) return;
    img.src = questionData.images[index];
    img.alt = "Option " + (index + 1);
    img.onerror = function () {
      console.error("Image not found:", questionData.images[index]);
    };
  });

  const t = getTranslation();
  const questionCounter = document.querySelector(".quesNo p");

  if (questionCounter) {
    const language = getSelectedLanguage();
    if (language === "en") {
      questionCounter.textContent = `Question ${currentQuestion} of ${TOTAL_QUESTIONS} (${currentDifficulty.toUpperCase()})`;
    } else if (language === "hi") {
      questionCounter.textContent = `प्रश्न ${currentQuestion} में से ${TOTAL_QUESTIONS} (${currentDifficulty.toUpperCase()})`;
    } else {
      questionCounter.textContent = `${currentQuestion} / ${TOTAL_QUESTIONS} (${currentDifficulty.toUpperCase()})`;
    }
  }

  const questionText = document.querySelector(".question");
  if (questionText) {
    questionText.textContent = t.findDifferent || "Find the one that is different";
  }

  const hearText = document.querySelector("#hear-question-btn p") || document.querySelector("#hear-question-btn span");
  if (hearText) {
    hearText.innerHTML = `<i class="fa-solid fa-volume-high"></i> ${t.hearQuestion || "HEAR QUESTION"}`;
  }

  document.querySelectorAll(".option").forEach(option => {
    option.classList.remove("correct", "wrong", "selected");
    option.style.outline = "none";
  });

  answerLocked = false;
  questionStartTime = Date.now();
}

// ============================================================
// START FIRST QUESTION
// ============================================================
function startFirstQuestion() {
  const state = getSelectedState();
  const questions = gameData[state];

  if (!questions || !questions.q1) {
    console.error("Questions not found for state:", state);
    return false;
  }

  currentQuestion = 1;
  currentQuestionKey = "q1";
  currentDifficulty = questions.q1.difficulty;
  usedQuestions = ["q1"];
  gameRunning = true;
  answerLocked = false;
  gameStartTime = Date.now();

  showQuestion(questions.q1);
  return true;
}

// ============================================================
// START GAME
// ============================================================
function startGame() {
  stopSpeech();
  resetGame();

  if (winPopup) winPopup.style.display = "none";

  const started = startFirstQuestion();
  if (!started) {
    console.error("GAME COULD NOT START");
    showOnlyScreen(screen2);
    return;
  }
  showOnlyScreen(screen3);
}

// ============================================================
// NEXT ADAPTIVE QUESTION SELECTION
// ============================================================
function getNextAdaptiveQuestion() {
  const state = getSelectedState();
  const questions = gameData[state];
  if (!questions) return null;

  const available = Object.keys(questions).filter(key => !usedQuestions.includes(key));
  if (!available.length) return null;

  let matching = available.filter(key => questions[key].difficulty === currentDifficulty);
  if (!matching.length) matching = available;

  const randomIndex = Math.floor(Math.random() * matching.length);
  const nextKey = matching[randomIndex];

  usedQuestions.push(nextKey);
  currentQuestionKey = nextKey;
  return questions[nextKey];
}

// ============================================================
// ANSWER HANDLING & ML EVALUATION
// ============================================================
async function handleAnswer(selectedIndex) {
  if (!gameRunning || answerLocked) return;

  answerLocked = true;
  const responseTimeSec = Math.max(1, (Date.now() - (questionStartTime || Date.now())) / 1000);

  const state = getSelectedState();
  const questions = gameData[state];
  const question = questions ? questions[currentQuestionKey] : null;

  if (!question) {
    console.error("Current question missing");
    answerLocked = false;
    return;
  }

  const isCorrect = selectedIndex === question.answer;
  const options = document.querySelectorAll(".option");

  if (options[selectedIndex]) {
    options[selectedIndex].classList.add(isCorrect ? "correct" : "wrong");
    options[selectedIndex].style.outline = isCorrect ? "4px solid #22c55e" : "4px solid #ef4444";
  }

  // Update game tracking stats
  if (isCorrect) {
    score++;
    streak++;
  } else {
    streak = 0;
  }

  const currentAccuracy = score / currentQuestion;

  // Query ML difficulty model
  const predictedDifficulty = await getRecommendedDifficulty(currentAccuracy, responseTimeSec, streak);

  if (predictedDifficulty) {
    currentDifficulty = predictedDifficulty;
  } else {
    // Fallback heuristic if ML server is disconnected
    if (isCorrect) {
      if (currentDifficulty === "easy") currentDifficulty = "medium";
      else if (currentDifficulty === "medium") currentDifficulty = "hard";
    } else {
      if (currentDifficulty === "hard") currentDifficulty = "medium";
      else if (currentDifficulty === "medium") currentDifficulty = "easy";
    }
  }

  console.log(
    isCorrect ? "Correct" : "Wrong",
    "| Score:", score,
    "| Streak:", streak,
    "| Response Time:", responseTimeSec + "s",
    "| Next Difficulty:", currentDifficulty
  );

  // Check Game Completion
  if (currentQuestion === TOTAL_QUESTIONS) {
    setTimeout(finishGame, 600);
    return;
  }

  currentQuestion++;

  // Fetch next question adaptively
  const nextQuestion = getNextAdaptiveQuestion();
  if (!nextQuestion) {
    console.error("No next question available");
    finishGame();
    return;
  }

  setTimeout(() => {
    showQuestion(nextQuestion);
  }, 600);
}

// ============================================================
// FINISH GAME
// ============================================================
function finishGame() {
  stopSpeech();
  gameRunning = false;
  answerLocked = true;

  const accuracy = Math.round((score / TOTAL_QUESTIONS) * 100);
  const gameTime = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0;

  const oldProgress = JSON.parse(localStorage.getItem("gameProgress")) || {
    gamesPlayed: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    totalTime: 0
  };

  oldProgress.gamesPlayed++;
  oldProgress.totalCorrect += score;
  oldProgress.totalQuestions += TOTAL_QUESTIONS;
  oldProgress.totalTime += gameTime;
  if (score > oldProgress.bestScore) oldProgress.bestScore = score;

  localStorage.setItem("gameProgress", JSON.stringify(oldProgress));

  if (!winPopup) {
    console.error("Win popup not found");
    showOnlyScreen(screen2);
    return;
  }

  const scoreElement = winPopup.querySelector(".score p:last-child");
  const accuracyElement = winPopup.querySelector(".accuracy p:last-child");

  if (scoreElement) scoreElement.textContent = score + "/" + TOTAL_QUESTIONS;
  if (accuracyElement) accuracyElement.textContent = accuracy + "%";

  winPopup.style.display = "flex";
  winPopup.setAttribute("aria-hidden", "false");
}

// ============================================================
// COMPONENT SETUP & LISTENERS
// ============================================================
function setupPlayGame() {
  const playGame = document.getElementById("play-game");
  if (!playGame) return;

  playGame.addEventListener("click", () => startGame());
  playGame.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startGame();
    }
  });
}

function setupStartButton() {
  const startBtn = document.getElementById("startBtn");
  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    stopSpeech();
    showOnlyScreen(screen2);
  });
}

function setupOptions() {
  const options = document.querySelectorAll(".option");
  options.forEach((option, index) => {
    option.addEventListener("click", () => handleAnswer(index));
    option.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleAnswer(index);
      }
    });
  });
}

function setupPlayAgain() {
  const button = document.querySelector(".play-again");
  if (button) button.addEventListener("click", () => startGame());
}

function setupGoHome() {
  const button = document.querySelector(".go-home");
  if (button) {
    button.addEventListener("click", () => {
      stopSpeech();
      resetGame();
      if (winPopup) {
        winPopup.style.display = "none";
        winPopup.setAttribute("aria-hidden", "true");
      }
      showOnlyScreen(screen2);
    });
  }
}

function setupProgress() {
  const button = document.getElementById("progress");
  if (!button) return;

  button.addEventListener("click", () => {
    stopSpeech();
    updateProgressScreen();
    showOnlyScreen(screen4);
  });
}

function updateProgressScreen() {
  const progress = JSON.parse(localStorage.getItem("gameProgress")) || {
    gamesPlayed: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    totalTime: 0
  };

  const accuracy = progress.totalQuestions > 0
    ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
    : 0;

  const avgTime = progress.gamesPlayed > 0
    ? Math.round(progress.totalTime / progress.gamesPlayed)
    : 0;

  const gamesPlayed = document.getElementById("games-played-value");
  const accuracyElement = document.getElementById("accuracy-value");
  const bestScore = document.getElementById("best-score-value");
  const avgTimeElement = document.getElementById("avg-time-value");

  if (gamesPlayed) gamesPlayed.textContent = progress.gamesPlayed;
  if (accuracyElement) accuracyElement.textContent = accuracy + "%";
  if (bestScore) bestScore.textContent = progress.bestScore + "/" + TOTAL_QUESTIONS;
  if (avgTimeElement) avgTimeElement.textContent = avgTime + " sec";
}

function setupSettings() {
  const button = document.getElementById("settings");
  if (button) {
    button.addEventListener("click", () => {
      stopSpeech();
      showOnlyScreen(screen5);
    });
  }
}

function setupHome() {
  const homeIcon = document.getElementById("home-icon");
  if (homeIcon) {
    homeIcon.addEventListener("click", () => {
      stopSpeech();
      resetGame();
      showOnlyScreen(screen2);
    });
  }

  const homeNav = document.getElementById("home-nav");
  if (homeNav) {
    homeNav.addEventListener("click", event => {
      event.preventDefault();
      stopSpeech();
      showOnlyScreen(screen2);
    });
  }
}

function setupExitPopups() {
  const endButtons = document.querySelectorAll(".end");
  endButtons.forEach(button => {
    const screen = button.closest(".screen");
    if (!screen) return;

    const popup = screen.querySelector(".exitPopup");
    if (!popup) return;

    button.addEventListener("click", () => {
      popup.style.display = "flex";
      popup.setAttribute("aria-hidden", "false");
    });

    const cancel = popup.querySelector(".cancelExit");
    const confirm = popup.querySelector(".confirmExit");

    if (cancel) {
      cancel.addEventListener("click", () => {
        popup.style.display = "none";
        popup.setAttribute("aria-hidden", "true");
      });
    }

    if (confirm) {
      confirm.addEventListener("click", () => {
        popup.style.display = "none";
        popup.setAttribute("aria-hidden", "true");
        stopSpeech();
        resetGame();
        if (winPopup) winPopup.style.display = "none";
        showOnlyScreen(screen2);
      });
    }
  });
}

// ============================================================
// TEXT TO SPEECH ENGINE
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

function getBestVoice(language) {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  const wanted = speechLanguages[language] || ["en-US"];

  for (const lang of wanted) {
    const exact = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
  }

  for (const lang of wanted) {
    const prefix = lang.split("-")[0].toLowerCase();
    const similar = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (similar) return similar;
  }

  return voices[0];
}

function removeVoiceHighlights() {
  document.querySelectorAll(".voice-highlight").forEach(el => el.classList.remove("voice-highlight"));
}

function stopSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  speechIndex = 0;
  speechState = "stopped";
  speechMode = null;
  removeVoiceHighlights();

  const voiceButton = document.getElementById("voice-btn");
  if (voiceButton) voiceButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
}

function speakScreen2Next() {
  const elements = [
    document.getElementById("game-title"),
    document.getElementById("game-subtitle"),
    document.getElementById("play-game"),
    document.getElementById("progress"),
    document.getElementById("settings")
  ];

  if (speechIndex >= elements.length) {
    stopSpeech();
    return;
  }

  const element = elements[speechIndex];
  if (!element) {
    speechIndex++;
    speakScreen2Next();
    return;
  }

  removeVoiceHighlights();
  element.classList.add("voice-highlight");

  const language = getSelectedLanguage();
  const utterance = new SpeechSynthesisUtterance(element.innerText);
  const voice = getBestVoice(language);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  utterance.rate = 0.85;

  utterance.onend = function () {
    element.classList.remove("voice-highlight");
    speechIndex++;
    if (speechState === "speaking") speakScreen2Next();
  };

  utterance.onerror = function () {
    element.classList.remove("voice-highlight");
    speechIndex++;
    if (speechState === "speaking") speakScreen2Next();
  };

  speechSynthesis.speak(utterance);
}

function setupVoiceButton() {
  const button = document.getElementById("voice-btn");
  if (!button) return;

  button.addEventListener("click", function () {
    if (speechState === "speaking") {
      speechSynthesis.pause();
      speechState = "paused";
      button.innerHTML = '<i class="fa-solid fa-play"></i>';
      return;
    }

    if (speechState === "paused") {
      speechSynthesis.resume();
      speechState = "speaking";
      button.innerHTML = '<i class="fa-solid fa-pause"></i>';
      return;
    }

    stopSpeech();
    speechIndex = 0;
    speechMode = "menu";
    speechState = "speaking";
    button.innerHTML = '<i class="fa-solid fa-pause"></i>';
    speakScreen2Next();
  });
}

function setupHearQuestion() {
  const button = document.getElementById("hear-question-btn");
  if (!button) return;

  button.addEventListener("click", function () {
    if (speechState === "speaking" && speechMode === "question") {
      speechSynthesis.pause();
      speechState = "paused";
      return;
    }

    if (speechState === "paused" && speechMode === "question") {
      speechSynthesis.resume();
      speechState = "speaking";
      return;
    }

    stopSpeech();
    const question = document.querySelector(".question");
    if (!question) return;

    const language = getSelectedLanguage();
    const utterance = new SpeechSynthesisUtterance(question.innerText);
    const voice = getBestVoice(language);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = 0.85;
    speechMode = "question";
    speechState = "speaking";
    button.classList.add("voice-highlight");

    utterance.onend = function () {
      button.classList.remove("voice-highlight");
      speechState = "stopped";
      speechMode = null;
    };

    utterance.onerror = function () {
      button.classList.remove("voice-highlight");
      speechState = "stopped";
      speechMode = null;
    };

    speechSynthesis.speak(utterance);
  });
}

// ============================================================
// LANGUAGE SWITCHER
// ============================================================
function changeLanguage(lang) {
  if (typeof translations === "undefined") return;
  const t = translations[lang];
  if (!t) return;

  stopSpeech();
  localStorage.setItem("selectedLanguage", lang);

  // Screen 1
  const logoTitle = document.querySelector(".logoText h3");
  const tagline = document.querySelectorAll(".logoText p");
  const startButton = document.getElementById("startBtn");

  if (logoTitle) logoTitle.textContent = t.oddOneOut;
  if (tagline.length >= 2) {
    tagline[0].textContent = t.tagline1;
    tagline[1].textContent = t.tagline2;
  }
  if (startButton) startButton.textContent = t.getStarted;

  // Screen 2
  const home = document.querySelector("#top-bar a:first-child p");
  const brainTrain = document.querySelector("#top-bar h3");
  const help = document.querySelector("#top-bar a:last-child p");
  const gameTitle = document.getElementById("game-title");
  const gameSubtitle = document.getElementById("game-subtitle");
  const playGame = document.querySelector(".b1 h3");
  const progress = document.querySelector(".b2 h3");
  const settings = document.querySelector(".b3 h3");

  if (home) home.textContent = t.home;
  if (brainTrain) brainTrain.textContent = t.brainTrain;
  if (help) help.textContent = t.help;
  if (gameTitle) gameTitle.textContent = t.oddOneOut;
  if (gameSubtitle) gameSubtitle.textContent = t.selectOption;
  if (playGame) playGame.textContent = t.playGame;
  if (progress) progress.textContent = t.myProgress;
  if (settings) settings.textContent = t.settings;

  // Screen 3
  const questionText = document.querySelector(".question");
  const hearQuestion = document.querySelector("#hear-question-btn span") || document.querySelector("#hear-question-btn p");
  if (questionText) questionText.textContent = t.findDifferent;
  if (hearQuestion) hearQuestion.innerHTML = `<i class="fa-solid fa-volume-high"></i> ${t.hearQuestion}`;

  // Exit Modals
  document.querySelectorAll(".end span").forEach(el => (el.textContent = t.exit));
  document.querySelectorAll(".popup-box h3").forEach(el => (el.textContent = t.exitGame));
  document.querySelectorAll(".popup-box > p").forEach(el => (el.textContent = t.leaveGame));
  document.querySelectorAll(".cancelExit").forEach(el => (el.textContent = t.cancel));
  document.querySelectorAll(".confirmExit").forEach(el => (el.textContent = t.exit));

  // Win Popup
  if (winPopup) {
    const title = winPopup.querySelector("h3");
    const description = winPopup.querySelector(":scope > p");
    const scoreLabel = winPopup.querySelector(".score p:first-child");
    const accuracyLabel = winPopup.querySelector(".accuracy p:first-child");
    const playAgain = winPopup.querySelector(".play-again span");
    const homeButton = winPopup.querySelector(".go-home span");

    if (title) title.textContent = t.greatJob;
    if (description) description.textContent = t.completedChallenge;
    if (scoreLabel) scoreLabel.textContent = t.score;
    if (accuracyLabel) accuracyLabel.textContent = t.accuracy;
    if (playAgain) playAgain.textContent = t.playAgain;
    if (homeButton) homeButton.textContent = t.winHome;
  }

  // Update dynamic question display if currently in game
  if (gameRunning && screen3 && screen3.style.display !== "none") {
    const questions = gameData[getSelectedState()];
    if (questions && questions[currentQuestionKey]) {
      showQuestion(questions[currentQuestionKey]);
    }
  }
}

function setupLanguageSelector() {
  const selector = document.getElementById("languageSelector");
  if (!selector) return;

  selector.addEventListener("change", function () {
    changeLanguage(this.value);
  });

  const saved = localStorage.getItem("selectedLanguage") || "en";
  selector.value = saved;
  changeLanguage(saved);
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  screen1 = document.querySelector(".s1");
  screen2 = document.querySelector(".s2");
  screen3 = document.querySelector(".s3");
  screen4 = document.querySelector(".s4");
  screen5 = document.querySelector(".s5");
  winPopup = document.querySelector(".win-popUp");

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

  // ML Test Button Listener (safe execution check)
  // ML Test Button Listener with visible popup
const testBtn = document.getElementById("test-ml-btn");
if (testBtn) {
  testBtn.addEventListener("click", async () => {
    testBtn.innerText = "Connecting...";
    try {
      const result = await getRecommendedDifficulty(0.9, 2.5, 5);
      alert("ML Server Response: " + result);
    } catch (err) {
      alert("ML Connection Failed: " + err.message);
    } finally {
      testBtn.innerText = "Test ML Difficulty";
    }
  });
}
  showOnlyScreen(screen1);
  console.log("OLDONEout ML-Adaptive Game Hub successfully initialized.");
});

if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.onvoiceschanged = function () {
    speechSynthesis.getVoices();
  };
}
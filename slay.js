const headerTitleContainer = document.querySelector(".header-title-container");
const headerToggle = document.getElementById("header-toggle");

const startPage = document.querySelector(".start-page");
const subjectButtons = document.querySelectorAll(".subject-option-container");

const questionPage = document.querySelector(".question-page");
const questionNumber = document.querySelector(".question-number");
const question = document.querySelector(".question");
const progressBar = document.querySelector(".progress-fill");
const answersContainer = document.querySelector(".answer-options-container");
const submitButton = document.querySelector(".submit-button");
const errorMessage = document.querySelector(".error-message-container");

const scorePage = document.querySelector(".score-page");
const scoreSubjectTitle = document.querySelector(".score-subject");
const scoreSubjectIconContainer = document.querySelector(
  ".score-subject-img-container"
);
const scoreSubjectIcon = document.querySelector(".score-subject-img");
const scoreText = document.querySelector(".score");
const playAgainButton = document.querySelector(".play-again-button");

let quizzesData = [];
let currentQuiz = {};
let currentQuestionIndex = 0;
let score = 0;
let isSubmitted = false;
let selectedOptionElement = null;

const escapeHtml = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const initApp = async function () {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("Failed to load data.");
    const data = await response.json();
    quizzesData = data.quizzes;
  } catch (error) {
    console.error("Error:", error);
  }
};
initApp();

const updateHeader = function () {
  const { title, icon } = currentQuiz;
  headerTitleContainer.innerHTML = `
    <img src="${icon}" class="header-title-img subject-${title.toLowerCase()}-img" />
    <p class="header-title">${title}</p>
  `;
};

const renderQuestion = function () {
  const currentQuestionData = currentQuiz.questions[currentQuestionIndex];

  answersContainer.classList.remove("disabled");
  selectedOptionElement = null;
  isSubmitted = false;
  submitButton.textContent = "Submit Answer";
  errorMessage.classList.remove("show");

  questionNumber.textContent = currentQuestionIndex + 1;
  question.textContent = currentQuestionData.question;

  const progressValue =
    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  progressBar.style.width = `${progressValue}%`;

  const optionLabels = ["A", "B", "C", "D"];

  answersContainer.innerHTML = currentQuestionData.options
    .map(
      (option, index) => `
      <div class="answer-option-container">
        <p class="answer-option">${optionLabels[index]}</p>
        <p class="answer">${escapeHtml(option)}</p>
        <img src="./images/icon-correct.svg" class="status-icon correct-icon" />
        <img src="./images/icon-incorrect.svg" class="status-icon incorrect-icon" />
      </div>
    `
    )
    .join("");
};

const finishQuiz = function () {
  questionPage.classList.add("hidden");
  scorePage.classList.remove("hidden");

  scoreText.textContent = score;

  const { title, icon } = currentQuiz;
  scoreSubjectTitle.textContent = title;
  scoreSubjectIcon.src = icon;
  scoreSubjectIcon.alt = `${title} icon`;
  scoreSubjectIconContainer.className = `score-subject-img-container subject-${title.toLowerCase()}-img`;
};

headerToggle.addEventListener("change", function () {
  document.body.classList.toggle("dark-mode");
});

subjectButtons.forEach((option, index) => {
  option.addEventListener("click", () => {
    currentQuiz = quizzesData[index];
    updateHeader();
    renderQuestion();

    startPage.classList.add("hidden");
    questionPage.classList.remove("hidden");
  });
});

answersContainer.addEventListener("click", (e) => {
  if (isSubmitted) return;

  const clickedOption = e.target.closest(".answer-option-container");

  if (!clickedOption || clickedOption === selectedOptionElement) return;

  if (selectedOptionElement) {
    selectedOptionElement.classList.remove("active");
  }

  selectedOptionElement = clickedOption;
  selectedOptionElement.classList.add("active");
  errorMessage.classList.remove("show");
});

submitButton.addEventListener("click", function () {
  const currentQuestionData = currentQuiz.questions[currentQuestionIndex];

  if (!isSubmitted) {
    if (!selectedOptionElement) {
      errorMessage.classList.add("show");
      return;
    }

    const answerText = selectedOptionElement
      .querySelector(".answer")
      .textContent.trim();
    const correctAnswer = currentQuestionData.answer;

    if (answerText === correctAnswer) {
      selectedOptionElement.classList.add("correct");
      score++;
    } else {
      selectedOptionElement.classList.add("incorrect");

      const allOptions = Array.from(answersContainer.children);
      const correctOption = allOptions.find(
        (opt) =>
          opt.querySelector(".answer").textContent.trim() === correctAnswer
      );
      if (correctOption) correctOption.classList.add("correct");
    }

    submitButton.textContent = "Next Question";
    isSubmitted = true;
    answersContainer.classList.add("disabled");
  } else {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.questions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }
});

playAgainButton.addEventListener("click", () => {
  score = 0;
  currentQuestionIndex = 0;
  isSubmitted = false;
  selectedOptionElement = null;

  answersContainer.classList.remove("disabled");
  scorePage.classList.add("hidden");
  startPage.classList.remove("hidden");
  questionPage.classList.add("hidden");

  headerTitleContainer.innerHTML = "";
  progressBar.style.width = "0%";
});

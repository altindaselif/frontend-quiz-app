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
let currentQuestionData = "";
let options = [];
let selectedOption = "";
let selectedOptionText = "";
let score = 0;
let isSubmitted = false;

const initApp = async function () {
  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error("Failed to load data.");
    }

    const data = await response.json();
    quizzesData = data.quizzes;

    console.log(quizzesData);
  } catch (error) {
    console.error("Error:", error);
  }
};
initApp();

subjectButtons.forEach((option, index) => {
  option.addEventListener("click", () => {
    currentQuiz = quizzesData[index];
    console.log(currentQuiz);

    updateHeader();
    renderQuestion();

    startPage.classList.add("hidden");
    questionPage.classList.remove("hidden");
  });
});

const updateHeader = function () {
  const headerTitle = currentQuiz.title;
  const headerTitleIcon = currentQuiz.icon;

  headerTitleContainer.innerHTML = `
    <img src="${headerTitleIcon}" class="header-title-img subject-${headerTitle.toLowerCase()}-img" />
    <p class="header-title">${headerTitle}</p>
  `;
};

const renderQuestion = function () {
  currentQuestionData = currentQuiz.questions[currentQuestionIndex];

  answersContainer.classList.remove("disabled");

  selectedOption = "";
  selectedOptionText = "";
  isSubmitted = false;
  submitButton.textContent = "Submit Answer";

  // (Current Question / Total Questions) * 100
  const progressValue =
    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  progressBar.style.width = `${progressValue}%`;

  questionNumber.textContent = currentQuestionIndex + 1;
  question.textContent = currentQuestionData.question;

  const optionLabels = ["A", "B", "C", "D"];

  answersContainer.innerHTML = "";

  currentQuestionData.options.forEach((option, index) => {
    const formattedOption = option.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    answersContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="answer-option-container">
        <p class="answer-option">${optionLabels[index]}</p>
        <p class="answer">${formattedOption}</p>
        <img src="./images/icon-correct.svg" class="status-icon correct-icon" alt="Correct Icon" />
        <img src="./images/icon-incorrect.svg" class="status-icon incorrect-icon" alt="Incorrect Icon" />
      </div>
      `
    );
  });

  options = document.querySelectorAll(".answer-option-container");

  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      if (isSubmitted) return;

      options.forEach((btn) => btn.classList.remove("active"));

      selectedOption = e.currentTarget;
      selectedOption.classList.add("active");

      selectedOptionText = selectedOption
        .querySelector(".answer")
        .textContent.trim();

      errorMessage.classList.remove("show");
    });
  });
};

submitButton.addEventListener("click", function () {
  options = document.querySelectorAll(".answer-option-container");

  if (!isSubmitted) {
    if (!selectedOptionText) {
      errorMessage.classList.add("show");
      return;
    }

    if (selectedOptionText === currentQuestionData.answer) {
      selectedOption.classList.add("correct");
      score++;
    }

    if (selectedOptionText !== currentQuestionData.answer) {
      selectedOption.classList.add("incorrect");

      options.forEach((option) => {
        const optionContent = option
          .querySelector(".answer")
          .textContent.trim();
        if (optionContent === currentQuestionData.answer) {
          option.classList.add("correct");
        }
      });
    }
    submitButton.textContent = "Next Question";
    isSubmitted = true;

    answersContainer.classList.add("disabled");
  } else {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.questions.length) {
      renderQuestion();
    } else {
      questionPage.classList.add("hidden");
      scorePage.classList.remove("hidden");
      scoreText.textContent = score;

      scoreSubjectTitle.textContent = currentQuiz.title;
      scoreSubjectIcon.src = currentQuiz.icon;
      scoreSubjectIcon.alt = `${currentQuiz.title} icon`;
      scoreSubjectIconContainer.className = `score-subject-img-container subject-${currentQuiz.title.toLowerCase()}-img`;
    }
  }
});

playAgainButton.addEventListener("click", function () {
  score = 0;
  currentQuestionIndex = 0;
  isSubmitted = false;
  selectedOption = "";
  selectedOptionText = "";

  answersContainer.classList.remove("disabled");

  scorePage.classList.add("hidden");
  startPage.classList.remove("hidden");
  questionPage.classList.add("hidden");

  headerTitleContainer.innerHTML = "";

  progressBar.style.width = "0%";
});

headerToggle.addEventListener("change", function () {
  document.body.classList.toggle("dark-mode");
});

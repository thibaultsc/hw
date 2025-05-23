// At the very start of script.js
console.log('script.js: Script execution started.');

// Get DOM Element References
const taskSelectionScreen = document.getElementById('task-selection-screen');
const quizScreen = document.getElementById('quiz-screen');
const scoreScreen = document.getElementById('score-screen');

const multiplicationBtn = document.getElementById('multiplication-btn');
const additionBtn = document.getElementById('addition-btn');
const homeBtn = document.getElementById('home-btn');

const questionText = document.getElementById('question-text');
const timerDisplay = document.getElementById('timer-display');
const answerChoices = document.getElementById('answer-choices');
const feedbackArea = document.getElementById('feedback-area');
const totalScore = document.getElementById('total-score');
console.log('script.js: DOM element references obtained.');

// Global Quiz State Variables
let currentQuestionIndex;
let currentTotalScore; // Renamed to avoid conflict with totalScore DOM element
let questions = [];
let timerInterval;
let startTime;
const QUESTION_COUNT = 10;
let currentQuizType; // To track 'multiplication' or 'addition'

// Screen Management Functions
function showTaskSelectionScreen() {
    console.log('script.js: showTaskSelectionScreen() called.');
    taskSelectionScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    scoreScreen.classList.add('hidden');
}

function showQuizScreen() {
    console.log('script.js: showQuizScreen() called.');
    taskSelectionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    scoreScreen.classList.add('hidden');
}

function showScoreScreen() {
    console.log('script.js: showScoreScreen() called.');
    taskSelectionScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    scoreScreen.classList.remove('hidden');
}

// Quiz Start Functions
function startMultiplicationQuiz() {
    console.log('script.js: startMultiplicationQuiz() called.');
    currentQuestionIndex = 0;
    currentTotalScore = 0;
    questions = [];
    currentQuizType = 'multiplication'; // Set quiz type
    generateMultiplicationQuestions();
    displayNextQuestion();
    // showQuizScreen(); // Called by event listener already
}

function startAdditionQuiz() {
    console.log('script.js: startAdditionQuiz() called.');
    currentQuestionIndex = 0;
    currentTotalScore = 0;
    questions = [];
    currentQuizType = 'addition'; // Set quiz type
    generateAdditionQuestions();
    displayNextQuestion();
    // showQuizScreen(); // Called by event listener already
}

// Event Listeners
console.log('script.js: Setting up event listeners.');
multiplicationBtn.addEventListener('click', () => {
    console.log('script.js: Multiplication button clicked.');
    startMultiplicationQuiz();
    showQuizScreen();
});

additionBtn.addEventListener('click', () => {
    console.log('script.js: Addition button clicked.');
    startAdditionQuiz();
    showQuizScreen();
});

homeBtn.addEventListener('click', () => {
    console.log('script.js: Home button clicked.');
    showTaskSelectionScreen();
});
console.log('script.js: Event listeners set up.');

// Helper function: Shuffle array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate Multiplication Questions
function generateMultiplicationQuestions() {
    console.log('script.js: generateMultiplicationQuestions() called.');
    questions = []; // Clear previous questions
    for (let i = 0; i < QUESTION_COUNT; i++) {
        let num1 = Math.floor(Math.random() * 12) + 1;
        let num2 = Math.floor(Math.random() * 12) + 1;
        const correctAnswer = num1 * num2;
        let choices = [correctAnswer];

        // Generate 3 unique incorrect answers
        let incorrectCount = 0;
        while (incorrectCount < 3) {
            let wrongAnswer;
            const type = Math.floor(Math.random() * 3); // 0, 1, or 2 for different strategies
            if (type === 0) { // (num1 +/- small_random) * num2
                wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*2)+1)) * num2;
            } else if (type === 1) { // num1 * (num2 +/- small_random)
                wrongAnswer = num1 * (num2 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*2)+1));
            } else { // (num1 +/- small_random) * (num2 +/- small_random)
                wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1)) * (num2 + (Math.random() > 0.5 ? 1 : -1));
            }

            // Ensure wrongAnswer is plausible (not negative if original numbers are positive) and unique
            if (wrongAnswer !== correctAnswer && !choices.includes(wrongAnswer) && wrongAnswer >= 0) {
                choices.push(wrongAnswer);
                incorrectCount++;
            }
        }
        questions.push({
            question: `${num1} x ${num2} = ?`,
            choices: shuffleArray(choices),
            answer: correctAnswer,
            type: 'multiplication' // Add type
        });
    }
}

// Generate Addition Questions
function generateAdditionQuestions() {
    console.log('script.js: generateAdditionQuestions() called.');
    questions = []; // Clear previous questions
    for (let i = 0; i < QUESTION_COUNT; i++) {
        let num1 = Math.floor(Math.random() * 100) + 1;
        let num2 = Math.floor(Math.random() * 100) + 1;
        const correctAnswer = num1 + num2;
        let choices = [correctAnswer];

        // Generate 3 unique incorrect answers
        let incorrectCount = 0;
        while (incorrectCount < 3) {
            let wrongAnswer;
            const type = Math.floor(Math.random() * 3); // Strategy for incorrect answers
            if (type === 0) { // correctAnswer +/- small_random_offset
                wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
            } else if (type === 1) { // num1 + (num2 +/- small_random_offset)
                wrongAnswer = num1 + (num2 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1));
            } else { // (num1 +/- small_random_offset) + num2
                wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1)) + num2;
            }

            // Ensure wrongAnswer is plausible and unique
            if (wrongAnswer !== correctAnswer && !choices.includes(wrongAnswer) && wrongAnswer > 0) {
                choices.push(wrongAnswer);
                incorrectCount++;
            }
        }
        questions.push({
            question: `${num1} + ${num2} = ?`,
            choices: shuffleArray(choices),
            answer: correctAnswer,
            type: 'addition' // Add type
        });
    }
}


// Display Next Question
function displayNextQuestion() {
    console.log('script.js: displayNextQuestion() called. Current question index:', currentQuestionIndex);
    if (currentQuestionIndex < QUESTION_COUNT) {
        const currentQ = questions[currentQuestionIndex];
        console.log('script.js: Displaying question:', currentQ.question);
        questionText.textContent = currentQ.question;
        answerChoices.innerHTML = ''; // Clear previous choices

        currentQ.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            // Call the new generic selectAnswer function
            button.addEventListener('click', () => selectAnswer(choice, currentQ.answer));
            answerChoices.appendChild(button);
        });

        feedbackArea.textContent = '';
        feedbackArea.style.color = ''; // Reset color
        startQuestionTimer();
    } else {
        console.log('script.js: No more questions. Ending quiz.');
        endQuiz(currentQuizType); // Pass currentQuizType to endQuiz
    }
}

// Start Question Timer
function startQuestionTimer() {
    console.log('script.js: startQuestionTimer() called.');
    clearInterval(timerInterval);
    startTime = new Date().getTime();
    timerDisplay.textContent = "Time: 0s";
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((new Date().getTime() - startTime) / 1000);
        timerDisplay.textContent = `Time: ${elapsedTime}s`;
    }, 1000);
}

// Generic Select Answer function
function selectAnswer(selectedChoice, correctAnswer) {
    console.log(`script.js: selectAnswer() called. Selected: ${selectedChoice}, Correct: ${correctAnswer}, QuizType: ${currentQuizType}`);
    clearInterval(timerInterval);
    const timeTaken = (new Date().getTime() - startTime) / 1000;
    const isCorrect = (selectedChoice === correctAnswer);
    let questionScore = 0;

    if (currentQuizType === 'multiplication') {
        if (isCorrect) {
            if (timeTaken <= 0.5) {
                questionScore = 100;
            } else if (timeTaken <= 10) {
                questionScore = 30 + Math.max(0, Math.floor(70 * ((10 - timeTaken) / 10)));
            } else { // timeTaken > 10
                questionScore = 30;
            }
        } else {
            questionScore = 0;
        }
    } else if (currentQuizType === 'addition') {
        if (isCorrect) {
            if (timeTaken <= 0.5) {
                questionScore = 100;
            } else if (timeTaken <= 20) {
                // Formula: 30 + Math.max(0, Math.floor(70 * ((20 - timeTaken) / 20)))
                questionScore = 30 + Math.max(0, Math.floor(70 * ((20 - timeTaken) / 20)));
            } else { // timeTaken > 20
                questionScore = 30;
            }
        } else {
            questionScore = 0;
        }
    }

    currentTotalScore += questionScore;
    showFeedback(isCorrect, questionScore, correctAnswer);
    currentQuestionIndex++;
    setTimeout(displayNextQuestion, 2000); // Wait 2 seconds before next question
}

// Show Feedback
function showFeedback(isCorrect, score, correctAnswer) {
    console.log(`script.js: showFeedback() called. Correct: ${isCorrect}, Score: ${score}`);
    if (isCorrect) {
        feedbackArea.textContent = `Correct! +${score} points.`;
        feedbackArea.style.color = 'green';
    } else {
        feedbackArea.textContent = `Incorrect. The correct answer was ${correctAnswer}. +${score} points.`;
        feedbackArea.style.color = 'red';
    }
}

// End Quiz
function endQuiz(quizType) {
    console.log(`script.js: endQuiz() called for ${quizType}. Final score: ${currentTotalScore}`);
    clearInterval(timerInterval);
    totalScore.textContent = currentTotalScore; // Display the score in the DOM element
    showScoreScreen();
    // quizType can be used later for different messages or logic
    console.log(`${quizType} quiz ended. Final Score: ${currentTotalScore}`);
}


// Initial State
console.log('script.js: Setting initial screen state.');
// Ensure quiz and score screens are hidden initially by adding 'hidden' class if not present.
// The HTML is expected to have style="display:none" which is equivalent for initial state.
// These lines ensure that if style is removed, class based hiding still works.
if (!quizScreen.classList.contains('hidden')) {
    quizScreen.classList.add('hidden');
}
if (!scoreScreen.classList.contains('hidden')) {
    scoreScreen.classList.add('hidden');
}
// Call showTaskSelectionScreen on load to ensure the correct screen is displayed.
showTaskSelectionScreen(); // This will log "script.js: showTaskSelectionScreen() called."
console.log('script.js: Script execution finished. Initial screen should be visible.');

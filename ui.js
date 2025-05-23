import { checkAnswer, moveToNextQuestion, gameMode, questions, currentQuestionIndex, startQuiz } from './quiz.js'; // Removed setStartTime, MULT_TIME_LIMIT, ADD_TIME_LIMIT
import { generateMultiplicationAnswerOptions, generateAdditionAnswerOptions, NUMBER_OF_QUESTIONS } from './question_generator.js';

// DOM Element Constants

// Screens
export const startScreen = document.getElementById('startScreen');
export const quizScreen = document.getElementById('quizScreen');
export const feedbackScreen = document.getElementById('feedbackScreen');
export const endScreen = document.getElementById('endScreen');
const screens = [startScreen, quizScreen, feedbackScreen, endScreen]; // Helper array for showScreen

// Buttons
export const startMultiplicationButton = document.getElementById('startMultiplication');
export const startAdditionButton = document.getElementById('startAddition');
export const restartButton = document.getElementById('restartButton');
export const nextQuestionButton = document.getElementById('nextQuestionButton');

// Quiz Screen Elements
const quizTitle = document.getElementById('quizTitle'); // New
const questionCounter = document.getElementById('questionCounter');
const progressBar = document.getElementById('progressBar'); // New
const timerMinutes = document.getElementById('timerMinutes'); // New
const timerSeconds = document.getElementById('timerSeconds'); // New
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');

// Feedback Screen Elements
const feedbackMessageElement = document.getElementById('feedbackMessage');
const correctAnswerDisplayElement = document.getElementById('correctAnswerDisplay');
const pointsDisplayElement = document.getElementById('pointsDisplay');

// End Screen Elements
const totalScoreElement = document.getElementById('totalScore');
const summaryElement = document.getElementById('summary');

// Local timer interval variable and question start time
let timerInterval;
let questionStartTime; // To calculate timeTaken

// Function to show a specific screen
export function showScreen(screenName) {
    screens.forEach(screen => {
        if (screen) { // Check if element exists
            screen.classList.remove('active-screen');
            screen.style.display = 'none';
        }
    });

    let activeScreenElement;
    if (screenName === 'start') activeScreenElement = startScreen;
    else if (screenName === 'quiz') activeScreenElement = quizScreen;
    else if (screenName === 'feedback') activeScreenElement = feedbackScreen;
    else if (screenName === 'end') activeScreenElement = endScreen;

    if (activeScreenElement) {
        activeScreenElement.classList.add('active-screen');
        activeScreenElement.style.display = 'flex'; // Using flex as per new design
    }
}

// Function to set the quiz title (called by quiz.js)
export function setQuizTitle(title) {
    if (quizTitle) quizTitle.textContent = title;
}

// Function to display a question
export function displayQuestion(questionData, currentMode) {
    stopTimer(); // Stop any existing timer

    if (questionCounter) questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${NUMBER_OF_QUESTIONS}`;
    if (progressBar) progressBar.style.width = `${((currentQuestionIndex + 1) / NUMBER_OF_QUESTIONS) * 100}%`;
    
    // Determine operator symbol based on currentMode (which is gameMode)
    let operatorSymbol = '';
    if (currentMode === 'multiplication') {
        operatorSymbol = '×'; // Using the actual multiplication symbol for better display
    } else if (currentMode === 'addition') {
        operatorSymbol = '+';
    }

    // Update question text using factor1, factor2, and operatorSymbol
    if (questionElement && questionData && questionData.factor1 !== undefined && questionData.factor2 !== undefined && operatorSymbol) {
        questionElement.textContent = `What is ${questionData.factor1} ${operatorSymbol} ${questionData.factor2}?`;
    } else if (questionElement && questionData && questionData.text) {
        // Fallback to using questionData.text if factors are not available (should not happen with new question_generator.js)
        // This also keeps the previous fix of "What is ...?" formatting
        questionElement.textContent = `What is ${questionData.text}?`;
    } else if (questionElement) {
        questionElement.textContent = 'Error loading question.'; // Fallback for missing data
    }
    
    if (answersElement) answersElement.innerHTML = ''; // Clear previous answers

    const answerOptions = currentMode === 'multiplication' ?
        generateMultiplicationAnswerOptions(questionData.answer) :
        generateAdditionAnswerOptions(questionData.answer);

    answerOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f3f0e7] text-[#1c170d] text-sm font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#e8e1cf]';
        button.onclick = () => {
            stopTimer();
            const timeTaken = (Date.now() - questionStartTime) / 1000;
            checkAnswer(option, gameMode, timeTaken); // gameMode is imported from quiz.js
        };
        if (answersElement) answersElement.appendChild(button);
    });

    // questionData.timeLimit should be set by quiz.js
    if (questionData.timeLimit !== undefined) {
        startTimer(questionData.timeLimit);
    } else {
        console.error("timeLimit not provided to displayQuestion");
        // Fallback or error handling if timeLimit is missing
        startTimer(10); // Default fallback, though quiz.js should always provide it
    }
}

// Function to start the timer for a question
export function startTimer(duration) { // duration is the timeLimit for the question
    questionStartTime = Date.now();
    let timeLeft = duration;
    updateTimerDisplay(timeLeft); // Initial display

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft < 0) {
            stopTimer();
            const timeTakenOnTimeout = duration; // For timeouts, timeTaken is the full duration
            checkAnswer(null, gameMode, timeTakenOnTimeout); // gameMode is imported
        }
    }, 1000);
}

// Function to update the timer display
export function updateTimerDisplay(timeLeft) {
    const minutes = Math.floor(Math.max(0, timeLeft) / 60); // Ensure non-negative
    const seconds = Math.max(0, timeLeft) % 60; // Ensure non-negative

    if (timerMinutes) timerMinutes.textContent = String(minutes).padStart(2, '0');
    if (timerSeconds) timerSeconds.textContent = String(seconds).padStart(2, '0');
}

// Function to stop the timer
export function stopTimer() {
    clearInterval(timerInterval);
}

// Function to display feedback after an answer
export function displayFeedback(isCorrect, correctAnswer, points) {
    stopTimer();
    if (feedbackMessageElement) feedbackMessageElement.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
    if (correctAnswerDisplayElement) correctAnswerDisplayElement.textContent = `The correct answer was: ${correctAnswer}`;
    if (pointsDisplayElement) pointsDisplayElement.textContent = `Points: ${points}`;
    if (nextQuestionButton) nextQuestionButton.focus();
}

// Function to display the end screen with results
export function endQuizUI(finalScore, results) {
    stopTimer();
    if (totalScoreElement) totalScoreElement.textContent = finalScore;
    if (summaryElement) summaryElement.innerHTML = ''; // Clear previous summary

    results.forEach((result, index) => {
        const summaryItem = document.createElement('div');
        summaryItem.classList.add('summary-item', 'p-3', 'mb-2', 'border', 'border-gray-200', 'rounded-lg', 'bg-gray-50', 'text-sm'); // Added some Tailwind classes for styling

        // Using result.questionText which contains "N x M" or "N + M"
        // result.correctAnswer has the answer.
        // result.selected is the user's answer (or null for timeout)
        // result.isCorrect is boolean
        // result.timeTaken is the time in seconds
        // result.points is the points awarded

        const selectedAnswerText = result.selected === null ? 'Timeout' : result.selected;
        const correctStatusText = result.isCorrect ? 'Correct' : 'Incorrect';
        const timeTakenFormatted = typeof result.timeTaken === 'number' ? result.timeTaken.toFixed(1) : 'N/A';

        summaryItem.innerHTML = `
            <p><strong>Q${index + 1}: ${result.questionText}</strong> (Correct: ${result.correctAnswer})</p>
            <p>Your Answer: ${selectedAnswerText} (${correctStatusText})</p>
            <p>Time: ${timeTakenFormatted}s</p>
            <p>Points: ${result.points}</p>
        `;
        if (summaryElement) summaryElement.appendChild(summaryItem);
    });
    showScreen('end');
}

// Initial setup
// Event listeners are attached to elements. Ensure elements exist before adding listeners.
if (startScreen) showScreen('start'); // Show start screen by default

if (startMultiplicationButton) startMultiplicationButton.addEventListener('click', () => startQuiz('multiplication'));
if (startAdditionButton) startAdditionButton.addEventListener('click', () => startQuiz('addition'));
if (nextQuestionButton) nextQuestionButton.addEventListener('click', moveToNextQuestion);
if (restartButton) restartButton.addEventListener('click', () => {
    // Call startQuiz with the current gameMode (imported from quiz.js)
    // quiz.js's startQuiz function will handle resetting state and showing the quiz screen.
    if (gameMode) { // Ensure gameMode has a value (e.g., a quiz has been played)
        startQuiz(gameMode);
    } else {
        // Fallback if gameMode is somehow not set, though it should be after a quiz.
        showScreen('start');
    }
});

// The close button in the quiz header
const closeQuizButton = document.querySelector('#quizScreen svg');
if (closeQuizButton) {
    closeQuizButton.addEventListener('click', () => {
        stopTimer();
        showScreen('start');
        // Optionally, reset quiz state more thoroughly here if needed
    });
}

// Bottom navigation bar links (example functionality)
const homeNavButton = document.querySelector('.flex-1 a[href="#"]'); // Adjust selector if more specific needed
if (homeNavButton && homeNavButton.querySelector('span').textContent === 'Home') {
    homeNavButton.addEventListener('click', (e) => {
        e.preventDefault();
        stopTimer(); // Stop timer if quiz is active
        showScreen('start'); // Navigate to start screen
    });
}
// Add similar listeners for 'Stats' and 'Profile' if they should also lead to 'start' or other screens.
// For now, they are placeholders.

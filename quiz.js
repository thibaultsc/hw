import {
    generateMultiplicationQuestions,
    generateAdditionQuestions,
    generateMultiplicationAnswerOptions,
    generateAdditionAnswerOptions,
    NUMBER_OF_QUESTIONS
} from './question_generator.js';

import {
    showScreen,
    displayQuestion,
    // updateTimerDisplay, // Not called directly by quiz.js anymore
    displayFeedback,
    endQuizUI,
    setQuizTitle
    // Removed: startScreen, quizScreen, feedbackScreen, endScreen,
    // startMultiplicationButton, startAdditionButton, restartButton, nextQuestionButton,
    // updateTimerDisplay (if not used)
} from './ui.js';

// Quiz state variables
export let questions = [];
export let currentQuestionIndex = 0;
export let totalScore = 0;
export let questionResults = [];
// startTime is no longer managed by quiz.js; ui.js handles its own questionStartTime
export let gameMode = ''; // 'multiplication' or 'addition'

// Time limits for scoring (can be adjusted)
const MULT_TIME_LIMIT = 20; // seconds
const ADD_TIME_LIMIT = 15; // seconds

// Function to calculate points based on time taken
function calculatePoints(timeTaken, correctAnswer, isMultiplication) {
    const timeLimit = isMultiplication ? MULT_TIME_LIMIT : ADD_TIME_LIMIT;
    if (timeTaken === -1) return 0; // Timeout

    const maxPoints = 100;
    const timePenalty = Math.max(0, timeTaken - (timeLimit / 2)); // Penalty for time over half the limit
    const points = Math.max(10, maxPoints - timePenalty * (maxPoints / (timeLimit / 2))); // Ensure minimum 10 points
    return Math.round(points);
}

// Function to start the quiz
export function startQuiz(mode) {
    gameMode = mode;
    currentQuestionIndex = 0;
    totalScore = 0;
    questionResults = [];

    if (gameMode === 'multiplication') {
        questions = generateMultiplicationQuestions();
        if (setQuizTitle) setQuizTitle('Multiplication Quiz');
    } else {
        questions = generateAdditionQuestions();
        if (setQuizTitle) setQuizTitle('Addition Quiz');
    }

    // Add timeLimit to each question
    const timeLimit = gameMode === 'multiplication' ? MULT_TIME_LIMIT : ADD_TIME_LIMIT;
    questions = questions.map(q => ({ ...q, timeLimit: timeLimit }));

    if (questions.length > 0) {
        // ui.js's displayQuestion will use questions[currentQuestionIndex].timeLimit
        displayQuestion(questions[currentQuestionIndex], gameMode);
        showScreen('quiz');
    } else {
        console.error("No questions generated for mode:", mode);
        showScreen('start');
    }
}

// Function to check the selected answer
// Signature changed: gameMode is accessed from module scope, timeTaken is passed by ui.js
export function checkAnswer(selectedAnswer, timeTaken) {
    // ui.js calls stopTimer() before calling this function.
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;

    // isCorrect determination
    const isCorrect = selectedAnswer === correctAnswer && selectedAnswer !== null;

    // Calculate points using the passed timeTaken and module-scoped gameMode
    const points = isCorrect ? calculatePoints(timeTaken, correctAnswer, gameMode === 'multiplication') : 0;

    totalScore += points;
    questionResults.push({
        questionText: currentQuestion.text,
        selected: selectedAnswer, // Will be null for timeout
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        timeTaken: timeTaken, // Passed from ui.js
        points: points
    });

    displayFeedback(isCorrect, correctAnswer, points);
    showScreen('feedback');
}

// Function to move to the next question or end the quiz
export function moveToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < NUMBER_OF_QUESTIONS) {
        const questionData = questions[currentQuestionIndex];
        // Ensure questionData has timeLimit (should have been set in startQuiz)
        if (questionData.timeLimit === undefined) {
             questionData.timeLimit = gameMode === 'multiplication' ? MULT_TIME_LIMIT : ADD_TIME_LIMIT;
        }
        displayQuestion(questionData, gameMode);
        showScreen('quiz');
    } else {
        endQuiz();
    }
}

// Function to end the quiz and display results
function endQuiz() {
    // ui.js's endQuizUI can access totalScore and questionResults via import if needed,
    // but passing them is cleaner.
    endQuizUI(totalScore, questionResults);
    showScreen('end'); // ui.js's showScreen
}

// Removed setStartTime function as ui.js now manages its own questionStartTime

// MULT_TIME_LIMIT and ADD_TIME_LIMIT are constants, already exported if needed by other modules (not currently)
// No change needed to their export unless ui.js needs them, which it doesn't with current plan.
export { MULT_TIME_LIMIT, ADD_TIME_LIMIT };

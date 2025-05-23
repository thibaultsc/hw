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

// New constants for degressive points logic
const MAX_POINTS = 100;
const MIN_POINTS = 30;
const MULT_THRESHOLD_SECONDS = 10; // Time to reach MIN_POINTS for multiplication
const ADD_THRESHOLD_SECONDS = 20;  // Time to reach MIN_POINTS for addition

// Function to calculate points using the new degressive logic
function calculatePoints(timeTaken, isCorrect, gameMode) {
    if (!isCorrect) {
        return 0;
    }

    let validTimeTaken = timeTaken;
    if (typeof timeTaken !== 'number' || !isFinite(timeTaken) || timeTaken < 0) {
        validTimeTaken = 0; // Treat invalid or negative time as 0 for calculation
    }

    let thresholdSeconds;
    if (gameMode === 'multiplication') {
        thresholdSeconds = MULT_THRESHOLD_SECONDS;
    } else if (gameMode === 'addition') {
        thresholdSeconds = ADD_THRESHOLD_SECONDS;
    } else {
        console.error("Invalid game mode in calculatePoints:", gameMode);
        return MIN_POINTS; // Default to MIN_POINTS if mode is somehow wrong (and answer is correct)
    }

    // Ensure thresholdSeconds is valid (should be based on constants)
    if (typeof thresholdSeconds !== 'number' || thresholdSeconds <= 0) {
        console.error("Invalid thresholdSeconds in calculatePoints:", thresholdSeconds);
        return MIN_POINTS; // Should not happen if constants are defined correctly
    }

    if (validTimeTaken >= thresholdSeconds) {
        return MIN_POINTS;
    } else {
        // Linear decrease from MAX_POINTS to MIN_POINTS over thresholdSeconds
        const pointsRange = MAX_POINTS - MIN_POINTS;
        const pointsLostPerSecond = pointsRange / thresholdSeconds;
        const calculatedPoints = MAX_POINTS - (validTimeTaken * pointsLostPerSecond);
        return Math.round(calculatedPoints);
    }
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

    // The timeLimit property on question objects was for the countdown timer, which is removed.
    // questions = questions.map(q => ({ ...q, timeLimit: timeLimit })); // This line is removed.
    // MULT_TIME_LIMIT and ADD_TIME_LIMIT are still used in calculatePoints.

    if (questions.length > 0) {
        // ui.js's displayQuestion no longer needs questionData.timeLimit for a countdown.
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

    // Calculate points using the new calculatePoints function
    const points = calculatePoints(timeTaken, isCorrect, gameMode);

    totalScore += points;

    // Ensure timeTaken stored in results is a valid number for later display
    let storedTimeTaken = timeTaken;
    if (typeof timeTaken !== 'number' || !isFinite(timeTaken)) {
        // If timeTaken from ui.js was invalid, store the relevant timeLimit.
        // This helps ui.js format "N/As" if something went very wrong upstream.
        storedTimeTaken = (gameMode === 'multiplication') ? MULT_TIME_LIMIT : ADD_TIME_LIMIT;
        console.warn("Storing default timeLimit for results due to invalid timeTaken input to checkAnswer:", timeTaken);
    }


    questionResults.push({
        questionText: currentQuestion.text,
        selected: selectedAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        timeTaken: storedTimeTaken, // Store the validated or default timeTaken
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
        // The timeLimit property on questionData was for the countdown timer.
        // It's no longer added in startQuiz, so no need to check/add it here.
        // if (questionData.timeLimit === undefined) {
        //      questionData.timeLimit = gameMode === 'multiplication' ? MULT_TIME_LIMIT : ADD_TIME_LIMIT;
        // }
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

// Removed export of old MULT_TIME_LIMIT and ADD_TIME_LIMIT as they are no longer used.
// export { MULT_TIME_LIMIT, ADD_TIME_LIMIT }; 
// The new threshold constants are not exported as they are only used internally by calculatePoints.

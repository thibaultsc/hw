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

// Function to calculate points based on time taken, correctness, and game mode
function calculatePoints(timeTaken, isCorrect, gameMode) {
    if (!isCorrect) {
        return 0;
    }

    const basePoints = 30; // As per prompt's refined logic
    const maxBonus = 70;   // As per prompt's refined logic
    let timeLimit;

    if (gameMode === 'multiplication') {
        timeLimit = MULT_TIME_LIMIT; // 20 seconds
    } else if (gameMode === 'addition') {
        timeLimit = ADD_TIME_LIMIT;  // 15 seconds
    } else {
        console.error("Invalid game mode for point calculation:", gameMode);
        return basePoints; // Should not happen, but return base points if it does
    }

    // Validate timeLimit (should always be positive based on constants)
    if (typeof timeLimit !== 'number' || !isFinite(timeLimit) || timeLimit <= 0) {
        console.error("Invalid timeLimit in calculatePoints:", timeLimit);
        return basePoints; // Cannot calculate bonus without a valid timeLimit
    }

    // Validate timeTaken
    let validTimeTaken = timeTaken;
    if (typeof timeTaken !== 'number' || !isFinite(timeTaken)) {
        console.warn("Invalid timeTaken in calculatePoints:", timeTaken, "- treating as timeLimit.");
        validTimeTaken = timeLimit; // Treat invalid timeTaken as if time ran out (0 bonus)
    }
    
    // Ensure timeTaken is not negative (could happen with clock issues, though unlikely here)
    validTimeTaken = Math.max(0, validTimeTaken);

    let bonusPoints = 0;
    if (validTimeTaken < timeLimit) {
        bonusPoints = maxBonus * (timeLimit - validTimeTaken) / timeLimit;
    }
    // If validTimeTaken >= timeLimit, bonusPoints remains 0.

    const totalPoints = basePoints + Math.round(bonusPoints);
    
    // Final check to ensure a finite number is returned.
    return Number.isFinite(totalPoints) ? totalPoints : basePoints;
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

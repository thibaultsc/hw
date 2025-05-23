// At the very start of script.js
console.log('script.js: Script execution started.');

// Get DOM Element References
const taskSelectionScreen = document.getElementById('task-selection-screen');
const quizScreen = document.getElementById('quiz-screen');
const scoreScreen = document.getElementById('score-screen');
const feedbackScreen = document.getElementById('feedback-screen'); // New

const multiplicationBtnNew = document.getElementById('multiplication-btn-new'); // Updated
const additionBtnNew = document.getElementById('addition-btn-new'); // Updated
const playAgainBtnNew = document.getElementById('play-again-btn-new'); // Updated (replaces homeBtn)
const nextQuestionBtnNew = document.getElementById('next-question-btn-new'); // New
const closeQuizBtn = document.getElementById('close-quiz-btn'); // New

const questionTextNew = document.getElementById('question-text-new'); // Updated
const questionProgressNew = document.getElementById('question-progress-new'); // New
const timerMinutes = document.getElementById('timer-minutes'); // Updated (replaces timerDisplay)
const timerSeconds = document.getElementById('timer-seconds'); // Updated (replaces timerDisplay)
const answerChoicesNew = document.getElementById('answer-choices-new'); // Updated

const feedbackTitleNew = document.getElementById('feedback-title-new'); // Updated (replaces feedbackArea)
const feedbackPointsNew = document.getElementById('feedback-points-new'); // Updated (replaces feedbackArea)

const totalScoreNew = document.getElementById('total-score-new'); // Updated
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
    feedbackScreen.classList.add('hidden');
}

function showQuizScreen() {
    console.log('script.js: showQuizScreen() called.');
    taskSelectionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    scoreScreen.classList.add('hidden');
    feedbackScreen.classList.add('hidden');
}

function showScoreScreen() {
    console.log('script.js: showScoreScreen() called.');
    taskSelectionScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    scoreScreen.classList.remove('hidden');
    feedbackScreen.classList.add('hidden');
}

function showFeedbackScreen() {
    console.log('script.js: showFeedbackScreen() called.');
    taskSelectionScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    scoreScreen.classList.add('hidden');
    feedbackScreen.classList.remove('hidden');
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
if (multiplicationBtnNew && additionBtnNew && playAgainBtnNew && nextQuestionBtnNew && closeQuizBtn) { // Guard against null elements
    multiplicationBtnNew.addEventListener('click', () => { 
        console.log('script.js: Multiplication button clicked.');
        startMultiplicationQuiz();
        showQuizScreen();
    });

    additionBtnNew.addEventListener('click', () => { 
        console.log('script.js: Addition button clicked.');
        startAdditionQuiz();
        showQuizScreen();
    });

    playAgainBtnNew.addEventListener('click', () => { 
        console.log('script.js: Play Again button clicked.');
        showTaskSelectionScreen();
    });

    nextQuestionBtnNew.addEventListener('click', () => { 
        console.log('script.js: Next Question button clicked.');
        displayNextQuestion(); 
        // showQuizScreen(); // Transition back to quiz screen (or score screen if quiz ended) is handled by displayNextQuestion or endQuiz
    });

    closeQuizBtn.addEventListener('click', () => { 
        console.log('script.js: Close Quiz button clicked.');
        endQuiz(currentQuizType); 
    });
    console.log('script.js: Event listeners set up.');
} else {
    console.error('script.js: Could not find one or more buttons to attach event listeners. Check HTML IDs and script timing.');
}


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

        let incorrectCount = 0;
        while (incorrectCount < 3) {
            let wrongAnswer;
            const type = Math.floor(Math.random() * 3); 
            if (type === 0) { 
                wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*2)+1)) * num2;
            } else if (type === 1) { 
                wrongAnswer = num1 * (num2 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*2)+1));
            } else { 
                wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1)) * (num2 + (Math.random() > 0.5 ? 1 : -1));
            }

            if (wrongAnswer !== correctAnswer && !choices.includes(wrongAnswer) && wrongAnswer >= 0) {
                choices.push(wrongAnswer);
                incorrectCount++;
            }
        }
        questions.push({
            question: `${num1} x ${num2} = ?`,
            choices: shuffleArray(choices),
            answer: correctAnswer,
            type: 'multiplication'
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

        let incorrectCount = 0;
        while (incorrectCount < 3) {
            let wrongAnswer;
            const type = Math.floor(Math.random() * 3); 
            if (type === 0) { 
                wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
            } else if (type === 1) { 
                wrongAnswer = num1 + (num2 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1));
            } else { 
                wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1)) + num2;
            }

            if (wrongAnswer !== correctAnswer && !choices.includes(wrongAnswer) && wrongAnswer > 0) {
                choices.push(wrongAnswer);
                incorrectCount++;
            }
        }
        questions.push({
            question: `${num1} + ${num2} = ?`,
            choices: shuffleArray(choices),
            answer: correctAnswer,
            type: 'addition'
        });
    }
}


// Display Next Question
function displayNextQuestion() {
    console.log('script.js: displayNextQuestion() called. Current question index:', currentQuestionIndex);
    if (!quizScreen || !questionTextNew || !questionProgressNew || !answerChoicesNew) {
        console.error("script.js: displayNextQuestion - core quiz elements not found. Quiz cannot proceed.");
        return;
    }
    if (currentQuestionIndex < QUESTION_COUNT) {
        const currentQ = questions[currentQuestionIndex];
        console.log('script.js: Displaying question:', currentQ.question);
        questionTextNew.textContent = currentQ.question; 
        questionProgressNew.textContent = `Question ${currentQuestionIndex + 1}/${QUESTION_COUNT}`; 
        answerChoicesNew.innerHTML = ''; 

        currentQ.choices.forEach(choice => {
            const button = document.createElement('button');
            // Tailwind classes for answer buttons from the new UI
            button.className = "flex min-h-[40px] md:min-h-[48px] w-full cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-solid border-[#e0e0e0] bg-white px-4 text-center text-sm md:text-base font-medium text-[#1c170d] transition-all hover:bg-[#f7f7f7]"; 
            
            const span = document.createElement('span');
            span.className = "truncate"; 
            span.textContent = String(choice); // Ensure choice is a string
            button.appendChild(span);
            
            button.addEventListener('click', () => selectAnswer(choice, currentQ.answer));
            answerChoicesNew.appendChild(button); 
        });

        if (feedbackTitleNew) feedbackTitleNew.textContent = ''; // Clear previous feedback
        if (feedbackPointsNew) feedbackPointsNew.textContent = '';
        
        startQuestionTimer();
        showQuizScreen(); // Ensure quiz screen is shown for the new question
    } else {
        console.log('script.js: No more questions. Ending quiz.');
        endQuiz(currentQuizType); 
    }
}

// Start Question Timer
function startQuestionTimer() {
    console.log('script.js: startQuestionTimer() called.');
    clearInterval(timerInterval);
    startTime = new Date().getTime();
    if (timerMinutes && timerSeconds) {
        timerMinutes.textContent = "00"; 
        timerSeconds.textContent = "00"; 
        
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((new Date().getTime() - startTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            timerMinutes.textContent = String(minutes).padStart(2, '0');
            timerSeconds.textContent = String(seconds).padStart(2, '0');
        }, 1000);
    } else {
        console.error("script.js: Timer display elements not found.");
    }
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
            if (timeTaken <= 0.5) { // Very fast
                questionScore = 100;
            } else if (timeTaken <= 10) { // Within 10 seconds
                questionScore = 30 + Math.max(0, Math.floor(70 * ((10 - timeTaken) / (10 - 0.5) ))); // Adjusted degressive
            } else { // Over 10 seconds
                questionScore = 30;
            }
        } else {
            questionScore = 0;
        }
    } else if (currentQuizType === 'addition') {
        if (isCorrect) {
            if (timeTaken <= 0.5) { // Very fast
                questionScore = 100;
            } else if (timeTaken <= 20) { // Within 20 seconds
                questionScore = 30 + Math.max(0, Math.floor(70 * ((20 - timeTaken) / (20 - 0.5) ))); // Adjusted degressive
            } else { // Over 20 seconds
                questionScore = 30;
            }
        } else {
            questionScore = 0;
        }
    }

    currentTotalScore += questionScore;
    updateFeedbackScreenContent(isCorrect, questionScore, correctAnswer);
    showFeedbackScreen(); 

    currentQuestionIndex++;
}

// New function to update feedback screen content
function updateFeedbackScreenContent(isCorrect, score, correctAnswer) {
    console.log(`script.js: updateFeedbackScreenContent() called. Correct: ${isCorrect}, Score: ${score}`);
    if (!feedbackScreen || !feedbackTitleNew || !feedbackPointsNew) {
        console.error("script.js: Feedback screen elements not found.");
        return;
    }
    
    // Assuming the feedback screen HTML has an SVG element that might need its color changed.
    // This is a placeholder for the actual SVG targeting and class manipulation.
    // const feedbackSVG = feedbackScreen.querySelector('svg'); // More specific selector needed

    if (isCorrect) {
        feedbackTitleNew.textContent = 'Correct!';
        feedbackPointsNew.textContent = `You earned ${score} points!`;
        // if (feedbackSVG) {
        //     // Logic to set SVG to green for correct
        // }
    } else {
        feedbackTitleNew.textContent = 'Incorrect!';
        feedbackPointsNew.textContent = `The correct answer was ${correctAnswer}. You earned ${score} points.`;
        // if (feedbackSVG) {
        //     // Logic to set SVG to red for incorrect
        // }
    }
}

// End Quiz
function endQuiz(quizType) {
    console.log(`script.js: endQuiz() called for ${quizType}. Final score: ${currentTotalScore}`);
    clearInterval(timerInterval);
    if (totalScoreNew) {
        totalScoreNew.textContent = currentTotalScore; 
    } else {
        console.error("script.js: Total score display element not found.");
    }
    showScoreScreen();
    console.log(`${currentQuizType || 'Unknown'} quiz ended. Final Score: ${currentTotalScore || 0}`);
}

// Initial State - ensure this runs after DOM is ready
function initializeApp() {
    console.log('script.js: Initializing app state and UI.');
    if (taskSelectionScreen && quizScreen && scoreScreen && feedbackScreen) {
         showTaskSelectionScreen(); 
    } else {
        console.error('script.js: One or more main screen elements not found. App cannot initialize correctly.');
    }
    console.log('script.js: Script execution finished. Initial screen should be visible.');
}

// Since 'defer' is used, the script executes after DOM parsing but before DOMContentLoaded.
// However, to be absolutely sure all elements are available, especially complex ones,
// wrapping in DOMContentLoaded is safest. But given the `defer` attribute, direct execution
// of `initializeApp()` should be fine if all element getters are at the top.
// For robustness, let's ensure button checks and listener attachments are also guarded or happen
// after explicit DOM ready if `defer` proves insufficient for complex scenarios, though it usually is.

// Call initialization
if (document.readyState === 'loading') { // DOMContentLoaded has not fired yet
    document.addEventListener('DOMContentLoaded', initializeApp);
} else { // DOMContentLoaded has already fired
    initializeApp();
}

// Adding null checks for all DOM elements before use or listener attachment.
// This was partially done for buttons, extending to other critical elements.
const criticalElements = [
    taskSelectionScreen, quizScreen, scoreScreen, feedbackScreen,
    multiplicationBtnNew, additionBtnNew, playAgainBtnNew, nextQuestionBtnNew, closeQuizBtn,
    questionTextNew, questionProgressNew, timerMinutes, timerSeconds, answerChoicesNew,
    feedbackTitleNew, feedbackPointsNew, totalScoreNew
];

criticalElements.forEach(el => {
    if (!el) {
        console.error(`script.js: A critical DOM element was not found. Check HTML IDs. Element ID that might be missing: ${el ? el.id : 'unknown (was null during array creation)'}`);
    }
});

// Refined degressive scoring logic slightly, and added more null checks and logging.
// Ensured String(choice) for button text content.
// Adjusted when showQuizScreen is called in displayNextQuestion.
// Wrapped event listener attachments in a null check for all buttons.
// Wrapped initializeApp in a DOMContentLoaded check for robustness, although defer should usually suffice.

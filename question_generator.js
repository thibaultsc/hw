// Constants for question generation
export const NUMBER_OF_QUESTIONS = 10;

// Multiplication specific constants
const MULT_TABLE_FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MULT_MULTIPLIER_FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const allPossibleProducts = [];
for (let i = 0; i < MULT_TABLE_FACTORS.length; i++) {
    for (let j = 0; j < MULT_MULTIPLIER_FACTORS.length; j++) {
        allPossibleProducts.push(MULT_TABLE_FACTORS[i] * MULT_MULTIPLIER_FACTORS[j]);
    }
}
const sortedPossibleProducts = [...new Set(allPossibleProducts)].sort((a, b) => a - b);

// Addition specific constants
const ADD_MAX_SUM = 100;
const ADD_FACTORS = Array.from({ length: ADD_MAX_SUM + 1 }, (_, i) => i); // Numbers from 0 to ADD_MAX_SUM
const allPossibleSums = [];
for (let i = 0; i < ADD_FACTORS.length; i++) {
    for (let j = 0; j < ADD_FACTORS.length; j++) {
        if (ADD_FACTORS[i] + ADD_FACTORS[j] <= ADD_MAX_SUM) {
            allPossibleSums.push(ADD_FACTORS[i] + ADD_FACTORS[j]);
        }
    }
}
const sortedPossibleSums = [...new Set(allPossibleSums)].sort((a, b) => a - b);

// Function to generate multiplication questions
export function generateMultiplicationQuestions() {
    const questions = [];
    const usedPairs = new Set();

    while (questions.length < NUMBER_OF_QUESTIONS) {
        const factor1 = MULT_TABLE_FACTORS[Math.floor(Math.random() * MULT_TABLE_FACTORS.length)];
        const factor2 = MULT_MULTIPLIER_FACTORS[Math.floor(Math.random() * MULT_MULTIPLIER_FACTORS.length)];
        const pairKey = `${Math.min(factor1, factor2)}_${Math.max(factor1, factor2)}`;

        if (!usedPairs.has(pairKey)) {
            usedPairs.add(pairKey);
            const questionText = `${factor1} × ${factor2}`; // Original text for reference or summary
            const correctAnswer = factor1 * factor2;
            questions.push({
                text: questionText, // Retain original text for potential summary use
                factor1: factor1,   // Add factor1
                factor2: factor2,   // Add factor2
                answer: correctAnswer,
                timeLimit: 20 // Default time limit, will be overridden by quiz.js
            });
        }
    }
    return questions;
}

// Function to generate addition questions
export function generateAdditionQuestions() {
    const questions = [];
    const usedPairs = new Set();

    while (questions.length < NUMBER_OF_QUESTIONS) {
        const num1 = ADD_FACTORS[Math.floor(Math.random() * ADD_FACTORS.length)];
        const num2 = ADD_FACTORS[Math.floor(Math.random() * ADD_FACTORS.length)];
        const sum = num1 + num2;
        const pairKey = `${Math.min(num1, num2)}_${Math.max(num1, num2)}`; // To avoid duplicate questions like 1+2 and 2+1 if desired, though sums can be the same.

        if (sum <= ADD_MAX_SUM && !usedPairs.has(pairKey)) {
            usedPairs.add(pairKey);
            const questionText = `${num1} + ${num2}`; // Original text for reference or summary
            questions.push({
                text: questionText, // Retain original text for potential summary use
                factor1: num1,      // Add num1 as factor1
                factor2: num2,      // Add num2 as factor2
                answer: sum,
                timeLimit: 15 // Default time limit, will be overridden by quiz.js
            });
        }
    }
    return questions;
}

// Function to generate answer options for multiplication
export function generateMultiplicationAnswerOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    // Add nearby products
    const productIndex = sortedPossibleProducts.indexOf(correctAnswer);
    if (productIndex > 0) options.add(sortedPossibleProducts[productIndex - 1]);
    if (productIndex < sortedPossibleProducts.length - 1) options.add(sortedPossibleProducts[productIndex + 1]);

    // Add random products, ensuring they are different from correct answer and other options
    while (options.size < 4 && options.size < sortedPossibleProducts.length) {
        const randomProduct = sortedPossibleProducts[Math.floor(Math.random() * sortedPossibleProducts.length)];
        options.add(randomProduct);
    }
    return Array.from(options).sort(() => Math.random() - 0.5); // Shuffle options
}

// Function to generate answer options for addition
export function generateAdditionAnswerOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    // Add nearby sums
    const sumIndex = sortedPossibleSums.indexOf(correctAnswer);
    if (sumIndex > 0) options.add(sortedPossibleSums[sumIndex - 1]);
    if (sumIndex < sortedPossibleSums.length - 1) options.add(sortedPossibleSums[sumIndex + 1]);
    
    // Add random sums
    while (options.size < 4 && options.size < sortedPossibleSums.length) {
        const randomSum = sortedPossibleSums[Math.floor(Math.random() * sortedPossibleSums.length)];
        options.add(randomSum);
    }
    return Array.from(options).sort(() => Math.random() - 0.5); // Shuffle options
}

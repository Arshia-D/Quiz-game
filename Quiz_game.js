let numberOfPlayers = 0;
let currentPlayer = 1; 
let playerColors = {}; 
let quizSubject = '';
let questions = []; 
let currentQuestionIndex = 0;
let timer;
let timeLeft = 30; 
let playerScores = {}; 
let playerChoices = {}; 
let HTMLQuestions 
let CSSQuestions 
let JSQuestions 

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// function to load quastions from json file 
fetch('./html.json')
  .then(response => response.json())
  .then(data => {
    HTMLQuestions = data;
    shuffleArray(HTMLQuestions.questions);
  })
  .catch(error => console.error('Error loading questions:', error));
  fetch('./css.json')
  .then(response => response.json())
  .then(data => {
    CSSQuestions = data;
    shuffleArray(CSSQuestions.questions);
  })
  .catch(error => console.error('Error loading CSS questions:', error));
fetch('./js.json')
  .then(response => response.json())
  .then(data => {
    JSQuestions = data;
    shuffleArray(JSQuestions.questions);
  })
  .catch(error => console.error('Error loading JS questions:', error));
  
  // Set num of players
const predefinedColors = ["Red", "Blue", "Green", "Yellow"];
window.setPlayers = function(num)
{
    numberOfPlayers = num;
    currentPlayer = 1;
    playerColors = {};
    playerScores = {};
    for (let i = 1; i <= numberOfPlayers; i++) {
        playerColors[`Player ${i}`] = predefinedColors[i - 1];
        playerScores[`Player ${i}`] = 0;
    }
    console.log(`Number of Players: ${numberOfPlayers}`);
    navigateTo('selectSubjectScreen');
}
function startGame() {
    currentQuestionIndex = 0; 
    displayQuestion(); 
    updateCurrentPlayerInfo();
}
//select quize subject 
window.setSubject = function(subject) {
    quizSubject = subject;
    console.log(`Quiz Subject: ${quizSubject}`);
    switch (subject) {
        case 'HTML':
            questions = HTMLQuestions ? HTMLQuestions.questions : [];
            break;
        case 'CSS':
            questions = CSSQuestions ? CSSQuestions.questions : [];
            break;
        case 'JS':
            questions = JSQuestions ? JSQuestions.questions : [];
            break;
    }
    if (questions.length > 0) {
        navigateTo('quizScreen'); 
        displayQuestion(); 
    } else {
        console.error('Error: Questions for the selected subject are not loaded.');
    }
}

// load Questions
function loadQuestions() {

    switch (quizSubject) {
        case 'HTML':
            if (HTMLQuestions && HTMLQuestions.questions) {
                questions = HTMLQuestions.questions;
            }
            break;
        case 'CSS':
            if (CSSQuestions && CSSQuestions.questions) {
                questions = CSSQuestions.questions;
            }
            break;
        case 'JS':
            if (JSQuestions && JSQuestions.questions) {
                questions = JSQuestions.questions;
            } 
            break;
    }
}

// navigate to scrren after selection 
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
// reset game state
function resetGameState() {
    numberOfPlayers = 0;
    currentPlayer = 1;
    playerColors = {};
    quizSubject = '';
    resetColorButtons();
    playerScores = {}; 
    updateScoreDisplay(); 
}
// display 10 Question for the game
function displayQuestion() {
    if (currentQuestionIndex >= 10) {
        endQuiz();
        return;
    }
    updateCurrentPlayerInfo();
    const question = questions[currentQuestionIndex];
    document.getElementById('question').textContent = question.questionText;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => selectAnswer(option, question.correctAnswer);
        answersDiv.appendChild(button);
    });
    startTimer();
}

// Calculating the selected answers of players
function selectAnswer(selectedOption, correctAnswer) {
    clearInterval(timer);

    if (playerScores[`Player ${currentPlayer}`] === undefined) {
        playerScores[`Player ${currentPlayer}`] = 0;
    }

    if (selectedOption == correctAnswer) { 
        console.log("Correct answer!");
        playerScores[`Player ${currentPlayer}`] += 10;
    } else {
        console.log("Incorrect answer.");
    }

    playerChoices[`Player ${currentPlayer}`] = playerChoices[`Player ${currentPlayer}`] || [];
    playerChoices[`Player ${currentPlayer}`][currentQuestionIndex] = selectedOption;

    if (currentPlayer < numberOfPlayers) {
        currentPlayer++;
        displayQuestion(); 
    } else {
        currentPlayer = 1;
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }
}

// Update Player Info
function updateCurrentPlayerInfo() {
    const playerInfoDiv = document.getElementById('currentPlayerInfo');
    if (playerInfoDiv) {
        playerInfoDiv.textContent = `Player ${currentPlayer}'s turn`;
    }
}
// showing Scoreboard after game finished 
function displayScoreboard() {
    let sortedPlayers = Object.entries(playerScores).sort((a, b) => b[1] - a[1]);
    let maxScore = sortedPlayers[0][1]; 
    let winners = sortedPlayers.filter(player => player[1] === maxScore);
    let scoreboardHtml = '<h2>Scoreboard</h2>';
    scoreboardHtml += winners.length > 1 ? '<p>Winners:</p>' : '<p>Winner:</p>';
    winners.forEach(player => {
        scoreboardHtml += `<p>${player[0]} - ${player[1]} points</p>`;
    });
    scoreboardHtml += '<ol>';
    sortedPlayers.forEach(player => {
        scoreboardHtml += `<li>${player[0]} - ${player[1]} points</li>`;
    });
    scoreboardHtml += '</ol>';
    document.getElementById('scoreboard').innerHTML = scoreboardHtml;
}
function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = `Score: ${playerScores[`Player ${currentPlayer}`]}`;
}
// game timer 
function startTimer() {
    timeLeft = 30; 
    updateTimerDisplay();
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            timeRanOut();
        } else {
            timeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
}
function updateTimerDisplay() {
    document.getElementById('timeLeft').textContent = `${timeLeft} seconds`;
}
// function for ran out of time 
function timeRanOut() {
    console.log("Time ran out!");
    clearInterval(timer);
    selectAnswer('no answer', questions[currentQuestionIndex].correctAnswer);
}
// function for ending quize 
  function endQuiz() {
    clearInterval(timer);
    console.log("Quiz ended");
    hideAllScreens();
    displayScoreboard();
    createButtonIfNotExists('newGameButton', 'Play New Game', startNewGame);
    createButtonIfNotExists('reviewButton', 'Review Answers', reviewAnswers);
    document.getElementById('scoreboard').style.display = 'block';
  }
  // hide scrren for showing the score 
  function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
  }
  // make sure scoreboard show itself 
  function createButtonIfNotExists(id, text, clickHandler) {
    let button = document.getElementById(id);
    if (!button) {
      button = document.createElement('button');
      button.id = id;
      button.textContent = text;
      button.onclick = clickHandler;
      document.getElementById('scoreboard').appendChild(button);
    }
  }
  function startNewGame() {
    location.reload(); 
  }
// review answers in colors and show the right answer 
const reviewAnswers = () => {
    const reviewAnswersDiv = document.getElementById('reviewAnswersDiv') || (() => {
      const newDiv = document.createElement('div');
      newDiv.id = 'reviewAnswersDiv';
      document.getElementById('scoreboard').appendChild(newDiv);
      return newDiv;
    })();
    reviewAnswersDiv.innerHTML = ''; 
    
    questions.slice(0, 10).forEach((question, index) => {
      const questionReviewDiv = document.createElement('div');
      questionReviewDiv.classList.add('question-review');

      const createPElement = (text, isCorrect) => {
        const p = document.createElement('p');
        p.textContent = text;

        if (isCorrect === true) {
          p.style.color = 'green'; 
        } else if (isCorrect === false) {
          p.style.color = 'red'; 
        } 
        return p;
      };

      questionReviewDiv.appendChild(createPElement(`Question ${index + 1}: ${question.questionText}`));
      questionReviewDiv.appendChild(createPElement(`Correct Answer: ${question.correctAnswer}`));
      
      Object.keys(playerScores).forEach(playerName => {
        const playerChoice = playerChoices[playerName]?.[index];
        const isCorrect = playerChoice ? playerChoice === question.correctAnswer : null;
        questionReviewDiv.appendChild(createPElement(`${playerName}'s Choice: ${playerChoice || 'No answer'}`, isCorrect));
      });

      questionReviewDiv.appendChild(document.createElement('hr'));
      reviewAnswersDiv.appendChild(questionReviewDiv);
    });
};


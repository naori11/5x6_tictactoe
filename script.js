var origBoard;
const player1 = 'O';
const player2 = 'X';
let currentPlayer;
let isAIPlayer;
let aiDifficulty;
//added variables
let player1Wins = 0;
let player2Wins = 0;
let draws = 0;

const winCombos = [
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],
    [0, 6, 12, 18, 24],
    [1, 7, 13, 19, 25],
    [2, 8, 14, 20, 26],
    [3, 9, 15, 21, 27],
    [4, 10, 16, 22, 28],
    [5, 11, 17, 23, 29],
    [18, 25],
	[12, 19, 26],
	[6, 13, 20, 27],
	[0, 7, 14, 21, 28],
	[1, 8, 15, 22, 29],
	[2, 9, 16, 23],
	[3, 10, 17],
	[4, 11],
	[1, 6],
	[2, 7, 12],
	[3, 8, 13, 18],
	[24, 19, 14, 9 ,4],
	[25, 20, 15, 10, 5],
	[26, 21, 16, 11],
	[27, 22, 17],
	[28, 23]
];

const table = document.querySelector('table');
const cells = document.querySelectorAll('.cell');
table.addEventListener('click', turnClick);

//added variables
const scoreboard = document.getElementById('scoreboard');
scoreboard.innerHTML = `Player 1: ${player1Wins} | Player 2: ${player2Wins} | Draws: ${draws}`;
//

startGame();

function startGame() {
    document.querySelector('.endgame').style.display = 'none';
    origBoard = Array.from(Array(6 * 5).keys());
    getPlayerMode();
}

function getPlayerMode() {
    const mode = prompt("Choose game mode: '1' for 2 players, '2' for AI");
    if (mode === '1') {
        isAIPlayer = false;
        currentPlayer = player1;
        initGame();
    } else if (mode === '2') {
        isAIPlayer = true;
        getAIDifficulty();
    } else {
        alert("Invalid choice. Please choose '1' for 2 players or '2' for AI.");
        getPlayerMode();
    }
}

function getAIDifficulty() {
    aiDifficulty = prompt("Choose AI difficulty: 'easy', 'medium', or 'hard'");
    if (aiDifficulty !== 'easy' && aiDifficulty !== 'medium' && aiDifficulty !== 'hard') {
        alert("Invalid difficulty. Please choose 'easy', 'medium', or 'hard'.");
        getAIDifficulty();
    } else {
        currentPlayer = player1;
        initGame();
    }
}

function initGame() {
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].classList.remove('win-cell');
        cells[i].addEventListener('click', turnClick, false);
    }

    if (isAIPlayer && currentPlayer === player2) {
        aiMove();
        checkGameOver(); // Ensure checkGameOver is called after AI move
    }
}

function turnClick(event) {
    const cellId = event.target.id;
    if (typeof origBoard[cellId] === 'number' && !checkWin(origBoard, player1) && !checkWin(origBoard, player2)) {
        turn(cellId, currentPlayer);

        if (checkWin(origBoard, currentPlayer)) {
            declareWinner(`${currentPlayer} wins!`);
        } else if (checkTie()) {
            declareWinner("It's a Tie!");
        }

        currentPlayer = (currentPlayer === player1) ? player2 : player1;

        if (isAIPlayer && currentPlayer === player2 && !checkWin(origBoard, player1) && !checkWin(origBoard, player2) && !checkTie()) {
            aiMove();
            checkGameOver();
        }
    }
}


function aiMove() {
    if (aiDifficulty === 'easy') {
        easyAIMove();
    } else if (aiDifficulty === 'medium') {
        mediumAIMove();
    } else if (aiDifficulty === 'hard') {
        hardAIMove();
    }
}

//easy mode just makes random moves
function easyAIMove() {
    const emptySquaresArray = emptySquares();
    const randomIndex = Math.floor(Math.random() * emptySquaresArray.length);
    const aiMove = emptySquaresArray[randomIndex];
    turn(aiMove, player2);
    checkGameOver();
}

// medium ai makes sure to make winning moves first then block
function mediumAIMove() {
    // If there's a winning move, make it
    const winningMove = findWinningMove(player2);
    if (winningMove !== -1) {
        turn(winningMove, player2);
    } else {
        // If no winning move, block the opponent's winning move
        const blockWinningMove = findWinningMove(player1);
        if (blockWinningMove !== -1) {
            turn(blockWinningMove, player2);
        } else {
            // If no winning or blocking move, make a random move
            easyAIMove();
        }
    }

    checkGameOver();
}


function findWinningMove(player) {
    for (let i = 0; i < origBoard.length; i++) {
        if (typeof origBoard[i] === 'number') {
            origBoard[i] = player;
            if (checkWin(origBoard, player)) {
                origBoard[i] = i; // Reset the board
                return i;
            }
            origBoard[i] = i; // Reset the board
        }
    }
    return -1;
}

//hard ai will block move first then fo a winning move, if it can't make both it will make a move towards a winning move
function hardAIMove() {
    // If no blocking move, choose a move that blocks the opponent's winning move
    const blockingMove = findWinningMove(player1);

    if (blockingMove !== -1) {
        turn(blockingMove, player2);
    } else {
        // If no winning move, choose a move that results in a win
        const winningMove = findWinningMove(player2);
        if (winningMove !== -1) {
            turn(winningMove, player2);
        } else {
            // If no winning or blocking move, choose any available move
            const emptySquaresArray = emptySquares();
            if (emptySquaresArray.length > 0) {
                // Prioritize center and corners
                const prioritizedMoves = [13, 6, 8, 12, 14, 18, 24, 26, 28];
                const availablePrioritizedMoves = prioritizedMoves.filter(move => emptySquaresArray.includes(move));
                const bestMove = availablePrioritizedMoves.length > 0
                    ? availablePrioritizedMoves[0]
                    : emptySquaresArray[0];

                turn(bestMove, player2);
            }
        }
    }

    checkGameOver();
}


function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    document.getElementById(squareId).removeEventListener('click', turnClick, false);
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let win of winCombos) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { player: player , index: win };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    const winningCombination = gameWon.index;

    for (let i = 0; i < winningCombination.length; i++) {
        const index = winningCombination[i];
        document.getElementById(index).classList.add('win-cell');
    }

    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

	if (gameWon.player == player1 || gameWon.player == player2) {
        declareWinner(`${gameWon.player} wins!`);
		updateScore(gameWon.player); //added logic to update scoreboard
    } else {
        declareWinner("It's a Tie!");
		updateScore('draw'); //added logic to update scoreboard
    }}

//edited function
function declareWinner(who) {
    document.querySelector('.endgame').style.display = 'block';
    document.querySelector('.endgame .text').innerText = who;
	setTimeout(() => {
        resetGame();
    }, 2000); // Delay before resetting the game
}


function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    const emptySpots = emptySquares();
    const randomIndex = Math.floor(Math.random() * emptySpots.length);
    return emptySpots[randomIndex];
}

function checkTie() {
    if (emptySquares().length == 0 && !checkWin(origBoard, player1) && !checkWin(origBoard, player2)) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        return true;
    }
    return false;
}

function checkGameOver() {
    if (checkWin(origBoard, player2)) {
        declareWinner(`${player2} wins!`);
    } else if (checkTie()) {
        declareWinner("It's a Tie!");
    }
    currentPlayer = player1;
}

//added functions to reset the game and add scoreboard tracking
function resetGame() {
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].classList.remove('win-cell');
        cells[i].addEventListener('click', turnClick, false);
    }

    currentPlayer = player1;

    if (player1Wins === 3 || player2Wins === 3) {
        // If one player wins 3 games, ask for a rematch
        const rematch = confirm('We have a winner! Do you want to play again?');
        if (rematch) {
            player1Wins = 0;
            player2Wins = 0;
            draws = 0;
            updateScoreboard();
        } else {
            startGame();
        }
    } else {
        if (isAIPlayer && currentPlayer === player2) {
            aiMove();
            checkGameOver(); // Ensure checkGameOver is called after AI move
        }
    }
}

function updateScore(player) {
    if (player === player1) {
        player1Wins++;
    } else if (player === player2) {
        player2Wins++;
    } else {
        draws++;
    }
    updateScoreboard();
}

function updateScoreboard() {
    scoreboard.innerHTML = `Player 1: ${player1Wins} | Player 2: ${player2Wins} | Draws: ${draws}`;
}


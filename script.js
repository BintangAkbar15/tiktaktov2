// initialization
const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");
const scoreXText = document.querySelector("#scoreX");
const scoreOText = document.querySelector("#scoreO");
const historyLog = document.querySelector("#historyLog");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const modeRadios = document.querySelectorAll('input[name="gameMode"]');
const gameMode = document.querySelector('#gameMode')

let options = ["", "", "", "", "", "", "", "", ""];
const winCondition = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let currentPlayer = "X";
let scoreX = 0;
let scoreO = 0;
let xMoves = [];
let oMoves = [];
let running = false;
let turnTimeout = null;
let vsBot = true;
let turnCount = 0;
let timerInterval = null
 
// watcher radio change
modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        vsBot = document.querySelector('input[name="gameMode"]:checked')?.value === "bot";

        scoreX = 0;
        scoreO = 0;
        scoreXText.textContent = "0";
        scoreOText.textContent = "0";

        resetGame();
        clearInterval(timerInterval)
        clearTimeout(turnTimeout)
        statusText.textContent = ''
    });
});

// button events
startBtn.addEventListener("click", initializeGame);
restartBtn.addEventListener("click", restartGame);
resetBtn.addEventListener("click", resetGame);

// game initialization
function initializeGame() {
    gameMode.classList.add('d-none')
    resetBtn.classList.add('d-none')
    startBtn.classList.add('d-none')
    restartBtn.classList.remove('d-none')
    const selectedMode = document.querySelector('input[name="gameMode"]:checked')?.value || "human";
    vsBot = selectedMode === "bot";

    options = ["", "", "", "", "", "", "", "", ""];
    xMoves = [];
    oMoves = [];
    turnCount = 0;
    currentPlayer = "X";
    running = true;

    statusText.textContent = `${currentPlayer}'s Turn`;
    statusText.style.color = "red";
    historyLog.innerHTML = "";

    // initialization each cell
    cells.forEach((cell, index) => {
        cell.textContent = "";
        cell.classList.remove("text-muted", "win");
        cell.setAttribute("cellIndex", index);
        cell.addEventListener("click", cellClicked);
    });
    // clear timer interval & timeout and set the turn timer
    clearInterval(timerInterval)
    clearTimeout(turnTimeout)
    startTurnTimer();

    if (currentPlayer === "O" && vsBot) {
        botMove();
    }
}

// cell click function
function cellClicked(e) {
    console.log(e)
    const index = this.getAttribute("cellIndex");

    if (options[index] !== "" || !running || (vsBot && currentPlayer === "O")) return;

    updateCell(this, index);
    checkWinner();
}

// update cell function
function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.textContent = currentPlayer;
    setTimeout(() => {
        logMove(index);
    }, 100);

    let moves = currentPlayer === "X" ? xMoves : oMoves;
    moves.push(index);

    if (moves.length === 2) cells[moves[0]].classList.add("text-muted");

    if (moves.length > 3) {
        let oldIndex = moves.shift();
        historyLog.innerHTML += `Cell ${oldIndex} has been removed by ${currentPlayer}<br>`;
        cells[oldIndex].classList.remove("text-muted");
        options[oldIndex] = "";
        cells[oldIndex].textContent = "";
        cells[moves[0]].classList.add("text-muted");
    }
}

// change player function
function changePlayer() {
    setTimeout(() => {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `${currentPlayer}'s Turn`;
        statusText.style.color = currentPlayer === "X" ? "red" : "blue";
        clearTimeout(turnTimeout);
        startTurnTimer();
    
        if (currentPlayer === "O" && vsBot && running) {
            botMove();
        }
    }, 200);
}

// check winner condition
function checkWinner() {
    let roundWon = false;
    let winningCombo = [];

    for (let condition of winCondition) {
        const [a, b, c] = condition;
        if (options[a] && options[a] === options[b] && options[b] === options[c]) {
        roundWon = true;
        winningCombo = condition;
        break;
        }
    }

    // clear timeout untuk reset waktu
    clearTimeout(turnTimeout);

    if (roundWon) {
        gameMode.classList.remove('d-none')
        resetBtn.classList.remove('d-none')
        startBtn.classList.remove('d-none')
        restartBtn.classList.add('d-none')
        winningCombo.forEach(i => cells[i].classList.add("win"));
        updateScore(currentPlayer);
        Swal.fire({
            title: `${currentPlayer} Wins!`,
            text: `${currentPlayer} dominates the board!`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        });
        clearInterval(timerInterval)
        clearTimeout(turnTimeout)
        running = false;
        return;
    }

    if (!options.includes("")) {
        gameMode.classList.remove('d-none')
        resetBtn.classList.remove('d-none')
        startBtn.classList.remove('d-none')
        restartBtn.classList.add('d-none')
        Swal.fire({
            title: "Draw!",
            text: "Both players ran out of moves — it's a tie!",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        });
        timerInterval = null
        running = false;
        return;
    }

    changePlayer();
}

// restart game fuction
function restartGame() {
    gameMode.classList.remove('d-none')
    resetBtn.classList.remove('d-none')
    startBtn.classList.remove('d-none')
    restartBtn.classList.add('d-none')
    options = ["", "", "", "", "", "", "", "", ""];
    xMoves = [];
    oMoves = [];
    turnCount = 0;
    currentPlayer = "X";
    statusText.textContent = `${currentPlayer}'s Turn`;
    statusText.style.color = "red";
    historyLog.innerHTML = "";

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("text-muted", "win");
    });

    clearInterval(timerInterval)
    clearTimeout(turnTimeout)
    // startTurnTimer();    

    if (currentPlayer === "O" && vsBot) {
        botMove();
    }
}

// reset game function
function resetGame(){
    scoreX = 0;
    scoreO = 0;
    scoreXText.textContent = "0";
    scoreOText.textContent = "0";

    restartGame()
}

// update score function
function updateScore(winner) {
    if (winner === "X") {
        scoreX++;
        scoreXText.textContent = scoreX;
    } else {
        scoreO++;
        scoreOText.textContent = scoreO;
    }
}

// player timer function
function startTurnTimer() {
    clearTimeout(turnTimeout);
    clearInterval(timerInterval);

    // total time
    let timeLeft = 10;
    const timerText = document.querySelector("#timerText");
    timerText.textContent = `${timeLeft} second left`;

    // set interval timer every 1 second
    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = `${timeLeft} second left`;

        if (timeLeft <= 0) {
        // clear interval
            clearInterval(timerInterval);
            Swal.fire({
                title: `${currentPlayer} took too long!`,
                text: "Turn skipped.",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false
            });
            changePlayer();
        }
    }, 1000);
}

// set history function
function logMove(index) {
    turnCount++;
    historyLog.innerHTML += `Turn ${turnCount}: ${currentPlayer} → Cell ${Number(index) +1}<br>`;
}

// BOT
// start bot function
function botMove() {
  smartBotMove();
}

// bot movement logic
function smartBotMove() {
    let move;

    // 1. Coba cari langkah untuk menang
    move = findBestMove("O");
    if (move !== null) {
        executeBotMove(move);
        return;
    }

    // 2. Coba blok lawan (X) biar gak menang
    move = findBestMove("X");
    if (move !== null) {
        executeBotMove(move);
        return;
    }

    // 3. Ambil tengah kalau kosong
    if (options[4] === "") {
        executeBotMove(4);
        return;
    }

    // 4. Ambil pojok kalau ada
    const corners = [0, 2, 6, 8];
    move = corners.find(i => options[i] === "");
    if (move !== undefined) {
        executeBotMove(move);
        return;
    }

    // 5. Ambil sisi samping kalau terpaksa
    const sides = [1, 3, 5, 7];
    move = sides.find(i => options[i] === "");
    if (move !== undefined) {
        executeBotMove(move);
        return;
    }
}

// attack or defend logic
function findBestMove(player) {
    for (let condition of winCondition) {
        const [a, b, c] = condition;
        const values = [options[a], options[b], options[c]];

        const countPlayer = values.filter(v => v === player).length;
        const countEmpty = values.filter(v => v === "").length;

        if (countPlayer === 2 && countEmpty === 1) {
        const emptyIndex = [a, b, c].find(i => options[i] === "");
        return emptyIndex;
        }
    }
    return null;
}

// execution bot function
function executeBotMove(index) {
    let theBotThink = Math.floor(Math.random() *(5000 - 500 +1) + 500)
    setTimeout(() => {
        updateCell(cells[index], index);
        checkWinner();
    }, theBotThink);
}

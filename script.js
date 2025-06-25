const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");
const scoreXText = document.querySelector("#scoreX");
const scoreOText = document.querySelector("#scoreO");
const historyLog = document.querySelector("#historyLog");
const startBtn = document.querySelector("#startBtn");
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
 
modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        vsBot = document.querySelector('input[name="gameMode"]:checked')?.value === "bot";
        // Reset skor
        scoreX = 0;
        scoreO = 0;
        scoreXText.textContent = "0";
        scoreOText.textContent = "0";

        // Restart game biar mode dan skor bersih
        restartGame();
        clearInterval(timerInterval)
        clearTimeout(turnTimeout)
        statusText.textContent = ''
    });
});

startBtn.addEventListener("click", initializeGame);
restartBtn.addEventListener("click", restartGame);

function initializeGame() {
    gameMode.classList.add('d-none')
    startBtn.classList.add('d-none')
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

    cells.forEach((cell, index) => {
        cell.textContent = "";
        cell.classList.remove("text-muted", "win");
        cell.setAttribute("cellIndex", index);
        cell.removeEventListener("click", cellClicked); // clear duplicate listeners
        cell.addEventListener("click", cellClicked);
    });
    
    clearInterval(timerInterval)
    clearTimeout(turnTimeout)
    startTurnTimer();

    if (currentPlayer === "O" && vsBot) {
        botMove();
    }
}

function cellClicked() {
    const index = this.getAttribute("cellIndex");

    if (options[index] !== "" || !running || (vsBot && currentPlayer === "O")) return;

    updateCell(this, index);
    checkWinner();
}

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

function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s Turn`;
    statusText.style.color = currentPlayer === "X" ? "red" : "blue";
    clearTimeout(turnTimeout);
    startTurnTimer();

    if (currentPlayer === "O" && vsBot && running) {
        botMove();
    }
}

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

    clearTimeout(turnTimeout);

    if (roundWon) {
        gameMode.classList.remove('d-none')
        startBtn.classList.remove('d-none')
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
        startBtn.classList.remove('d-none')
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

function restartGame() {
    gameMode.classList.remove('d-none')
    startBtn.classList.remove('d-none')
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

function updateScore(winner) {
    if (winner === "X") {
        scoreX++;
        scoreXText.textContent = scoreX;
    } else {
        scoreO++;
        scoreOText.textContent = scoreO;
    }
}

function startTurnTimer() {
    clearTimeout(turnTimeout);
    clearInterval(timerInterval);

    let timeLeft = 10;
    const timerText = document.querySelector("#timerText");
    timerText.textContent = `${timeLeft} second left`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = `${timeLeft} second left`;

        if (timeLeft <= 0) {
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

function logMove(index) {
    turnCount++;
    historyLog.innerHTML += `Turn ${turnCount}: ${(currentPlayer == "X") ? 'O' : 'X' } → Cell ${index}<br>`;
}

// BOT

function botMove() {
  smartBotMove();
}

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

function executeBotMove(index) {
    setTimeout(() => {
        updateCell(cells[index], index);
        checkWinner();
    }, 500);
}

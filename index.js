let level = 0;
let timerId = 0;
let clock = 0;
let flagsPlanted = 0;
let firstClick = true;
let bestScores = [Infinity, Infinity, Infinity];
const GRID_DIMS = [[8, 10], [14, 18], [20, 24]];
const CELL_DIMS = [45, 35, 30];
const MINES_COUNT = [10, 40, 99];
const FONT_COLORS = ['white', 'blue', 'green', 'red', 'purple', 'black', 'maroon', 'gray', 'turquoise'];

// DOM objects
let levelMenu, fieldDiv, timerDiv, mineCounter;
let finalScreen, resultImg, scoreDiv, bestDiv, replayBtn;

// TRANS[[]]: the translation matrix to get the eight surrounding cells
const TRANS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

let mineField = [[], []];
let revealed = [[], []];
let flaggedCells = [];      // an array of flagged cells

document.addEventListener("DOMContentLoaded", function() {
    bestScores = initBestScores();
    levelMenu = document.querySelector('#level-menu');
    levelMenu.addEventListener('input', function(e) {
        startNewGame(e);
    }, false);
    timerDiv = document.querySelector('#timer');
    mineCounter = document.querySelector('#mine-count');
    fieldDiv = document.querySelector('#field');

    finalScreen = document.querySelector('#final-screen');
    resultImg = document.querySelector('#result-img');
    scoreDiv = document.querySelector('#score');
    bestDiv = document.querySelector('#best-score');
    replayBtn = document.querySelector('#replay');
    replayBtn.addEventListener('click', startNewGame);

    startNewGame();
    // showMines(mineField);
});

function startNewGame(event) {
    setLevel();
    generateFieldDOM();
    timerDiv.textContent = '000';
    mineCounter.textContent = MINES_COUNT[level];
    finalScreen.style.display = 'none';
}

function setLevel() {
    switch (levelMenu.value) {
        case 'easy':
            level = 0;
            break;
        case 'medium':
            level = 1;
            break;
        case 'hard':
            level = 2;
            break;
        default:
            level = 0
    }
    
    // set up a new game
    firstClick = true;
    flagsPlanted = 0;
    flaggedCells = [];
    clock = 0;
    if (timerId !== 0) {
        clearInterval(timerId);
    }
    // generate a new mine field
    revealed = resetRevealed(GRID_DIMS[level][1], GRID_DIMS[level][0]);
    mineField = generateMines(GRID_DIMS[level][1], GRID_DIMS[level][0], MINES_COUNT[level]);
    mineField = markMineSurroundings(mineField);
}

function resetRevealed(width, height) {
    let r = [];
    for (let i = 0; i < height; i++) {
        r[i] = Array(width).fill(false);
    }
    return r;
}

function generateMines(width, height, mc) {
    // width, height: dimensions of the mine field
    // mc: number of mines to be planted
    // return mf[[]]: the mine field
    const LAND = 0;
    const MINE = 1;

    let mf = [];
    for (let i = 0; i < height; i++) {
        mf[i] = Array(width).fill(LAND);
    }

    let counter = 0;
    while (counter < mc) {
        let index = Math.floor(Math.random() * height * width);
        if (mf[Math.floor(index / width)][index % width] === LAND) {
            mf[Math.floor(index / width)][index % width] = MINE;
            counter++;
        }
    }
    return mf;
}

function markMineSurroundings(mf) {
    // mf[[]]: a filled mine field
    // return target[[]]: mine field with mine surroundings marked
    let height = mf.length;
    let width = mf[0].length;

    let target = [];
    // target = JSON.parse(JSON.stringify(mf));
    for (let i = 0; i < height; i++) {
        target[i] = Array(width).fill(0);
    }

    // isValid: takes coordinates of a cell (row and column).
    // Returns true if the coordinates fall within the field and the cell is not a mine.
    function isValid(y, x) {
        return x >= 0 && x < width && y >= 0 && y < height && mf[y][x] === 0;
    }

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (mf[i][j] === 1) {
                target[i][j] = 9;
                for (let k = 0; k < TRANS.length; k++) {
                    if (isValid(i + TRANS[k][0], j + TRANS[k][1])) {
                        target[i + TRANS[k][0]][j + TRANS[k][1]]++;
                    }
                }
            }
        }
    }
    return target;
}

function generateFieldDOM() {
    // set CSS variables
    document.documentElement.style.setProperty('--rowNum', GRID_DIMS[level][0]);
    document.documentElement.style.setProperty('--colNum', GRID_DIMS[level][1]);
    document.documentElement.style.setProperty('--cellDim', `${CELL_DIMS[level]}px`);
    document.documentElement.style.setProperty('--gameWidth', `${CELL_DIMS[level] * GRID_DIMS[level][1]}px`);

    fieldDiv.innerHTML = '';
    for (let i = 0; i < GRID_DIMS[level][0]; i++) {
        for (let j = 0; j < GRID_DIMS[level][1]; j++) {
            let cellDiv = document.createElement("div");
            cellDiv.setAttribute('data-index-y', i);
            cellDiv.setAttribute('data-index-x', j);
            cellDiv.classList.add('cell');
            // cellDiv.classList.add(`size${level}`);
            if ((i + j) % 2 === 0) {
                cellDiv.classList.add('even');
            } else {
                cellDiv.classList.add('odd');
            }
            cellDiv.addEventListener('click', revealCell);
            cellDiv.addEventListener('contextmenu', flagCell, false);
            
            fieldDiv.append(cellDiv);
        }
    }
}

function updateClock() {
    clock++;
    timerDiv.textContent = ('00' + (clock)).slice(-3);
}

function revealCell(e) {
    if (firstClick) {
        firstClick = false;
        timerId = setInterval(updateClock, 1000);
    }
    let x = Number(this.dataset.indexX);
    let y = Number(this.dataset.indexY);
    if (revealed[y][x] === false && !this.classList.contains('flagged')) {
        if (!isMine(mineField, y, x)) {
            cascadeReveal(y, x);
        } else {
            // You lost!!!
            // alert('You lost!')
            clearInterval(timerId);
            // TODO: reveal mines
            resultImg.setAttribute('src', './icons/win_screen.png');
            scoreDiv.textContent = '— — —';
            bestDiv.textContent = bestScores[level] === Infinity ? '— — —' : ('00' + (bestScores[level])).slice(-3);
            finalScreen.style.display = 'block';            
        }
    }
}

function revealMines() {
    // reveal mines after lost
}

function cascadeReveal(y, x) {
    revealed[y][x] = true;
    let cell = document.querySelector(`[data-index-y='${y}'][data-index-x='${x}']`)
    cell.classList.add('revealed');
    if (mineField[y][x] > 0) {
        cell.textContent = mineField[y][x];
        if (mineField[y][x] > 1) {
            cell.classList.add(FONT_COLORS[mineField[y][x]]);
        }
    } else {
        for (let i = 0; i < TRANS.length; i++) {
            if (isExpandable(y + TRANS[i][0], x + TRANS[i][1])) {
                cascadeReveal(y + TRANS[i][0], x + TRANS[i][1]);
            }
        }
    }

    // isExpandable(): takes coordinates of a cell (row and column).
    // Returns true if the coordinates fall within the field and the cell is neither revealed nor a mine.
    function isExpandable(y, x) {
        return x >= 0 && x < GRID_DIMS[level][1] && y >= 0 && y < GRID_DIMS[level][0] && !revealed[y][x] && !isMine(mineField, y, x);
    }
}

function flagCell(e) {
    e.preventDefault();

    let x = Number(this.dataset.indexX);
    let y = Number(this.dataset.indexY);

    if (revealed[y][x] === false) {
        //let mineCounter = document.querySelector('#mine-count');
        if (this.classList.contains('flagged')) {
            this.classList.remove('flagged');
            flagsPlanted--;
            flaggedCells.splice(flaggedCells.findIndex(c => c[0] === y && c[1] === x),1);
            mineCounter.textContent = MINES_COUNT[level] - flagsPlanted;
        } else {
            this.classList.add('flagged');
            flagsPlanted++;
            flaggedCells.push([y, x]);
            mineCounter.textContent = MINES_COUNT[level] - flagsPlanted;
            if (checkVictory()) {
                // You won!!!
                clearInterval(timerId);
                resultImg.setAttribute('src', './icons/win_screen.png');
                scoreDiv.textContent = ('00' + (clock)).slice(-3);
                if (clock < bestScores[level]) {
                    bestScores[level] = clock;
                    localStorage.setItem('minesweeperBestScores', JSON.stringify(bestScores));
                }
                bestDiv.textContent = ('00' + (bestScores[level])).slice(-3);
                finalScreen.style.display = 'block';
            }
        }
    }
    // should return false to prevent the default context menu
    return false;
}

function checkVictory() {
    if (flagsPlanted === MINES_COUNT[level]) {
        // check if all the coordinates stored in flaggedCells represent cell with mines
        return flaggedCells.every(e => mineField[e[0]][e[1]] === 9)
    }
    return false;
}

function isMine(mf, y, x) {
    return mf[y][x] === 9 ? true : false;
}

// this function shows the values of all the cells. Used for debugging.
function showMines(mf) {
    const cells = document.querySelectorAll('div.cell');
    for (let i = 0; i < mf.length; i++) {
        for (let j = 0; j < mf[0].length; j++) {
            cells[i * mf[0].length + j].textContent = isMine(mf, i, j) ? 'X' : mf[i][j];
        }
    }
}

function initBestScores() {
    const scoreFromLocalStorage = JSON.parse(localStorage.getItem('minesweeperBestScores'));
    if (Array.isArray(scoreFromLocalStorage)) {
        return scoreFromLocalStorage;
    } else {
        return [Infinity, Infinity, Infinity];
    }
}


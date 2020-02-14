let level = 0;
let timerId = 0;
let clock = 0;
let flagsPlanted = 0;
let firstClick = true;
const GRID_DIMS = [[8, 10], [14, 18], [20, 24]];
const CELL_DIMS = [45, 30, 30];
const MINES_COUNT = [10, 40, 99];

// TRANS[[]]: the translation matrix to get the eight surrounding cells
const TRANS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

let mineField = [[], []];
let revealed = [[], []];

document.addEventListener("DOMContentLoaded", function() {
    setLevel();
    generateFieldDOM();
    // showMines(mineField);
});

function setLevel() {
    switch (document.querySelector('#level').value) {
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

    document.querySelector('#game').classList.add(`size${level}`);
    const fieldDiv = document.querySelector('#field');
    for (let i = 0; i < GRID_DIMS[level][0]; i++) {
        for (let j = 0; j < GRID_DIMS[level][1]; j++) {
            let cellDiv = document.createElement("div");
            cellDiv.setAttribute('data-index-y', i);
            cellDiv.setAttribute('data-index-x', j);
            cellDiv.classList.add('cell');
            cellDiv.classList.add(`size${level}`);
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
    document.querySelector('#timer').textContent = ('00' + (clock)).slice(-3);
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
            alert('You lose!')
        }
    }
}

function cascadeReveal(y, x) {
    revealed[y][x] = true;
    let cell = document.querySelector(`[data-index-y='${y}'][data-index-x='${x}']`)
    cell.classList.add('revealed');
    if (mineField[y][x] > 0) {
        cell.textContent = mineField[y][x];
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
        let mineCounter = document.querySelector('#mine-count');
        console.log(mineCounter)
        if (this.classList.contains('flagged')) {
            this.classList.remove('flagged');
            flagsPlanted--;
            mineCounter.textContent = MINES_COUNT[level] - flagsPlanted;
        } else {
            this.classList.add('flagged');
            flagsPlanted++;
            mineCounter.textContent = MINES_COUNT[level] - flagsPlanted;
            checkVictory();
        }
    }
    
    return false;
}

function checkVictory() {
    // check victory after adding a new flag
}

function isMine(mf, y, x) {
    return mf[y][x] === 9 ? true : false;
}

// this function shows the values of all the cells. Used for debugging.
function showMines(mf) {
    const fieldDiv = document.querySelector('#field');
    const cells = document.querySelectorAll('div.cell');
    for (let i = 0; i < mf.length; i++) {
        for (let j = 0; j < mf[0].length; j++) {
            cells[i * mf[0].length + j].textContent = isMine(mf, i, j) ? 'X' : mf[i][j];
        }
    }
}
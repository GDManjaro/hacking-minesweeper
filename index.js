let level = 0;
const GRID_DIMS = [[8, 10], [14, 18], [20, 24]];
const CELL_DIMS = [30, 30, 30];
const MINES_COUNT = [10, 40, 99];
let mineField = [[], []];

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
    // generate a new mine field
    mineField = generateMines(GRID_DIMS[level][1], GRID_DIMS[level][0], MINES_COUNT[level]);
    mineField = markMineSurroundings(mineField);
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

    // trans: the translation matrix to get the eight surrounding cells
    const trans = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    
    let target = [];
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
                for (let k = 0; k < trans.length; k++) {
                    if (isValid(i + trans[k][0], j + trans[k][1])) {
                        target[i + trans[k][0]][j + trans[k][1]]++;
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
    document.documentElement.style.setProperty('--gameWidth', '300px');

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
                cellDiv.textContent = 'x';
            } else {
                cellDiv.classList.add('odd');
                cellDiv.textContent = 'o';
            }
            fieldDiv.append(cellDiv);
        }
        
    }
}

function showMines(mf) {
    const fieldDiv = document.querySelector('#field');
    const cells = document.querySelectorAll('div.cell');
    for (let i = 0; i < mf.length; i++) {
        for (let j = 0; j < mf[0].length; j++) {
            cells[i * mf[0].length + j].textContent = mf[i][j] === 9 ? 'X' : mf[i][j];
        }
    }
}
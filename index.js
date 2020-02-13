let level = 0;
const dims = [[8, 10], [14, 18], [20, 24]];
const cellDims = [10];
const mines = [10, 40, 99];

document.addEventListener("DOMContentLoaded", function() {
    setLevel();
    generateField();
});



mineSweep([
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 0, 0],
]) // => [[1, 9, 2, 1], [2, 3, 9, 2], [3, 9, 4, 9], [9, 9, 3, 1]]

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
}

function generateField() {
    document.querySelector('#game').classList.add(`size${level}`);
    const fieldDiv = document.querySelector('#field');
    for (let i = 0; i < dims[level][0]; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.classList.add('row');
        for (let j = 0; j < dims[level][1]; j++) {
            let cellSpan = document.createElement("span");
            cellSpan.classList.add('field');
            cellSpan.classList.add(`size${level}`);
            if ((i + j) % 2 === 0) {
                cellSpan.classList.add('even');
                cellSpan.textContent = 'x';
            } else {
                cellSpan.classList.add('odd');
                cellSpan.textContent = 'o';
            }
            rowDiv.append(cellSpan);
        }
        fieldDiv.append(rowDiv);
    }
}

function mineSweeper(src) {
    let target = [];
    const trans = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let height = src.length;
    let width = src[0].length;
    
    for (let i = 0; i < height; i++) {
        target[i] = src[i].slice();
    }
    
    function isValid(y, x) {
        return x >= 0 && x < width && y >= 0 && y < height && src[y][x] === 0;
    }

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (src[i][j] === 1) {
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
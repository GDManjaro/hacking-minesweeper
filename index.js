mineSweep([
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 0, 0],
]) // => [[1, 9, 2, 1], [2, 3, 9, 2], [3, 9, 4, 9], [9, 9, 3, 1]]

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
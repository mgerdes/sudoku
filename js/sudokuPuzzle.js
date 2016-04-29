var app = app || { };

app.SudokuPuzzle = function() {
    var board = new Array(9);
    for (var i = 0; i < 9; i++) {
        board[i] = new Array(9);
    }
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            board[row][col] = null;
        }
    }

    var isValidMove = function(row, col, num) {
        // Check if there is already a piece there
        if (board[row][col]) {
            return false;
        }

        // Check the row and col for the number
        for (var i = 0; i < 9; i++) {
            if (board[row][i] == num || board[i][col] == num) {
                return false;
            }
        }

        // Check the nonet for the number
        var nonetRow = Math.floor(row / 3) * 3;
        var nonetCol = Math.floor(col / 3) * 3;
        for (var row = nonetRow; row < nonetRow + 3; row++) {
            for (var col = nonetCol; col < nonetCol + 3; col++) {
                if (board[row][col] == num) {
                    return false;
                }
            }
        }

        return true;
    };

    this.undoMove = function(row, col) {
        board[row][col] = null;
    };

    this.makeMove = function(row, col, num) {
        if (isValidMove(row, col, num)) {
            board[row][col] = num;
            return true;
        }
        return false;
    };

    this.getNumber = function(row, col) {
        return board[row][col];
    };

    this.printBoard = function() {
        for (var row = 0; row < 9; row++) {
            var s = "";
            for (var col = 0; col < 9; col++) {
                s += board[row][col] + " ";
            }
            console.log(s);
        }
    };
};

var app = app || { };

app.SudokuSolver = function(puzzle) {
    var solvePuzzleHelper = function(row, col) {
        if (row == 9) {
            return true;
        }

        if (puzzle.getNumber(row, col)) {
            var nextCol = (col + 1) % 9;
            var nextRow = nextCol == 0 ? row + 1 : row;
            return solvePuzzleHelper(nextRow, nextCol);
        }

        for (var num = 1; num < 10; num++) {
            if (puzzle.makeMove(row, col, num)) {
                var nextCol = (col + 1) % 9;
                var nextRow = nextCol == 0 ? row + 1 : row;

                if (solvePuzzleHelper(nextRow, nextCol)) {
                    return true;
                }

                puzzle.undoMove(row, col);
            }
        }

        return false;
    };

    this.solvePuzzle = function() {
        return solvePuzzleHelper(0, 0);
    };
};

var app = app || { };

app.initRenderer = function() {
    app.renderer = new THREE.WebGLRenderer({alpha: true});
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);
};

app.initCamera = function() {
    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    app.camera.position.set(0.0, 0.0, 8.0);
    app.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
};

app.initScene = function() {
    app.scene = new THREE.Scene();
};

app.initSudokuBoard = function() {
    app.sudokuBoard = new app.SudokuBoard();
    app.scene.add(app.sudokuBoard.object);
};

app.init = function() {
    app.initRenderer();
    app.initCamera();
    app.initScene();
    app.initSudokuBoard();

    document.onkeydown = function (event) {
        if (event.keyCode == 37) {
            // left
            app.camera.position.x += 0.1; 
            app.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        }
        else if (event.keyCode == 38) {
            // up 
            app.camera.position.y += 0.1; 
            app.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        }
        else if (event.keyCode == 39) {
            // right
            app.camera.position.x -= 0.1; 
            app.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        }
        else if (event.keyCode == 40) {
            // down
            app.camera.position.y -= 0.1; 
            app.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        }
    };
};

app.lastTime = Date.now();

app.update = function(dt) {
    app.sudokuBoard.update(dt);
};

app.render = function() {
    requestAnimationFrame(app.render);

    var dt = Date.now() - app.lastTime;
    app.lastTime = Date.now();
    app.update(dt / 1000.0);

    app.renderer.render(app.scene, app.camera);
};

app.init();
app.render();

var puzzle = new app.SudokuPuzzle(); 

puzzle.makeMove(0,0,5);
puzzle.makeMove(0,1,3);
puzzle.makeMove(0,4,7);

puzzle.makeMove(1,0,6);
puzzle.makeMove(1,3,1);
puzzle.makeMove(1,4,9);
puzzle.makeMove(1,5,5);

puzzle.makeMove(2,1,9);
puzzle.makeMove(2,2,8);
puzzle.makeMove(2,7,6);

puzzle.makeMove(3,0,8);
puzzle.makeMove(3,4,6);
puzzle.makeMove(3,8,3);

puzzle.makeMove(4,0,4);
puzzle.makeMove(4,3,8);
puzzle.makeMove(4,5,3);
puzzle.makeMove(4,8,1);

puzzle.makeMove(5,0,7);
puzzle.makeMove(5,4,2);
puzzle.makeMove(5,8,6);

puzzle.makeMove(6,1,6);
puzzle.makeMove(6,6,2);
puzzle.makeMove(6,7,8);

puzzle.makeMove(7,3,4);
puzzle.makeMove(7,4,1);
puzzle.makeMove(7,5,9);
puzzle.makeMove(7,8,5);

puzzle.makeMove(8,4,8);
puzzle.makeMove(8,7,7);
puzzle.makeMove(8,8,9);


var solver = new app.SudokuSolver(puzzle);
solver.solvePuzzle();

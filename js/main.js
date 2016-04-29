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
};

app.update = function(dt) {
    app.sudokuBoard.update(dt);
};

app.render = function() {
    requestAnimationFrame(app.render);
    app.update(1/60);
    app.renderer.render(app.scene, app.camera);
};

app.init();
app.render();

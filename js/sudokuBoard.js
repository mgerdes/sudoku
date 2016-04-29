var app = app || { };

app.SudokuBoard = function() {
    /*
     * Constants
     */ 
    var STATES = {
        START: 0,
        SET_UP_BOARD: 1,
        WAIT_FOR_INPUT: 2
    };

    var TIME_TO_SET_UP_BOARD = 2.0;

    var TIME_TO_MOVE_PIECE = 2.0;

    var NUM_OF_PARTICLES_FOR_BOARD = 60000;

    var NUM_OF_PARTICLES_FOR_BOX = 1000;

    /*
     * Init State
     */
    var state = STATES.START;
    var currentTime = 0;

    /*
     * Board Array
     */
    var board = new Array(9);
    for (var row = 0; row < 9; row++) {
        board[row] = new Array(9);
        for (var col = 0; col < 9; col++) {
            board[row][col] = null;
        }
    }

    /*
     * Init Boxes Particles
     */
    var boxesParticles = new Array(81);
    var boxesPoints = function() {
        var pointsGeometry = new THREE.Geometry();
        var pointsMaterial = new THREE.PointsMaterial({size: 0.015, vertexColors: true});

        for (var i = 0; i < 81; i++) {
            boxesParticles[i] = [];

            var row = Math.floor(i / 9);
            var col = Math.floor(i % 9); 

            var x = -5 + col * 10.0 / 9.0; 
            var y = -5 + row * 10.0 / 9.0;

            var box = new app.ParticleBox(x + 0.2, y + 0.2, 0.0, 10.0 / 9.0 - 0.4, 10.0 / 9.0 - 0.4, 0.5);

            for (var j = 0; j < NUM_OF_PARTICLES_FOR_BOX; j++) {
                boxesParticles[i].push(new app.Particle(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Color(0x00ff00), j));

                boxesParticles[i][j].color.setHex(0xffffff);
                boxesParticles[i][j].positionInBoardBox = box.randomPointOnSurface(6);

                pointsGeometry.vertices[i * NUM_OF_PARTICLES_FOR_BOX + j] = boxesParticles[i][j].position;  
                pointsGeometry.colors[i * NUM_OF_PARTICLES_FOR_BOX + j] = boxesParticles[i][j].color;
            }
        }

        return new THREE.Points(pointsGeometry, pointsMaterial);
    }();

    /*
     * Init Boarder Particles
     */
    var boarderParticles = [];
    var boarderPoints = function() {
        var boarders = [];
        boarders.push(new app.ParticleBox(-5.0, -5.0, 0.0, 10.0, 10.0, 0.1));

        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var x = -5 + col * 10.0 / 3.0; 
                var y = -5 + row * 10.0 / 3.0;

                boarders.push(new app.ParticleBox(x, y, 0.0, 10.0 / 3.0, 10.0 / 3.0, 0.1));
            }
        }

        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var x = -5 + col * 10.0 / 3.0; 
                var y = -5 + row * 10.0 / 3.0;

                for (var innerRow = 0; innerRow < 3; innerRow++) {
                    for (var innerCol = 0; innerCol < 3; innerCol++) {
                        var innerX = x + innerCol * 10.0 / 9.0; 
                        var innerY = y + innerRow * 10.0 / 9.0; 

                        boarders.push(new app.ParticleBox(innerX, innerY, 0.0, 10.0 / 9.0, 10.0 / 9.0, 0.1));
                    }
                }
            }
        }

        var particlesGeometry = new THREE.Geometry();
        var particlesMaterial = new THREE.PointsMaterial({size: 0.015, vertexColors: true});

        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            boarderParticles.push(new app.Particle(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Color(0x00ff00), i));

            if (i < NUM_OF_PARTICLES_FOR_BOARD * 0.2) {
                boarderParticles[i].color.setHex(0x28784D);
                boarderParticles[i].positionInBoardBox = boarders[0].randomPointOnSurface(4);
            }
            else if (i < NUM_OF_PARTICLES_FOR_BOARD * 0.4) {
                boarderParticles[i].color.setHex(0xAA4339);
                boarderParticles[i].positionInBoardBox = boarders[1 + Math.floor(Math.random() * 9)].randomPointOnSurface(4);
            } 
            else {
                boarderParticles[i].color.setHex(0x452F74);
                boarderParticles[i].positionInBoardBox = boarders[10 + Math.floor(Math.random() * 81)].randomPointOnSurface(4);
            }

            particlesGeometry.vertices[i] = boarderParticles[i].position;  
            particlesGeometry.colors[i] = boarderParticles[i].color;
        }

        return new THREE.Points(particlesGeometry, particlesMaterial);
    }();

    /*
     * Init THREEJS Object
     */
    this.object = new THREE.Object3D();
    this.object.add(boarderPoints);
    this.object.add(boxesPoints);

    /*
     * Private Functions
     */
    var updateStartState = function(dt) {
        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            var ax = 10.0 * (Math.random() - 0.5); 
            var ay = 10.0 * (Math.random() - 0.5); 
            var az = 10.0 * (Math.random() - 0.5); 

            var a = new THREE.Vector3(ax, ay, az);
            var p = boarderParticles[i].positionInBoardBox;

            boarderParticles[i].setToMoveWithAcceleration(a, p, TIME_TO_SET_UP_BOARD);
        }

        state = STATES.SET_UP_BOARD;
        currentTime = 0;
    };

    var updateSetUpBoardState = function(dt) {
        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            var v = boarderParticles[i].getCurrentVelocity();
            var p = boarderParticles[i].positionInBoardBox;

            // Lol hack to get particles to move slower towards end
            boarderParticles[i].setToMoveWithVelocity(v, p, 1.0);

            boarderParticles[i].update(dt);
        }

        if (currentTime > TIME_TO_SET_UP_BOARD + 1.2) {
            state = STATES.WAIT_FOR_INPUT;

            for (var i = 0; i < 81; i++) {
                for (var j = 0; j < NUM_OF_PARTICLES_FOR_BOX; j++) {
                    var ax = (Math.random() - 0.5);
                    var ay = (Math.random() - 0.5);
                    var az = (Math.random() - 0.5);

                    var a = new THREE.Vector3(ax, ay, az);
                    var p = boxesParticles[i][j].positionInBoardBox;

                    boxesParticles[i][j].setToMoveWithAcceleration(a, p, TIME_TO_MOVE_PIECE);
                }
            }
        }

        boarderPoints.geometry.verticesNeedUpdate = true;
    };

    var updateWaitForInputState = function(dt) {
        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            var ax = (Math.random() - 0.5);
            var ay = (Math.random() - 0.5);
            var az = 0.0 * (Math.random() - 0.5);

            var a = new THREE.Vector3(ax, ay, az);
            var p = boarderParticles[i].positionInBoardBox;

            boarderParticles[i].setToMoveWithAcceleration(a, p, 1.0);
            boarderParticles[i].update(dt);
        }

        for (var i = 0; i < 81; i++) {
            for (var j = 0; j < NUM_OF_PARTICLES_FOR_BOX; j++) {
                if (boxesParticles[i][j].t > boxesParticles[i][j].timeToFinish - 0.5) {
                    var v = boxesParticles[i][j].getCurrentVelocity();
                    var p = boxesParticles[i][j].positionInBoardBox;

                    // Lol hack to get particles to move slower towards end
                    boxesParticles[i][j].setToMoveWithVelocity(v, p, 1.0);
                }
                boxesParticles[i][j].update(dt); 
            }
        }

        boarderPoints.geometry.verticesNeedUpdate = true;
        boxesPoints.geometry.verticesNeedUpdate = true;
    };

    /*
     * Public Update Function
     */
    this.update = function(dt) {
        currentTime += dt;

        if (state == STATES.START) {
            updateStartState(dt);
        }
        else if (state == STATES.SET_UP_BOARD) {
            updateSetUpBoardState(dt);
        }
        else if (state == STATES.WAIT_FOR_INPUT) {
            updateWaitForInputState(dt);       
        }
    };
};

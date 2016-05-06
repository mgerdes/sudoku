var app = app || { };

app.SudokuBoard = function(puzzle) {
    /*
     * Constants
     */ 
    var STATES = {
        START: 0,
        SET_UP_BOARD: 1,
        SETTLE_IN_BOARD: 2
    };

    var TIME_TO_SET_UP_BOARD = 2.0;

    var TIME_TO_SETTLE_IN_BOARD = 5.0;

    var TIME_TO_MOVE_PIECE = 2.0;

    var ACTIONS_PER_SECOND = 1.0;

    var TIME_BETWEEN_CONSECUTIVE_ACTIONS = 0.2;

    var NUM_OF_PARTICLES_FOR_BOARD = 20000

    var NUM_OF_PARTICLES_FOR_NUMBER = 500;

    /*
     * Init State
     */
    var state = STATES.START;
    var currentTime = 0;

    /*
     * Log Of Steps To Solve Puzzle
     */
    var log = [];
    var logStep = 0;

    var getPositionForParticle = function(i, num) {
        var row = Math.floor(i / 9);
        var col = Math.floor(i % 9); 

        // Get a random vertex in the numbers geometry
        var indexInGeometry = Math.floor(Math.random() * numberGeometries[num].length);

        var position = new THREE.Vector3();
        position.x = numberGeometries[num][indexInGeometry].x;
        position.y = numberGeometries[num][indexInGeometry].y;
        position.z = numberGeometries[num][indexInGeometry].z;

        // Translate position to be placed on the board properly
        position.x += -5 + col * 10.0 / 9.0 + 0.25; 
        position.y += 3.9 - row * 10.0 / 9.0 + 0.25;

        return position;
    };

    /*
     * Init Number Particles
     */
    var isNumberMovingTowardsDest = new Array(81);
    var numberParticles = new Array(81);
    var numberPoints = function() {
        var pointsGeometry = new THREE.Geometry();
        var pointsMaterial = new THREE.PointsMaterial({size: 0.020, vertexColors: true});

        for (var i = 0; i < 81; i++) {
            isNumberMovingTowardsDest[i] = false;
            numberParticles[i] = new Array(NUM_OF_PARTICLES_FOR_NUMBER);

            // Init each of the particles
            for (var j = 0; j < NUM_OF_PARTICLES_FOR_NUMBER; j++) {
                numberParticles[i][j] = new app.Particle(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Color(0x00ff00), j);
                numberParticles[i][j].color.setHex(0xffffff);

                var row = Math.floor(i / 9);
                var col = Math.floor(i % 9); 
                var num = puzzle.getNumber(row, col);

                // Move the particle to it's initial destination 
                if (num) {
                    var p = getPositionForParticle(i, num);
                    numberParticles[i][j].setToMoveWithRandomAcceleration(10.0, p, TIME_TO_SET_UP_BOARD);
                }

                // Attach the Geometries vertex to the particle
                pointsGeometry.vertices[i * NUM_OF_PARTICLES_FOR_NUMBER + j] = numberParticles[i][j].position;  
                pointsGeometry.colors[i * NUM_OF_PARTICLES_FOR_NUMBER + j] = numberParticles[i][j].color;
            }
        }

        return new THREE.Points(pointsGeometry, pointsMaterial);
    }();

    /*
     * Init Boarder Particles
     */
    var boarderParticles = new Array(NUM_OF_PARTICLES_FOR_BOARD);
    var boarderPoints = function() {
        // An array of each of the borders for the board
        var boarders = [];

        // The main outer boarder
        boarders.push(new app.ParticleBox(-5.0, -5.0, 0.0, 10.0, 10.0, 0.1));

        // Create 9 of the inner boarders (for the nonets) 
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var x = -5 + col * 10.0 / 3.0; 
                var y = -5 + row * 10.0 / 3.0;

                boarders.push(new app.ParticleBox(x, y, 0.0, 10.0 / 3.0, 10.0 / 3.0, 0.1));
            }
        }

        // Create 81 of the smallest boarders (for each slot in board)
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
            boarderParticles[i] = new app.Particle(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Color(0x00ff00), i);

            // Figure out the position of the particle.
            // First 20% of particles go into outer boarder, 
            // next 20% go into the nonet boarders, 
            // next 60% go into the smaller boarders.
            var p;
            if (i < NUM_OF_PARTICLES_FOR_BOARD * 0.2) {
                // First 20%
                boarderParticles[i].color.setHex(0x28784D);
                p = boarders[0].randomPointOnSurface(4);
            }
            else if (i < NUM_OF_PARTICLES_FOR_BOARD * 0.4) {
                // Next 20%
                boarderParticles[i].color.setHex(0xAA4339);
                p = boarders[1 + Math.floor(Math.random() * 9)].randomPointOnSurface(4);
            } 
            else {
                // Next 60%
                boarderParticles[i].color.setHex(0x452F74);
                p = boarders[10 + Math.floor(Math.random() * 81)].randomPointOnSurface(4);
            }

            boarderParticles[i].setToMoveWithRandomAcceleration(10.0, p, TIME_TO_SET_UP_BOARD);

            // Attach the geometries vertex to the particle
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
    this.object.add(numberPoints);

    /*
     * Private Update Functions
     */
    var updateStartState = function(dt) {
        // Currently this state does nothing, just goes to next state.
        state = STATES.SET_UP_BOARD;
        currentTime = 0;
    };

    var updateSetUpBoardState = function(dt) {
        // Have each of the particles move slowly towards their targets.

        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            boarderParticles[i].setToMoveSlowlyTowardsTarget();
            boarderParticles[i].update(dt);
        }

        for (var i = 0; i < 81; i++) {
            for (var j = 0; j < NUM_OF_PARTICLES_FOR_NUMBER; j++) {
                numberParticles[i][j].setToMoveSlowlyTowardsTarget();
                numberParticles[i][j].update(dt);
            }
        }

        // A bit of a hack
        // Moving slowly towards target fudges with times so have to add a 1.2 time 
        // delta before switching states to make sure things have time to finish
        if (currentTime > TIME_TO_SET_UP_BOARD + 1.2) {
            state = STATES.SETTLE_IN_BOARD;
        }

        boarderPoints.geometry.verticesNeedUpdate = true;
        numberPoints.geometry.verticesNeedUpdate = true;
    };

    var updateSettleInBoardState = function(dt) {
        // Wiggleing the particles slowly moves them towards their target.
   
        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            boarderParticles[i].setToWiggle();
            boarderParticles[i].update(dt);
        }

        for (var i = 0; i < 81; i++) {
            for (var j = 0; j < NUM_OF_PARTICLES_FOR_NUMBER; j++) {
                numberParticles[i][j].setToWiggle();
                numberParticles[i][j].update(dt);
            }
        }

        if (currentTime > TIME_TO_SETTLE_IN_BOARD) {
            // Now that everything is settled in, solve the puzzle
            new app.SudokuSolver(puzzle).solvePuzzle(log);

            // Start moving the first piece that needs to be moved
            var i = log[0][1] * 9 + log[0][2];
            isNumberMovingTowardsDest[i] = true;
            for (var j = 0; j < NUM_OF_PARTICLES_FOR_NUMBER; j++) {
                var p = getPositionForParticle(i, log[0][3]);
                numberParticles[i][j].setToMoveWithRandomAcceleration(1.0, p, 1.0 / (1.0 * ACTIONS_PER_SECOND));
            }

            currentTime = 0;
            state = STATES.SOLVE_THE_PUZZLE;
        }

        boarderPoints.geometry.verticesNeedUpdate = true;
        numberPoints.geometry.verticesNeedUpdate = true;
    };

    var updateSolveThePuzzleState = function(dt) {
        // Wiggle each of the particles for the borders
        for (var i = 0; i < NUM_OF_PARTICLES_FOR_BOARD; i++) {
            boarderParticles[i].setToWiggle();
            boarderParticles[i].update(dt);
        }

        // Wiggle each of the particles for the numbers
        // except for the ones that are currently moving
        var i = log[logStep][1] * 9 + log[logStep][2];
        for (var j = 0; j < 81; j++) {
            for (var k = 0; k < NUM_OF_PARTICLES_FOR_NUMBER; k++) {
                if (!isNumberMovingTowardsDest[j]) {
                    numberParticles[j][k].setToWiggle();
                }
                else {
                    if (numberParticles[j][k].t > numberParticles[j][k].timeToFinish) {
                        // Set the current steps particles to no longer be moving.
                        isNumberMovingTowardsDest[j] = false;
                        var p = numberParticles[j][k].targetPosition;
                        numberParticles[j][k].position.set(p.x, p.y, p.z);
                        numberParticles[j][k].setNotMoving();
                    }
                }
                numberParticles[j][k].update(dt);
            }
        }

        boarderPoints.geometry.verticesNeedUpdate = true;
        numberPoints.geometry.verticesNeedUpdate = true;

        if (logStep >= log.length - 1) {
            return;
        }

        var timeTillNextAction = 1.0 / ACTIONS_PER_SECOND;
        if (log[logStep][0] == log[logStep+1][0]) {
            timeTillNextAction = TIME_BETWEEN_CONSECUTIVE_ACTIONS;
        }

        if (currentTime > timeTillNextAction) {
            console.log(logStep / log.length);
            logStep++;
            currentTime = 0;

            // Init the particles for the next log step.
            i = log[logStep][1] * 9 + log[logStep][2];
            isNumberMovingTowardsDest[i] = true;
            for (var j = 0; j < NUM_OF_PARTICLES_FOR_NUMBER; j++) {
                // Check if a new number is being added or if a number is being removed
                if (log[logStep][0] == 0) {
                    // Number being added
                    var p = getPositionForParticle(i, log[logStep][3]);
                    numberParticles[i][j].setToMoveWithRandomAcceleration(1.0, p, 1.0 / (1.0 * ACTIONS_PER_SECOND));
                }
                else if (log[logStep][0] == 1) {
                    // Number being removed
                    var p = new THREE.Vector3(0.0, 0.0, 0.0);
                    numberParticles[i][j].setToMoveWithRandomAcceleration(1.0, p, 1.0 / (1.0 * ACTIONS_PER_SECOND));
                }
            }
        }
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
        else if (state == STATES.SETTLE_IN_BOARD) {
            updateSettleInBoardState(dt);       
        }
        else if (state == STATES.SOLVE_THE_PUZZLE) {
            updateSolveThePuzzleState(dt);
        }
    };
};

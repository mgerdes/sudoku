var app = app || { };

app.SudokuBoard = function() {
    /*
     * Constants
     */ 
    var STATES = {
        START: 0,
        SET_UP_BOARD: 1
    };

    var TIME_TO_SET_UP_BOARD = 2.0;

    var NUM_OF_PARTICLES = 60000;

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
     * Init Particles
     */
    var particles = [];

    var points = function() {
        var boardBoxes = [];
        var boardBoxProbability = [];

        boardBoxes.push(new app.ParticleBox(-5.0, -5.0, 0.0, 10.0, 10.0, 0.1));

        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var x = -5 + col * 10.0 / 3.0; 
                var y = -5 + row * 10.0 / 3.0;

                boardBoxes.push(new app.ParticleBox(x, y, 0.0, 10.0 / 3.0, 10.0 / 3.0, 0.1));

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

                        boardBoxes.push(new app.ParticleBox(innerX, innerY, 0.0, 10.0 / 9.0, 10.0 / 9.0, 0.1));
                    }
                }
            }
        }

        var particlesGeometry = new THREE.Geometry();
        var particlesMaterial = new THREE.PointsMaterial({size: 0.015, vertexColors: true});

        for (var i = 0; i < NUM_OF_PARTICLES; i++) {
            particles.push(new app.Particle(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Color(0x00ff00), i));

            if (i < NUM_OF_PARTICLES * 0.2) {
                particles[i].color.setHex(0x28784D);
                particles[i].positionInBoardBox = boardBoxes[0].randomPointOnSurface();
            }
            else if (i < NUM_OF_PARTICLES * 0.4) {
                particles[i].color.setHex(0xAA4339);
                particles[i].positionInBoardBox = boardBoxes[1 + Math.floor(Math.random() * 9)].randomPointOnSurface();
            } 
            else {
                particles[i].color.setHex(0x452F74);
                particles[i].positionInBoardBox = boardBoxes[10 + Math.floor(Math.random() * 81)].randomPointOnSurface();
            }

            particlesGeometry.vertices[i] = particles[i].position;  
            particlesGeometry.colors[i] = particles[i].color;
        }

        return new THREE.Points(particlesGeometry, particlesMaterial);
    }();

    /*
     * Init THREEJS Object
     */
    this.object = new THREE.Object3D();
    this.object.add(points);

    /*
     * Private Functions
     */
    var updateStartState = function(dt) {
        for (var i = 0; i < NUM_OF_PARTICLES; i++) {
            var ax = 5 * (Math.random() - 0.5);
            var ay = 5 * (Math.random() - 0.5);
            var az = 5 * (Math.random() - 0.5);

            var a = new THREE.Vector3(ax, ay, az);
            var p = particles[i].positionInBoardBox;

            particles[i].setToMoveWithAcceleration(a, p, TIME_TO_SET_UP_BOARD);
        }

        state = STATES.SET_UP_BOARD;
        currentTime = 0;
    };

    var updateSetUpBoardState = function(dt) {
        for (var i = 0; i < NUM_OF_PARTICLES; i++) {
            if (currentTime <= TIME_TO_SET_UP_BOARD) {
                particles[i].update(dt);
            }
            else {
                var p = particles[i].positionInBoardBox;
                particles[i].position.set(p.x, p.y, p.z);
            }
        }
        points.geometry.verticesNeedUpdate = true;

        if (currentTime > TIME_TO_SET_UP_BOARD) {
            state = STATES.WAIT_FOR_INPUT;    
            currentTime = 0;
        }
    };

    var updateWaitForInputState = function(dt) {
        for (var i = 0; i < NUM_OF_PARTICLES; i++) {
            var ax = (Math.random() - 0.5);
            var ay = (Math.random() - 0.5);
            var az = (Math.random() - 0.5);

            var a = new THREE.Vector3(ax, ay, az);
            var p = particles[i].positionInBoardBox;

            particles[i].setToMoveWithAcceleration(a, p, 1.0);
            particles[i].update(dt);
        }

        points.geometry.verticesNeedUpdate = true;
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

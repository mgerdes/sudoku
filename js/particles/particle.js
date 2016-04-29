var app = app || { };

app.Particle = function(position, color, i) {
    this.position = position;
    this.color = color;
    this.i = i;
    this.startColor = color.clone();
    this.endColor = color.clone();
    this.a0 = new THREE.Vector3(0, 0, 0);
    this.v0 = new THREE.Vector3(0, 0, 0);
    this.p0 = position.clone();
    this.t = 0;
    this.timeToFinish = 0;
    this.state = 0;
    this.finalPos = new THREE.Vector3(0, 0, 0);
};

app.Particle.prototype.setToMoveWithAcceleration = function(a, p, t) {
    this.p0.x = this.position.x;
    this.p0.y = this.position.y;
    this.p0.z = this.position.z;

    this.finalPos.x = p.x;
    this.finalPos.y = p.y;
    this.finalPos.z = p.z;

    this.v0.x = (p.x - this.position.x - (1/2)*a.x*t*t) / t;
    this.v0.y = (p.y - this.position.y - (1/2)*a.y*t*t) / t;
    this.v0.z = (p.z - this.position.z - (1/2)*a.z*t*t) / t;

    this.a0.x = a.x;
    this.a0.y = a.y;
    this.a0.z = a.z;

    this.timeToFinish = t;
    this.t = 0;
};

app.Particle.prototype.setToMoveWithVelocity = function(v, p, t) {
    this.p0.x = this.position.x;
    this.p0.y = this.position.y;
    this.p0.z = this.position.z;

    this.finalPos.x = p.x;
    this.finalPos.y = p.y;
    this.finalPos.z = p.z;

    this.v0.x = v.x;
    this.v0.y = v.y;
    this.v0.z = v.z;

    this.a0.x = (p.x - this.position.x - v.x*t) / (1/2*t*t);
    this.a0.y = (p.y - this.position.y - v.y*t) / (1/2*t*t);
    this.a0.z = (p.z - this.position.z - v.z*t) / (1/2*t*t);

    this.timeToFinish = t;
    this.t = 0;
};

app.Particle.prototype.setNotMoving = function() {
    this.p0.x = this.position.x;
    this.p0.y = this.position.y;
    this.p0.z = this.position.z;

    this.v0.x = 0;
    this.v0.y = 0;
    this.v0.z = 0;

    this.a0.x = 0;
    this.a0.y = 0;
    this.a0.z = 0;

    this.timeToFinish = 0;
    this.t = 0;
};

app.Particle.prototype.getCurrentVelocity = function() {
    return this.a0.multiplyScalar(this.t).add(this.v0);
};

app.Particle.prototype.updatePosition = function() {
    this.position.x = (1/2)*this.a0.x*this.t*this.t + this.v0.x*this.t + this.p0.x;
    this.position.y = (1/2)*this.a0.y*this.t*this.t + this.v0.y*this.t + this.p0.y;
    this.position.z = (1/2)*this.a0.z*this.t*this.t + this.v0.z*this.t + this.p0.z;
};

app.Particle.prototype.updateColor = function() {
    if (this.timeToFinish == 0) {
        return; 
    }
    var c = this.startColor.clone().lerp(this.endColor, this.t / this.timeToFinish);
    this.color.r = c.r;
    this.color.g = c.g;
    this.color.b = c.b;
};

app.Particle.prototype.update = function(dt) {
    this.t += dt;
    this.updatePosition();
    this.updateColor();
};

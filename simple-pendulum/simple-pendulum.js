var canvas;

var ppm = 10; // pixel per meter
var dT = 0.001; // sampling interval [sec]
var g = 9.8*ppm*ppm; // gravity [px/sec/sec]
var l = 100; // length of pendulum

var p0; // position of origin
var p; // [x, y]: position in Cartesian coordinate system
var state; // [theta, omega]: state vector in generalized coordinate system


function setup()
{
    // create canvas
    canvas = createCanvas(480, 480);
    canvas.parent("canvas_container");
    canvas.style("background-color", "white");

    // initialize variables
    p0 = createVector(width/2, height/2);
    p  = createVector(0, 0);
    state = [1.57079632679489661923, 0.0];
    p.x = l*sin(state[0]);
    p.y = l*cos(state[0]);
    p.add(p0);
}


function draw()
{
    // the number of time evolution at this frame
    N = int(1/frameRate() / dT);
    if (isFinite(N) == false) N = 0;

    // calculating time evolution N times
    for (var i=0; i<N; i++)
    {
        state = runge_kutta(state, F, dT);
    }

    // transforming generalized coordinate to Cartesian coordinate
    p.x = l*sin(state[0]);
    p.y = l*cos(state[0]);
    p.add(p0);

    // drawing
    clear();
    stroke(0, 0, 0);
    fill(0, 0, 0);
    line(p0.x, p0.y, p.x, p.y);
    ellipse(p.x, p.y, 30);
}


/**
 * Calculating time evolution by using Runge-Kutta method.
 *
 * @param {Array} x state vector at a time.
 * @param {function} f function calculating the time differentiation of a state vector.
 * @param {number} dt sampling interval.
 * @return {Array} state vector at the next sampling.
 */
function runge_kutta(x, f, dt)
{
    k1 = f(x, 0);

    x2 = new Array(x.length);
    for (var i=0; i<x.length; i++) x2[i] = x[i] + k1[i]*dt/2;
    k2 = f(x2, dt/2);

    x3 = new Array(x.length);
    for (var i=0; i<x.length; i++) x3[i] = x[i] + k2[i]*dt/2;
    k3 = f(x3, dt/2);

    x4 = new Array(x.length);
    for (var i=0; i<x.length; i++) x4[i] = x[i] + k3[i]*dt;
    k4 = f(x4, dt);

    x_next = new Array(x.length);
    for (var i=0; i<x.length; i++)
    {
        x_next[i] = x[i] + (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]) * dt/6;
    }

    return x_next
}


/**
 * Calculating time differentiation of a state vector for simple pendulum.
 *
 * @param {Array} x state vector consists of [theta, omega].
 * @param {number} dt sampling interval (not used).
 * @return {Array} time differentiation of x: [omega, accel].
 */
function F(x, dt)
{
    theta = x[0];
    omega = x[1];

    var accel = (-g*sin(theta)) / l;

    return [omega, accel];
}

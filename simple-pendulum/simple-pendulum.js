var canvas;

var ppm = 10; // the number of pixels per meter
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

    p0 = createVector(width/2, height/2);
    p  = createVector(0, 0);
    th = 1.57079632679489661923;
    oo = 0.0;
    poo = 0.0;
    pacc = 0.0;
    state = [th, oo];
    p.x = l*sin(th);
    p.y = l*cos(th);
    p.add(p0);
}


function draw()
{
    N = int(1/frameRate() / dT);
    if (isFinite(N) == false) N = 0;

    for (var i=0; i<N; i++)
    {
        state = runge_kutta(state, F, dT);
    }

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


function F(x, dt)
{
    theta = x[0];
    omega = x[1];

    var accel = (-g*sin(theta)) / l;

    return [omega, accel];
}

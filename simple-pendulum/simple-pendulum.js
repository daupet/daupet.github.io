var canvas;

var ppm = 10; // the number of pixels per meter
var dT = 0.001; // sampling interval [sec]
var g = 9.8*ppm*ppm; // gravity [px/sec/sec]
var l = 100; // length of pendulum
var p0; // origin
var p; // position and velocity of mass

var th;
var oo;
var poo;
var pacc;


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
        time_evaluate();
    }

    p.x = l*sin(th);
    p.y = l*cos(th);
    p.add(p0);

    // drawing
    clear();
    stroke(0, 255, 0, 128);
    fill(0, 255, 0);
    line(p0.x, p0.y, p.x, p.y);
    ellipse(p.x, p.y, 30);
}


function time_evaluate()
{
    var sin_th = sin(th);
    var cos_th = cos(th);

    var acc = (-g*sin_th) / l;

    // update position and velocity
    th += (oo+poo)*dT/2;
    poo = oo;
    oo += (acc+pacc)*dT/2;
    pacc = acc;
}

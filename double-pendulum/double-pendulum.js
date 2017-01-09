var canvas;
var gr_traj; // graphic buffer for drawing trajectory

var ppm = 100; // pixel per meter
var dT = 0.001; // sampling interval [sec]
var g; // gravity vector [px/sec/sec]
var l1 = 1.5*ppm; // length of link-1 [px]
var l2 = 1.0*ppm; // length of link-2 [px]
var m1 = 1.0; // weight of mass-1 [kg]
var m2 = 2.0; // weight of mass-2 [kg]

var p0; // position of origin
var p; // [x1, y1, x2, y2]: position in Cartesian coordinate system
var p_pre; // position at previous sample
var state; // [theta1, theta2, omega1, omega2]: state vector in generalized coordinate system
var time; // time [sec]

var p_grab; // position of grabbing [px]
var grip = 1000; // strength of grip [1/sec/sec]
var fric = 2*Math.sqrt(50*(l1+l2)*grip); // friction coefficient [px/sec]
var is_grabbing; // whether grabbing the pendulum or not


function setup()
{
    // create canvas
    canvas = createCanvas(640, 640);
    canvas.id("p5_canvas");
    canvas.parent("canvas_container");
    canvas.style("background-color", "white");

    // create graphic buffer for drawing trajectory
    gr_traj = createGraphics(width, height);
    gr_traj.fill(255);
    gr_traj.rect(0, 0, width, height);

    // disable scrolling while the canvas is being touched
    var elem_canvas = document.getElementById("p5_canvas");
    elem_canvas.addEventListener("touchstart", function(e){ e.preventDefault(); }, false);
    elem_canvas.addEventListener("touchmove", function(e){ e.preventDefault(); }, false);

    // initialize variables
    time = 0;
    state = [1.57, 1.57, 0.0, 0.0];
    p0 = createVector(width/2, height/2);
    p  = [0.0, 0.0, 0.0, 0.0];
    p[0] = p0.x + l1*sin(state[0]);
    p[1] = p0.y + l1*cos(state[0]);
    p[2] = p0.x + l1*sin(state[0]) + l2*sin(state[1]);
    p[3] = p0.y + l1*cos(state[0]) + l2*cos(state[1]);
    p_pre = p.concat()

    // setting gravity by using acceleration sensor
    g = createVector(0, 0);
    window.addEventListener("devicemotion", function(e) {
            g.x = -e.accelerationIncludingGravity.x * ppm;
            g.y = e.accelerationIncludingGravity.y * ppm;
        }, false);

    // initialize variables for grabbing
    p_grab = createVector(0, 0);
    is_grabbing = false;
}


function draw()
{
    // calculating grabbing position if the pendulum is grabbed
    if (is_grabbing)
    {
        calculate_grab();
    }

    // the number of time evolution at this frame
    N = int(1/frameRate() / dT);
    if (isFinite(N) == false) N = 0;

    // calculating time evolution N times
    for (var i=0; i<N; i++)
    {
        state = runge_kutta(state, F, time, dT);
        time += dT;
    }

    // transforming generalized coordinate to Cartesian coordinate
    p[0] = p0.x + l1*sin(state[0]);
    p[1] = p0.y + l1*cos(state[0]);
    p[2] = p0.x + l1*sin(state[0]) + l2*sin(state[1]);
    p[3] = p0.y + l1*cos(state[0]) + l2*cos(state[1]);

    // calculate mechanical energy
    T = ((m1+m2)*l1*l1*state[2]*state[2] + m2*l2*l2*state[3]*state[3])/2 + m2*l1*l2*state[2]*state[3]*cos(state[0]-state[1]);
    U = -(m1*(g.x*p[0]+g.y*p[1]) + m2*(g.x*p[2]+g.y*p[3]));
    E = T + U;

    clear();

    // drawing trajectory on graphic buffer
    gr_traj.colorMode(HSB, 255);
    gr_traj.stroke((time*10)%255, 255, 255);
    gr_traj.line(p_pre[2], p_pre[3], p[2], p[3]);
    p_pre = p.concat();
    image(gr_traj, 0, 0);

    // displaying acceleration as text
    var str = "time    : " + (time).toFixed(3) + " sec\n";
    str += "accel X: " + (g.x/ppm).toFixed(8) + " m/sec/sec\n";
    str += "accel Y: " + (g.y/ppm).toFixed(8) + " m/sec/sec\n";
    str += "Energy : " + (E/ppm/ppm).toFixed(3) + " J\n";
    noStroke();
    textSize(24);
    text(str, 10, 30);

    // drawing pendulum
    stroke(0, 0, 0);
    fill(0, 0, 0);
    line(p0.x, p0.y, p[0], p[1]);
    ellipse(p[0], p[1], 30);
    line(p[0], p[1], p[2], p[3]);
    ellipse(p[2], p[3], 30);
}


/**
 * Calculating time evolution by using Runge-Kutta method.
 *
 * @param {Array} x state vector at a time.
 * @param {function} f function calculating the time differentiation of a state vector.
 * @param {number} t time.
 * @param {number} dt sampling interval.
 * @return {Array} state vector at the next sampling.
 */
function runge_kutta(x, f, t, dt)
{
    k1 = f(x, t);

    x2 = new Array(x.length);
    for (var i=0; i<x.length; i++) x2[i] = x[i] + k1[i]*dt/2;
    k2 = f(x2, t + dt/2);

    x3 = new Array(x.length);
    for (var i=0; i<x.length; i++) x3[i] = x[i] + k2[i]*dt/2;
    k3 = f(x3, t + dt/2);

    x4 = new Array(x.length);
    for (var i=0; i<x.length; i++) x4[i] = x[i] + k3[i]*dt;
    k4 = f(x4, t + dt);

    x_next = new Array(x.length);
    for (var i=0; i<x.length; i++)
    {
        x_next[i] = x[i] + (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]) * dt/6;
    }

    return x_next
}


/**
 * Calculating time differentiation of a state vector for double pendulum.
 *
 * @param {Array} x state vector consists of [theta1, theta2, omega1, omega2].
 * @param {number} t time (not used).
 * @return {Array} time differentiation of x: [omega1, omega2, accel1, accel2].
 */
function F(x, t)
{
    theta1 = x[0];
    theta2 = x[1];
    omega1 = x[2];
    omega2 = x[3];

    // calculating effect of grabbing if the pendulum is grabbed
    var grab_acc1 = 0;
    var grab_acc2 = 0;
    if (is_grabbing)
    {

    }

    // calculating frequent terms
    var M = m2 / (m1+m2);
    var C1 = cos(theta1);
    var S1 = sin(theta1);
    var C2 = cos(theta2);
    var S2 = sin(theta2);
    var Cd = cos(theta1 - theta2);
    var Sd = sin(theta1 - theta2);

    // calculating anglar acceleration
    var accel1 = (M*l1*omega1*omega1*Sd*Cd + M*l2*omega2*omega2*Sd - g.x*C1 + g.y*S1 + M*g.x*C2*Cd - M*g.y*S2*Cd) / (l1*(M*Cd*Cd-1));
    var accel2 = (M*l2*omega2*omega2*Sd*Cd + l1*omega1*omega1*Sd + g.x*C2 - g.y*S2 - g.x*C1*Cd + g.y*S1*Cd) / (l2*(1-M*Cd*Cd));

    // calculating anglar acceleration by grabbing
    accel1 += grab_acc1;
    accel2 += grab_acc2;

    return [omega1, omega2, accel1, accel2];
}


function touchStarted()
{
    is_grabbing = true;
}


function touchEnded()
{
    is_grabbing = false;
}


function calculate_grab()
{
    // get position of mouse or touch
    if (touches.length > 0)
    {
        p_grab = createVector(touches[0].x, touches[0].y);
    }
    else
    {
        p_grab = createVector(mouseX, mouseY);
    }
    p_grab.sub(p0);
}

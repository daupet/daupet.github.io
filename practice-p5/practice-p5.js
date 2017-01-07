var canvas;
var button_reset;
var slider;

function setup()
{
    // create canvas
    canvas = createCanvas(640, 480);
    canvas.parent("canvas_container");
    canvas.style("display",          "block")
    canvas.style("background-color", "white")
    canvas.style("margin-bottom",    "10px")

    // create slide bar to set smoothing rate
    slider = createSlider(0, 1, 1, 0.01);
    slider.parent("canvas_container");
    slider.style('width',        canvas.width - 90 + "px");
    slider.style('height',       "30px");
    slider.style('float',        "left");
    slider.style('margin-right', "20px");

    // create reset button
    button_reset = createButton("reset");
    button_reset.parent("canvas_container");
    button_reset.style('width',  "60px");
    button_reset.style('height', "30px");
    button_reset.mousePressed(function() { clear(); });

    // settings for drawing curves
    noFill();
    stroke(0, 255, 0, 128);

    // initialize control points
    p1 = p2 = p3 = p4 = {x: mouseX, y: mouseY};
}

function draw()
{
    // set smoothing rate according to the slide bar
    a = slider.value();
}

function touchStarted()
{
    // initialize control points
    p1 = p2 = p3 = p4 = {x: mouseX, y: mouseY};
}

function touchMoved()
{
    // update positions of control points
    p4 = p3;
    p3 = p2;
    p2 = p1;
    p1 = {x: (1-a)*p1.x + a*mouseX, y: (1-a)*p1.y + a*mouseY};

    // draw a curve
    curve(p4.x, p4.y, p3.x, p3.y, p2.x, p2.y, p1.x, p1.y);
}

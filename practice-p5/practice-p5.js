var canvas;
var button_reset;
var slider;

function setup()
{
    var elem_canvas = document.getElementById("p5_canvas");
    canvas = createCanvas(elem_canvas.offsetWidth, elem_canvas.offsetHeight - 100);
    canvas.parent("p5_canvas");

    button_reset = createButton("reset");
    button_reset.parent("p5_canvas");
    button_reset.position(elem_canvas.offsetWidth - 50, elem_canvas.offsetHeight - 50);
    button_reset.mousePressed(function() { clear(); });

    slider = createSlider(0, 1, 1, 0);
    slider.parent("p5_canvas");
    slider.position(0, elem_canvas.offsetHeight - 45);
    slider.style('width', elem_canvas.offsetWidth - 90 + "px");

    textbox = 0;

    noFill();
    stroke(0, 255, 0, 128);

    p1 = p2 = p3 = p4 = {x: mouseX, y: mouseY};
}

function draw()
{
    a = slider.value();

    p4 = p3;
    p3 = p2;
    p2 = p1;
    p1 = {x: (1-a)*p1.x + a*mouseX, y: (1-a)*p1.y + a*mouseY};

    if (mouseIsPressed)
    {
        curve(p4.x, p4.y, p3.x, p3.y, p2.x, p2.y, p1.x, p1.y);
    }
}

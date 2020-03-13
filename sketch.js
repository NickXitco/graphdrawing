const globals = {
    vertices: [],
    edges: [],
    width: window.innerWidth,
    height: window.innerHeight,
    numVertices: 400,
    theta: 1.0,
    stepSize: 0.010,
    C: 2,
    K: 7.5,
    extremes: [],
    xSorted: [],
    ySorted: []
};

let paused;
let resetButton;
let pauseButton;
let step;
let stepButton;

let scaleSlider;

function setup() {
    createCanvas(globals.width, globals.height);
    stroke(0);

    strokeWeight(1);
    smooth();
	
	resetButton = createButton('Reset');
    resetButton.position(40, 60);
    resetButton.mousePressed(reset);

    pauseButton = createButton('Pause');
    pauseButton.position(40, 90);
    pauseButton.mousePressed(pause);

    stepButton = createButton('Step');
    stepButton.position(40, 120);
    stepButton.mousePressed(() => {if(paused) {paused = false; step = true;}});

    scaleSlider = createSlider(0, 5, 1, 0);
    scaleSlider.position(40, 150);
    scaleSlider.style('width', '80px');

    VertexUtils.placeVertices(globals);
}

function pause() {
    pauseButton.elt.innerHTML = (paused) ? 'Pause' : 'Play';
    paused = !paused;
}

function reset() {
	globals.vertices = [];
    globals.edges = [];
	VertexUtils.placeVertices(globals);
}

function draw() {
    background(250);

    scale(scaleSlider.value());
    for (const v of globals.vertices) {
        v.draw(globals.extremes);
    }

    for (const e of globals.edges) {
        line(e.u.x, e.u.y, e.v.x, e.v.y);
    }

    VertexUtils.drawBoundingSquare(globals.extremes);

    QuadTree.createQuadTree(globals);

    VertexUtils.updateForces(globals.vertices, globals.stepSize, globals.C, globals.K);

    scale(1);
    const energy = VertexUtils.getEnergy(globals.vertices);
    printEnergy(energy);
    globals.stepSize = getStepSize(energy);

    if (paused) return;

    VertexUtils.applyForces(globals.vertices, globals.stepSize);
    VertexUtils.updateExtrema(globals.vertices, globals.extremes);

    if (step) {
        step = false;
        paused = true;
    }
}

function printEnergy(energy) {
    textSize(16);
    fill(0);
    text(Math.floor(energy), 40, 50);
}

function getStepSize(energy) {
    return Math.max(Math.min(512 / energy, Math.min(2 ** -16 * energy, 0.01)), 0);
}
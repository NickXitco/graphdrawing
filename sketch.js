const globals = {
    vertices: [],
    edges: [],
    width: window.innerWidth,
    height: window.innerHeight,
    numVertices: 100,
    theta: 1.0,
    stepSize: 0.010,
    C: 2,
    K: 7.5,
    extremes: [],
    xSorted: [],
    ySorted: []
};

let scroll = 0;
let scaleVal = 1;

let paused;
let resetButton;
let pauseButton;
let step;
let stepButton;

let dragging = false;
let mOrigin = {x: 0, y: 0};
let mDown = {x: 0, y: 0};
let mCurrent = {x: 0, y: 0};

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

    push();

    const offsetX = window.innerWidth * (-0.5 * scaleVal + 0.5) / scaleVal;
    const offsetY = window.innerHeight * (-0.5 * scaleVal + 0.5) / scaleVal;
    scale(scaleVal);
    translate(offsetX, offsetY);

    for (const v of globals.vertices) {
        v.draw(globals.extremes);
    }

    for (const e of globals.edges) {
        line(e.u.x, e.u.y, e.v.x, e.v.y);
    }

    QuadTree.createQuadTree(globals);

    pop();

    VertexUtils.updateForces(globals.vertices, globals.stepSize, globals.C, globals.K, globals.theta);

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

function mouseWheel(e) {
    scroll = Math.min(scroll + e.delta, 2000);
    scaleVal = Math.max(-.005 * scroll + 1, -.001 * scroll + 1, -0.0001 * scroll  + 0.2, 0.01);
    console.log({scroll: scroll, scale: scaleVal});
    return false;
}

function touchStarted(e) {
    mDown.x = e.clientX;
    mDown.y = e.clientY;
    return false;
}

function touchMoved(e) {
    if (!dragging) return false;
    mCurrent.x = e.clientX;
    mCurrent.y = e.clientY;
    return false;
}

function touchEnded() {
    mOrigin.x += mCurrent.x - mDown.x;
    mOrigin.y += mCurrent.y - mDown.y;
    return false;
}
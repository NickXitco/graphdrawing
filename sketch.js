const globals = {
    vertices: [],
    edges: [],
    width: window.innerWidth,
    height: window.innerHeight,
    numVertices: 200,
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

function setup() {
    VertexUtils.placeVertices(globals);
    QuadTree.createQuadTree(globals);

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
    if (paused) return;

    background(250);

    VertexUtils.drawBoundingSquare(globals.extremes);

    let energy = 0;
    for (const v of globals.vertices) {
        if (globals.stepSize <= 0) break;
        let f = {x: 0, y: 0};

        for (const u of v.neighbors) {
            const fa = Vertex.attractiveForce(u, v, globals.K);
            f.x += fa.x;
            f.y += fa.y;
        }

        for (const j of globals.vertices) {
            if (j === v) continue;
            const fr = Vertex.repulsiveForce(j, v, globals.C, globals.K);
            f.x += fr.x;
            f.y += fr.y;
        }

        v.x += globals.stepSize * f.x;
        v.y += globals.stepSize * f.y;
        energy += (Math.sqrt(f.x**2 + f.y**2));
        v.f = f;
    }
    globals.stepSize = (energy > 51200) ? 512 / energy : 0.01;
    globals.stepSize = (energy < 400) ? globals.stepSize - 0.001 : globals.stepSize;
    textSize(16);
    fill(0);
    text(Math.floor(energy), 40, 50);

    for (const v of globals.vertices) {
        VertexUtils.updateExtremes(v, globals.extremes);
    }

    for (const v of globals.vertices) {
        v.draw(globals.extremes);
    }

    for (const e of globals.edges) {
        line(e.u.x, e.u.y, e.v.x, e.v.y);
    }

    if (step) {
        step = false;
        paused = true;
    }
}


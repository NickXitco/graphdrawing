let vertices = [];
let edges = [];
const width = window.innerWidth;
const height = window.innerHeight;
const numVertices = 100;
const tol = 0;
let stepSize = 0.010;

const C = 2;
const K = 7.5;

let resetButton;
let pauseButton;
let stepButton;
let paused;
let step;

let extremes;

let xSorted;
let ySorted;

let boundingSquare;

class Vertex {
    x;
    y;
    f;
    neighbors;

    constructor() {
        this.neighbors = [];
    }

    randPosition() {
        this.x = (Math.random() * (width / 4)) + width / 2.75;
        this.y = (Math.random() * (height / 4)) + height / 2.75;
    }

    addNeighbor(v) {
        this.neighbors.push(v);
        v.neighbors.push(this);
    }

    static angle(u, v) {
        return Math.atan2(v.y - u.y, v.x - u.x);
    }

    static distance(u, v) {
        return Math.sqrt(((u.x - v.x) ** 2) + ((u.y - v.y) ** 2));
    }

    static attractiveForce(u, v) {
        let f = -1 * (Vertex.distance(u, v) ** 2) / K;

        return {
            x: Math.cos(Vertex.angle(u, v)) * f,
            y: Math.sin(Vertex.angle(u, v)) * f
        };
    }

    static repulsiveForce(u, v) {
        let f = C * K * K / Vertex.distance(u, v);

        return {
            x: Math.cos(Vertex.angle(u, v)) * f,
            y: Math.sin(Vertex.angle(u, v)) * f
        };
    }
}


function placeVertices() {
    // TODO safer, general position random placement
    for (let i = 0; i < numVertices; i++) {
        vertices.push(new Vertex());
    }

    for (const v of vertices) {
        v.randPosition();
    }

    for (let i = 0; i < vertices.length; i++) {
        let r = Math.floor(Math.random() * (vertices.length));
        if (r !== i && !vertices[i].neighbors.includes(vertices[r])) {
            vertices[i].addNeighbor(vertices[r]);
            edges.push({
                u: vertices[i],
                v: vertices[r]
            });
        }
    }

    xSorted = sortVerticesX(vertices);
    ySorted = sortVerticesY(vertices);
    console.log(xSorted);
    console.log(ySorted);
    extremes = getExtremes(xSorted, ySorted);
    console.log(extremes);
}

function setup() {
    placeVertices();

    createCanvas(width, height);
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
	vertices = [];
	edges = [];
	placeVertices();
	if (paused) {paused = false; step = true;}
}

function updateExtremes(v) {
    if (v.x < extremes.east.x) {
        extremes.east = v;
    }
    if (v.x > extremes.west.x) {
        extremes.west = v;
    }
    if (v.y > extremes.south.y) {
        extremes.south = v;
    }
    if (v.y < extremes.north.y) {
        extremes.north = v;
    }
}

function drawVertex(v) {
    stroke(255 - Math.min(5 * (Math.sqrt(v.f.x ** 2 + v.f.y ** 2)), 255));

    if (Object.values(extremes).includes(v)) {
        fill('aqua');
    } else {
        fill(0, 0);
    }
    circle(v.x, v.y, 5);
    stroke(0);
}

function drawBoundingSquare() {
    let upperLeft = {x: 0, y: 0};
    let diameter;
    const naturalHeight = extremes.south.y - extremes.north.y;
    const naturalWidth = extremes.west.x - extremes.east.x;
    if (naturalHeight > naturalWidth) {
        upperLeft.y = extremes.north.y - 5;
        upperLeft.x = extremes.east.x - ((naturalHeight - naturalWidth) / 2) - 5;
        diameter = naturalHeight + 10;
    } else {
        upperLeft.x = extremes.east.x - 5;
        upperLeft.y = extremes.north.y - ((naturalWidth - naturalHeight) / 2) - 5;
        diameter = naturalWidth + 10;
    }
    fill(0, 0);
    rect(upperLeft.x, upperLeft.y, diameter, diameter);
}

function draw() {
    if (paused) return;

    background(250);

    let energy = 0;
    for (const v of vertices) {
        if (stepSize <= 0) break;
        let f = {x: 0, y: 0};

        for (const u of v.neighbors) {
            const fa = Vertex.attractiveForce(u, v);
            f.x += fa.x;
            f.y += fa.y;
        }

        for (const j of vertices) {
            if (j === v) continue;
            const fr = Vertex.repulsiveForce(j, v);
            f.x += fr.x;
            f.y += fr.y;
        }

        v.x += stepSize * f.x;
        v.y += stepSize * f.y;
        energy += (Math.sqrt(f.x**2 + f.y**2));
        v.f = f;
    }
    stepSize = (energy > 51200) ? 512 / energy : 0.01;
    stepSize = (energy < 400) ? stepSize - 0.001 : stepSize;
    textSize(16);
    fill(0);
    text(Math.floor(energy), 40, 50);

    for (const v of vertices) {
        updateExtremes(v);
    }

    for (const v of vertices) {
        drawVertex(v);
    }

    for (const e of edges) {
        line(e.u.x, e.u.y, e.v.x, e.v.y);
    }

    drawBoundingSquare();

    if (step) {
        step = false;
        paused = true;
    }

}

function sortVerticesX(vertices) {
    let newV = [...vertices];
    newV.sort((a, b) => a.x - b.x);
    return newV;
}

function sortVerticesY(vertices) {
    let newV = [...vertices];
    newV.sort((a, b) => a.y - b.y);
    return newV;
}

function getExtremes(xSorted, ySorted) {
    return {south: ySorted[ySorted.length - 1], north: ySorted[0], east: xSorted[0], west: xSorted[xSorted.length - 1]};
}

class QuadTree {
    subtrees;
    centerOfMass;
    boundingBox;

    parent;

    constructor(parent) {
        this.parent = parent;
    }

    inQuad(v) {
        return v.x > this.boundingBox.east && v.x < this.boundingBox.west
            && v.y > this.boundingBox.south && v.y < this.boundingBox.north;
    }
}
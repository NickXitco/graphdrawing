let vertices = [];
let edges = [];
const width = window.innerWidth;
const height = window.innerHeight;
const numVertices = 100;
const tol = 0;
let step = 0.010;

const C = 2;
const K = 7.5;


class Vertex {
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


function setup() {

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


    createCanvas(width, height);
    stroke(0);

    strokeWeight(1);
    smooth();
	
	button = createButton('Reset');
    button.position(40, 60);
    button.mousePressed(reset);
}

function reset() {
	vertices = [];
	edges = [];
	setup();
}

function draw() {
    background(250);

    let energy = 0;
    for (const v of vertices) {
        if (step <= 0) break;
        let f = {
            x: 0,
            y: 0
        };

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

        v.x += step * f.x;
        v.y += step * f.y;
        energy += (Math.sqrt(f.x**2 + f.y**2));
        stroke(255 - Math.min(5 * (Math.sqrt(f.x**2 + f.y**2)), 255));
        circle(v.x, v.y, 5);
        stroke(0);
    }
    step = (energy > 51200) ? 512 / energy : 0.01;
    step = (energy < 400) ? step - 0.001 : step;
    textSize(16);
    text(Math.floor(energy), 40, 50);


    for (const v of vertices) {

    }

    for (const e of edges) {
        line(e.u.x, e.u.y, e.v.x, e.v.y);
    }

}
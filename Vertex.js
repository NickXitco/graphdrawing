class Vertex {
    x;
    y;
    f;
    neighbors;

    constructor() {
        this.neighbors = [];
        this.f = {x: 0, y:0};
    }

    randPosition(width, height) {
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

    static attractiveForce(u, v, K) {
        let f = -1 * (Vertex.distance(u, v) ** 2) / K;

        return {
            x: Math.cos(Vertex.angle(u, v)) * f,
            y: Math.sin(Vertex.angle(u, v)) * f
        };
    }

    static repulsiveForce(v, C, K, theta) {
        let fx = 0;
        let fy = 0;
        for (const supernode of QuadTree.getSupernodes(v, theta)) {
            const s = supernode.centerOfMass;
            const u = {x: s.x, y: s.y};
            const f = C * K * K  * s.s / Vertex.distance(u, v);
            fx += Math.cos(Vertex.angle(u, v)) * f;
            fy += Math.sin(Vertex.angle(u, v)) * f;
        }

        return {
            x: fx,
            y: fy
        };
    }

    applyForce(stepSize) {
        this.x += stepSize * this.f.x;
        this.y += stepSize * this.f.y;
    }


    draw() {
        const v = this;
        stroke(255 - Math.min(5 * (Math.sqrt(v.f.x ** 2 + v.f.y ** 2)), 255));

        fill(0, 0);
        circle(v.x, v.y, 5);
        stroke(0);
    }
}
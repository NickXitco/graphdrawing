class Vertex {
    x;
    y;
    f;
    neighbors;

    constructor() {
        this.neighbors = [];
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

    static repulsiveForce(u, v, C, K) {
        let f = C * K * K / Vertex.distance(u, v);

        return {
            x: Math.cos(Vertex.angle(u, v)) * f,
            y: Math.sin(Vertex.angle(u, v)) * f
        };
    }

    draw(extremes) {
        const v = this;
        if (v.f !== undefined) {
            stroke(255 - Math.min(5 * (Math.sqrt(v.f.x ** 2 + v.f.y ** 2)), 255));
        } else {
            stroke(0, 255);
        }

        if (Object.values(extremes).includes(v)) {
            fill('aqua');
        } else {
            fill(0, 0);
        }
        circle(v.x, v.y, 5);
        stroke(0);
    }
}
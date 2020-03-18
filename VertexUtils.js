class VertexUtils {
    static updateExtrema(vertices, extremes) {
        for (const v of vertices) {
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
    }

    static placeVertices(g) {
        // TODO safer, general position random placement
        for (let i = 0; i < g.numVertices; i++) {
            g.vertices.push(new Vertex());
        }

        for (const v of g.vertices) {
            v.randPosition(g.width, g.height);
        }

        for (let i = 0; i < g.vertices.length; i++) {
            let r = Math.floor(Math.random() * (g.vertices.length));
            if (r !== i && !g.vertices[i].neighbors.includes(g.vertices[r])) {
                g.vertices[i].addNeighbor(g.vertices[r]);
                g.edges.push({
                    u: g.vertices[i],
                    v: g.vertices[r]
                });
            }
        }

        g.xSorted = this.sortVerticesX(g.vertices);
        g.ySorted = this.sortVerticesY(g.vertices);
        g.extremes = this.getExtremes(g.xSorted, g.ySorted);
    }

    static sortVerticesX(vertices) {
        let newV = [...vertices];
        newV.sort((a, b) => a.x - b.x);
        return newV;
    }

    static sortVerticesY(vertices) {
        let newV = [...vertices];
        newV.sort((a, b) => a.y - b.y);
        return newV;
    }

    static getExtremes(xSorted, ySorted) {
        return {south: ySorted[ySorted.length - 1], north: ySorted[0], east: xSorted[0], west: xSorted[xSorted.length - 1]};
    }

    static getEnergy(vertices) {
        let energy = 0;
        for (const v of vertices) {
            energy += (Math.sqrt(v.f.x**2 + v.f.y**2));
        }
        return energy;
    }

    static updateForces(vertices, stepSize, C, K, theta) {
        for (const v of vertices) {
            if (stepSize <= 0) break;
            let f = {x: 0, y: 0};

            for (const u of v.neighbors) {
                const fa = Vertex.attractiveForce(u, v, K);
                f.x += fa.x;
                f.y += fa.y;
            }

            const fr = Vertex.repulsiveForce(v, C, K, theta);
            f.x += fr.x;
            f.y += fr.y;
            v.f = f;
        }
    }

    static applyForces(vertices, stepSize) {
        for (const v of vertices) {
            v.applyForce(stepSize);
        }
    }
}




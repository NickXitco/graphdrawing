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

    static drawBoundingSquare(extremes) {
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

    static updateForces(vertices, stepSize, C, K) {
        for (const v of vertices) {
            if (stepSize <= 0) break;
            let f = {x: 0, y: 0};

            for (const u of v.neighbors) {
                const fa = Vertex.attractiveForce(u, v, K);
                f.x += fa.x;
                f.y += fa.y;
            }

            for (const j of vertices) {
                if (j === v) continue;
                const fr = Vertex.repulsiveForce(j, v, C, K);
                f.x += fr.x;
                f.y += fr.y;
            }
            v.f = f;
        }
    }

    static applyForces(vertices, stepSize) {
        for (const v of vertices) {
            v.applyForce(stepSize);
        }
    }
}




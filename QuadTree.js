let root;

class QuadTree {
    subtrees;
    centerOfMass;
    boundingBox;

    point;
    leaf;

    parent;

    constructor(parent) {
        this.subtrees = {ne: null, nw: null, se: null, sw: null};
        this.centerOfMass = {x: 0, y: 0, s: 0};
        this.boundingBox = {north: null, east: null, south: null, west: null};

        this.point = null;
        this.leaf = true;

        this.parent = parent;
    }

    inQuad(v) {
        return v.x > this.boundingBox.east && v.x < this.boundingBox.west
            && v.y > this.boundingBox.north && v.y < this.boundingBox.south;
    }

    static rootBoundingBox(extremes) {
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

        return {north: upperLeft.y, east: upperLeft.x, south: upperLeft.y + diameter, west: upperLeft.x + diameter};
    }

    getCenterOfMass() {
        if (this.leaf) {
            if (this.point == null) {
                return this.centerOfMass;
            }
            this.centerOfMass = {x: this.point.x, y: this.point.y, s: 1};
        } else {
            const ne = this.subtrees.ne.getCenterOfMass();
            const nw = this.subtrees.nw.getCenterOfMass();
            const se = this.subtrees.se.getCenterOfMass();
            const sw = this.subtrees.sw.getCenterOfMass();

            this.centerOfMass.s = ne.s + nw.s + se.s + sw.s;
            this.centerOfMass.x = (ne.x * ne.s + nw.x * nw.s + se.x * se.s + sw.x * sw.s) / this.centerOfMass.s;
            this.centerOfMass.y = (ne.y * ne.s + nw.y * nw.s + se.y * se.s + sw.y * sw.s) / this.centerOfMass.s;

            //if (ne.s > 0) line(this.centerOfMass.x, this.centerOfMass.y, ne.x, ne.y);
            //if (nw.s > 0) line(this.centerOfMass.x, this.centerOfMass.y, nw.x, nw.y);
            //if (se.s > 0) line(this.centerOfMass.x, this.centerOfMass.y, se.x, se.y);
            //if (sw.s > 0) line(this.centerOfMass.x, this.centerOfMass.y, sw.x, sw.y);
        }

        /*
        fill(255, 0, 0, 50);
        stroke(255, 0, 0, 75);
        circle(this.centerOfMass.x, this.centerOfMass.y, 1.5 * this.centerOfMass.s);
        fill(255, 255, 255, 255);
        textSize(0.3 * this.centerOfMass.s);
        textAlign(CENTER, CENTER);
        text(this.centerOfMass.s, this.centerOfMass.x, this.centerOfMass.y);
         */

        return this.centerOfMass;
    }

    insert(v) {
        if (!this.inQuad(v)) {
            return false;
        }

        if (this.leaf === true && this.point === null) {
            this.point = v;
            return true;
        }

        if (this.leaf === true) {
            const temp = this.point;
            this.point = null;
            this.leaf = false;
            this.subdivide();
            this.insert(temp);
        }

        if (this.subtrees.ne.insert(v)) return true;
        if (this.subtrees.nw.insert(v)) return true;
        if (this.subtrees.se.insert(v)) return true;
        if (this.subtrees.sw.insert(v)) return true; // noinspection RedundantIfStatementJS

        return false;
    }

    subdivide() {
         let ne = new QuadTree(this);
         let nw = new QuadTree(this);
         let sw = new QuadTree(this);
         let se = new QuadTree(this);

         let yNorth = this.boundingBox.north;
         let yCenter = (this.boundingBox.north + this.boundingBox.south) / 2;
         let ySouth = this.boundingBox.south;

         let xEast = this.boundingBox.east;
         let xCenter = (this.boundingBox.east + this.boundingBox.west) /2 ;
         let xWest = this.boundingBox.west;

         ne.boundingBox = {north: yNorth, east: xEast, south: yCenter, west: xCenter};
         nw.boundingBox = {north: yNorth, east: xCenter, south: yCenter, west: xWest};
         se.boundingBox = {north: yCenter, east: xEast, south: ySouth, west: xCenter};
         sw.boundingBox = {north: yCenter, east: xCenter, south: ySouth, west: xWest};

         //ne.drawBoundingBox();
         //nw.drawBoundingBox();
         //se.drawBoundingBox();
         //sw.drawBoundingBox();

         this.subtrees.ne = ne;
         this.subtrees.nw = nw;
         this.subtrees.se = se;
         this.subtrees.sw = sw;
    }

    drawBoundingBox() {
        const bb = this.boundingBox;
        fill(0, 0);
        rect(bb.east, bb.north, (bb.west - bb.east), (bb.south - bb.north));
    }

    static createQuadTree(g) {
        root = new QuadTree(null);
        root.boundingBox = this.rootBoundingBox(g.extremes);
        root.drawBoundingBox();

        for (const v of g.vertices) {
            root.insert(v);
        }

        root.getCenterOfMass();
    }

    getSupernodes(v, theta, supernodes) {

        if (this.leaf && this.point === null) {return;}
        if (this.point === v) {return;}
        if (this.leaf && this.point !== null) {supernodes.push(this); return;}

        const diameter = this.boundingBox.west - this.boundingBox.east;
        const distance = Math.sqrt((v.x - this.centerOfMass.x) ** 2 + (v.y - this.centerOfMass.y) ** 2);

        if (diameter / distance <= theta) {
            supernodes.push(this);
            return;
        }

        this.subtrees.ne.getSupernodes(v, theta, supernodes);
        this.subtrees.nw.getSupernodes(v, theta, supernodes);
        this.subtrees.se.getSupernodes(v, theta, supernodes);
        this.subtrees.sw.getSupernodes(v, theta, supernodes);
    }

    static getSupernodes(v, theta) {
        let supernodes = [];
        root.getSupernodes(v, theta, supernodes);
        return supernodes;
    }

}
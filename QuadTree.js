let root;

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
        return 0;
    }

    insert(v) {
        if (!this.inQuad(v)) {
            return false;
        }

        if (this.subtrees === undefined) {
            this.subdivide();
        }

        if (this.subtrees.ne.insert(v)) return true;
        if (this.subtrees.nw.insert(v)) return true;
        if (this.subtrees.se.insert(v)) return true;
        if (this.subtrees.sw.insert(v)) return true;

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

         this.subtrees.ne = ne;
         this.subtrees.nw = nw;
         this.subtrees.se = se;
         this.subtrees.sw = sw;
    }

    static createQuadTree(g) {
        for (const v of g.vertices) {
            root.insert(v);
        }
    }

}
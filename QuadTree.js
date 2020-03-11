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

    static createQuadTree(g) {

    }

}
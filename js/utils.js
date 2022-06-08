/**
 * Represents the Loading Resource Text
 * @function
 * @param {String} location - location for the returned text
 */
async function loadTextResource(location){
    var response = await fetch(location);
    const text = await response.text();
    return text;
}
/**
 * Represents the Loading of the specified Image
 * @function
 * @param {String} location - specified location
 * @param {function} callback - specified function to execute
 */
function loadImage(location , callback){
    var image = new Image();
    image.onload = function(){
        callback(image);
    }
    image.src = location;
}
/**
 * Represents the Loading of JSON Resource
 * @function
 * @param {String} location - specified location
 * @param {function} callback - specified function to execute
 */
function loadJSONResource(location, callback){
    loadTextResource(location, function(result){
        try{
            callback(JSON.parse(result));
        }catch(e){
            console.log("ERROR PARSING MODEL");
        }
    });
}
/**
 * Represents the Loading of the Resource Object
 * @function
 * @param {String} location - specified location
 */
async function loadObjResource(location){
    const response = await fetch(location);
    const text = await response.text();
    return text;
}
/**
 * Obtains the array of specified positions coordinates, coordinates of texture and the normals of the module.
 * @function
 * @param {String} text - specified location
 */
function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
    ];
    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
    ];
    /**
     * Responsible for the verification of an existing geometry and possibility of starting a new one.
     * @constructor
     *
     */
    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
        setGeometry();
    }
    /**
     * Obtains the vertice of specified positions, coordinates of texture and the norms of the module.
     * @function
     * @param {float} vert - specified vertice
     */
    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    return {
        position: webglVertexData[0],
        texcoord: webglVertexData[1],
        normal: webglVertexData[2],
    };
}
/**
 * Responsible for the adjustments of coordinates of the positions of the vertices of the object
 * @function
 * @param {Array} points - specified array of vertices
 */
function normalize(points){
    var min = points[0];
    var max = points[1];
    for(var i = 0;i<points.length;i++){
        if(points[i]<min)
            min = points[i];
        if(points[i]>max)
            max = points[i];
    }
    for(var i = 0;i<points.length;i++){
        points[i] = points[i]+Math.abs(min);
    }
    max = max+Math.abs(min);
    min = 0;
    for(var i = 0;i<points.length;i++){
        points[i]=((points[i]/max)*2)-1
    }
}

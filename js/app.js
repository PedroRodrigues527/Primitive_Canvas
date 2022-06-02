let pointsArray = [];
let texCoordsArray = [];
let colorsArray = [];
let normalsArray = [];

// Specify the colors of faces
let vertexColors = [
    [1.0 ,1.0, 1.0], // white
    [1.0, 1.0, 0.0], // yellow
    [0.0, 1.0, 0.0], // green
    [0.0, 0.0, 1.0], // blue
    [1.0, 0.0, 1.0], // magenta
    [0.0, 1.0, 1.0], // cyan
    [1.0, 0.0, 0.0], // red
    [0.0 ,0.0, 0.0], // black
];

let primitivesArray = [];
const MAX_PRIMITIVES = 10;

let modelsArray = [];
const MAX_MODELS = 5;

let counter = 0;

let gl;
let ctm;
let modelViewMatrix;
let ambientUniformLocation;

let diffColorUniformLocation;
let diffDirectionUniformLocation;

let program;

let model_src = "";
let model_txt = "";

window.onload = function () {
    init();
}

async function init() {

    // *** Get canvas ***
    const canvas = document.getElementById('gl-canvas');

    /** @type {WebGLRenderingContext} */ // ONLY FOR VS CODE
    gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
    if (!gl) {
        alert('WebGL not supported');
        return;
    }

    // *** Set viewport ***
    gl.viewport(0, 0, canvas.width, canvas.height)

    // *** Set color to the canvas ***
    gl.clearColor(0.95, .95, .95, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // *** Initialize vertex and fragment shader ***
    program = await initShaders(gl);
    gl.useProgram(program);

    ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
    diffColorUniformLocation = gl.getUniformLocation(program, 'diffuse_light.color');
    diffDirectionUniformLocation = gl.getUniformLocation(program, 'diffuse_light.direction');

    updateOptionsSelect("REMOVE");

    // *** Create the event listeners for the buttons ***

    // * ADD PRIMITIVE SECTION *
    document.getElementById("btn-add-primitive").onclick = function () {
        if(document.getElementById("add-primitive").value === "cube")
        {
            cube();
            let textureChosen = document.getElementById("add-primitive-get-texture-file").value;
            addPrimitive(textureChosen, "Cubo ");
            updateOptionsSelect("Cubo ");
        }
        else if(document.getElementById("add-primitive").value === "triangular-pyramid")
        {
            triangularPyramid();
            let textureChosen = document.getElementById("add-primitive-get-texture-file").value;
            addPrimitive(textureChosen, "Pir\u00E2mide triangular ");
            updateOptionsSelect("Pir\u00E2mide triangular ");
        }
        else
        {
            return -1;
        }
    };
    document.getElementById("btn-load-texture").onclick = function () {
        document.getElementById("add-primitive-get-texture-file").click();
    };
    document.getElementById("add-primitive-get-texture-file").onchange = function () {
        if(document.getElementById("add-primitive-get-texture-file").value !== "")
        {
            document.getElementById("btn-load-texture").innerText='Textura Carregada \u2714';
        }
        else
        {
            document.getElementById("btn-load-texture").innerText='Carregar Textura';
        }
    }

    // * ADD MODEL SECTION *
    document.getElementById("btn-load-model").onclick = function () {
        document.getElementById("add-model-load-model").click();
    };
    document.getElementById("add-model-load-model").onchange = function () {
        if(document.getElementById("add-model-load-model").value !== "")
        {
            document.getElementById("btn-load-model").innerText='Modelo Carregado \u2714';
        }
        else
        {
            document.getElementById("btn-load-model").innerText='Carregar Modelo';
        }
    }
    document.getElementById("btn-load-texture-model").onclick = function () {
        document.getElementById("add-model-load-texture-model").click();
    };
    document.getElementById("add-model-load-texture-model").onchange = function () {
        if(document.getElementById("add-model-load-texture-model").value !== "")
        {
            document.getElementById("btn-load-texture-model").innerText='Textura Carregada \u2714';
        }
        else
        {
            document.getElementById("btn-load-texture-model").innerText='Carregar Textura';
        }
    }
    document.getElementById("btn-add-model").onclick = async function () {
        let modelChosen = document.getElementById("add-model-load-model").value;
        let textureChosen = document.getElementById("add-model-load-texture-model").value;
        if(modelChosen !== "")
        {
            await createObject(modelChosen, textureChosen);
            updateOptionsSelect("Modelo ");
        }
        else
        {
            alert('O modelo ainda não foi escolhido.');
        }
    };

    // * ADD LIGHT SECTION *
    document.getElementById("btn-add-light").onclick = function () {
        applyLighting();
    };

    // * ADD ANIMATION SECTION *
    document.getElementById("btn-start-animate").onclick = function () {
        startAnimation();
    }
    document.getElementById("btn-end-animate").onclick = function () {
        endAnimation();
    }

    //TODO: OTHER ONCLICK BUTTONS
    // * MANIPULATE OBJECT SECTION *
    document.getElementById("btn-apply-transformation").onclick = function () {
        applyTransformation();
    }
    document.getElementById("btn-load-texture-manipulate").onclick = function () {
        document.getElementById("load-texture-file-manipulate").click();
    };
    document.getElementById("load-texture-file-manipulate").onchange = function () {
        if(document.getElementById("load-texture-file-manipulate").value !== "")
        {
            document.getElementById("btn-load-texture-manipulate").innerText='Textura Carregada \u2714';
        }
        else
        {
            document.getElementById("btn-load-texture-manipulate").innerText='Carregar Textura';
        }
    }

    // *** Render ***
    render();

}

function applyTransformation(){
    let typeObject = document.getElementById("object-type-manipulation").options[document.getElementById("object-type-manipulation").selectedIndex].text;
    let scalingX = document.getElementById("scaling-x").value;
    let scalingY = document.getElementById("scaling-y").value;
    let scalingZ = document.getElementById("scaling-z").value;
    let translationX = document.getElementById("translation-x").value;
    let translationY = document.getElementById("translation-y").value;
    let translationZ = document.getElementById("translation-z").value;

    let textureChosen = document.getElementById("load-texture-file-manipulate").value;


    if(typeObject.length !== 0) {
        if (scalingX.length !== 0 && scalingY.length !== 0 && scalingZ.length !== 0) {
            if (typeObject.includes("Cubo ") || typeObject.includes("Pir\u00E2mide triangular ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let primitiveElement = primitivesArray[indexElement];
                primitiveElement.scale.x = parseFloat(scalingX) / 100;
                primitiveElement.scale.y = parseFloat(scalingY) / 100;
                primitiveElement.scale.z = parseFloat(scalingZ) / 100;

                // *** Apply transformations ***
                mat4.scale(ctm, ctm, [primitiveElement.scale.x, primitiveElement.scale.y, primitiveElement.scale.z]);

                // *** Transfer the information to the model viewer ***
                gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

                // *** Draw the triangles ***
                gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
            } else if (typeObject.includes("Modelo ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let modelElement = modelsArray[indexElement];
                modelElement.scale.x = parseFloat(scalingX) / 100;
                modelElement.scale.y = parseFloat(scalingY) / 100;
                modelElement.scale.z = parseFloat(scalingZ) / 100;

                // *** Apply transformations ***
                mat4.scale(ctm, ctm, [modelElement.scale.x, modelElement.scale.y, modelElement.scale.z]);

                // *** Transfer the information to the model viewer ***
                gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

                // *** Draw the triangles ***
                gl.drawArrays(gl.TRIANGLES, 0, modelElement.data.position.length / 3);
            } else
                return -1;
        }
        if (translationX.length !== 0 && translationY.length !== 0 && translationZ.length !== 0) {
            if (typeObject.includes("Cubo ") || typeObject.includes("Pir\u00E2mide triangular ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let primitiveElement = primitivesArray[indexElement];
                primitiveElement.translation.x = parseFloat(translationX) / 100;
                primitiveElement.translation.y = parseFloat(translationY) / 100;
                primitiveElement.translation.z = parseFloat(translationZ) / 100;

                // *** Apply transformations ***
                mat4.translate(ctm, ctm, [primitiveElement.translation.x, primitiveElement.translation.y, primitiveElement.translation.z]);

                // *** Transfer the information to the model viewer ***
                gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

                // *** Draw the triangles ***
                gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
            } else if (typeObject.includes("Modelo ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let modelElement = modelsArray[indexElement];
                modelElement.translation.x = parseFloat(translationX) / 100;
                modelElement.translation.y = parseFloat(translationY) / 100;
                modelElement.translation.z = parseFloat(translationZ) / 100;

                // *** Apply transformations ***
                mat4.translate(ctm, ctm, [modelElement.translation.x, modelElement.translation.y, modelElement.translation.z]);

                // *** Transfer the information to the model viewer ***
                gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

                // *** Draw the triangles ***
                gl.drawArrays(gl.TRIANGLES, 0, modelElement.data.position.length / 3);
            } else
                return -1;
        }

        if (textureChosen.length !== 0) {
            if (typeObject.includes("Cubo ") || typeObject.includes("Pir\u00E2mide triangular ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let primitiveElement = primitivesArray[indexElement];

                let stringSplit = textureChosen.split('\\').pop().split('/').pop();
                let texturePathChosen = "modelos/" + stringSplit;

                let image = new Image();
                image.src = texturePathChosen;
                image.onload = function () {
                    configureTexture(image);
                }
                primitiveElement.textureId = counter;
                counter++;
            } else if (typeObject.includes("Modelo ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let modelElement = modelsArray[indexElement];

                let stringSplit = textureChosen.split('\\').pop().split('/').pop();
                let texturePathChosen = "modelos/" + stringSplit;

                let image = new Image();
                image.src = texturePathChosen;
                image.onload = function () {
                    configureTexture(image);
                }
                modelElement.textureId = counter;
                counter++;
            } else
                return -1;
        }
        else
        {
            if (typeObject.includes("Cubo ") || typeObject.includes("Pir\u00E2mide triangular ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let primitiveElement = primitivesArray[indexElement];

                let texturePathChosen = "modelos/white.png";

                let image = new Image();
                image.src = texturePathChosen;
                image.onload = function () {
                    configureTexture(image);
                }
                primitiveElement.textureId = counter;
                counter++;
            } else if (typeObject.includes("Modelo ")) {
                let indexElement = typeObject.substring(typeObject.length - 1);
                let modelElement = modelsArray[indexElement];

                let texturePathChosen = "modelos/white.png";

                let image = new Image();
                image.src = texturePathChosen;
                image.onload = function () {
                    configureTexture(image);
                }
                modelElement.textureId = counter;
                counter++;
            } else
                return -1;
        }
    }
    else
        return -1;
}


function cube() {

    // Specify the coordinates to draw
    pointsArray = [
        //FRONT FACE
        -.5, 0.5, 0.5,
        -.5, -.5, 0.5,
        0.5, -.5, 0.5,
        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, 0.5, 0.5,
        //RIGHT FACE
        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        0.5, 0.5, 0.5,
        0.5, -.5, -.5,
        0.5, 0.5, -.5,
        //BOTTOM FACE
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,
        -.5, -.5, -.5,
        0.5, -.5, 0.5,
        -.5, -.5, -.5,
        0.5, -.5, -.5,
        //TOP FACE
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        //BACK FACE
        -.5, -.5, -.5,
        -.5, 0.5, -.5,
        0.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, 0.5, -.5,
        0.5, -.5, -.5,
        //LEFT FACE
        -.5, 0.5, -.5,
        -.5, -.5, -.5,
        -.5, -.5, 0.5,
        -.5, 0.5, -.5,
        -.5, -.5, 0.5,
        -.5, 0.5, 0.5,
    ];

    // Get coordinates to insert texture in cube
    texCoordsArray = [
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
    ];

    normalsArray = [
        //FRONT FACE
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        //RIGHT FACE
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        //BOTTOM FACE
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        //TOP FACE
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        //BACK FACE
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        //LEFT FACE
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
    ]

}

function triangularPyramid() {

    // Specify the coordinates to draw
    pointsArray = [
        //FRONT FACE
        -.5, -.5, .5,
        0, .5, 0,
        .5, -.5, .5,
        //RIGHT FACE
        0, .5, 0,
        .5, -.5, .5,
        0, -.5, -.5,
        //LEFT FACE
        -.5, -.5, .5,
        0, -.5, -.5,
        0, .5, 0,
        //BOTTOM FACE
        -.5, -.5, .5,
        0, -.5, -.5,
        .5, -.5, .5,
    ];

    // Get coordinates to insert texture in cube
    texCoordsArray = [
        0, 0,
        0, 1,
        1, 1,

        0, 0,
        0, 1,
        1, 1,

        0, 0,
        0, 1,
        1, 1,

        1, 1,
        1, 0,
        0, 0,
    ];

    normalsArray = [
        0, .25, 0.5,
        0, .25, 0.5,
        0, .25, 0.5,

        .5, .25, 0,
        .5, .25, 0,
        .5, .25, 0,

        -.5, .25, 0,
        -.5, .25, 0,
        -.5, .25, 0,

        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
    ]

}

function preparePrimitive(primitive)
{
    if(primitive.id === "Cubo ")
    {
        cube();
    }
    else if(primitive.id === "Pir\u00E2mide triangular ")
    {
        triangularPyramid();
    }

    // *** Send position data to the GPU ***
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsArray), gl.STATIC_DRAW);

    // *** Define the form of the data ***
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // Send texture data to the GPU
    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i( gl.getUniformLocation(program, "texture"), primitive.textureId );

    // Send texture data to the GPU
    let nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let normalCoord = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(normalCoord);
    gl.vertexAttribPointer(normalCoord, 3, gl.FLOAT, false, 0, 0);

    // *** Send color data to the GPU ***
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(primitive.colors), gl.STATIC_DRAW);

    // *** Define the color of the data ***
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);


    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();

    // *** Apply transformations ***
    mat4.scale(ctm, ctm, [primitive.scale.x, primitive.scale.y, primitive.scale.z]);
    mat4.translate(ctm, ctm, [primitive.translation.x, primitive.translation.y, primitive.translation.z]);

    // *** Rotate cube (if necessary) ***
    primitive.currentRotation.x += primitive.rotation.x;
    primitive.currentRotation.y += primitive.rotation.y;
    primitive.currentRotation.z += primitive.rotation.z;
    mat4.rotateX(ctm, ctm, primitive.currentRotation.x);
    mat4.rotateY(ctm, ctm, primitive.currentRotation.y);
    mat4.rotateZ(ctm, ctm, primitive.currentRotation.z);

    // *** Transfer the information to the model viewer ***
    gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

    // *** Draw the triangles ***
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
}

function addPrimitive(textureChosen, primitiveType) {
    if(primitivesArray.length < MAX_PRIMITIVES) {

        let image;
        if(textureChosen !== "")
        {
            const stringSplit = textureChosen.split('\\').pop().split('/').pop();
            model_txt = "modelos/" + stringSplit;
            image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }
        else
        {
            model_txt = "modelos/white.png";
            image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }

        if(primitiveType === "Cubo ") {
            let faceColor1 = document.getElementById('color-face-1').value;
            let faceColor2 = document.getElementById('color-face-2').value;
            let faceColor3 = document.getElementById('color-face-3').value;
            let faceColor4 = document.getElementById('color-face-4').value;
            let faceColor5 = document.getElementById('color-face-5').value;
            let faceColor6 = document.getElementById('color-face-6').value;
            let arrayFaceColors = [faceColor1, faceColor2, faceColor3, faceColor4, faceColor5, faceColor6];

            // Set the color of the faces
            for (let face = 0; face < 6; face++) {
                let faceColor = vertexColors[arrayFaceColors[face]];
                for (let vertex = 0; vertex < 6; vertex++) {
                    colorsArray.push(...faceColor);
                }
            }
        }
        else if(primitiveType === "Pir\u00E2mide triangular ")
        {
            let faceColor1 = document.getElementById('color-face-1').value;
            let faceColor2 = document.getElementById('color-face-2').value;
            let faceColor3 = document.getElementById('color-face-3').value;
            let faceColor4 = document.getElementById('color-face-4').value;
            let arrayFaceColors = [faceColor1,faceColor2,faceColor3,faceColor4];

            // Set the color of the faces
            for (let face = 0; face < 4; face++) {
                let faceColor = vertexColors[arrayFaceColors[face]];
                for (let vertex = 0; vertex < 3; vertex++) {
                    colorsArray.push(...faceColor);
                }
            }
        }

        // Create the primitive object
        let primitive = {
            id: primitiveType,
            colors: colorsArray,
            textureId: counter,
            scale: {
                x: parseFloat("100") / 100,
                y: parseFloat("100") / 100,
                z: parseFloat("100") / 100,
            },
            translation: {
                x: parseFloat("0") / 100,
                y: parseFloat("0") / 100,
                z: parseFloat("0") / 100
            },
            rotation: {
                x: parseFloat("0") * (Math.PI / 180),
                y: parseFloat("0") * (Math.PI / 180),
                z: parseFloat("0") * (Math.PI / 180)
            },
            currentRotation: {
                x: 0,
                y: 0,
                z: 0,
            }
        }

        model_txt = "";
        colorsArray = [];
        counter++;

        // Append the cube object to the array
        primitivesArray.push(primitive);
    }
    else
        alert("Maximum number of primitives reached!");
}

function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  Add the cubes to the canvas
    for (const primitive of primitivesArray) {
        preparePrimitive(primitive);
    }

    // Add objects to the canvas
    for (const model of modelsArray)
    {
        prepareModel(model);
    }

    // Make the new frame
    requestAnimationFrame(render);
}

function configureTexture(image) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.activeTexture(gl.TEXTURE0 + counter);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), counter);
}

function prepareModel(model)
{
    // *** Send position data to the GPU ***
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.data.position), gl.STATIC_DRAW);

    // *** Define the form of the data ***
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // Send texture data to the GPU
    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.data.texcoord), gl.STATIC_DRAW);

    // Define the form of the data
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 3, gl.FLOAT, false, 0, 0);

    gl.uniform1i( gl.getUniformLocation(program, "texture"), model.textureId );

    // Send texture data to the GPU
    let nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.data.normal), gl.STATIC_DRAW);

    // Define the form of the data
    let normalCoord = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(normalCoord);
    gl.vertexAttribPointer(normalCoord, 3, gl.FLOAT, false, 0, 0);


    // *** Send color data to the GPU ***
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);

    // *** Define the color of the data ***
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();

    // *** Apply transformations ***
    mat4.scale(ctm, ctm, [model.scale.x, model.scale.y, model.scale.z]);
    mat4.translate(ctm, ctm, [model.translation.x, model.translation.y, model.translation.z]);

    // *** Rotate cube (if necessary) ***
    model.currentRotation.x += model.rotation.x;
    model.currentRotation.y += model.rotation.y;
    model.currentRotation.z += model.rotation.z;
    mat4.rotateX(ctm, ctm, model.currentRotation.x);
    mat4.rotateY(ctm, ctm, model.currentRotation.y);
    mat4.rotateZ(ctm, ctm, model.currentRotation.z);

    // *** Transfer the information to the model viewer ***
    gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

    // *** Draw the triangles ***
    gl.drawArrays(gl.TRIANGLES, 0, model.data.position.length / 3);
}

async function createObject(modelChosen, textureChosen)
{
    if(modelsArray.length < MAX_MODELS) {
        const stringSplit = modelChosen.split('\\').pop().split('/').pop();
        model_src = "modelos/" + stringSplit;

        let modelContent = await loadObjResource(model_src);
        let modelData = parseOBJ(modelContent);
        pointsArray = modelData.position;
        texCoordsArray = modelData.texcoord;
        normalsArray = modelData.normal;
        colorsArray = Array(pointsArray.length).fill(1.0);
        normalize(pointsArray);

        if(textureChosen !== "")
        {
            let stringSplit1 = textureChosen.split('\\').pop().split('/').pop();
            model_txt = "modelos/" + stringSplit1;
            let image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }
        else
        {
            model_txt = "modelos/white.png";
            let image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }

        let modelDataElement = {
            data: modelData,
            colors: colorsArray,
            textureId: counter,
            scale: {
                x: parseFloat("100") / 100,
                y: parseFloat("100") / 100,
                z: parseFloat("100") / 100,
            },
            translation: {
                x: parseFloat("0") / 100,
                y: parseFloat("0") / 100,
                z: parseFloat("0") / 100
            },
            rotation: {
                x: parseFloat("0") * (Math.PI / 180),
                y: parseFloat("0") * (Math.PI / 180),
                z: parseFloat("0") * (Math.PI / 180)
            },
            currentRotation: {
                x: 0,
                y: 0,
                z: 0,
            }
        }

        model_src = "";
        model_txt = "";
        colorsArray = [];
        counter++;

        modelsArray.push(modelDataElement);
    }
    else
    {
        alert("Maximum number of models reached!");
    }
}

function applyLighting()
{
    let typeLight = document.getElementById("light-type").value;

    let lightDirectionX = document.getElementById("direction-x").value;
    let lightDirectionY = document.getElementById("direction-y").value;
    let lightDirectionZ = document.getElementById("direction-z").value;

    let lightColorRed = document.getElementById("intensity-r").value;
    let lightColorGreen = document.getElementById("intensity-g").value;
    let lightColorBlue = document.getElementById("intensity-b").value;

    if(typeLight === "ambient")
    {
        gl.uniform3f(ambientUniformLocation,lightColorRed,lightColorGreen,lightColorBlue);
    }
    else if(typeLight === "diffuse")
    {
        gl.uniform3f(diffColorUniformLocation,lightColorRed,lightColorGreen,lightColorBlue);
        gl.uniform3f(diffDirectionUniformLocation,lightDirectionX,lightDirectionY,lightDirectionZ);
    }
    else
    {
        return -1;
    }
}
function endAnimation(){
    let typeObject = document.getElementById("object-type").options[document.getElementById("object-type").selectedIndex].text;
        if(typeObject.includes("Cubo ") || typeObject.includes("Pir\u00E2mide triangular "))
        {
            let indexElement = typeObject.substring(typeObject.length - 1);
            let primitiveElement = primitivesArray[indexElement];
            primitiveElement.rotation.x = 0;
            primitiveElement.rotation.y = 0;
            primitiveElement.rotation.z = 0;

            primitiveElement.currentRotation.x += primitiveElement.rotation.x;
            primitiveElement.currentRotation.y += primitiveElement.rotation.y;
            primitiveElement.currentRotation.z += primitiveElement.rotation.z;
            mat4.rotateX(ctm, ctm, primitiveElement.currentRotation.x);
            mat4.rotateY(ctm, ctm, primitiveElement.currentRotation.y);
            mat4.rotateZ(ctm, ctm, primitiveElement.currentRotation.z);

            // *** Transfer the information to the model viewer ***
            gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

            // *** Draw the triangles ***
            gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
        }
        else if(typeObject.includes("Modelo "))
        {
            let indexElement = typeObject.substring(typeObject.length - 1);
            let modelElement = modelsArray[indexElement];
            modelElement.rotation.x = 0
            modelElement.rotation.y = 0
            modelElement.rotation.z = 0

            modelElement.currentRotation.x += modelElement.rotation.x;
            modelElement.currentRotation.y += modelElement.rotation.y;
            modelElement.currentRotation.z += modelElement.rotation.z;
            mat4.rotateX(ctm, ctm, modelElement.currentRotation.x);
            mat4.rotateY(ctm, ctm, modelElement.currentRotation.y);
            mat4.rotateZ(ctm, ctm, modelElement.currentRotation.z);

            // *** Transfer the information to the model viewer ***
            gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

            // *** Draw the triangles ***
            gl.drawArrays(gl.TRIANGLES, 0, modelElement.data.position.length / 3);
        }
        else
            return -1;
}

function startAnimation()
{
    let typeObject = document.getElementById("object-type").options[document.getElementById("object-type").selectedIndex].text;
    let rotationX = document.getElementById("rotation-x").value;
    let rotationY = document.getElementById("rotation-y").value;
    let rotationZ = document.getElementById("rotation-z").value;

    if(rotationX.length !== 0 && rotationY.length !== 0 && rotationZ.length !== 0){
        if(typeObject.includes("Cubo ") || typeObject.includes("Pir\u00E2mide triangular "))
        {
            let indexElement = typeObject.substring(typeObject.length - 1);
            let primitiveElement = primitivesArray[indexElement];
            primitiveElement.rotation.x = parseFloat(rotationX) * (Math.PI / 180);
            primitiveElement.rotation.y = parseFloat(rotationY) * (Math.PI / 180);
            primitiveElement.rotation.z = parseFloat(rotationZ) * (Math.PI / 180);

            primitiveElement.currentRotation.x += primitiveElement.rotation.x;
            primitiveElement.currentRotation.y += primitiveElement.rotation.y;
            primitiveElement.currentRotation.z += primitiveElement.rotation.z;
            mat4.rotateX(ctm, ctm, primitiveElement.currentRotation.x);
            mat4.rotateY(ctm, ctm, primitiveElement.currentRotation.y);
            mat4.rotateZ(ctm, ctm, primitiveElement.currentRotation.z);

            // *** Transfer the information to the model viewer ***
            gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

            // *** Draw the triangles ***
            gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
        }
        else if(typeObject.includes("Modelo "))
        {
            let indexElement = typeObject.substring(typeObject.length - 1);
            let modelElement = modelsArray[indexElement];
            modelElement.rotation.x = parseFloat(rotationX) * (Math.PI / 180);
            modelElement.rotation.y = parseFloat(rotationY) * (Math.PI / 180);
            modelElement.rotation.z = parseFloat(rotationZ) * (Math.PI / 180);

            modelElement.currentRotation.x += modelElement.rotation.x;
            modelElement.currentRotation.y += modelElement.rotation.y;
            modelElement.currentRotation.z += modelElement.rotation.z;
            mat4.rotateX(ctm, ctm, modelElement.currentRotation.x);
            mat4.rotateY(ctm, ctm, modelElement.currentRotation.y);
            mat4.rotateZ(ctm, ctm, modelElement.currentRotation.z);

            // *** Transfer the information to the model viewer ***
            gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

            // *** Draw the triangles ***
            gl.drawArrays(gl.TRIANGLES, 0, modelElement.data.position.length / 3);
        }
        else
            return -1;
    }
    else
        return -1;
}

function updateOptionsSelect(typeObject)
{
    let options = document.getElementById('object-type').options;
    let options2 = document.getElementById('object-type-manipulation').options;

    if(typeObject === "Cubo " || typeObject === "Pir\u00E2mide triangular ")
    {
        let option = document.createElement("option");
        option.text = typeObject + (primitivesArray.length - 1);
        option.id = typeObject + (primitivesArray.length - 1);
        options2.add(option);

        let option2 = document.createElement("option");
        option2.text = typeObject + (primitivesArray.length - 1);
        option2.id = typeObject + (primitivesArray.length - 1);
        options.add(option2);
    }
    else if(typeObject === "Modelo ")
    {
        let option = document.createElement("option");
        option.text = typeObject + (modelsArray.length - 1);
        option.id = typeObject + (modelsArray.length - 1);
        options2.add(option);

        let option2 = document.createElement("option");
        option2.text = typeObject + (modelsArray.length - 1);
        option2.id = typeObject + (modelsArray.length - 1);
        options.add(option2);
    }
    else if(typeObject === "REMOVE") {
        for (let i = options.length - 1; i >= 0; i--) {
            options.remove(i);
            options2.remove(i);
        }
    }
    else
        return -1;
}
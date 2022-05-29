precision mediump float;

attribute vec3 vPosition;
attribute vec2 vTexCoord;
attribute vec3 vNormal;

//attribute vec3 vColor;
//varying vec3 fColor;

varying vec2 fTexCoord;
varying vec3 fNormal;

uniform mat4 modelViewMatrix;

void main() {
    //fColor = vColor;
    fTexCoord = vTexCoord;
    fNormal = (modelViewMatrix * vec4(vNormal,1.0)).xyz;
    gl_Position = modelViewMatrix * vec4(vPosition, 1.0);
}
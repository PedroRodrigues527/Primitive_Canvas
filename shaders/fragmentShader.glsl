precision mediump float;

struct DirectionalLight
{
	vec3 direction;
    vec3 color;
};

varying vec2 fTexCoord;

//varying vec3 fColor;

uniform sampler2D texture;
uniform vec3 ambientLightIntensity;
varying vec3 fNormal;
uniform DirectionalLight diffuse_light;

void main()
{
	vec3 phongLight = ambientLightIntensity + diffuse_light.color * max(dot(fNormal, diffuse_light.direction), 0.0);
	vec4 texel = texture2D(texture, fTexCoord);
	gl_FragColor = vec4(texel.rgb * phongLight, texel.a);
	//gl_FragColor = vec4(fColor, 1.0);
}
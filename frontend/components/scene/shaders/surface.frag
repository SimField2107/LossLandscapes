varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;
varying vec3 vViewPosition;

uniform float uFresnelPower;
uniform float uRimIntensity;
uniform vec3 uRimColor;
uniform int uColorMode;
uniform sampler2D uGradientMap;
uniform float uMorph;
uniform float uWireframeBlend;
uniform float uGridStrength;

vec3 jet(float t) {
  t = clamp(t, 0.0, 1.0);
  
  vec3 color;
  if (t < 0.125) {
    color = vec3(0.0, 0.0, 0.5 + t * 4.0);
  } else if (t < 0.375) {
    color = vec3(0.0, (t - 0.125) * 4.0, 1.0);
  } else if (t < 0.625) {
    color = vec3((t - 0.375) * 4.0, 1.0, 1.0 - (t - 0.375) * 4.0);
  } else if (t < 0.875) {
    color = vec3(1.0, 1.0 - (t - 0.625) * 4.0, 0.0);
  } else {
    color = vec3(1.0 - (t - 0.875) * 2.0, 0.0, 0.0);
  }
  
  return color;
}

vec3 turbo(float t) {
  const vec3 c0 = vec3(0.1140890109226559, 0.06288340699912215, 0.2248337216805064);
  const vec3 c1 = vec3(6.716419496985708, 3.182286745507602, 7.571581586103393);
  const vec3 c2 = vec3(-66.09402360453038, -4.9279827041226, -10.09439367561635);
  const vec3 c3 = vec3(228.7660791526501, 25.04986699771073, -91.54105330182436);
  const vec3 c4 = vec3(-334.8351565777451, -69.31749712757485, 288.5858850615712);
  const vec3 c5 = vec3(218.7637218434795, 67.52150567819112, -305.2045772184957);
  const vec3 c6 = vec3(-52.88903478218835, -21.54527364654712, 110.5174647748972);
  
  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
}

vec3 viridis(float t) {
  const vec3 c0 = vec3(0.2777, 0.0054, 0.3340);
  const vec3 c1 = vec3(0.1050, 0.6388, 0.7267);
  const vec3 c2 = vec3(-0.3308, 0.2148, 0.0942);
  const vec3 c3 = vec3(-4.6342, -5.7991, -19.3324);
  const vec3 c4 = vec3(6.2282, 14.1799, 56.6905);
  const vec3 c5 = vec3(4.7763, -13.7451, -65.3530);
  const vec3 c6 = vec3(-5.4354, 4.6456, 26.3124);
  
  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
}

float gridLine(vec2 uv, float divisions, float thickness) {
  vec2 grid = abs(fract(uv * divisions - 0.5) - 0.5) / fwidth(uv * divisions);
  float line = min(grid.x, grid.y);
  return 1.0 - min(line, thickness) / thickness;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  float heightNorm = clamp(vHeight, 0.0, 1.0);
  vec3 baseColor;
  
  if (uColorMode == 0) {
    baseColor = jet(heightNorm);
  } else if (uColorMode == 1) {
    baseColor = turbo(heightNorm);
  } else {
    float gradMag = texture2D(uGradientMap, vUv).r;
    baseColor = viridis(clamp(gradMag, 0.0, 1.0));
  }
  
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
  float diffuse = max(dot(normal, lightDir), 0.0);
  diffuse = diffuse * 0.4 + 0.6;
  
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 48.0);
  
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
  vec3 rimLight = uRimColor * fresnel * uRimIntensity;
  
  vec3 color = baseColor * diffuse;
  color += vec3(1.0) * specular * 0.15;
  color += rimLight * 0.5;
  
  if (uGridStrength > 0.0) {
    float grid = gridLine(vUv, 20.0, 1.5);
    vec3 gridColor = mix(color, vec3(1.0), 0.4);
    color = mix(color, gridColor, grid * uGridStrength);
  }
  
  gl_FragColor = vec4(color, 1.0);
}

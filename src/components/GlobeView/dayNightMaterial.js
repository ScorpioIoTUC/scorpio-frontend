import { MeshPhongMaterial, ShaderMaterial, TextureLoader, Vector2 } from 'three'

const DAY_TEXTURE = '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg'
const NIGHT_TEXTURE = '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'

const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793

    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;

    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(in float angle) {
      return angle * PI / 180.0;
    }

    vec3 polarToCartesian(in vec2 coordinates) {
      float theta = toRad(90.0 - coordinates.x);
      float phi = toRad(90.0 - coordinates.y);

      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);

      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );

      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );

      vec3 rotatedSunDirection = rotX * rotY * polarToCartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.12, 0.12, intensity);

      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `,
}

function dayOfYearUtc(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

  return Math.floor((current - start) / 86400000)
}

export function sunPositionAt(date = new Date()) {
  const dayOfYear = dayOfYearUtc(date)
  const minutesUtc = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  const fractionalHour = minutesUtc / 60
  const gamma = (2 * Math.PI) / 365 * (dayOfYear - 1 + (fractionalHour - 12) / 24)

  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))

  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)

  const longitude = (720 - minutesUtc - equationOfTime) / 4
  const latitude = (declination * 180) / Math.PI

  return [longitude, latitude]
}

export async function createDayNightMaterial() {
  const loader = new TextureLoader()
  loader.setCrossOrigin('anonymous')

  const [dayTexture, nightTexture] = await Promise.all([
    loader.loadAsync(DAY_TEXTURE),
    loader.loadAsync(NIGHT_TEXTURE),
  ])

  const material = new ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunPosition: { value: new Vector2(...sunPositionAt(new Date())) },
      globeRotation: { value: new Vector2() },
    },
    vertexShader: dayNightShader.vertexShader,
    fragmentShader: dayNightShader.fragmentShader,
  })

  return material
}

export function createFallbackGlobeMaterial() {
  return new MeshPhongMaterial({
    color: '#0f3b70',
    emissive: '#020617',
    shininess: 8,
  })
}

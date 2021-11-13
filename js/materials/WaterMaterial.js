"use strict"

import { DoubleSide, ShaderMaterial } from "../lib/three.module.js";

export default class WaterMaterial extends ShaderMaterial {

    constructor(normalmap) {

        const vertexShader =/*glsl*/ `

            precision mediump float;

            varying vec2 texcoord;
            uniform float time;
            out vec3 pos;

            void main() {

                vec4 p = modelViewMatrix * vec4(position, 1.0);
                pos = vec3(p.xyz) / p.w;

                texcoord = position.xy;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            }
        `
        const fragmentShader =/*glsl*/ `

            precision mediump float;

            uniform float time;
            uniform sampler2D nmap;
            varying vec2 texcoord;
            in vec3 pos;
            const vec4 color = vec4(0.0, 0.6, 1.0, 1.0);

            float modulo(float a, float b) {
                return a - (b * floor(a/b));
            }

            vec4 mix(vec4 a, vec4 b, float f) {
                return f * a + (1.0-f) * b;
            }

            void main() {

                float timeShift = time * 0.0003;
                float x1 = modulo(texcoord.x + timeShift, 1.0);
                float x2 = modulo(texcoord.x - timeShift, 1.0);
                float y = modulo(texcoord.y + timeShift, 1.0);

                vec4 n1 = texture(nmap, vec2(x1,y));
                vec4 n2 = texture(nmap, vec2(x2, y));
                vec4 normal = mix(n1, n2, 0.5);

                vec3 lightPos = vec3(100, 400, 0);
                vec3 lightDirection = normalize(lightPos);

                float lambertian = clamp(dot(lightDirection, normal.xyz), 0.001, 1.0);

                gl_FragColor = lambertian * color;

            }
        `

        super({        
            side: DoubleSide,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            uniforms: {
                time: { value: 0 },
                nmap: { value: normalmap },
                PI: { value: Math.PI }
            }
        });
        
    }
    
}
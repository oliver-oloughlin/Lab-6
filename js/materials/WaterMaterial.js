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
            uniform vec3 sunPosition;
            varying vec2 texcoord;
            in vec3 pos;
            const vec3 color = vec3(0.0, 0.3, 0.6);

            float modulo(float a, float b) {
                return a - (b * floor(a/b));
            }

            vec4 mix(vec4 a, vec4 b, float f) {
                return f * a + (1.0-f) * b;
            }

            void main() {

                float timeShift = time * 0.00015; // How fast the normal map moves
                float x1 = modulo(texcoord.x + timeShift, 1.0); // This x coordinate moves in positive direction
                float x2 = modulo(texcoord.x - timeShift, 1.0); // This x coordinate moves in negative direction
                float y = modulo(texcoord.y + timeShift, 1.0); // y always moves in positive direction

                // An attempt at making the edges slightly less jarring
                float shiftx1 = 0.0;
                float shiftx2 = 0.0;
                float shifty = 0.0;

                if (x1 < 0.01) shiftx1 = x1;
                else if (x1 > 0.99) shiftx1 = -x1;

                if (x2 < 0.01) shiftx2 = x2;
                else if (x2 > 0.99) shiftx2 = -x2;

                if (y < 0.01) shifty = y;
                else if (y > 0.99) shifty = -y;

                // We get 2 normals from the normalmap based on x1 and x2, and we use the same y for both. This lets us move 2 perceived instances of the normalmap across each other diagonally.
                vec4 n1 = texture(nmap, vec2(x1 + shiftx1, y + shifty));
                vec4 n2 = texture(nmap, vec2(x2 + shiftx2, y + shifty));
                vec4 normal = max(n1, n2); // We mix the 2 normals into 1 that  we actually use

                // Light..
                vec3 lightDirection = normalize(sunPosition);
                float lambertian = clamp(dot(lightDirection, normal.xyz), 0.001, 1.0);

                vec3 reflectDirection = reflect(-sunPosition, normal.xyz);
                vec3 viewDirection = normalize(-pos);

                float shininess = 0.00001;
                vec3 specularColor = vec3(0.1, 0.2, 0.25);
                float specular = 0.0;
                if (lambertian > 0.0) {
                    float specAngle = max(dot(reflectDirection, viewDirection), 0.0);
                    specular = pow(specAngle, shininess);
                }

                // Final output
                gl_FragColor = vec4((lambertian * color) + (specular * specularColor), 1.0);

            }
        `

        super({        
            side: DoubleSide,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            uniforms: {
                time: { value: 0 },
                nmap: { value: normalmap },
                PI: { value: Math.PI },
                sunPosition: { value: [10, 10, 0] }
            }
        });
        
    }
    
}
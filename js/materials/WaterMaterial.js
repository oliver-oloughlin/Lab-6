"use strict"

import { DoubleSide, ShaderMaterial } from "../lib/three.module.js";

export default class WaterMaterial extends ShaderMaterial {

    constructor(normalmap) {

        const vertexShader =/*glsl*/ `

            precision mediump float;
            varying vec2 texcoord;
            uniform float time;

            void main() {
                texcoord = position.xy;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `
        const fragmentShader =/*glsl*/ `

            precision mediump float;
            uniform float time;
            uniform sampler2D nmap;
            in vec2 texcoord;

            void main() {
                vec4 tex = texture(nmap, texcoord);
                gl_FragColor = tex;
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
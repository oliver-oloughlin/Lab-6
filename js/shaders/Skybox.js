"use strict";

// Sources:
// https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-16-accurate-atmospheric-scattering

import { DoubleSide, ShaderMaterial } from "../lib/three.module.js";

export default class Skybox extends ShaderMaterial{
    constructor()
    {
        const vertexShader =/*glsl*/ `
            varying vec2 vUv;
            varying vec3 vPosition;
            //uniform vec2 pixels;

            //out vec2 vUv;

            void main(){
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `

        const fragmentShader =/*glsl*/ `
            const float PI = 3.14159265;
            const float invPI = 1.0 / PI;

            const float zenithOffset = 0.1;
            const float multiScatterPhase = 0.1;
            const float density = 0.7;

            const float anisotropicIntensity = 0.0;
            
            const vec3 skyColor = vec3(0.39, 0.57, 1.0)*(1.0 + anisotropicIntensity); // fine tune at a later stage

            uniform vec2 sunDirection;
            varying vec2 iResolution; // nødvendig?

            varying vec3 vPosition;

            #define smooth(x) x * x * (3.0-2.0*x) // følger WebGL order of operations??
            #define zenithDensity(x) density / pow(max(x - zenithOffset, 0.35e-2), 0.75)

            vec3 skyAbsorption(vec3 x, float y){
                vec3 absorption = exp2(x * -y) * 2.0;
                // Vurder å gjøre dette i input, for så å gange input med hverandre. Mulig det øker ytelse.

                return absorption;
            }

            float getSunPoint(vec2 x, vec2 y){
                return smoothstep(0.03, 0.026, distance(x, y)) * 50.0;
            }

            float rayleighMultiplier(vec2 x, vec2 y){
                return 1.0 + pow(1.0 - clamp(distance(x, y), 0.0, 1.0), 2.0) * PI * 0.5;
            }

            float getMie(vec2 x, vec2 y){
                float disc = clamp(1.0 - pow(distance(x, y), 0.1), 0.0, 1.0);
                
                return disc * disc * disc * 2.0 * PI; // se på effektivisering.
            }

            // Fargelegger skybox
            // Konverter til vec3
            vec3 atmosphericScattering(vec2 x, vec2 y){
                // Original
                //vec2 correctedY = y / max(iResolution.x, iResolution.y) * iResolution.xy;
                
                vec2 correctedY = y / max(vPosition.x, vPosition.y) * vPosition.xy;
                //vec2 correctedY = y / max(0.0, 1.0) * vec2(1920.0, 1080.0);
                //vec2 correctedY = y / max(vPosition.x, vPosition.y) * vec2(1920.0, 1080.0);

                float zenith = zenithDensity(x.y); // krysser matrise x og y
                float sunPointDistanceMultiplier = clamp(length(max(correctedY.y + multiScatterPhase - zenithOffset, 0.0)), 0.0, 1.0);

                float rayleightMult = rayleighMultiplier(x, correctedY);

                vec3 absorption = skyAbsorption(skyColor, zenith);
                vec3 sunAbsorption = skyAbsorption(skyColor, zenithDensity(correctedY.y + multiScatterPhase));
                float zenRay = zenith * rayleightMult;
                vec3 sky = skyColor * vec3(zenRay, zenRay, zenRay);
                vec3 sun = getSunPoint(x, correctedY) * absorption;
                vec3 mie = getMie(x, correctedY) * sunAbsorption;

                vec3 totalSky = mix(sky * absorption, sky / (sky + 0.5), sunPointDistanceMultiplier);
                totalSky += sun + mie;
                totalSky *= sunAbsorption * 0.5 + 0.5 * length(sunAbsorption);

                return totalSky;
            }

            // https://64.github.io/tonemapping/#reinhard-jodie
            // Konverterer fargene til mer realistiske farger. Basert på gradient mapping.
            vec3 reinhardJodie(vec3 map){
                float l = dot(map, vec3(0.2126, 0.7152, 0.0722));
                vec3 tMap = map / (map + 1.0);
                return mix(map / (l + 1.0), tMap, tMap);
            } 
            

            void main(){
                // Få inn fragCoord. Muligens også iResolution.
                vec2 position = vPosition.xy / max(vPosition.x, vPosition.y) * 2.0;
                //vec2 position = vPosition.xy / max(1920.0, 1080.0) * 2.0;

                //hent fra directional light
               // konverter til vec3 
                vec2 lightPosition = vec2(0.5, 0.5) * 2.0;

                vec3 color = atmosphericScattering(position, lightPosition);
                color = reinhardJodie(color);
                color = pow(color, vec3(2.2, 2.2, 2.2));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `

        super({        
            side: DoubleSide,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            uniforms: {
            }
        });
    }
}
export default class ModelLoader {

    static loadAllModels(scene,loader,width,terrainGeometry) {
        loadTrees(scene,loader,width,terrainGeometry);
        loadFlowers(scene,loader,width,terrainGeometry);
    }

}

function loadTrees(scene,loader,width,terrainGeometry) {
    loader.load(
        // resource URL
        'resources/models/kenney_nature_kit/tree_thin.glb',
        // called when resource is loaded
        (object) => {
            for (let x = -width/2; x < width/2; x += 1.3) {
                for (let z = -width/2; z < width/2; z += 1.3) {
                    
                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);
                    const heightL = terrainGeometry.getHeightAt(px - 1, pz);
                    const heightR = terrainGeometry.getHeightAt(px + 1, pz);
                    const heightB = terrainGeometry.getHeightAt(px, pz - 1);
                    const heightF = terrainGeometry.getHeightAt(px, pz + 1);

                    const diffL = Math.abs(height - heightL);
                    const diffR = Math.abs(height - heightR);
                    const diffB = Math.abs(height - heightB);
                    const diffF = Math.abs(height - heightF);

                    if (height > 0.35 * terrainGeometry.height && height < 0.75 * terrainGeometry.height && diffL < 0.07 && diffR < 0.07 && diffB < 0.07 && diffF < 0.07) {
                        const tree = object.scene.children[0].clone();

                        tree.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        tree.position.x = px;
                        tree.position.y = height - 0.01;
                        tree.position.z = pz;

                        tree.rotation.y = Math.random() * (2 * Math.PI);

                        tree.scale.multiplyScalar(0.2 + Math.random() * 3);

                        scene.add(tree);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );
}

function loadFlowers(scene,loader,width,terrainGeometry) {
    loader.load(
        // resource URL
        'resources/models/flower/scene.gltf',
        // called when resource is loaded
        (object) => {
            for (let x = -width/2; x < width/2; x += 5) {
                for (let z = -width/2; z < width/2; z += 5) {
                    
                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);

                    if (height > 0 && height < 3) {
                        const flower = object.scene.children[0].clone();

                        flower.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        flower.position.x = px;
                        flower.position.y = height - 0.01;
                        flower.position.z = pz;

                        flower.rotation.y = Math.random() * (Math.PI / 10);

                        flower.scale.multiplyScalar(Math.random() * 0.5);

                        scene.add(flower);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );
}
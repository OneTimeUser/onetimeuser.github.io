        // Hex color palette for background colors
        const hexColors = [
            '#625dc1','#effe54', '#575c45', '#e6e1de', 
            '#061316'
        ];

        let currentColorIndex = 0;

        // Hex selector functionality
        const hexSelector = document.getElementById('hexSelector');

        function getLuminance(hexColor) {
            const hex = hexColor.replace('#', '');
            const r = parseInt(hex.slice(0, 2), 16) / 255;
            const g = parseInt(hex.slice(2, 4), 16) / 255;
            const b = parseInt(hex.slice(4, 6), 16) / 255;
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        function setThemeColor(newColor) {
            if (newColor === '#625dc1' || newColor === '#effe54' || newColor === '#e6e1de') {
                secColor = '#061316';
            } else {
                secColor = '#e6e1de';
            }
            document.body.style.backgroundColor = newColor;
            document.body.style.color = secColor;
            document.querySelectorAll('a').forEach(link => {
                link.style.color = secColor;
            });
            document.querySelectorAll('button').forEach(btn => {
                btn.style.color = secColor;
            });
            document.querySelectorAll('footer').forEach(foot => {
                foot.style.borderColor = secColor;
            });
            applyModelColor(newColor);

            if (ambientLight && directionalLight) {
                const isDarkTheme = getLuminance(newColor) < 0.5;
                ambientLight.intensity = isDarkTheme ? 0.6 : 0.35;
                directionalLight.intensity = isDarkTheme ? 1.0 : 0.9;
                if (modelMaterial) {
                    modelMaterial.emissiveIntensity = isDarkTheme ? 0.35 : 0.08;
                }
            }
        }

        hexSelector.addEventListener('click', () => {
            currentColorIndex = (currentColorIndex + 1) % hexColors.length;
            const newColor = hexColors[currentColorIndex];
            setThemeColor(newColor);
        });

        // Three.js setup
        const canvas = document.getElementById('canvas3d');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true,
            antialias: true 
        });

        renderer.setSize(300, 300);
        renderer.setClearColor(0x000000, 0);

        // Create a cube placeholder
        // TO LOAD YOUR OBJ FILE:
        // 1. Include OBJLoader: <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js"></script>
        // 2. Replace the cube code below with:
        //    const loader = new THREE.OBJLoader();
        //    loader.load('path/to/your/model.obj', (obj) => {
        //        obj.scale.set(2, 2, 2); // Adjust scale as needed
        //        scene.add(obj);
        //        mesh = obj; // Store reference for rotation
        //    });

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.5,
            metalness: 0.5
        });
        // const cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);

        const modelGroup = new THREE.Group();
        scene.add(modelGroup);

        let mesh = null; // Reference to current mesh/group (cube or loaded OBJ)
        let modelMaterial = null;

        function applyModelColor(hexColor) {
            if (!mesh) {
                return;
            }

            if (!modelMaterial) {
                modelMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(hexColor),
                    roughness: 0.85,
                    metalness: 0.0,
                    emissive: new THREE.Color(hexColor),
                    emissiveIntensity: 0.1,
                    side: THREE.DoubleSide
                });
            } else {
                modelMaterial.color.set(hexColor);
                modelMaterial.emissive.set(hexColor);
            }

            mesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = modelMaterial;
                }
            });
        }

        const loader = new THREE.OBJLoader();
        loader.load(
            'assets/ls.obj',
            (obj) => {
                obj.scale.set(30, 30, 30); // Adjust scale as needed
                modelGroup.add(obj);
                // Auto-center and auto-frame the model in the camera view.
                const box = new THREE.Box3().setFromObject(obj);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                obj.position.sub(center);

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = (camera.fov * Math.PI) / 180;
                const cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
                camera.position.z = cameraDistance * 1.4;
                camera.near = cameraDistance / 100;
                camera.far = cameraDistance * 100;
                camera.updateProjectionMatrix();
                mesh = modelGroup; // Store reference for rotation
                applyModelColor(hexSelector.textContent.trim());
            },
            undefined,
            (error) => {
                console.error('Failed to load OBJ:', error);
            }
        );

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(0, 8, 3);
        scene.add(directionalLight);

        camera.position.z = 5;

        const initialColor = hexSelector.textContent.trim();
        const initialIndex = hexColors.indexOf(initialColor);
        if (initialIndex !== -1) {
            currentColorIndex = initialIndex;
        }
        setThemeColor(hexColors[currentColorIndex]);

        // Animation loop - rotates on X axis
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate on X-axis
            if (mesh) {
                mesh.rotation.y += 0.01;
            }
            
            renderer.render(scene, camera);
        }

        animate();

        // Handle responsive canvas
        function handleResize() {
            const container = document.querySelector('.model-container');
            const size = Math.min(container.offsetWidth, container.offsetHeight);
            renderer.setSize(size, size);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', handleResize);
        handleResize();

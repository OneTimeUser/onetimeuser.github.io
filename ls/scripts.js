        // Hex color palette
        const hexColors = [
            '#effe54', '#575c45', '#625dc1', '#e6e1de', 
            '#061316'
        ];

        const secColors = [
            '#fb5142', '#e10f77', '#9c7f3b', '#e6e1de', 
            '#898989'
        ];

        let currentColorIndex = 0;

        // Hex selector functionality
        const hexSelector = document.getElementById('hexSelector');
        hexSelector.addEventListener('click', () => {
            currentColorIndex = (currentColorIndex + 1) % hexColors.length;
            const newColor = hexColors[currentColorIndex];
            document.body.style.backgroundColor = newColor;
            hexSelector.textContent = newColor;
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
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        camera.position.z = 5;

        let mesh = cube; // Reference to current mesh (cube or loaded OBJ)

        // Animation loop - rotates on X axis
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate on X-axis
            mesh.rotation.x += 0.01;
            
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

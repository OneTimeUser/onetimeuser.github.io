        // Hex color palette for background colors
        const hexColors = [
            '#625dc1', '#effe54', '#575c45', '#e6e1de',
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
            document.querySelectorAll('button:not(.hex-selector)').forEach(btn => {
                btn.style.color = secColor;
            });
            document.querySelectorAll('footer').forEach(foot => {
                foot.style.borderColor = secColor;
            });
            const nextColor = hexColors[(currentColorIndex + 1) % hexColors.length];
            hexSelector.textContent = nextColor;
            document.documentElement.style.setProperty('--next-hex', nextColor);
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

        const cursor = document.querySelector('.custom-cursor');

        document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        });

        // Optional: Hide cursor when it leaves the window
        document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        });

        let isDragging = false;
        let lastPointerX = 0;
        let lastPointerY = 0;
        let velocityX = 0;
        let velocityY = 0;
                
        let targetRotationX = 0;
        let targetRotationY = 0;

        function isInteractiveTarget(target) {
            return target.closest('a, button, input, textarea, select, [role="button"], [role="link"]');
        }



window.addEventListener('pointerdown', (event) => {
    if (isInteractiveTarget(event.target)) return;

    // ONLY allow dragging if it's NOT a mouse (i.e., touch or pen)
    if (event.pointerType !== 'mouse') {
        isDragging = true;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        velocityX = 0;
        velocityY = 0;
    }
});

window.addEventListener('pointermove', (event) => {
    if (!mesh) return;

    // DESKTOP: Passive high-response tracking
    if (event.pointerType === 'mouse') {
        // Calculate normalized position (-1 to 1)
        const mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

        // "Target" rotation (Adjust 1.5 to increase/decrease total rotation range)
        const targetRotY = mouseX * 1.5; 
        const targetRotX = mouseY * 1.5;

        // High-responsiveness: Direct assignment with a tiny bit of smoothing
        // This bypasses the inertia loop for a more 'pinned' feel to the cursor
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.15;
        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.15;
        
        return; // Exit here so dragging logic never runs for mouse
    }

    // MOBILE: Keep your existing drag logic
    if (isDragging) {
        const deltaX = event.clientX - lastPointerX;
        const deltaY = event.clientY - lastPointerY;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;

        const rotateSpeed = 0.008; // Slightly boosted for mobile feel
        mesh.rotation.y += deltaX * rotateSpeed;
        mesh.rotation.x += deltaY * rotateSpeed;

        velocityX = deltaX * rotateSpeed;
        velocityY = deltaY * rotateSpeed;
    }
});
        window.addEventListener('pointerup', () => {
            isDragging = false;
        });

        window.addEventListener('pointercancel', () => {
            isDragging = false;
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

        function frameModel(obj) {
            const box = new THREE.Box3().setFromObject(obj);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            obj.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = (camera.fov * Math.PI) / 180;
            const cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
            const isMobile = window.innerWidth <= 768;
            const padding = isMobile ? 1.6 : 1.4;
            camera.position.z = cameraDistance * padding;
            camera.near = cameraDistance / 100;
            camera.far = cameraDistance * 100;
            camera.updateProjectionMatrix();
        }

        let loadedObj = null;
        const loader = new THREE.OBJLoader();
        loader.load(
            'assets/ls.obj',
            (obj) => {
                const isMobile = window.innerWidth <= 768;
                const baseScale = 50;
                const mobileScale = 50;
                const scaleValue = isMobile ? mobileScale : baseScale;
                obj.scale.set(scaleValue, scaleValue, scaleValue);
                modelGroup.add(obj);
                frameModel(obj);
                loadedObj = obj;
                mesh = modelGroup; // Store reference for rotation
                applyModelColor(hexColors[currentColorIndex]);
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

        setThemeColor(hexColors[currentColorIndex]);

        // Animation loop - rotates on X axis
        function animate() {
            requestAnimationFrame(animate);
            
            if (mesh && !isDragging) {
                const inertia = 0.92;
                mesh.rotation.y += velocityX;
                mesh.rotation.x += velocityY;
                velocityX *= inertia;
                velocityY *= inertia;
            }
            
            renderer.render(scene, camera);
        }

        animate();

        // Handle responsive canvas
        function handleResize() {
            const container = document.querySelector('.model-container');
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            if (loadedObj) {
                const isMobile = window.innerWidth <= 768;
                const baseScale = 30;
                const mobileScale = 50;
                const scaleValue = isMobile ? mobileScale : baseScale;
                loadedObj.scale.set(scaleValue, scaleValue, scaleValue);
                frameModel(loadedObj);
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize();

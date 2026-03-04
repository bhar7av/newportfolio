/* ============================================
   BHARGAV KOUSHAL — PORTFOLIO v2 INSANE EDITION
   Three.js Madness + GSAP + Chaos
   ============================================ */

// ========== THREE.JS INSANE BACKGROUND ==========
(function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // ---- GALAXY VORTEX PARTICLES ----
    const particleCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color(0x00f5ff),
        new THREE.Color(0xa855f7),
        new THREE.Color(0xec4899),
        new THREE.Color(0x3b82f6),
        new THREE.Color(0xffd700),
    ];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.5) * 20;
        const armOffset = (Math.floor(Math.random() * 3)) * (Math.PI * 2 / 3);
        const spiralAngle = angle + armOffset + radius * 0.3;

        angles[i] = spiralAngle;
        radii[i] = radius;

        positions[i * 3] = Math.cos(spiralAngle) * radius + (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
        positions[i * 3 + 2] = Math.sin(spiralAngle) * radius + (Math.random() - 0.5) * 2;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        sizes[i] = Math.random() * 4 + 0.5;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uScroll: { value: 0 },
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uScroll;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vColor = color;
                vec3 pos = position;

                // Spiral rotation
                float dist = length(pos.xz);
                float rotAngle = uTime * 0.08 * (1.0 - dist / 25.0);
                float cosA = cos(rotAngle);
                float sinA = sin(rotAngle);
                pos.x = pos.x * cosA - pos.z * sinA;
                pos.z = pos.x * sinA + pos.z * cosA;

                // Wave distortion
                pos.y += sin(uTime * 0.5 + dist * 0.3) * 0.3;
                pos.x += cos(uTime * 0.3 + pos.z * 0.2) * 0.2;

                // Mouse repulsion
                vec2 mouseWorld = uMouse * 10.0;
                float mouseDist = length(pos.xz - mouseWorld);
                float repulsion = smoothstep(4.0, 0.0, mouseDist) * 2.5;
                pos.xz += normalize(pos.xz - mouseWorld + 0.001) * repulsion;

                // Scroll warp
                pos.z += uScroll * 0.015;

                vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPos.z);
                gl_Position = projectionMatrix * mvPos;

                vAlpha = smoothstep(20.0, 5.0, dist) * 0.9 + 0.1;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec2 uv = gl_PointCoord - 0.5;
                float d = length(uv);
                if (d > 0.5) discard;

                // Glow
                float core = smoothstep(0.5, 0.0, d);
                float glow = pow(core, 1.5);
                float ring = smoothstep(0.5, 0.3, d) * smoothstep(0.3, 0.5, d) * 0.5;

                gl_FragColor = vec4(vColor, (glow + ring) * vAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    const galaxy = new THREE.Points(pGeo, pMat);
    scene.add(galaxy);

    // ---- DNA HELIX ----
    const helixGroup = new THREE.Group();
    const helixPoints1 = [];
    const helixPoints2 = [];
    const rungs = [];

    for (let i = 0; i < 200; i++) {
        const t = i / 200;
        const angle = t * Math.PI * 8;
        const y = (t - 0.5) * 20;
        const r = 1.5;

        helixPoints1.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
        helixPoints2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r));

        if (i % 10 === 0) {
            const rungGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
                new THREE.Vector3(Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r)
            ]);
            const rungMat = new THREE.LineBasicMaterial({
                color: 0x00f5ff,
                transparent: true,
                opacity: 0.25,
            });
            rungs.push(new THREE.Line(rungGeo, rungMat));
            helixGroup.add(rungs[rungs.length - 1]);
        }
    }

    const helixCurve1 = new THREE.CatmullRomCurve3(helixPoints1);
    const helixCurve2 = new THREE.CatmullRomCurve3(helixPoints2);

    const helixTube1 = new THREE.TubeGeometry(helixCurve1, 400, 0.04, 6, false);
    const helixTube2 = new THREE.TubeGeometry(helixCurve2, 400, 0.04, 6, false);

    const helixMat1 = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.5 });
    const helixMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.5 });

    helixGroup.add(new THREE.Mesh(helixTube1, helixMat1));
    helixGroup.add(new THREE.Mesh(helixTube2, helixMat2));

    helixGroup.position.set(-10, 0, -8);
    helixGroup.scale.setScalar(0.7);
    scene.add(helixGroup);

    // ---- FLOATING SHAPES ----
    const shapes = [];

    function addShape(geo, color, x, y, z, rx, ry, rAmp = 0.5) {
        const mat = new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        shapes.push({ mesh, rotSpeed: { x: rx, y: ry }, floatAmp: rAmp, phase: Math.random() * Math.PI * 2 });
        return mesh;
    }

    addShape(new THREE.IcosahedronGeometry(1.8, 1), 0x00f5ff, 8, 3, -7, 0.003, 0.005);
    addShape(new THREE.TorusKnotGeometry(1.2, 0.35, 80, 8), 0xa855f7, -9, -2, -8, 0.004, 0.003, 0.7);
    addShape(new THREE.OctahedronGeometry(1.2, 0), 0xec4899, 7, -5, -5, 0.005, 0.004, 0.3);
    addShape(new THREE.DodecahedronGeometry(1.5, 0), 0x3b82f6, -6, 4, -6, 0.002, 0.006, 0.6);
    addShape(new THREE.TorusGeometry(1.5, 0.4, 12, 24), 0xffd700, 10, -4, -9, 0.006, 0.002, 0.8);

    // ---- CURSOR-TRACKING ROBOT ----
    const robotGroup = new THREE.Group();

    const botMat = (color, wireframe = false, opacity = 1) => new THREE.MeshBasicMaterial({
        color, wireframe, transparent: opacity < 1, opacity
    });

    // Body
    const bodyGeo = new THREE.BoxGeometry(2.2, 2.8, 1.2);
    const body = new THREE.Mesh(bodyGeo, botMat(0x0d1b2a));
    body.position.y = 0;
    robotGroup.add(body);

    // Body border glow
    const bodyBorder = new THREE.Mesh(bodyGeo, botMat(0x00f5ff, true, 0.25));
    bodyBorder.scale.setScalar(1.01);
    body.add(bodyBorder);

    // Chest panel
    const chestPanelGeo = new THREE.BoxGeometry(1.5, 0.9, 0.15);
    const chestPanel = new THREE.Mesh(chestPanelGeo, botMat(0x0a2235));
    chestPanel.position.set(0, 0.2, 0.65);
    body.add(chestPanel);
    const chestBorder = new THREE.Mesh(chestPanelGeo, botMat(0x00f5ff, true, 0.4));
    chestBorder.scale.setScalar(1.02);
    body.add(chestBorder);

    // Chest lights (3 small cubes)
    [-0.45, 0, 0.45].forEach((xOff, idx) => {
        const lightColors = [0x00f5ff, 0xa855f7, 0xec4899];
        const lightGeo = new THREE.BoxGeometry(0.22, 0.22, 0.15);
        const light = new THREE.Mesh(lightGeo, botMat(lightColors[idx]));
        light.position.set(xOff, 0.2, 0.66);
        body.add(light);
    });

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.5, 8);
    const neck = new THREE.Mesh(neckGeo, botMat(0x0d1b2a));
    neck.position.y = 1.65;
    robotGroup.add(neck);

    // Head (pivot for look-at)
    const headPivot = new THREE.Group();
    headPivot.position.y = 2.1;
    robotGroup.add(headPivot);

    const headGeo = new THREE.BoxGeometry(1.8, 1.6, 1.4);
    const head = new THREE.Mesh(headGeo, botMat(0x0d1b2a));
    headPivot.add(head);
    const headBorder = new THREE.Mesh(headGeo, botMat(0x00f5ff, true, 0.3));
    headBorder.scale.setScalar(1.02);
    headPivot.add(headBorder);

    // Antennae
    const antGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6);
    const antBallGeo = new THREE.SphereGeometry(0.1, 8, 8);
    [-0.5, 0.5].forEach(xOff => {
        const ant = new THREE.Mesh(antGeo, botMat(0x00f5ff, false, 0.8));
        ant.position.set(xOff, 1.15, 0);
        headPivot.add(ant);
        const ball = new THREE.Mesh(antBallGeo, botMat(0x00f5ff));
        ball.position.set(xOff, 1.55, 0);
        headPivot.add(ball);
    });

    // Eye sockets
    [-0.42, 0.42].forEach(xOff => {
        const socketGeo = new THREE.BoxGeometry(0.55, 0.42, 0.08);
        const socket = new THREE.Mesh(socketGeo, botMat(0x050c18));
        socket.position.set(xOff, 0.15, 0.72);
        headPivot.add(socket);
    });

    // Eyes (pivot so they can look around)
    const eyePivotL = new THREE.Group();
    const eyePivotR = new THREE.Group();
    eyePivotL.position.set(-0.42, 0.15, 0.68);
    eyePivotR.position.set(0.42, 0.15, 0.68);
    headPivot.add(eyePivotL);
    headPivot.add(eyePivotR);

    const eyeGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(0.08, 8, 8);

    function makeEye(pivot, color) {
        const eyeball = new THREE.Mesh(eyeGeo, botMat(0x111827));
        pivot.add(eyeball);
        const pupil = new THREE.Mesh(pupilGeo, botMat(color));
        pupil.position.set(0, 0, 0.12);
        pivot.add(pupil);
        return pupil;
    }
    const pupilL = makeEye(eyePivotL, 0x00f5ff);
    const pupilR = makeEye(eyePivotR, 0x00f5ff);

    // Eye glow rings
    [-0.42, 0.42].forEach((xOff, idx) => {
        const ringGeo = new THREE.TorusGeometry(0.19, 0.025, 6, 24);
        const glowRing = new THREE.Mesh(ringGeo, botMat(0x00f5ff, false, 0.5));
        glowRing.position.set(xOff, 0.15, 0.72);
        headPivot.add(glowRing);
    });

    // Mouth (thin rectangle)
    const mouthGeo = new THREE.BoxGeometry(0.9, 0.08, 0.08);
    const mouth = new THREE.Mesh(mouthGeo, botMat(0x00f5ff, false, 0.6));
    mouth.position.set(0, -0.45, 0.72);
    headPivot.add(mouth);

    // Mouth dashes
    [-0.28, 0, 0.28].forEach(xOff => {
        const dashGeo = new THREE.BoxGeometry(0.14, 0.09, 0.09);
        const dash = new THREE.Mesh(dashGeo, botMat(0x00f5ff));
        dash.position.set(xOff, -0.45, 0.72);
        headPivot.add(dash);
    });

    // Shoulders
    [-1.4, 1.4].forEach(xOff => {
        const shoulderGeo = new THREE.SphereGeometry(0.45, 10, 10);
        const shoulder = new THREE.Mesh(shoulderGeo, botMat(0x0d1b2a));
        const shoulderBorder = new THREE.Mesh(shoulderGeo, botMat(0xa855f7, true, 0.3));
        shoulder.position.set(xOff, 1.1, 0);
        shoulder.add(shoulderBorder);
        robotGroup.add(shoulder);
    });

    // Arms
    [-1.75, 1.75].forEach((xOff, idx) => {
        const armGeo = new THREE.CylinderGeometry(0.22, 0.2, 2.2, 8);
        const arm = new THREE.Mesh(armGeo, botMat(0x0d1b2a));
        arm.position.set(xOff, -0.2, 0);
        arm.rotation.z = xOff < 0 ? 0.2 : -0.2;
        const armBorder = new THREE.Mesh(armGeo, botMat(0xa855f7, true, 0.2));
        armBorder.scale.setScalar(1.03);
        arm.add(armBorder);
        robotGroup.add(arm);

        // Hand
        const handGeo = new THREE.SphereGeometry(0.32, 10, 10);
        const hand = new THREE.Mesh(handGeo, botMat(0x0d1b2a));
        hand.position.set(xOff + (xOff < 0 ? -0.24 : 0.24), -1.4, 0);
        const handBorder = new THREE.Mesh(handGeo, botMat(0x00f5ff, true, 0.3));
        handBorder.scale.setScalar(1.04);
        hand.add(handBorder);
        robotGroup.add(hand);
    });

    // Legs
    [-0.55, 0.55].forEach(xOff => {
        const legGeo = new THREE.CylinderGeometry(0.3, 0.28, 1.8, 8);
        const leg = new THREE.Mesh(legGeo, botMat(0x0d1b2a));
        leg.position.set(xOff, -2.3, 0);
        const legBorder = new THREE.Mesh(legGeo, botMat(0x00f5ff, true, 0.2));
        legBorder.scale.setScalar(1.03);
        leg.add(legBorder);
        robotGroup.add(leg);

        // Foot
        const footGeo = new THREE.BoxGeometry(0.8, 0.35, 1.0);
        const foot = new THREE.Mesh(footGeo, botMat(0x0d1b2a));
        foot.position.set(xOff, -3.3, 0.15);
        const footBorder = new THREE.Mesh(footGeo, botMat(0x00f5ff, true, 0.25));
        footBorder.scale.setScalar(1.03);
        foot.add(footBorder);
        robotGroup.add(foot);
    });

    robotGroup.position.set(9, 0, -4);
    robotGroup.scale.setScalar(0.55);
    scene.add(robotGroup);

    // Store head/eye pivots for animation
    const robotData = { headPivot, eyePivotL, eyePivotR, pupilL, pupilR };

    // ---- GRID FLOOR ----
    const gridHelper = new THREE.GridHelper(60, 40, 0x00f5ff, 0x00f5ff);
    const gridMat = gridHelper.material;
    gridMat.transparent = true;
    gridMat.opacity = 0.04;
    gridHelper.position.y = -12;
    scene.add(gridHelper);

    // ---- ENERGY RINGS ----
    const rings = [];
    for (let i = 0; i < 5; i++) {
        const ringGeo = new THREE.TorusGeometry(3 + i * 2, 0.02, 4, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00f5ff : 0xa855f7,
            transparent: true,
            opacity: 0.08,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0, 0, 0);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        rings.push({ mesh: ring, speed: 0.001 * (i + 1), phase: i * 0.5 });
    }

    camera.position.set(0, 2, 12);

    // Scroll tracking
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        mouse.x += (mouse.targetX - mouse.x) * 0.04;
        mouse.y += (mouse.targetY - mouse.y) * 0.04;

        // Update galaxy
        pMat.uniforms.uTime.value = time;
        pMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
        pMat.uniforms.uScroll.value = scrollY;

        // Galaxy slow rotation
        galaxy.rotation.y = time * 0.03;

        // DNA rotation
        helixGroup.rotation.y = time * 0.2;
        helixGroup.position.y = Math.sin(time * 0.3) * 1.5;

        // Shape animations
        shapes.forEach(s => {
            s.mesh.rotation.x += s.rotSpeed.x;
            s.mesh.rotation.y += s.rotSpeed.y;
            s.mesh.position.y += Math.sin(time * 0.8 + s.phase) * 0.003 * s.floatAmp;
        });

        // Energy rings pulse
        rings.forEach((r, i) => {
            r.mesh.rotation.z = time * r.speed;
            r.mesh.scale.setScalar(1 + Math.sin(time * 1.5 + r.phase) * 0.05);
            r.mesh.material.opacity = 0.05 + Math.sin(time * 2 + r.phase) * 0.03;
        });

        // Grid breathing
        gridHelper.material.opacity = 0.03 + Math.sin(time * 0.5) * 0.015;
        gridHelper.position.y = -12 + scrollY * 0.005;

        // Robot idle animation + cursor tracking
        robotGroup.position.y = Math.sin(time * 0.9) * 0.3;
        robotGroup.rotation.y = Math.sin(time * 0.25) * 0.06;

        // Head tilts toward mouse (horizontal = Y rotation, vertical = X rotation)
        const targetHeadY = mouse.x * 0.45;
        const targetHeadX = -mouse.y * 0.3;
        robotData.headPivot.rotation.y += (targetHeadY - robotData.headPivot.rotation.y) * 0.06;
        robotData.headPivot.rotation.x += (targetHeadX - robotData.headPivot.rotation.x) * 0.06;

        // Eyes follow cursor (pupils shift position)
        const eyeShiftX = mouse.x * 0.06;
        const eyeShiftY = mouse.y * 0.06;
        robotData.pupilL.position.set(eyeShiftX, eyeShiftY, 0.12);
        robotData.pupilR.position.set(eyeShiftX, eyeShiftY, 0.12);

        // Pulse eye glow color
        const eyeGlowIntensity = 0.5 + Math.sin(time * 2.5) * 0.5;
        const eyeColor = new THREE.Color(0x00f5ff).multiplyScalar(0.5 + eyeGlowIntensity * 0.5);
        robotData.pupilL.material.color = eyeColor;
        robotData.pupilR.material.color = eyeColor;

        // Camera parallax
        camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.025;
        camera.position.y += (-mouse.y * 0.8 + 2 - camera.position.y) * 0.025;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    document.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
})();


// ========== MATRIX RAIN OVERLAY ==========
(function initMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 0; pointer-events: none; opacity: 0.025;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ∑∆∇∞≈∫';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(5, 8, 22, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Gradient colors
            const hue = (i / drops.length) * 180 + 160;
            ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.fillText(char, x, y);

            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 80);
})();


// ========== CLICK PARTICLE EXPLOSION ==========
(function initClickExplosion() {
    const canvas = document.createElement('canvas');
    canvas.id = 'explosion-canvas';
    canvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 9990; pointer-events: none;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const particles = [];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.03 + 0.015;
            this.size = Math.random() * 4 + 1;
            const colors = ['#00f5ff', '#a855f7', '#ec4899', '#3b82f6', '#ffd700', '#00ff88'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.gravity = 0.15;
            this.type = Math.random() > 0.5 ? 'circle' : 'star';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.vx *= 0.98;
            this.life -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;

            if (this.type === 'star') {
                ctx.translate(this.x, this.y);
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5;
                    const r = i % 2 === 0 ? this.size : this.size * 0.4;
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        requestAnimationFrame(loop);
    }
    loop();

    document.addEventListener('click', (e) => {
        const count = 40;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(e.clientX, e.clientY));
        }

        // Ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${e.clientX}px; top: ${e.clientY}px;
            width: 0; height: 0;
            border: 2px solid rgba(0, 245, 255, 0.8);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9989;
            animation: rippleOut 0.8s ease-out forwards;
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });
})();


// ========== MAGNETIC BUTTONS ==========
(function initMagneticButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const strength = 0.35;
            btn.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(1.05)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => btn.style.transition = '', 500);
        });
    });
})();


// ========== CUSTOM CURSOR (UPGRADED) ==========
(function initCursor() {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const trail = document.querySelector('.cursor-trail');

    if (!dot || !outline) return;

    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        dot.style.left = cursorX + 'px';
        dot.style.top = cursorY + 'px';
    });

    function animateOutline() {
        outlineX += (cursorX - outlineX) * 0.1;
        outlineY += (cursorY - outlineY) * 0.1;
        trailX += (cursorX - trailX) * 0.06;
        trailY += (cursorY - trailY) * 0.06;

        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';
        if (trail) {
            trail.style.left = trailX + 'px';
            trail.style.top = trailY + 'px';
        }
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    document.querySelectorAll('a, button, .tilt-card, .glass-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.width = '16px';
            dot.style.height = '16px';
            dot.style.background = '#a855f7';
            outline.style.width = '60px';
            outline.style.height = '60px';
            outline.style.borderColor = 'rgba(168, 85, 247, 0.6)';
            outline.style.borderWidth = '1px';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.background = 'var(--accent-cyan)';
            outline.style.width = '36px';
            outline.style.height = '36px';
            outline.style.borderColor = 'rgba(0, 245, 255, 0.4)';
            outline.style.borderWidth = '2px';
        });
    });
})();


// ========== TYPED TEXT EFFECT ==========
(function initTypedText() {
    const el = document.querySelector('.typed-text');
    if (!el) return;

    const strings = [
        'Full-Stack Developer',
        'ML Enthusiast',
        'Content Creator',
        'Three.js Artist',
        'Problem Solver',
        'Video Editor',
        'NIT Srinagar 2028',
    ];

    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function type() {
        const current = strings[stringIndex];

        if (isDeleting) {
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = 40;
        } else {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 90;
        }

        if (!isDeleting && charIndex === current.length) {
            typingDelay = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            stringIndex = (stringIndex + 1) % strings.length;
            typingDelay = 300;
        }

        setTimeout(type, typingDelay);
    }
    setTimeout(type, 800);
})();


// ========== NAVBAR ==========
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const sections = document.querySelectorAll('section, .hero');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === current) {
                link.classList.add('active');
            }
        });
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });
})();


// ========== GSAP SCROLL ANIMATIONS (INSANE) ==========
(function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Massive section header reveal
    gsap.utils.toArray('.section-header').forEach(header => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: 'top 90%',
                toggleActions: 'play none none none',
            }
        });
        tl.from(header.querySelector('.section-tag'), { opacity: 0, y: -30, duration: 0.4, ease: 'back.out(3)', immediateRender: false })
            .from(header.querySelector('.section-title'), { opacity: 0, y: 40, duration: 0.6, ease: 'power4.out', immediateRender: false }, '-=0.2')
            .from(header.querySelector('.section-line'), { scaleX: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.3');
    });

    // Cards with stagger — no rotateX to avoid perspective glitches
    gsap.utils.toArray('.skills-grid, .projects-grid, .achievements-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.glass-card');
        gsap.from(cards, {
            scrollTrigger: {
                trigger: grid,
                start: 'top 88%',
                toggleActions: 'play none none none',
            },
            immediateRender: false,
            opacity: 0,
            y: 60,
            duration: 0.75,
            stagger: { each: 0.1, from: 'start', ease: 'power3.out' },
            ease: 'power3.out',
        });
    });

    // About card smooth entry
    gsap.from('.about-card', {
        scrollTrigger: {
            trigger: '.about-card',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        immediateRender: false,
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: 'power4.out',
    });

    // Timeline — slide from left with bounce
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: 'play none none none',
            },
            immediateRender: false,
            opacity: 0,
            x: -60,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'back.out(1.7)',
        });
    });

    // Contact — zoom in
    gsap.from('.contact-grid', {
        scrollTrigger: {
            trigger: '.contact-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        immediateRender: false,
        opacity: 0,
        scale: 0.92,
        y: 40,
        duration: 0.9,
        ease: 'power4.out',
    });

    // Hero entrance — cinematic
    const heroTl = gsap.timeline({ delay: 0.2 });
    heroTl
        .from('.hero-tag', { opacity: 0, scale: 0.5, duration: 0.6, ease: 'back.out(3)', immediateRender: false })
        .from('.hero-line', { opacity: 0, y: 40, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.2')
        .from('.hero-name', { opacity: 0, y: 60, scale: 0.8, duration: 0.8, ease: 'power4.out', immediateRender: false }, '-=0.3')
        .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.3')
        .from('.hero-desc', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.3')
        .from('.hero-cta .btn', { opacity: 0, y: 30, stagger: 0.15, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, '-=0.2')
        .from('.hero-socials .social-link', { opacity: 0, scale: 0, stagger: 0.08, duration: 0.4, ease: 'back.out(3)', immediateRender: false }, '-=0.2')
        .from('.scroll-indicator', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.1');
})();


// ========== SKILL BAR ANIMATION ==========
(function initSkillBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fills = entry.target.querySelectorAll('.skill-bar-fill');
                fills.forEach((fill, i) => {
                    setTimeout(() => {
                        const width = fill.getAttribute('data-width');
                        fill.style.width = width + '%';
                        setTimeout(() => fill.classList.add('filled'), 1500);
                    }, i * 150);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-card').forEach(card => observer.observe(card));
})();


// ========== ANIMATED COUNTERS ==========
(function initCounters() {
    function animateCounter(el, target, duration = 2000, isDecimal = false) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            if (isDecimal) {
                el.textContent = current.toFixed(1);
            } else if (target >= 1000) {
                el.textContent = Math.floor(current).toLocaleString() + '+';
            } else {
                el.textContent = Math.floor(current);
            }

            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.stat-number[data-target]').forEach(el => {
                    const target = parseFloat(el.dataset.target);
                    animateCounter(el, target, 2000, target % 1 !== 0);
                });

                entry.target.querySelectorAll('.achievement-value[data-target]').forEach(el => {
                    const target = parseFloat(el.dataset.target);
                    const prefix = el.textContent.startsWith('#') ? '#' : '';
                    animateCounter(el, target, 2000, false);
                    if (prefix) {
                        const counterObs = new MutationObserver(() => {
                            if (!el.textContent.startsWith('#')) el.textContent = '#' + el.textContent;
                        });
                        counterObs.observe(el, { childList: true, characterData: true, subtree: true });
                    }
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('#about, #achievements').forEach(s => observer.observe(s));
})();


// ========== ADVANCED 3D TILT ==========
(function initTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        const shine = document.createElement('div');
        shine.classList.add('card-shine');
        card.appendChild(shine);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = (y - cy) / cy * -6;
            const rotY = (x - cx) / cx * 6;

            card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
            card.style.transition = 'transform 0.1s ease';

            const spotX = (x / rect.width) * 100;
            const spotY = (y / rect.height) * 100;
            shine.style.background = `radial-gradient(circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
            shine.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            shine.style.opacity = '0';
        });
    });
})();


// ========== HOLOGRAPHIC TEXT EFFECT ==========
(function initHolographic() {
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('mousemove', (e) => {
            const rect = title.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            title.style.backgroundImage = `linear-gradient(${90 + x * 0.5}deg, #00f5ff ${x - 30}%, #a855f7 ${x}%, #ec4899 ${x + 30}%, #3b82f6 ${x + 60}%)`;
        });

        title.addEventListener('mouseleave', () => {
            title.style.backgroundImage = '';
        });
    });
})();


// ========== NOISE GLITCH ON HERO ==========
(function initGlitchNoise() {
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;

    setInterval(() => {
        if (Math.random() > 0.92) {
            heroName.classList.add('glitch-intense');
            setTimeout(() => heroName.classList.remove('glitch-intense'), 150 + Math.random() * 200);
        }
    }, 800);
})();


// ========== CONTACT FORM ==========
(function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = '<span>Message Sent! 🚀</span>';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        btn.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.5)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.boxShadow = '';
            form.reset();
        }, 3000);
    });

    // Input focus effects
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
})();


// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// ========== SCROLL PROGRESS BAR ==========
(function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = scrolled + '%';
    });
})();


// ========== AURORA BACKGROUND SHIFT ==========
(function initAurora() {
    let hue = 200;
    function pulse() {
        hue = (hue + 0.2) % 360;
        document.documentElement.style.setProperty('--aurora-hue', hue);
        requestAnimationFrame(pulse);
    }
    pulse();
})();


// ========== THEME SWITCHER ==========
(function initThemeSwitcher() {
    const btn = document.getElementById('theme-toggle');
    const icon = btn ? btn.querySelector('.theme-icon') : null;
    const html = document.documentElement;

    // Load saved theme or default to dark
    const saved = localStorage.getItem('bk-theme') || 'dark';
    html.setAttribute('data-theme', saved);
    if (icon) icon.textContent = saved === 'dark' ? '\u2600\ufe0f' : '\uD83C\uDF19';

    if (!btn) return;
    btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('bk-theme', next);

        // Switch icon with a spin
        if (icon) {
            icon.style.transform = 'rotate(360deg) scale(0)';
            setTimeout(() => {
                icon.textContent = next === 'dark' ? '\u2600\ufe0f' : '\uD83C\uDF19';
                icon.style.transform = '';
            }, 200);
        }

        // Refresh Three.js background color if needed
        const isLight = next === 'light';
        document.getElementById('three-canvas').style.opacity = isLight ? '0.35' : '1';
        const matrixCanvas = document.getElementById('matrix-canvas');
        if (matrixCanvas) matrixCanvas.style.opacity = isLight ? '0' : '0.025';
    });

    // Apply initial opacity based on theme
    const isLight = saved === 'light';
    const threeCanvas = document.getElementById('three-canvas');
    if (threeCanvas && isLight) threeCanvas.style.opacity = '0.35';
    const matrixCanvas = document.getElementById('matrix-canvas');
    if (matrixCanvas && isLight) matrixCanvas.style.opacity = '0';
})();

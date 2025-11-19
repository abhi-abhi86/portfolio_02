import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HeroBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- ASSET GENERATION (Cinematic Textures) ---
    const createTexture = (type: 'star' | 'gas' | 'lens') => {
      const canvas = document.createElement('canvas');
      const size = 128; // Higher res
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      const cx = size / 2;
      const cy = size / 2;

      if (type === 'star') {
        // Core
        let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        g.addColorStop(0, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        
        // Diffraction spikes (anamorphic flare)
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, cy - 1, size, 2);
        ctx.globalAlpha = 1.0;
      } else if (type === 'gas') {
        // Cloud smoke
        let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        g.addColorStop(0.6, 'rgba(220, 220, 255, 0.02)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      } else if (type === 'lens') {
        // Sharp ring
        let g = ctx.createRadialGradient(cx, cy, size*0.3, cx, cy, size*0.5);
        g.addColorStop(0, 'rgba(255, 255, 255, 0)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const starTex = createTexture('star');
    const gasTex = createTexture('gas');
    const lensTex = createTexture('lens');

    // --- SCENE ---
    const scene = new THREE.Scene();
    // Cinematic deep purple/blue fog
    scene.fog = new THREE.FogExp2(0x020205, 0.015);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
    
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true, 
        powerPreference: "high-performance",
        stencil: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Tone mapping for HDR feel
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    mountRef.current.appendChild(renderer.domElement);

    // --- CONSTANTS ---
    const STAR_COUNT = 20000;
    const BG_STAR_COUNT = 5000;
    const GALAXY_RAD = 70;
    const BLACKHOLE_RAD = 4;
    
    // --- 1. BACKGROUND STARFIELD (With Lensing capability) ---
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(BG_STAR_COUNT * 3);
    const bgBasePos = new Float32Array(BG_STAR_COUNT * 3); // To restore after lensing
    const bgCol = new Float32Array(BG_STAR_COUNT * 3);
    
    for (let i=0; i<BG_STAR_COUNT; i++) {
        const i3 = i*3;
        const r = 400 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        bgPos[i3]=x; bgPos[i3+1]=y; bgPos[i3+2]=z;
        bgBasePos[i3]=x; bgBasePos[i3+1]=y; bgBasePos[i3+2]=z;

        // Star temps: Blue, White, Red
        const col = new THREE.Color();
        const rand = Math.random();
        if(rand > 0.9) col.setHex(0xffaaaa); // Red giant
        else if(rand > 0.7) col.setHex(0xaaaaff); // Blue
        else col.setHex(0xffffff);
        
        bgCol[i3]=col.r; bgCol[i3+1]=col.g; bgCol[i3+2]=col.b;
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgCol, 3));
    
    const bgMat = new THREE.PointsMaterial({
        size: 2,
        map: starTex,
        transparent: true,
        opacity: 0.6,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const bgSystem = new THREE.Points(bgGeo, bgMat);
    scene.add(bgSystem);


    // --- 2. MAIN GALAXY (Density Wave) ---
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(STAR_COUNT * 3);
    const initialPos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const vels = new Float32Array(STAR_COUNT * 3);
    
    // Palette: Core(White), Inner(Cyan), Mid(Blue), Outer(Purple), Nebula(Pink)
    const cCore = new THREE.Color(0xffffff);
    const cInner = new THREE.Color(0x67e8f9); // Cyan 300
    const cMid = new THREE.Color(0x3b82f6);   // Blue 500
    const cOuter = new THREE.Color(0x9333ea); // Purple 600
    const cNebula = new THREE.Color(0xf472b6); // Pink 400 (Star forming regions)
    const tmpCol = new THREE.Color();

    for (let i=0; i<STAR_COUNT; i++) {
        const i3 = i*3;
        
        // Spiral Arms math
        const armCount = 3;
        const r = Math.pow(Math.random(), 1.5) * GALAXY_RAD; // More density at center
        const spin = r * 0.5;
        const armAngle = (i % armCount) * ((Math.PI * 2) / armCount);
        
        // Scatter
        const randomX = Math.pow(Math.random(), 3) * (Math.random()<0.5?1:-1) * (2 + r*0.15);
        const randomY = Math.pow(Math.random(), 3) * (Math.random()<0.5?1:-1) * (1 + r*0.1);
        const randomZ = Math.pow(Math.random(), 3) * (Math.random()<0.5?1:-1) * (2 + r*0.15);
        
        const x = Math.cos(armAngle + spin) * r + randomX;
        const y = randomY * 0.5; // Flat disk
        const z = Math.sin(armAngle + spin) * r + randomZ;
        
        pos[i3]=x; pos[i3+1]=y; pos[i3+2]=z;
        initialPos[i3]=x; initialPos[i3+1]=y; initialPos[i3+2]=z;
        
        // Color Grading
        if (r < 5) {
             tmpCol.copy(cCore).lerp(cInner, r/5);
        } else {
             // Chance for star forming region in arms
             if (Math.random() < 0.05 && r > 15) {
                 tmpCol.copy(cNebula);
                 sizes[i] = Math.random() * 2 + 1; // Big nebula blob
             } else {
                 tmpCol.copy(cInner).lerp(cOuter, (r-5)/(GALAXY_RAD-5));
                 sizes[i] = Math.random() * 0.8 + 0.2; // Normal star
             }
        }
        col[i3]=tmpCol.r; col[i3+1]=tmpCol.g; col[i3+2]=tmpCol.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
        size: 0.5,
        map: starTex,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });
    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);


    // --- 3. BLACK HOLE OBJECTS ---
    // Event Horizon (Black Sphere)
    const bhGeo = new THREE.SphereGeometry(BLACKHOLE_RAD, 64, 64);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(bhGeo, bhMat);
    blackHole.scale.set(0,0,0);
    scene.add(blackHole);
    
    // Accretion Disk (Multiple rotating layers)
    const diskGroup = new THREE.Group();
    // Create 3 layers of disks for volume
    const createDiskLayer = (radius: number, width: number, color: number, opacity: number) => {
        const g = new THREE.RingGeometry(radius, radius + width, 128);
        const m = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            map: gasTex // Use gas texture for smoky look
        });
        // UV mapping for circular texture
        const uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
             // Basic polar UVs could be better but standard works ok for RingGeometry if textured right
             // Here we just rely on noise in the texture
        }
        const mesh = new THREE.Mesh(g, m);
        mesh.rotation.x = Math.PI/2;
        return mesh;
    };
    
    const disk1 = createDiskLayer(4.1, 2, 0xffaa00, 0.8); // Hot inner
    const disk2 = createDiskLayer(5.5, 4, 0xff5500, 0.5); // Mid
    const disk3 = createDiskLayer(8, 6, 0xaa0000, 0.2);   // Outer cool
    diskGroup.add(disk1, disk2, disk3);
    scene.add(diskGroup);
    
    // Photon Sphere (Thin sharp ring)
    const photonGeo = new THREE.RingGeometry(4.05, 4.15, 128);
    const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const photonSphere = new THREE.Mesh(photonGeo, photonMat);
    photonSphere.lookAt(camera.position);
    scene.add(photonSphere);

    // Jets (Particle Beams)
    const jetCount = 2000;
    const jetGeo = new THREE.BufferGeometry();
    const jetPos = new Float32Array(jetCount * 3);
    const jetCol = new Float32Array(jetCount * 3);
    const jetVel = new Float32Array(jetCount); // Speed
    
    for(let i=0; i<jetCount; i++){
        jetPos[i*3] = 0; jetPos[i*3+1] = 0; jetPos[i*3+2] = 0;
        jetCol[i*3] = 0.8; jetCol[i*3+1] = 0.9; jetCol[i*3+2] = 1.0; // Blue-white
        jetVel[i] = Math.random() * 2 + 1;
    }
    jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3));
    jetGeo.setAttribute('color', new THREE.BufferAttribute(jetCol, 3));
    const jetMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, map: gasTex, depthWrite: false });
    const jets = new THREE.Points(jetGeo, jetMat);
    scene.add(jets);

    // Shockwave (Mesh)
    const shockGeo = new THREE.RingGeometry(0.1, 1, 128);
    const shockMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    shockwave.rotation.x = Math.PI/2;
    scene.add(shockwave);


    // --- ANIMATION ---
    const clock = new THREE.Clock();
    let phase = 0; // 0:Galaxy, 1:Collapse, 2:Bang, 3:Hole, 4:Reform
    let timer = 0;
    let exploded = false;
    
    // Mouse Interaction
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;
    const handleMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);

    let frameId = 0;

    const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);
        const time = clock.getElapsedTime();
        timer += delta;

        // 1. Cinematic Camera Orbit (Lissajous)
        // Smoothly float around
        const camTime = time * 0.1;
        camera.position.x = Math.sin(camTime) * 30;
        camera.position.y = Math.cos(camTime * 0.7) * 20 + 10; // Slight elevation
        camera.position.z = Math.cos(camTime * 0.5) * 40 + 10;
        camera.lookAt(0,0,0);

        // 2. Scene Rotation (Mouse)
        targetRotY += (mouseX * 0.5 - targetRotY) * delta;
        targetRotX += (mouseY * 0.3 - targetRotX) * delta;
        scene.rotation.y = targetRotY * 0.2;
        scene.rotation.x = targetRotX * 0.2;

        // Arrays
        const p = geo.attributes.position.array as Float32Array;
        const c = geo.attributes.color.array as Float32Array;
        
        // --- STATE MACHINE ---

        // PHASE 0: MAJESTIC GALAXY (15s)
        if (phase === 0) {
            if (timer > 15) { phase=1; timer=0; }
            
            // Gentle Rotation
            galaxy.rotation.y -= 0.05 * delta;
            
            // Reforming physics
            for(let i=0; i<STAR_COUNT; i++){
                const i3=i*3;
                const ix = initialPos[i3]; const iy = initialPos[i3+1]; const iz = initialPos[i3+2];
                
                // Organic Wave Drift
                const wave = Math.sin(time + ix*0.05) * 0.2;
                
                p[i3] += (ix - p[i3]) * delta;
                p[i3+1] += (iy + wave - p[i3+1]) * delta;
                p[i3+2] += (iz - p[i3+2]) * delta;

                // Restore Color
                const r = Math.sqrt(ix*ix + iz*iz);
                if(r<5) tmpCol.copy(cCore).lerp(cInner, r/5);
                else if(sizes[i]>1) tmpCol.copy(cNebula); // Keep nebulae
                else tmpCol.copy(cInner).lerp(cOuter, (r-5)/(GALAXY_RAD-5));
                
                c[i3] += (tmpCol.r - c[i3]) * delta;
                c[i3+1] += (tmpCol.g - c[i3+1]) * delta;
                c[i3+2] += (tmpCol.b - c[i3+2]) * delta;
            }
        }

        // PHASE 1: THE COLLAPSE (3.5s)
        else if (phase === 1) {
            if (timer > 3.5) { phase=2; timer=0; exploded=false; }
            
            galaxy.rotation.y -= (0.2 + timer) * delta;
            
            for(let i=0; i<STAR_COUNT; i++){
                const i3=i*3;
                const pull = 1 + timer * 2;
                p[i3] -= p[i3]*pull*delta;
                p[i3+1] -= p[i3+1]*pull*delta;
                p[i3+2] -= p[i3+2]*pull*delta;
                
                // Heat up
                c[i3] += (1 - c[i3]) * delta * 2;
                c[i3+1] += (1 - c[i3+1]) * delta * 2;
                c[i3+2] += (1 - c[i3+2]) * delta * 2;
            }
        }

        // PHASE 2: BIG BANG (4s)
        else if (phase === 2) {
            if (!exploded) {
                exploded = true;
                shockwave.scale.set(1,1,1);
                shockMat.opacity = 1;
                
                // Explosive Velocities
                for(let i=0; i<STAR_COUNT; i++){
                    const i3=i*3;
                    const speed = 60 + Math.random()*100;
                    const theta = Math.random()*Math.PI*2;
                    const phi = Math.acos(2*Math.random()-1);
                    vels[i3] = speed * Math.sin(phi) * Math.cos(theta);
                    vels[i3+1] = speed * Math.sin(phi) * Math.sin(theta);
                    vels[i3+2] = speed * Math.cos(phi);
                    
                    // Center start
                    p[i3] = (Math.random()-0.5)*2; 
                    p[i3+1] = (Math.random()-0.5)*2;
                    p[i3+2] = (Math.random()-0.5)*2;
                }
            }
            
            const sScale = 1 + timer * 100;
            shockwave.scale.set(sScale, sScale, 1);
            shockMat.opacity = Math.max(0, 1 - timer*0.5);

            for(let i=0; i<STAR_COUNT; i++){
                const i3=i*3;
                p[i3] += vels[i3] * delta;
                p[i3+1] += vels[i3+1] * delta;
                p[i3+2] += vels[i3+2] * delta;
                vels[i3] *= 0.92; // Drag
                
                // Cool
                if (timer > 0.5) {
                    c[i3+1] *= 0.9; // Less Green
                    c[i3+2] *= 0.9; // Less Blue -> Red/Orange
                }
            }
            
            if (timer > 3.5) { phase=3; timer=0; shockMat.opacity=0; }
        }

        // PHASE 3: BLACK HOLE & LENSING (10s)
        else if (phase === 3) {
            // Init / Fade In
            blackHole.scale.lerp(new THREE.Vector3(1,1,1), delta*2);
            photonMat.opacity = Math.min(0.8, photonMat.opacity + delta);
            jetMat.opacity = Math.min(0.6, jetMat.opacity + delta);
            
            (disk1.material as THREE.Material).opacity = Math.min(0.8, (disk1.material as THREE.Material).opacity + delta);
            (disk2.material as THREE.Material).opacity = Math.min(0.5, (disk2.material as THREE.Material).opacity + delta);
            (disk3.material as THREE.Material).opacity = Math.min(0.2, (disk3.material as THREE.Material).opacity + delta);

            // Spin Disks
            disk1.rotation.z -= 5 * delta;
            disk2.rotation.z -= 3 * delta;
            disk3.rotation.z -= 1.5 * delta;
            
            // Face Photon Ring
            photonSphere.lookAt(camera.position);
            
            // GRAVITATIONAL LENSING EFFECT
            // We distort the BACKGROUND stars based on screen position relative to Black Hole
            // A cheap but effective trick is to push stars away from center in 3D space
            
            const lensRad = 15;
            for(let i=0; i<BG_STAR_COUNT; i++){
                const i3=i*3;
                const x = bgBasePos[i3]; const y = bgBasePos[i3+1]; const z = bgBasePos[i3+2];
                
                // Simple lensing: if star is behind BH, push it out
                // Calculate distance from center (approximation of screen projected distance)
                // Since BH is at 0,0,0, we can just use 3D distance to Z-axis line for a rough effect
                // But a true lens works in screen space. 
                // Let's do a radial distortion:
                
                const dist = Math.sqrt(x*x + y*y + z*z);
                // Check alignment with BH center (0,0,0) vs Camera
                // This is expensive to do perfectly. 
                // Simple Warp: Stars near center (0,0,0) get pushed out.
                
                const d2 = Math.sqrt(x*x + y*y); // Cylindrical dist
                if (d2 < lensRad && Math.abs(z) > 10) {
                     const push = (lensRad - d2) * 0.5; // Strength
                     const ang = Math.atan2(y, x);
                     bgPos[i3] = bgBasePos[i3] + Math.cos(ang) * push;
                     bgPos[i3+1] = bgBasePos[i3+1] + Math.sin(ang) * push;
                } else {
                     // Restore
                     bgPos[i3] += (bgBasePos[i3] - bgPos[i3]) * delta * 5;
                     bgPos[i3+1] += (bgBasePos[i3+1] - bgPos[i3+1]) * delta * 5;
                }
            }
            bgGeo.attributes.position.needsUpdate = true;

            // Animate Jets
            const jp = jetGeo.attributes.position.array as Float32Array;
            for(let i=0; i<jetCount; i++){
                const i3=i*3;
                // Reset if far
                if(Math.abs(jp[i3+1]) > 40 || jp[i3+1]===0) {
                    jp[i3] = (Math.random()-0.5);
                    jp[i3+1] = (Math.random()>0.5?1:-1) * 3;
                    jp[i3+2] = (Math.random()-0.5);
                    jetVel[i] = 20 + Math.random()*20;
                }
                // Move Out
                jp[i3+1] += Math.sign(jp[i3+1]) * jetVel[i] * delta;
                // Spiral
                jp[i3] += Math.cos(time*20+i)*0.1;
                jp[i3+2] += Math.sin(time*20+i)*0.1;
            }
            jetGeo.attributes.position.needsUpdate = true;

            // Consume Galaxy Debris
            for(let i=0; i<STAR_COUNT; i++){
                const i3=i*3;
                const x=p[i3]; const y=p[i3+1]; const z=p[i3+2];
                const d = Math.sqrt(x*x + y*y + z*z);
                
                if (d > 4.5) {
                    const force = 80 / (d*d);
                    vels[i3] += (-x*force - z*force)*delta; // Tangential + Inward
                    vels[i3+1] += (-y*force)*delta;
                    vels[i3+2] += (-z*force + x*force)*delta;
                    
                    p[i3] += vels[i3]*delta;
                    p[i3+1] += vels[i3+1]*delta;
                    p[i3+2] += vels[i3+2]*delta;
                    vels[i3] *= 0.95;
                    
                    // Fade near center
                    const alpha = Math.min(1, (d-5)/5);
                    c[i3] = alpha; c[i3+1] = alpha*0.3; c[i3+2] = 0;
                } else {
                    p[i3]=0; p[i3+1]=0; p[i3+2]=0;
                }
            }
            
            if (timer > 10) { phase=4; timer=0; }
        }

        // PHASE 4: REFORMING (4s)
        else if (phase === 4) {
             blackHole.scale.lerp(new THREE.Vector3(0,0,0), delta*2);
             
             const fadeOut = (m: THREE.Material) => { m.opacity = Math.max(0, m.opacity - delta); };
             fadeOut(photonMat);
             fadeOut(jetMat);
             fadeOut(disk1.material as THREE.Material);
             fadeOut(disk2.material as THREE.Material);
             fadeOut(disk3.material as THREE.Material);

             // Reset Lensing
             for(let i=0; i<BG_STAR_COUNT; i++){
                 const i3=i*3;
                 bgPos[i3] += (bgBasePos[i3] - bgPos[i3]) * delta * 2;
                 bgPos[i3+1] += (bgBasePos[i3+1] - bgPos[i3+1]) * delta * 2;
             }
             bgGeo.attributes.position.needsUpdate = true;

             // Fly home
             for(let i=0; i<STAR_COUNT; i++){
                const i3=i*3;
                p[i3] += (initialPos[i3] - p[i3]) * 2 * delta;
                p[i3+1] += (initialPos[i3+1] - p[i3+1]) * 2 * delta;
                p[i3+2] += (initialPos[i3+2] - p[i3+2]) * 2 * delta;
                
                const r = Math.sqrt(initialPos[i3]*initialPos[i3] + initialPos[i3+2]*initialPos[i3+2]);
                if(r<5) tmpCol.copy(cCore).lerp(cInner, r/5);
                else if(sizes[i]>1) tmpCol.copy(cNebula);
                else tmpCol.copy(cInner).lerp(cOuter, (r-5)/(GALAXY_RAD-5));
                
                c[i3] += (tmpCol.r - c[i3]) * delta * 2;
                c[i3+1] += (tmpCol.g - c[i3+1]) * delta * 2;
                c[i3+2] += (tmpCol.b - c[i3+2]) * delta * 2;
             }
             
             if (timer > 4) { phase=0; timer=0; }
        }

        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
        renderer.render(scene, camera);
    };

    animate();
    
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('mousemove', handleMouse);
        window.removeEventListener('resize', handleResize);
        if(mountRef.current) mountRef.current.removeChild(renderer.domElement);
        // Dispose
        renderer.dispose();
        geo.dispose(); mat.dispose();
        bgGeo.dispose(); bgMat.dispose();
        bhGeo.dispose(); bhMat.dispose();
        jetGeo.dispose(); jetMat.dispose();
        shockGeo.dispose(); shockMat.dispose();
        diskGroup.clear();
        starTex?.dispose(); gasTex?.dispose(); lensTex?.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
       <div ref={mountRef} className="absolute inset-0 bg-black" />
       {/* Cinematic Vignette & Grain Overlay */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10 pointer-events-none" />
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10 pointer-events-none" />
    </div>
  );
};

export default HeroBackground;
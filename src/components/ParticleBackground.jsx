import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        
        const setSize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        setSize();
        
        // Màu nền chính của Spotify (#121212)
        renderer.setClearColor(0x121212, 1);
        containerRef.current.appendChild(renderer.domElement);

        // Particles chính với màu xanh Spotify
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        const posArray = new Float32Array(particleCount * 3);
        for(let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Màu xanh chính của Spotify (#1DB954)
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: 0x1DB954,
            transparent: true,
            opacity: 0.5,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Particles phụ với màu xám sáng của Spotify
        const accentGeometry = new THREE.BufferGeometry();
        const accentCount = 500;
        const accentPosArray = new Float32Array(accentCount * 3);
        for(let i = 0; i < accentCount * 3; i++) {
            accentPosArray[i] = (Math.random() - 0.5) * 10;
        }
        accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentPosArray, 3));

        // Màu xám sáng của Spotify (#B3B3B3)
        const accentMaterial = new THREE.PointsMaterial({
            size: 0.008,
            color: 0xB3B3B3,
            transparent: true,
            opacity: 0.3,
        });

        const accentMesh = new THREE.Points(accentGeometry, accentMaterial);
        scene.add(accentMesh);

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.x += 0.0003;
            particlesMesh.rotation.y += 0.0005;
            accentMesh.rotation.x -= 0.0004;
            accentMesh.rotation.y -= 0.0006;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            setSize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            accentGeometry.dispose();
            accentMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                // Gradient sử dụng các màu chính thức của Spotify
                background: `
                    linear-gradient(to bottom,
                        #121212 0%,
                        #181818 30%,
                        #121212 100%
                    )
                `
            }}
        />
    );
};

export default ParticleBackground;

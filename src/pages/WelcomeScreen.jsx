import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import * as THREE from 'three';
import Logo from "../assets/icons/Logo.jsx";

const WelcomeScreen = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Three.js background setup
    useEffect(() => {
        // Create scene
        const scene = new THREE.Scene();

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer with alpha for transparency
        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Add renderer to DOM
        const container = document.getElementById('threejs-welcome');
        if (container) {
            // Remove old canvas if exists
            if (container.querySelector('canvas')) {
                container.querySelector('canvas').remove();
            }
            container.appendChild(renderer.domElement);
        }

        // Create particle system for background
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 3000;

        const posArray = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Create particles material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x1DB954, // Spotify green color
            transparent: true,
            opacity: 0.7,
        });

        // Create mesh from geometry and material
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Create a few larger particles that will move differently
        const accentGeometry = new THREE.BufferGeometry();
        const accentCount = 50;
        const accentPosArray = new Float32Array(accentCount * 3);

        for (let i = 0; i < accentCount * 3; i++) {
            accentPosArray[i] = (Math.random() - 0.5) * 10;
        }

        accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentPosArray, 3));

        const accentMaterial = new THREE.PointsMaterial({
            size: 0.08,
            color: 0xFFFFFF, // White accent particles
            transparent: true,
            opacity: 0.5,
        });

        const accentMesh = new THREE.Points(accentGeometry, accentMaterial);
        scene.add(accentMesh);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            particlesMesh.rotation.x += 0.0003;
            particlesMesh.rotation.y += 0.0005;

            accentMesh.rotation.x += 0.001;
            accentMesh.rotation.y -= 0.0012;

            renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (container && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Navigate to login screen
    const handleLogin = () => {
        navigate('/login');
    };

    // Button pulse animation
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 1000);
        }, 5000);

        return () => clearInterval(pulseInterval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
            {/* Three.js Background Container */}
            <div id="threejs-welcome" className="absolute inset-0 z-0"></div>

            {/* Spotify-inspired gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80 z-0"></div>

            {/* Logo and branding element */}
            <div className="absolute top-8 left-8 z-10 flex items-center">
                <Logo className="w-20 h-20 text-black"/>
                <h3 className="text-white text-xl font-bold ml-3">SoundClone</h3>
            </div>

            {/* Main content */}
            <div className="max-w-4xl text-center z-10 px-4">
                {/* Animated circles for visual effect */}
                <div className={`absolute w-64 h-64 bg-green-500 rounded-full opacity-5 blur-3xl 
                                top-1/4 -left-20 transform transition-transform duration-10000 
                                ${isLoading ? '' : 'animate-pulse'}`}>
                </div>
                <div className={`absolute w-96 h-96 bg-green-500 rounded-full opacity-5 blur-3xl 
                                bottom-1/4 -right-20 transform transition-transform duration-10000 
                                ${isLoading ? '' : 'animate-pulse'}`}>
                </div>

                {/*Text*/}
                <div
                    className={`transform transition-all duration-1000 ${isLoading ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
                    <h1 className="text-6xl font-bold text-white mb-4">
                        Chào Mừng Đến Với
                    </h1>
                    <h2 className="text-5xl font-bold text-green-500 mb-6">
                        SoundClone
                    </h2>
                    <p className="text-2xl text-gray-300 mb-12">
                        Nền tảng giải trí âm nhạc hàng đầu
                    </p>
                </div>

                {/* Login button with hover and pulse effects */}
                <button
                    onClick={handleLogin}
                    className={`px-12 py-4 bg-green-500 text-black font-bold text-lg rounded-full 
                              transform transition-all duration-300
                              hover:bg-green-400 hover:scale-105 focus:outline-none
                              ${isPulsing ? 'animate-pulse scale-105' : ''}`}
                >
                    Đăng Nhập
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center text-gray-500 text-sm z-10">
                © {new Date().getFullYear()} Admin Dashboard
            </div>
        </div>
    );
};

export default WelcomeScreen;
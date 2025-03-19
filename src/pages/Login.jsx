import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import * as THREE from 'three';
import Logo from "@/assets/icons/Logo.jsx";

const Login = ({ onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Handle login submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoginError('');

        // Call authentication function from onLogin prop
        const isSuccess = onLogin(username, password);

        //admid/user if login admin navigate to dashboard, login user navigate to introduction
        if (isSuccess) {
            // If login is successful, navigate to home page
            navigate('/');
        } else {
            // If login fails, display error message
            setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
    };

    // Initialize Three.js background
    useEffect(() => {
        // Create scene
        const scene = new THREE.Scene();

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Add renderer to DOM
        const container = document.getElementById('threes-background');
        if (container) {
            // Remove old canvas if exists
            if (container.querySelector('canvas')) {
                container.querySelector('canvas').remove();
            }
            container.appendChild(renderer.domElement);
        }

        // Create particles for background
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;

        const posArray = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Material for particles
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x1DB954, // Spotify green color
            transparent: true,
            opacity: 0.8,
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

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (container && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Handle return to welcome screen
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
            {/* Three.js Background Container */}
            <div id="threejs-background" className="absolute inset-0 z-0"></div>

            {/* Spotify branding gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80 z-0"></div>

            {/* Animated circles for visual effect */}
            <div className={`absolute w-64 h-64 bg-green-500 rounded-full opacity-5 blur-3xl 
                            top-1/4 -left-20 transform transition-transform duration-10000 
                            ${isLoading ? '' : 'animate-pulse'}`}>
            </div>
            <div className={`absolute w-96 h-96 bg-green-500 rounded-full opacity-5 blur-3xl 
                            bottom-1/4 -right-20 transform transition-transform duration-10000 
                            ${isLoading ? '' : 'animate-pulse'}`}>
            </div>

            {/* Logo Element */}
            <div className="absolute top-8 left-8 z-10 flex items-center">
                <Logo className="w-20 h-20 text-black"/>
                <h3 className="text-white text-lg font-bold ml-2">SoundClone</h3>
            </div>

            {/* Back button */}
            <button
                onClick={handleBack}
                className="absolute top-8 right-8 z-10 text-gray-400 hover:text-white transition-colors duration-300"
            >
                Quay lại
            </button>

            {/* Login Card */}
            <div className={`w-full max-w-md p-8 space-y-8 bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-md rounded-xl shadow-2xl z-10 border border-opacity-10 border-gray-700 transition-all duration-1000 ${isLoading ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
                {/* Logo & Header */}
                <div className="text-center">
                    <div className="rounded-full flex items-center justify-center">
                        <Logo className="w-25 h-25 text-black"/>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {loginError && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded-lg relative" role="alert">
                            <span className="block sm:inline">{loginError}</span>
                        </div>
                    )}

                    <div className="rounded-md -space-y-px">
                        <div className="mb-5">
                            <label htmlFor="username" className="text-sm font-medium text-gray-300 block mb-2">Tên đăng nhập</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-[23px] bg-gray-800 bg-opacity-70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-[23px] bg-gray-800 bg-opacity-70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-500 hover:text-white focus:outline-none transition-colors duration-300"
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-[23px] text-black bg-green-500 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
                        >
                            Đăng Nhập
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer*/}
            <div className="mt-6 text-center text-gray-500 text-xs z-10">
                © {new Date().getFullYear()} Admin Dashboard
            </div>
        </div>
    );
};

export default Login;
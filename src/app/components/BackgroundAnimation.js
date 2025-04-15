'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const BackgroundAnimation = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const [theme, setTheme] = useState('light');
  
  // Check theme from document class
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? 'dark' : 'light');
    
    // Add observer to detect theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          setTheme(isDarkMode ? 'dark' : 'light');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  useEffect(() => {
    // Initialize scene, camera, renderer
    const init = () => {
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 30;
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // Transparent background
      rendererRef.current = renderer;
      
      // Add renderer to DOM
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }
      
      // Create floating particles
      createParticles();
      
      // Handle window resize
      window.addEventListener('resize', handleWindowResize);
    };
    
    // Create particles
    const createParticles = () => {
      const particleCount = 100;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      // Set random positions and sizes
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
        
        sizes[i] = Math.random() * 2;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Create particle material
      const particleMaterial = new THREE.PointsMaterial({
        color: theme === 'dark' ? 0x44a1fa : 0x0070f3,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      // Create particle system
      const particleSystem = new THREE.Points(particles, particleMaterial);
      sceneRef.current.add(particleSystem);
      
      // Store particle system for animation
      window.particleSystem = particleSystem;
    };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particle system
      if (window.particleSystem) {
        window.particleSystem.rotation.x += 0.0005;
        window.particleSystem.rotation.y += 0.0005;
      }
      
      // Render scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    // Handle window resize
    const handleWindowResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    // Initialize and animate
    if (typeof window !== 'undefined') {
      init();
      animate();
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [theme]);
  
  // Update particle color when theme changes
  useEffect(() => {
    if (window.particleSystem) {
      window.particleSystem.material.color.set(
        theme === 'dark' ? 0x44a1fa : 0x0070f3
      );
    }
  }, [theme]);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default BackgroundAnimation; 
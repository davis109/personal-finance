'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

export default function BackgroundAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 20;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Make background fully transparent
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    
    const positionArray = new Float32Array(particlesCount * 3);
    const scales = new Float32Array(particlesCount);
    
    for (let i = 0; i < particlesCount; i++) {
      positionArray[i * 3] = (Math.random() - 0.5) * 50;
      positionArray[i * 3 + 1] = (Math.random() - 0.5) * 50; 
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      scales[i] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    
    // Create material
    const particlesMaterial = new THREE.PointsMaterial({
      color: '#3498db',
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.3, // More transparent particles
    });
    
    // Create points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Animation
    const animate = () => {
      particles.rotation.x += 0.0002;
      particles.rotation.y += 0.0002;
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Animation using GSAP
    gsap.to(particles.rotation, {
      y: Math.PI * 2,
      duration: 120,
      repeat: -1,
      ease: 'none'
    });
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      scene.remove(particles);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: 'transparent' }}
    />
  );
} 
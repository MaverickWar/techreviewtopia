
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Laptop, Smartphone, Gamepad, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: "Smartphones", icon: Smartphone, path: "/smartphones" },
  { id: 2, name: "Laptops", icon: Laptop, path: "/laptops" },
  { id: 3, name: "Gaming", icon: Gamepad, path: "/gaming" },
  { id: 4, name: "AI & Software", icon: Brain, path: "/ai" },
];

const featuredReviews = [
  {
    id: 1,
    title: "iPhone 15 Pro Review",
    category: "Smartphones",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    excerpt: "Apple's latest flagship redefines mobile photography",
  },
  {
    id: 2,
    title: "MacBook Pro M3 Max",
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    excerpt: "The most powerful MacBook yet",
  },
  {
    id: 3,
    title: "PS5 Pro Analysis",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    excerpt: "Next-gen gaming reaches new heights",
  },
];

const Index = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create floating cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      opacity: 0.8,
      transparent: true,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      sceneRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div ref={sceneRef} className="scene-container" />
      
      <div className="content-container">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl font-bold mb-6">Tech365</h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Your daily dose of technology reviews, insights, and innovations
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-gradient-to-b from-transparent to-gray-50">
          <div className="container px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  to={category.path}
                  className="glass-panel hover-card p-6 flex flex-col items-center justify-center gap-4"
                >
                  <category.icon size={32} className="text-primary" />
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Reviews */}
        <section className="py-20">
          <div className="container px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Featured Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredReviews.map((review) => (
                <article key={review.id} className="glass-panel hover-card overflow-hidden">
                  <img 
                    src={review.image} 
                    alt={review.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="category-tag mb-4">{review.category}</div>
                    <h3 className="text-xl font-semibold mb-2">{review.title}</h3>
                    <p className="text-gray-600">{review.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;

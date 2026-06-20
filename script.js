/* ==========================================================================
   1. THREE.JS 3D PARTICLE BACKGROUND
   ========================================================================== */

let scene, camera, renderer;
let particlesGeometry, particlesMaterial, particleSystem;
let largeBokehGeometry, largeBokehMaterial, largeBokehSystem;

// Target coordinates for mouse parallax
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function init3D() {
  const canvas = document.getElementById('webgl-background');
  if (!canvas) return;

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 150;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Soft gold circular texture generator (no asset loading needed)
  function createBokehTexture(colorHex, alphaStart) {
    const size = 64;
    const canvasObj = document.createElement('canvas');
    canvasObj.width = size;
    canvasObj.height = size;
    const ctx = canvasObj.getContext('2d');

    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alphaStart})`);
    gradient.addColorStop(0.2, `rgba(243, 208, 130, ${alphaStart * 0.7})`);
    gradient.addColorStop(0.5, `rgba(197, 160, 89, ${alphaStart * 0.2})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvasObj);
  }

  // --- Particle Set 1: Tiny Gold Dust ---
  const particlesCount = window.innerWidth < 768 ? 150 : 350;
  particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i += 3) {
    // Spread particles in a large 3D volume
    posArray[i] = (Math.random() - 0.5) * 350;
    posArray[i+1] = (Math.random() - 0.5) * 350;
    posArray[i+2] = (Math.random() - 0.5) * 200;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const dustTexture = createBokehTexture('#f3d082', 0.9);
  particlesMaterial = new THREE.PointsMaterial({
    size: 2.2,
    map: dustTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // --- Particle Set 2: Large Floating Amber Bokeh ---
  const largeBokehCount = window.innerWidth < 768 ? 15 : 35;
  largeBokehGeometry = new THREE.BufferGeometry();
  const largePosArray = new Float32Array(largeBokehCount * 3);

  for (let i = 0; i < largeBokehCount * 3; i += 3) {
    largePosArray[i] = (Math.random() - 0.5) * 400;
    largePosArray[i+1] = (Math.random() - 0.5) * 400;
    largePosArray[i+2] = (Math.random() - 0.5) * 150;
  }

  largeBokehGeometry.setAttribute('position', new THREE.BufferAttribute(largePosArray, 3));

  const bokehTexture = createBokehTexture('#c5a059', 0.4);
  largeBokehMaterial = new THREE.PointsMaterial({
    size: 22,
    map: bokehTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  largeBokehSystem = new THREE.Points(largeBokehGeometry, largeBokehMaterial);
  scene.add(largeBokehSystem);

  // Listeners
  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('touchmove', onDocumentTouchMove, { passive: true });

  // Start Animation
  animate();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.12;
  mouseY = (event.clientY - windowHalfY) * 0.12;
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    mouseX = (event.touches[0].pageX - windowHalfX) * 0.08;
    mouseY = (event.touches[0].pageY - windowHalfY) * 0.08;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Smooth camera easing to create responsive parallax
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  camera.position.x = targetX;
  camera.position.y = -targetY;
  camera.lookAt(scene.position);

  // Rotate/drift dust particles slowly
  if (particleSystem) {
    particleSystem.rotation.y += 0.0006;
    particleSystem.rotation.x += 0.0003;
  }

  // Drift large bokeh elements at a different speed (depth illusion)
  if (largeBokehSystem) {
    largeBokehSystem.rotation.y -= 0.0003;
    largeBokehSystem.rotation.z += 0.0002;
  }

  renderer.render(scene, camera);
}


/* ==========================================================================
   2. DOM INTERACTION & NAVIGATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize Three.js scene
  init3D();

  // Scroll Header Effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Navigation Hamburger Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close Mobile Menu on Link Click
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Active Link Tracking via Scroll Observer
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));


  /* ==========================================================================
     3. MENU SECTION TABS
     ========================================================================== */
  
  const tabBtns = document.querySelectorAll('.menu-tabs .tab-btn');
  const menuGrids = document.querySelectorAll('.menu-grid');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      // Hide all grids
      menuGrids.forEach(grid => {
        grid.style.display = 'none';
        grid.classList.remove('active');
      });

      // Activate current
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      const targetGrid = document.getElementById(targetTab);
      
      if (targetGrid) {
        targetGrid.style.display = 'grid';
        // Trigger small fade-in animation
        setTimeout(() => {
          targetGrid.classList.add('active');
        }, 50);
      }
    });
  });


  /* ==========================================================================
     4. GALLERY FILTER & LIGHTBOX
     ========================================================================== */

  const galleryBtns = document.querySelectorAll('.gallery-filters .tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  // Filter functionality
  galleryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          // Smooth fade-in
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          // Delay display change to complete fade animation
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Lightbox functionality
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('img').getAttribute('src');
      lightboxImg.setAttribute('src', imgSrc);
      lightbox.classList.add('active');
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  // Close lightbox on clicking dark background
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });


  /* ==========================================================================
     5. REVIEWS SLIDER CAROUSEL
     ========================================================================== */

  const reviews = document.querySelectorAll('.review-card');
  const prevBtn = document.getElementById('prev-review');
  const nextBtn = document.getElementById('next-review');
  let currentReview = 0;
  let autoSlideTimer;

  function showReview(index) {
    reviews.forEach(review => {
      review.classList.remove('active');
      // Apply exit animations
      review.style.opacity = '0';
      review.style.transform = 'translateX(-50px)';
    });

    currentReview = (index + reviews.length) % reviews.length;
    const activeReview = reviews[currentReview];

    // Reset styles then show active
    activeReview.classList.add('active');
    setTimeout(() => {
      activeReview.style.opacity = '1';
      activeReview.style.transform = 'translateX(0)';
    }, 50);
  }

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      showReview(currentReview + 1);
    }, 8000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  if (prevBtn && nextBtn && reviews.length > 0) {
    prevBtn.addEventListener('click', () => {
      showReview(currentReview - 1);
      resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
      showReview(currentReview + 1);
      resetAutoSlide();
    });

    // Start auto slider on page load
    startAutoSlide();
  }


  /* ==========================================================================
     6. CONTACT FORM SUBMISSION MOCKUP
     ========================================================================== */

  const cateringForm = document.getElementById('catering-form');
  const formMsg = document.getElementById('form-msg');

  if (cateringForm) {
    cateringForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple visual loader simulation
      const submitBtn = cateringForm.querySelector('.form-submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Inquiry...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Display success response card
        formMsg.classList.add('success');
        
        // Reset inputs
        cateringForm.reset();

        // Remove success display after 6 seconds
        setTimeout(() => {
          formMsg.classList.remove('success');
        }, 6000);

      }, 1500);
    });
  }

});

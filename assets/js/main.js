/**
 * Premium Damp Proofing & Waterproofing Contractor Website JS
 * Includes Design Utilities, Theme Control, RTL Mirror, and Custom Canvas Engines.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Core Layout & Controls ---
  initResponsiveNavbar();
  initThemeAndRtl();
  initMobileNav();
  initDropdowns();
  initScrollTop();
  initDiagnosticWizard();
  initFaqAccordion();
  initProjectFilters();
  initImageUploadPreview();

  // --- Hero Canvas Animations ---
  const canvas1 = document.getElementById('hero-canvas-1');
  if (canvas1) initHeroAnimationOne(canvas1);

  const canvas2 = document.getElementById('hero-canvas-2');
  if (canvas2) initHeroAnimationTwo(canvas2);
});

/**
 * Initializes and syncs theme & RTL modes with local storage
 */
function initThemeAndRtl() {
  // Sync Theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const isDark = savedTheme === 'dark';
  if (isDark) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Update theme toggle icons initially
  document.querySelectorAll('#theme-toggle, .theme-toggle-btn').forEach(btn => {
    btn.innerHTML = isDark ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
  });

  // Sync RTL
  const savedRtl = localStorage.getItem('rtl') === 'true';
  if (savedRtl) {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.removeAttribute('dir');
  }

  // Listeners via delegation for theme & RTL toggles
  document.addEventListener('click', (e) => {
    const themeBtn = e.target.closest('#theme-toggle, .theme-toggle-btn');
    if (themeBtn) {
      const isDarkNow = document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
      document.querySelectorAll('#theme-toggle, .theme-toggle-btn').forEach(btn => {
        btn.innerHTML = isDarkNow ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
      });
      window.dispatchEvent(new Event('themechange'));
    }

    const rtlBtn = e.target.closest('#rtl-toggle, .rtl-toggle-btn');
    if (rtlBtn) {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      if (isRtl) {
        document.documentElement.removeAttribute('dir');
        localStorage.setItem('rtl', 'false');
      } else {
        document.documentElement.setAttribute('dir', 'rtl');
        localStorage.setItem('rtl', 'true');
      }
    }
  });
}

/**
 * Responsive Mobile Menu Controller
 */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
      }
    });
  }
}

/**
 * /**
 * Interactive Calculator: Diagnostic Damp Wizard (for rising-damp.html)
 */
function initDiagnosticWizard() {
  const wizard = document.getElementById('diagnostic-wizard');
  if (!wizard) return;

  const steps = wizard.querySelectorAll('.wizard-step');
  const options = wizard.querySelectorAll('.wizard-option');
  const stepDots = wizard.querySelectorAll('.step-dot');
  const progressLineActive = document.getElementById('wizard-progress-line');
  const btnPrev = wizard.querySelector('.btn-prev');
  const btnNext = wizard.querySelector('.btn-next');
  const btnRecalc = wizard.querySelector('#btn-recalc-action');
  const wizardButtons = wizard.querySelector('.wizard-buttons');
  let currentStep = 0;
  const selections = {};

  function updateSteps() {
    // Show/hide steps
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === currentStep);
    });

    // Update dots progress
    stepDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx <= currentStep);
    });

    // Update progress track line
    if (progressLineActive) {
      const percentage = (currentStep / (steps.length - 1)) * 100;
      progressLineActive.style.width = `${percentage}%`;
    }

    // Toggle navigation buttons
    if (currentStep === steps.length - 1) {
      // Results step: hide the next/prev buttons container
      if (wizardButtons) wizardButtons.style.display = 'none';
      calculateRiskResult();
    } else {
      if (wizardButtons) wizardButtons.style.display = 'flex';
      if (btnPrev) btnPrev.style.display = currentStep === 0 ? 'none' : 'inline-flex';
      if (btnNext) {
        btnNext.innerHTML = currentStep === steps.length - 2 ? 'Calculate Risk <i class="ph ph-shield-check"></i>' : 'Next Step <i class="ph ph-caret-right"></i>';
      }
    }
  }

  // Handle option selections
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const category = opt.dataset.category;
      const val = opt.dataset.value;

      // Clear sibling options and select current
      opt.parentNode.querySelectorAll('.wizard-option').forEach(el => el.classList.remove('selected'));
      opt.classList.add('selected');
      selections[category] = val;
    });
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      // Validate that an option is selected for current step before moving forward
      const currentStepEl = steps[currentStep];
      const categoryEl = currentStepEl.querySelector('.wizard-option');
      if (categoryEl) {
        const category = categoryEl.dataset.category;
        if (!selections[category]) {
          // Highlight options with visual shake or border glow
          const optionsContainer = currentStepEl.querySelector('.wizard-options');
          if (optionsContainer) {
            optionsContainer.style.borderColor = 'var(--accent-third)';
            setTimeout(() => {
              optionsContainer.style.borderColor = 'var(--border)';
            }, 800);
          }
          alert('Please select an option to proceed.');
          return;
        }
      }

      if (currentStep < steps.length - 1) {
        currentStep++;
        updateSteps();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateSteps();
      }
    });
  }

  if (btnRecalc) {
    btnRecalc.addEventListener('click', resetWizard);
  }

  function resetWizard() {
    currentStep = 0;
    // Clear selections object
    for (const key in selections) {
      delete selections[key];
    }
    // Clear option styles
    options.forEach(opt => opt.classList.remove('selected'));
    // Reset radial meter
    const meterFill = document.getElementById('meter-fill');
    if (meterFill) {
      meterFill.style.strokeDashoffset = '440';
    }
    updateSteps();
  }

  function calculateRiskResult() {
    const resultPercent = document.getElementById('result-percent');
    const resultRiskLevel = document.getElementById('result-risk-level');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const actionsList = document.getElementById('actions-list');
    const meterFill = document.getElementById('meter-fill');

    const wallMoisture = selections['moisture'] || 'low';
    const age = selections['age'] || 'modern';
    const symptoms = selections['symptom'] || 'none';

    let score = 0;
    if (wallMoisture === 'high') score += 40;
    else if (wallMoisture === 'medium') score += 20;

    if (age === 'historic') score += 30;
    else if (age === 'midcentury') score += 15;

    if (symptoms === 'peeling' || symptoms === 'mould') score += 30;
    else if (symptoms === 'musty') score += 15;

    // Minimum risk score if high symptoms or age
    if (score === 0) score = 10; // base score for calculating

    // Animate circular SVG ring offset (circumference = 440)
    if (meterFill) {
      meterFill.style.strokeDashoffset = '440';
      setTimeout(() => {
        const offset = 440 - (440 * score) / 100;
        meterFill.style.strokeDashoffset = offset;
      }, 50);
    }

    // Animate count up for percent number
    let startPercent = 0;
    const duration = 600; // ms
    const stepTime = 15; // ms
    const stepsCount = duration / stepTime;
    const increment = score / stepsCount;
    const timer = setInterval(() => {
      startPercent += increment;
      if (startPercent >= score) {
        clearInterval(timer);
        if (resultPercent) resultPercent.textContent = `${score}%`;
      } else {
        if (resultPercent) resultPercent.textContent = `${Math.floor(startPercent)}%`;
      }
    }, stepTime);

    let level = 'LOW RISK';
    let summary = 'Your property displays minimal structural moisture concern. Ambient humidity or localized condensation might cause minor dampness. Normal property maintenance applies.';
    let colorClass = 'risk-low';
    let actions = [
      'Keep ambient indoor relative humidity below 55% with standard ventilation.',
      'Maintain steady space heating in cooler ground-floor rooms.',
      'Inspect external air vents to ensure they are clean and unobstructed.'
    ];

    if (score >= 70) {
      level = 'CRITICAL RISK';
      summary = 'High moisture profile and structural vulnerabilities detected. Active groundwater rising damp is highly probable. Professional chemical DPC injection is strongly advised to prevent dry rot and structural masonry damage.';
      colorClass = 'risk-high';
      actions = [
        'Book an immediate technical surveyor inspection.',
        'Avoid applying non-breathable vinyl wallpaper or gypsum plasters on damp surfaces.',
        'Verify that external soil/ground level is at least 150mm below original slate/DPC line.',
        'Inspect subfloor timber joists for wet/dry rot contamination.'
      ];
    } else if (score >= 40) {
      level = 'MODERATE RISK';
      summary = 'Subsurface humidity signs and structural age factors suggest moderate risk. This could indicate early capillary action or secondary condensation pooling near floor levels.';
      colorClass = 'risk-medium';
      actions = [
        'Monitor affected wall areas with a moisture pin-meter over a 30-day period.',
        'Increase mechanical extraction ventilation in high-humidity areas (kitchen/bath).',
        'Inspect external gutters, downpipes, and rendering for cracks or leaks.',
        'Consider applying a breathable silicone water-repellent sealer externally.'
      ];
    }

    if (resultRiskLevel) {
      resultRiskLevel.textContent = level;
      resultRiskLevel.className = `meter-risk-label ${colorClass}`;
    }
    if (resultTitle) resultTitle.textContent = `Diagnostics Complete: ${level}`;
    if (resultText) resultText.textContent = summary;

    if (actionsList) {
      actionsList.innerHTML = '';
      actions.forEach(action => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="ph ph-check-square"></i> ${action}`;
        actionsList.appendChild(li);
      });
    }
  }

  // Initial update
  updateSteps();
}

/**
 * FAQ Accordion Controller (for rising-damp.html)
 */
function initFaqAccordion() {
  const accordion = document.querySelector('.faq-accordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.accordion-item');

  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    if (header && content) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close other items
        items.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherHeader = otherItem.querySelector('.accordion-header');
            if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
            const otherContent = otherItem.querySelector('.accordion-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = null;
        } else {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });
}

/**
 * Filter Projects categories (projects.html)
 */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  if (filterBtns.length && projectItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Highlight active btn
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.dataset.filter;

        projectItems.forEach(item => {
          if (filterVal === 'all' || item.dataset.category === filterVal) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}

/**
 * Contact Form Property Image Upload Simulation (contact.html)
 */
function initImageUploadPreview() {
  const uploader = document.getElementById('property-images');
  const previewContainer = document.getElementById('upload-preview');

  if (uploader && previewContainer) {
    uploader.addEventListener('change', (e) => {
      previewContainer.innerHTML = '';
      const files = e.target.files;
      if (!files.length) return;

      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const imgWrapper = document.createElement('div');
          imgWrapper.style.position = 'relative';
          imgWrapper.style.width = '70px';
          imgWrapper.style.height = '70px';
          imgWrapper.style.borderRadius = '8px';
          imgWrapper.style.overflow = 'hidden';
          imgWrapper.style.border = '1px solid var(--border)';

          const img = document.createElement('img');
          img.src = event.target.result;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';

          imgWrapper.appendChild(img);
          previewContainer.appendChild(imgWrapper);
        };
        reader.readAsDataURL(file);
      });
    });
  }
}

/**
 * Hero Animation #1: "Building Protection Intelligence"
 * Water particles dropping, repelled by mouse hovering shield overlay, blueprint background.
 */
function initHeroAnimationOne(canvas) {
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  let particles = [];
  const particleCount = 70;
  let mouse = { x: null, y: null, radius: 110 };

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  const heroSection = canvas.closest('.hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }

  // Particle Class representing moisture water droplets
  class Droplet {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20;
      this.size = Math.random() * 2 + 1;
      this.speedY = Math.random() * 2 + 1.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.color = getComputedStyle(document.body).classList.contains('dark-theme')
        ? 'rgba(27, 154, 170, 0.45)'
        : 'rgba(27, 154, 170, 0.25)';
    }

    update() {
      // Flow downwards
      this.y += this.speedY;
      this.x += this.speedX;

      // Mouse repelling physics (barrier shield)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const forceX = (dx / distance) * force * 4;
          const forceY = (dy / distance) * force * 4;

          this.x += forceX;
          this.y += forceY;
          this.color = 'rgba(87, 204, 153, 0.8)'; // Green accent repels
        } else {
          this.color = getComputedStyle(document.body).classList.contains('dark-theme')
            ? 'rgba(27, 154, 170, 0.45)'
            : 'rgba(27, 154, 170, 0.25)';
        }
      }

      if (this.y > height || this.x < 0 || this.x > width) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Create droplets
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Droplet());
  }

  function drawGrid() {
    const isDark = document.body.classList.contains('dark-theme');
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(15, 23, 42, 0.02)';
    ctx.lineWidth = 1;

    const gridSize = 45;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Drawing structural blueprint overlay
    drawGrid();

    // 2. Draw protective mouse barrier shield
    if (mouse.x !== null && mouse.y !== null) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(27, 154, 170, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius - 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(87, 204, 153, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Update & Draw water droplets
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Hero Animation #2: "Property Defense System"
 * Building framework vectors, water particles sliding off structural slopes (diversion), pulses.
 */
function initHeroAnimationTwo(canvas) {
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  let drops = [];
  const maxDrops = 60;
  let pulseRadius = 0;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  // Structural blueprint points (house roof peak and foundation boundaries)
  // Position structural frame relative to canvas size
  function getBuildingGeometry() {
    const cx = width / 2;
    const cy = height * 0.6;
    const houseWidth = Math.min(width * 0.5, 420);
    const houseHeight = 160;

    return {
      roofPeak: { x: cx, y: cy - houseHeight },
      roofLeft: { x: cx - houseWidth / 2, y: cy - houseHeight * 0.4 },
      roofRight: { x: cx + houseWidth / 2, y: cy - houseHeight * 0.4 },
      foundationLeft: { x: cx - houseWidth / 2, y: cy + houseHeight * 0.6 },
      foundationRight: { x: cx + houseWidth / 2, y: cy + houseHeight * 0.6 },
      width: houseWidth,
      height: houseHeight
    };
  }

  class RainDrop {
    constructor() {
      this.reset();
      this.y = Math.random() * (height * 0.5);
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -10;
      this.speed = Math.random() * 3 + 2;
      this.size = Math.random() * 2 + 1;
      this.sliding = false;
      this.slideDirection = 0;
    }

    update() {
      const geo = getBuildingGeometry();

      if (this.sliding) {
        // Slide off roof slope
        this.x += this.slideDirection * 2.5;
        this.y += 1.25;

        // Reset if off roof boundaries
        if (this.x < geo.roofLeft.x || this.x > geo.roofRight.x || this.y > geo.roofLeft.y) {
          this.sliding = false;
        }
      } else {
        // Direct descend
        this.y += this.speed;

        // Check roof collision (slope intercept)
        const isLeftSlope = this.x >= geo.roofLeft.x && this.x <= geo.roofPeak.x;
        const isRightSlope = this.x > geo.roofPeak.x && this.x <= geo.roofRight.x;

        if (isLeftSlope) {
          // Roof left slope line equation: y = m*x + c
          const m = (geo.roofLeft.y - geo.roofPeak.y) / (geo.roofLeft.x - geo.roofPeak.x);
          const c = geo.roofPeak.y - m * geo.roofPeak.x;
          const intersectY = m * this.x + c;

          if (this.y >= intersectY - 4 && this.y <= intersectY + 10) {
            this.sliding = true;
            this.slideDirection = -1;
            this.y = intersectY;
          }
        } else if (isRightSlope) {
          // Roof right slope
          const m = (geo.roofRight.y - geo.roofPeak.y) / (geo.roofRight.x - geo.roofPeak.x);
          const c = geo.roofPeak.y - m * geo.roofPeak.x;
          const intersectY = m * this.x + c;

          if (this.y >= intersectY - 4 && this.y <= intersectY + 10) {
            this.sliding = true;
            this.slideDirection = 1;
            this.y = intersectY;
          }
        }
      }

      if (this.y > height || this.x < 0 || this.x > width) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.sliding ? 'rgba(87, 204, 153, 0.75)' : 'rgba(27, 154, 170, 0.4)';
      ctx.fill();
    }
  }

  // Populate
  for (let i = 0; i < maxDrops; i++) {
    drops.push(new RainDrop());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const geo = getBuildingGeometry();
    const isDark = document.body.classList.contains('dark-theme');

    // 1. Draw building defense vector lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)';
    ctx.lineWidth = 1;

    // Drawing coordinates axes
    ctx.beginPath();
    ctx.moveTo(geo.roofPeak.x, 0);
    ctx.lineTo(geo.roofPeak.x, height);
    ctx.stroke();

    // Draw house frame
    ctx.strokeStyle = isDark ? 'rgba(93, 124, 149, 0.3)' : 'rgba(93, 124, 149, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Roof Left
    ctx.moveTo(geo.roofPeak.x, geo.roofPeak.y);
    ctx.lineTo(geo.roofLeft.x, geo.roofLeft.y);
    // Roof Right
    ctx.moveTo(geo.roofPeak.x, geo.roofPeak.y);
    ctx.lineTo(geo.roofRight.x, geo.roofRight.y);
    // Outer walls
    ctx.moveTo(geo.roofLeft.x, geo.roofLeft.y);
    ctx.lineTo(geo.foundationLeft.x, geo.foundationLeft.y);
    ctx.moveTo(geo.roofRight.x, geo.roofRight.y);
    ctx.lineTo(geo.foundationRight.x, geo.foundationRight.y);
    // Foundation level
    ctx.moveTo(geo.foundationLeft.x, geo.foundationLeft.y);
    ctx.lineTo(geo.foundationRight.x, geo.foundationRight.y);
    ctx.stroke();

    // 2. Foundation pulsing defense barrier (Green alert)
    pulseRadius += 0.5;
    if (pulseRadius > 40) pulseRadius = 0;

    ctx.strokeStyle = `rgba(87, 204, 153, ${0.4 - (pulseRadius / 40) * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(geo.roofPeak.x, geo.foundationLeft.y, geo.width / 2 + pulseRadius, Math.PI, 0);
    ctx.stroke();

    // 3. Update & Draw falling and sliding drops
    drops.forEach(d => {
      d.update();
      d.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Initialize Home dropdown menu click events and click-away closing
 */
function initDropdowns() {
  const dropdownToggle = document.getElementById('home-dropdown');
  const dropdownMenu = document.getElementById('home-menu');

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }
}

/**
 * Initialize Scroll to Top button click event and scroll visibility window trigger
 */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scroll-to-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Responsive Navbar modifier: Restructures home dropdown and action buttons dynamically for tablet/mobile
 */
function initResponsiveNavbar() {
  // 1. Navbar scroll effect
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  const navbar = document.querySelector('.navbar');
  if (navbarWrapper && navbar) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        navbarWrapper.classList.add('navbar-scrolled');
        navbar.classList.add('navbar-scrolled');
      } else {
        navbarWrapper.classList.remove('navbar-scrolled');
        navbar.classList.remove('navbar-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  // 2. Navigation items restructure for mobile/tablet
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    // Add class to hide desktop Home dropdown
    const homeDropdownLi = navMenu.querySelector('li.dropdown');
    if (homeDropdownLi) {
      homeDropdownLi.classList.add('desktop-only-nav');
    }

    // Add separate Home 1 and Home 2 links
    const home1Li = document.createElement('li');
    home1Li.className = 'mobile-only-nav';
    home1Li.innerHTML = '<a href="index.html" class="nav-link">Home 1</a>';
    
    const home2Li = document.createElement('li');
    home2Li.className = 'mobile-only-nav';
    home2Li.innerHTML = '<a href="home-2.html" class="nav-link">Home 2</a>';

    const currentPath = window.location.pathname;
    if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '') {
      home1Li.querySelector('a').classList.add('active');
    } else if (currentPath.endsWith('home-2.html')) {
      home2Li.querySelector('a').classList.add('active');
    }

    navMenu.insertBefore(home2Li, navMenu.firstChild);
    navMenu.insertBefore(home1Li, navMenu.firstChild);

    // 3. Move actions and signup buttons inside hamburger
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      const mobileActionsLi = document.createElement('li');
      mobileActionsLi.className = 'mobile-only-nav mobile-nav-actions';
      
      const signUpBtn = navActions.querySelector('.btn-primary');
      let signUpHtml = '';
      if (signUpBtn) {
        signUpHtml = `<a href="signup.html" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 12px;">Sign Up</a>`;
      }
      
      mobileActionsLi.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%; border-top: 1px solid var(--border); padding-top: 15px; margin-top: 15px;">
          ${signUpHtml}
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="toggle-btn theme-toggle-btn" aria-label="Toggle Theme">
              <i class="ph ph-sun"></i>
            </button>
            <button class="toggle-btn rtl-toggle-btn" aria-label="Toggle RTL">
              <i class="ph ph-arrows-left-right"></i>
            </button>
          </div>
        </div>
      `;
      navMenu.appendChild(mobileActionsLi);
    }
  }
}


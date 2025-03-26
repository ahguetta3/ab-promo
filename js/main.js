// Language handling and translations
let currentLang = localStorage.getItem('preferred_language') || 
                 navigator.language.substring(0, 2) || 
                 'ar'; // Default language

// Device detection for mobile optimizations
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function detectLanguage() {
    const browserLang = navigator.language.split('-')[0];
    return ['ar', 'fr', 'en'].includes(browserLang) ? browserLang : 'ar';
}

function setLanguage(lang) {
    // Save language preference
    localStorage.setItem('preferred_language', lang);
    
    // Update HTML dir attribute
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update current language display
    const currentLangText = document.querySelector('.lang-current .lang-text');
    if (currentLangText) {
        currentLangText.textContent = translations[lang].current_lang;
    }

    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Update form placeholders
    document.querySelectorAll('input[data-translate], textarea[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Force update Bootstrap RTL/LTR if using Bootstrap
    const currentStylesheet = document.getElementById('bootstrap-css');
    if (currentStylesheet) {
        currentStylesheet.href = lang === 'ar' 
            ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css'
            : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
    }
}

// Scroll animation function with performance optimizations
function handleScrollAnimation() {
    // Only use animations on non-mobile devices or if the user hasn't disabled animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || (isMobile && !sessionStorage.getItem('allow_animations'))) {
        // Skip animations for better performance on mobile or if user prefers reduced motion
        return;
    }
    
    const elements = document.querySelectorAll('.card, .hero-section h1, .hero-section p, section h2, .contact-section .card');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });

    // Use more efficient intersection observer with lower update frequency for mobile
    const observerOptions = {
        threshold: isMobile ? 0.1 : 0.2,
        rootMargin: '0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after animation to save resources
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elements.forEach(element => {
        observer.observe(element);
    });
}

// Lazy loading for images with native support check
function setupLazyLoading() {
    // Check if browser supports native lazy loading
    if ('loading' in HTMLImageElement.prototype) {
        // Use native lazy loading
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.setAttribute('loading', 'lazy');
            img.removeAttribute('data-src');
        });
    } else {
        // Fallback to Intersection Observer API
        const lazyImages = [].slice.call(document.querySelectorAll("img[data-src]"));
        
        if ("IntersectionObserver" in window) {
            let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.removeAttribute('data-src');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            }, { rootMargin: "0px 0px 300px 0px" }); // Load images 300px before they appear

            lazyImages.forEach(function(lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        }
    }
}

// Mobile-specific optimizations
function setupMobileOptimizations() {
    if (isMobile) {
        // Collapsible navbar should close when a link is clicked
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
        
        // Add touch feedback for buttons
        const buttons = document.querySelectorAll('.btn, .card, .nav-link');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.classList.add('active-touch');
            }, { passive: true });
            
            button.addEventListener('touchend', function() {
                this.classList.remove('active-touch');
            }, { passive: true });
        });
    }
}

// Initialize language based on browser settings
document.addEventListener('DOMContentLoaded', function() {
    // Get browser language or default to Arabic
    const initialLang = detectLanguage();
    setLanguage(initialLang);

    // Language switcher functionality
    document.querySelectorAll('.lang-switch').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Initialize scroll animations
    handleScrollAnimation();
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Setup mobile optimizations
    setupMobileOptimizations();

    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            // لا نمنع السلوك الافتراضي لأننا نريد أن يتم إرسال النموذج إلى Formspree
            
            // إضافة مؤشر تحميل أثناء الإرسال
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitButton.disabled = true;
            
            // لا نحتاج إلى مزيد من الإجراءات هنا لأن Formspree سيتولى الباقي
            // وسيتم توجيه المستخدم إلى صفحة الشكر المحددة في النموذج
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Language handling and translations
let currentLang = localStorage.getItem('preferred_language') || 
                 navigator.language.substring(0, 2) || 
                 'ar'; // Default language

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

// Scroll animation function
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.card, .hero-section h1, .hero-section p, section h2, .contact-section .card');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        observer.observe(element);
    });
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

    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Show thank you message in current language
            alert(translations[currentLang].thank_you);
            
            // Reset form
            contactForm.reset();
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

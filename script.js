// Set current year
document.getElementById('current-year').textContent = new Date().getFullYear();

// Mobile navigation toggle
const navToggle = document.querySelector('.mobile-nav-toggle');
const primaryNav = document.querySelector('nav');

navToggle.addEventListener('click', () => {
    primaryNav.classList.toggle('visible');
    navToggle.classList.toggle('active');
    document.body.style.overflow = primaryNav.classList.contains('visible') ? 'hidden' : '';
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
    if (!primaryNav.contains(e.target) && !navToggle.contains(e.target)) {
        primaryNav.classList.remove('visible');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Loading animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe loading elements
document.querySelectorAll('.loading').forEach(el => {
    observer.observe(el);
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Image loading enhancement
const profileImage = document.querySelector('.profile-image');
if (profileImage) {
    profileImage.addEventListener('load', function() {
        this.classList.add('loaded');
    });
}

// Back to top button functionality
const backToTopBtn = document.getElementById("backToTopBtn");

if (backToTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    });

    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
}


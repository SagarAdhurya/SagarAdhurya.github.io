// Fixed JavaScript function to load sidebar into any page
function loadSidebar() {
    fetch('sidebar.html')
        .then(response => response.text())
        .then(data => {
            // Create a temporary div to hold the sidebar content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            
            // Get the mobile toggle and navigation elements
            const mobileToggle = tempDiv.querySelector('.mobile-nav-toggle');
            const nav = tempDiv.querySelector('nav');
            
            // Find where to insert the elements
            const body = document.body;
            const pageWrapper = document.querySelector('.page-wrapper');
            
            if (mobileToggle && nav && pageWrapper) {
                // Insert mobile toggle before page wrapper
                body.insertBefore(mobileToggle, pageWrapper);
                
                // Insert navigation as first child of page wrapper
                pageWrapper.insertBefore(nav, pageWrapper.firstChild);
                
                // Set active navigation link
                setActiveNavLink();
                
                // Initialize mobile navigation
                initializeMobileNav();
            } else {
                console.error('Could not find required elements for sidebar insertion');
            }
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
        });
}

// Function to set the active navigation link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        
        // Check if this is the current page
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === '#about')) {
            link.classList.add('active');
        }
    });
}

// Function to initialize mobile navigation
function initializeMobileNav() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('nav');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');
        });
        
        // Close mobile nav when clicking on a link
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Load sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', loadSidebar);
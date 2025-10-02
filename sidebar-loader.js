// JavaScript function to load sidebar into any page
function loadSidebar() {
    fetch('sidebar.html')
        .then(response => response.text())
        .then(data => {
            // Insert sidebar content into the page
            const sidebarContainer = document.querySelector('.sidebar-container') || 
                                   document.querySelector('.page-wrapper') || 
                                   document.body;
            
            // Create a temporary div to hold the sidebar content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            
            // Get the first child from the wrapper div
            const pageWrapper = document.querySelector('.page-wrapper');
            if (pageWrapper) {
                // Insert mobile nav toggle before page wrapper
                const mobileToggle = tempDiv.querySelector('.mobile-nav-toggle');
                if (mobileToggle) {
                    pageWrapper.parentNode.insertBefore(mobileToggle, pageWrapper);
                }
                
                // Insert navigation inside page wrapper
                const nav = tempDiv.querySelector('nav');
                if (nav) {
                    pageWrapper.insertBefore(nav, pageWrapper.firstChild);
                }
            }
            
            // Set active navigation link based on current page
            setActiveNavLink();
            
            // Initialize mobile navigation toggle
            initializeMobileNav();
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
            (currentPage === 'index.html' && linkHref === 'index.html')) {
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
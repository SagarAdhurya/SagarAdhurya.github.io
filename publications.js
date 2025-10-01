// publications.js - Enhanced version with metrics calculation and improved citation styling
class PublicationManager {
    constructor() {
        this.publications = [];
        this.citations = [];
        this.filteredPublications = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
    }

    async loadData() {
        try {
            // Show loading state
            this.showLoading();

            // Load publications
            const pubResponse = await fetch('assets/publications.csv');
            if (!pubResponse.ok) {
                throw new Error(`Failed to load publications.csv: ${pubResponse.statusText}`);
            }
            const pubText = await pubResponse.text();
            this.publications = this.parseCSV(pubText);

            // Load citations
            const citResponse = await fetch('assets/citations.csv');
            if (!citResponse.ok) {
                throw new Error(`Failed to load citations.csv: ${citResponse.statusText}`);
            }
            const citText = await citResponse.text();
            this.citations = this.parseCitationsCSV(citText);

            // Calculate citation counts for each publication
            this.calculateCitationCounts();

            // Initialize filtered publications
            this.filteredPublications = [...this.publications];

            // Render everything
            this.renderStats();
            this.renderCategoryFilters();
            this.renderPublications();
            this.initializeSearch();
            this.initializeFilters();

            console.log(`Loaded ${this.publications.length} publications and ${this.citations.length} citations`);

        } catch (error) {
            console.error('Error loading data:', error);
            this.showError(`Error loading publications: ${error.message}`);
        }
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];
        
        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length > 0 && values[0]) { // Skip empty rows
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index] ? values[index].trim() : '';
                });
                data.push(obj);
            }
        }
        return data;
    }

    parseCitationsCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];
        
        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length > 0 && values[0]) { // Skip empty rows
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index] ? values[index].trim() : '';
                });
                data.push(obj);
            }
        }
        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        result.push(current);
        return result;
    }

    calculateCitationCounts() {
        // Calculate citation count for each publication
        this.publications.forEach(pub => {
            pub.citationCount = this.citations.filter(citation => 
                citation.id === pub.id.toString()
            ).length;
        });
    }

    getCitationCount(publicationId) {
        const pub = this.publications.find(p => p.id === publicationId.toString());
        return pub ? pub.citationCount : 0;
    }

    getCitations(publicationId) {
        return this.citations.filter(citation => 
            citation.id === publicationId.toString()
        );
    }

    // Calculate h-index
    calculateHIndex() {
        const citationCounts = this.publications.map(pub => pub.citationCount || 0);
        const sortedCounts = citationCounts.sort((a, b) => b - a);
        
        let hIndex = 0;
        for (let i = 0; i < sortedCounts.length; i++) {
            if (sortedCounts[i] >= i + 1) {
                hIndex = i + 1;
            } else {
                break;
            }
        }
        return hIndex;
    }

    // Calculate i10-index
    calculateI10Index() {
        return this.publications.filter(pub => (pub.citationCount || 0) >= 10).length;
    }

    // Calculate first-authored articles
    calculateFirstAuthoredCount() {
        return this.publications.filter(pub => {
            if (!pub.authors) return false;
            const firstAuthor = pub.authors.trim().split(',')[0].trim();
            return firstAuthor === 'Adhurya, S.' || firstAuthor === 'Adhurya, S';
        }).length;
    }

    // Enhanced function to create clickable title
    formatTitle(title, link) {
        if (!title) return '';
        
        // Clean up the title
        const cleanTitle = title.replace(/^"|"$/g, '');
        
        if (link && link.trim() && link.toLowerCase() !== 'na') {
            // Make title clickable if link exists
            return `<a href="${link}" target="_blank" class="publication-title-link">${cleanTitle}</a>`;
        } else {
            // Return non-clickable title
            return cleanTitle;
        }
    }

    // Enhanced function to format DOI/link buttons (keeping existing functionality)
    formatLink(pub) {
        if (!pub.link || pub.link.toLowerCase() === 'na') return '';
        
        if (pub.link.startsWith('https://') || pub.link.startsWith('http://')) {
            // Direct link
            if (pub.doi && pub.doi.startsWith('10.') && pub.doi.toLowerCase() !== 'na') {
                return `<a href="${pub.link}" target="_blank" class="doi-link">📄 DOI: ${pub.doi}</a>`;
            } else {
                return `<a href="${pub.link}" target="_blank" class="article-link">🔗 View Article</a>`;
            }
        } else {
            // Available from source
            return `<span class="available-from">📚 ${pub.link}</span>`;
        }
    }

    renderStats() {
        const totalPubs = this.publications.length;
        const totalCitations = this.citations.length;
        const categories = [...new Set(this.publications.map(p => p.category).filter(Boolean))];
        const years = this.publications.map(p => parseInt(p.year)).filter(y => !isNaN(y));
        const yearsActive = years.length > 0 ? Math.max(...years) - Math.min(...years) + 1 : 0;

        // Calculate new metrics
        const hIndex = this.calculateHIndex();
        const i10Index = this.calculateI10Index();
        const firstAuthoredCount = this.calculateFirstAuthoredCount();

        document.getElementById('total-publications').textContent = totalPubs;
        document.getElementById('total-citations').textContent = totalCitations;
        document.getElementById('h-index').textContent = hIndex;
        document.getElementById('i10-index').textContent = i10Index;
        document.getElementById('first-authored').textContent = firstAuthoredCount;
        document.getElementById('research-areas').textContent = categories.length;
        document.getElementById('years-active').textContent = yearsActive;
    }

    renderCategoryFilters() {
        const categories = [...new Set(this.publications.map(p => p.category).filter(Boolean))];
        const filterContainer = document.getElementById('category-filter');
        
        let html = '<button class="filter-btn active" data-category="all">All Publications</button>';
        categories.forEach(category => {
            const count = this.publications.filter(p => p.category === category).length;
            html += `<button class="filter-btn" data-category="${category}">${category} (${count})</button>`;
        });
        
        filterContainer.innerHTML = html;
    }

    renderPublications() {
        const container = document.getElementById('publications-container');
        if (!container) {
            console.error('Publications container not found');
            return;
        }

        if (this.filteredPublications.length === 0) {
            container.innerHTML = '<div class="no-results">No publications found matching your criteria.</div>';
            return;
        }

        // Group by year and sort
        const groupedByYear = this.groupByYear(this.filteredPublications);
        const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

        let html = '';

        sortedYears.forEach(year => {
            const yearPubs = groupedByYear[year];
            html += `<div class="year-section">
                <h3 class="year-header">
                    ${year}
                    <span class="year-count">${yearPubs.length} publication${yearPubs.length > 1 ? 's' : ''}</span>
                </h3>`;

            yearPubs.forEach(pub => {
                const citationCount = pub.citationCount || 0;
                const citations = this.getCitations(pub.id);
                const linkHtml = this.formatLink(pub);
                const titleHtml = this.formatTitle(pub.title, pub.link);

                html += `
                <div class="publication-card" data-category="${pub.category}" data-pub-id="${pub.id}">
                    <div class="publication-header">
                        <h4 class="publication-title">${titleHtml}</h4>
                        <div class="publication-badges">
                            <span class="publication-type">${pub.type || 'Article'}</span>
                            <span class="publication-category">${pub.category || 'Research'}</span>
                        </div>
                    </div>
                    <div class="publication-authors">${pub.authors}</div>
                    <div class="publication-journal">
                        <strong>${pub.journal}</strong>
                        ${pub.volume ? `, Vol. ${pub.volume}` : ''}
                        ${pub.pages ? `: ${pub.pages}` : ''}
                        ${pub.year ? ` (${pub.year})` : ''}
                    </div>
                    <div class="publication-meta">
                        ${linkHtml}
                        ${citationCount > 0 ? `
                            <span class="citation-count">
                                📊 ${citationCount} citation${citationCount > 1 ? 's' : ''}
                            </span>
                            <button class="toggle-citations" onclick="toggleCitations(${pub.id})">
                                View Citations
                            </button>
                        ` : ''}
                    </div>
                    ${citationCount > 0 ? `
                        <div class="citations-list" id="citations-${pub.id}" style="display: none;">
                            ${this.renderCitationsList(citations)}
                        </div>
                    ` : ''}
                </div>`;
            });
            html += '</div>';
        });

        container.innerHTML = html;
    }

    renderCitationsList(citations) {
        if (citations.length === 0) return '';
        
        let html = '<h5>📚 Cited by:</h5><div class="citations-container">';
        citations.forEach(citation => {
            // Format citation title as clickable if link exists
            const citationTitleHtml = this.formatCitationTitle(citation.title, citation.link);
            
            html += `<div class="citation-item-new">
                <div class="citation-main-title">
                    ${citationTitleHtml} <span class="citation-year">(${citation.year})</span>
                </div>
                <div class="citation-details">
                    <div class="citation-journal-info">
                        <em>${citation.journal_book}</em>
                        ${citation.doi && citation.doi !== 'NA' && citation.link ? `
                            <a href="${citation.link}" target="_blank" class="citation-doi-new">DOI: ${citation.doi}</a>
                        ` : ''}
                    </div>
                    <div class="citation-authors-info">${citation.author}</div>
                </div>
            </div>`;
        });
        html += '</div>';
        return html;
    }

    // Enhanced function to format citation titles as clickable
    formatCitationTitle(title, link) {
        if (!title) return '';
        
        const cleanTitle = `"${title.replace(/^"|"$/g, '')}"`;
        
        if (link && link.trim() && link.toLowerCase() !== 'na') {
            return `<a href="${link}" target="_blank" class="citation-title-link-new">${cleanTitle}</a>`;
        } else {
            return cleanTitle;
        }
    }

    groupByYear(publications) {
        return publications.reduce((grouped, pub) => {
            const year = pub.year || 'Unknown';
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(pub);
            return grouped;
        }, {});
    }

    initializeSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.applyFilters();
        });
    }

    initializeFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.currentFilter = btn.dataset.category;
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        this.filteredPublications = this.publications.filter(pub => {
            // Category filter
            const categoryMatch = this.currentFilter === 'all' || pub.category === this.currentFilter;
            
            // Search filter
            const searchMatch = !this.searchQuery || 
                pub.title.toLowerCase().includes(this.searchQuery) ||
                pub.authors.toLowerCase().includes(this.searchQuery) ||
                pub.journal.toLowerCase().includes(this.searchQuery) ||
                (pub.keywords && pub.keywords.toLowerCase().includes(this.searchQuery));
            
            return categoryMatch && searchMatch;
        });

        this.renderPublications();
    }

    showLoading() {
        const container = document.getElementById('publications-container');
        if (container) {
            container.innerHTML = '<div class="loading-spinner">Loading publications...</div>';
        }
    }

    showError(message) {
        const container = document.getElementById('publications-container');
        if (container) {
            container.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }
}

// Global functions
function toggleCitations(pubId) {
    const citationsDiv = document.getElementById(`citations-${pubId}`);
    const button = document.querySelector(`[onclick="toggleCitations(${pubId})"]`);
    
    if (!citationsDiv || !button) return;
    
    if (citationsDiv.style.display === 'none') {
        citationsDiv.style.display = 'block';
        button.textContent = 'Hide Citations';
        button.classList.add('active');
    } else {
        citationsDiv.style.display = 'none';
        button.textContent = 'View Citations';
        button.classList.remove('active');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const pubManager = new PublicationManager();
    pubManager.loadData();

    // Add loading animation to sections
    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(element => {
            element.classList.add('loaded');
        });
    }, 500);
});
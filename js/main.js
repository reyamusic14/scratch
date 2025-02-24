document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const resultsSection = document.querySelector('.results-section');
    const locationInput = document.getElementById('location');
    const climateIssueSelect = document.getElementById('climate-issue');

    generateBtn.addEventListener('click', async () => {
        const location = locationInput.value;
        const climateIssue = climateIssueSelect.value;

        if (!location || !climateIssue) {
            alert('Please fill in all fields');
            return;
        }

        // Show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            // Generate images (to be implemented)
            await generateImages(location, climateIssue);
            
            // Show results section
            resultsSection.classList.remove('hidden');
            
            // Update climate info
            updateClimateInfo(climateIssue);
        } catch (error) {
            console.error('Error generating images:', error);
            alert('Failed to generate images. Please try again.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Vision';
        }
    });

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateClimateInfo(climateIssueSelect.value, button.textContent.toLowerCase());
        });
    });
});

function updateClimateInfo(climateIssue, tab = 'causes') {
    const infoContent = document.querySelector('.info-content');
    const climateData = {
        'rising-sea': {
            causes: 'Global warming, thermal expansion of oceans, melting ice caps',
            effects: 'Coastal flooding, erosion, displacement of communities',
            solutions: 'Reduce carbon emissions, protect coastal wetlands, implement flood defense systems'
        },
        'deforestation': {
            causes: 'Agriculture expansion, logging, urbanization',
            effects: 'Loss of biodiversity, soil erosion, increased CO2 emissions',
            solutions: 'Sustainable forestry, reforestation programs, reduced paper consumption'
        },
        // Add more climate issues as needed
    };

    infoContent.innerHTML = `<p>${climateData[climateIssue][tab]}</p>`;
}

class SocialSharing {
    constructor() {
        this.shareBtn = document.getElementById('share-btn');
        this.init();
    }

    init() {
        this.shareBtn.addEventListener('click', () => this.showShareOptions());
    }

    showShareOptions() {
        const shareData = {
            title: 'EcoVision - Climate Change Awareness',
            text: `Check out this climate change visualization for ${document.getElementById('location').value}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('Shared successfully'))
                .catch((error) => console.log('Error sharing:', error));
        } else {
            this.showFallbackShareDialog();
        }
    }

    showFallbackShareDialog() {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-options">
                <button onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(window.location.href)}')">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}')">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
                <button onclick="window.open('https://www.linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}')">
                    <i class="fab fa-linkedin"></i> LinkedIn
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

new SocialSharing(); 
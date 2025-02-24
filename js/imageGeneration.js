class ImageGenerator {
    constructor() {
        this.generateBtn = document.getElementById('generate-btn');
        this.locationInput = document.getElementById('location');
        this.climateIssue = document.getElementById('climate-issue');
        this.resultsSection = document.querySelector('.results-section');
        
        // Add the event listener in constructor
        this.generateBtn.addEventListener('click', () => this.generateImages());
        
        // Validate API keys on initialization
        this.validateAPIKeys();
    }

    validateAPIKeys() {
        if (!CONFIG.OPENAI_API_KEY || !CONFIG.STABILITY_API_KEY) {
            console.error('API keys not found. Please add them to config.js');
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = 'API Keys Required';
        }
    }

    async generateImages() {
        if (!this.locationInput.value || !this.climateIssue.value) {
            alert('Please fill in all fields');
            return;
        }

        // Show loading state
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';

        try {
            const prompt = this.generatePrompt();
            console.log('Sending prompt:', prompt); // Debug log

            const response = await fetch('http://localhost:3000/api/generate-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate images');
            }

            const data = await response.json();
            console.log('Received data:', data); // Debug log

            // Update UI with generated images
            const imageCards = document.querySelectorAll('.image-card img');
            imageCards[0].src = data.images.stabilityAI;
            imageCards[1].src = data.images.dalleE;
            imageCards[2].src = data.images.stabilityAI; // or another variation

            // Show results section
            this.resultsSection.classList.remove('hidden');
            
            // Update climate information
            this.updateClimateInfo();
        } catch (error) {
            console.error('Error generating images:', error);
            alert(error.message || 'Failed to generate images. Please try again.');
        } finally {
            // Reset button state
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = 'Generate Vision';
        }
    }

    generatePrompt() {
        return `Show the impact of ${this.climateIssue.value} in ${this.locationInput.value}, 
                photorealistic visualization of climate change effects, 
                environmental photography style`;
    }

    updateClimateInfo() {
        const climateData = {
            'rising-sea': {
                causes: 'Global warming, thermal expansion of oceans, melting ice caps',
                effects: 'Coastal flooding, erosion, displacement of communities',
                solutions: 'Reduce carbon emissions, coastal protection, renewable energy'
            },
            'drought': {
                causes: 'Climate change, deforestation, poor water management',
                effects: 'Crop failure, water scarcity, desertification',
                solutions: 'Water conservation, drought-resistant crops, improved irrigation'
            },
            'coral-bleaching': {
                causes: 'Ocean warming, ocean acidification, pollution',
                effects: 'Loss of marine habitat, ecosystem collapse, tourism impact',
                solutions: 'Reduce emissions, marine protected areas, coral restoration'
            },
            // Add more climate issues here
        };

        const info = climateData[this.climateIssue.value];
        const infoContent = document.querySelector('.info-content');
        infoContent.innerHTML = `<p>${info.causes}</p>`;
    }
}

// Create instance immediately
const imageGenerator = new ImageGenerator(); 
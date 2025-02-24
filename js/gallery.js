class Gallery {
    constructor() {
        this.savedImages = JSON.parse(localStorage.getItem('savedImages')) || [];
        this.saveBtn = document.getElementById('save-btn');
        this.init();
    }

    init() {
        this.saveBtn.addEventListener('click', () => this.saveCurrentImages());
        this.initGalleryView();
        this.initLikeButtons();
    }

    saveCurrentImages() {
        const currentImages = Array.from(document.querySelectorAll('.image-card')).map(card => ({
            imageUrl: card.querySelector('img').src,
            location: document.getElementById('location').value,
            climateIssue: document.getElementById('climate-issue').value,
            timestamp: new Date().toISOString(),
            likes: 0
        }));

        this.savedImages = [...this.savedImages, ...currentImages];
        localStorage.setItem('savedImages', JSON.stringify(this.savedImages));
        alert('Images saved to gallery!');
    }

    initGalleryView() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns[1].addEventListener('click', () => this.showGallery());
    }

    showGallery() {
        const main = document.querySelector('main');
        main.innerHTML = `
            <div class="gallery-grid">
                ${this.savedImages.map(img => this.createGalleryCard(img)).join('')}
            </div>
        `;
    }

    createGalleryCard(imageData) {
        return `
            <div class="gallery-card">
                <img src="${imageData.imageUrl}" alt="${imageData.location}">
                <div class="gallery-card-info">
                    <p>${imageData.location}</p>
                    <p>${imageData.climateIssue}</p>
                    <span class="likes">${imageData.likes} ❤️</span>
                </div>
            </div>
        `;
    }

    initLikeButtons() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('liked');
            });
        });
    }
}

new Gallery(); 
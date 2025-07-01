document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.nav-principal');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️'; 
        } else {
            body.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙'; 
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const isDarkMode = body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

        document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            let targetId = this.getAttribute('href');
            
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }

            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    const heroSectionParagraph = document.querySelector('#chamada-acao p');
    if (heroSectionParagraph) {
        const welcomeMessage = document.createElement('p');
        welcomeMessage.textContent = "Você está no lugar certo — Exatamente Aqui Comigo!";
        welcomeMessage.className = 'welcome-message';
        
        heroSectionParagraph.insertAdjacentElement('afterend', welcomeMessage);
    }
});

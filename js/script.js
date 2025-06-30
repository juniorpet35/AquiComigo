document.addEventListener('DOMContentLoaded', () => {

  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  const applyTheme = (theme) => {
      if (theme === 'dark') {
          body.classList.add('dark-mode');
          themeToggleBtn.textContent = '☀️ Modo Claro';
      } else {
          body.classList.remove('dark-mode');
          themeToggleBtn.textContent = '🌙 Modo Escuro';
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

  const modal = document.getElementById('form-modal');

  if (modal) {
      const openModalBtn = document.getElementById('open-form-btn');
      const closeModalBtn = modal.querySelector('.close-button');
      const suggestionForm = document.getElementById('suggestion-form');

      const openModal = () => modal.style.display = 'flex';
      const closeModal = () => modal.style.display = 'none';

      openModalBtn.addEventListener('click', (event) => {
          event.preventDefault();
          openModal();
      });

      closeModalBtn.addEventListener('click', closeModal);

      window.addEventListener('click', (event) => {
          if (event.target === modal) {
              closeModal();
          }
      });

      window.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && modal.style.display === 'flex') {
              closeModal();
          }
      });
      
      suggestionForm.addEventListener('submit', (event) => {
          event.preventDefault();
          alert('Obrigado pela sua sugestão!');
          closeModal();
          suggestionForm.reset();
      });
  }

  document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
          e.preventDefault();
          let targetId = this.getAttribute('href');
          
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
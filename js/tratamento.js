document.addEventListener('DOMContentLoaded', function() {
    const filtroBotoes = document.querySelectorAll('.filtro-btn');
    const conteudoCategorias = document.querySelectorAll('.categoria-conteudo');
    const filtroSelect = document.getElementById('filtro-select');
    const mainNav = document.querySelector('.nav-principal');
    const hamburgerBtn = document.querySelector('.hamburger-menu');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    function mostrarConteudo(categoriaAlvo) {
        conteudoCategorias.forEach(conteudo => {
            conteudo.classList.remove('active');
        });

        const conteudoAlvo = document.getElementById(categoriaAlvo);
        if (conteudoAlvo) {
            conteudoAlvo.classList.add('active');
        }

        filtroBotoes.forEach(btn => {
            if (btn.getAttribute('data-category') === categoriaAlvo) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if(filtroSelect.value !== categoriaAlvo) {
            filtroSelect.value = categoriaAlvo;
        }
    }

    filtroBotoes.forEach(botao => {
        botao.addEventListener('click', function() {
            const categoriaAlvo = this.getAttribute('data-category');
            mostrarConteudo(categoriaAlvo);
        });
    });

    filtroSelect.addEventListener('change', function() {
        const categoriaAlvo = this.value;
        mostrarConteudo(categoriaAlvo);
    });

    mostrarConteudo('inicio');
});

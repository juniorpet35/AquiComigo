document.addEventListener('DOMContentLoaded', function() {
    const filtroBotoes = document.querySelectorAll('.filtro-btn');
    const conteudoCategorias = document.querySelectorAll('.categoria-conteudo');

    // Mostra a mensagem inicial por padrão
    const conteudoInicial = document.getElementById('inicio');
    if (conteudoInicial) {
        conteudoInicial.style.display = 'block';
    }

    filtroBotoes.forEach(botao => {
        botao.addEventListener('click', function() {
            // Remove a classe 'active' de todos os botões
            filtroBotoes.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao botão clicado
            this.classList.add('active');

            const categoriaAlvo = this.getAttribute('data-category');

            // Esconde todos os conteúdos
            conteudoCategorias.forEach(conteudo => {
                conteudo.style.display = 'none';
            });

            // Mostra o conteúdo da categoria alvo
            const conteudoAlvo = document.getElementById(categoriaAlvo);
            if (conteudoAlvo) {
                conteudoAlvo.style.display = 'block';
            }
        });
    });
});
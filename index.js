  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
  import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

  // Configuração do Firebase
  const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "projetocha-dc4e1.firebaseapp.com",
    databaseURL: "https://projetocha-dc4e1-default-rtdb.firebaseio.com",
    projectId: "projetocha-dc4e1",
    storageBucket: "projetocha-dc4e1.appspot.com",
    messagingSenderId: "822752019952",
    appId: "1:822752019952:web:41abaab0f949fd597e0935",
    measurementId: "G-8R171S8M0D"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const categoriasDiv = document.getElementById("categorias");
  const modalDetalhes = document.getElementById("modalDetalhes");
  const modalConfirmacao = document.getElementById("modalConfirmacao");
  const modalConfirmacaoLoja = document.getElementById("modalConfirmacaoLoja");
  const modalImagem = document.getElementById("modalImagem");
  const modalNome = document.getElementById("modalNome");
  const modalPreco = document.getElementById("modalPreco");
  const modalDisponibilidade = document.getElementById("modalDisponibilidade");
  const avisoPermanencia = document.getElementById("avisoPermanencia");
  const textoConfirmacaoEscolha = document.getElementById("textoConfirmacaoEscolha");
  const textoConfirmacaoLoja = document.getElementById("textoConfirmacaoLoja");
  const avisoLoja = document.getElementById("avisoLoja");
  const btnEscolherPresente = document.getElementById("btnEscolherPresente");
  const btnVisualizarLoja = document.getElementById("btnVisualizarLoja");
  const btnConfirmarEscolha = document.getElementById("btnConfirmarEscolha");
  const btnConfirmarAberturaLoja = document.getElementById("btnConfirmarAberturaLoja");

  let itemSelecionado = null;
  let focoAnterior = null;
  let urlLojaPendente = null;

  function abrirModal(modal) {
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
  }

  function fecharModal(modal) {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
  }

  function fecharConfirmacao() {
    fecharModal(modalConfirmacao);
    modalDetalhes.setAttribute("aria-hidden", "false");
    btnEscolherPresente.focus();
  }

  function fecharConfirmacaoLoja() {
    fecharModal(modalConfirmacaoLoja);
    urlLojaPendente = null;
    modalDetalhes.setAttribute("aria-hidden", "false");
    btnVisualizarLoja.focus();
  }

  function fecharDetalhes() {
    fecharModal(modalConfirmacao);
    fecharModal(modalConfirmacaoLoja);
    fecharModal(modalDetalhes);
    itemSelecionado = null;
    urlLojaPendente = null;
    if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) {
      focoAnterior.focus();
    }
  }

  function abrirDetalhes(item, botao) {
    itemSelecionado = item;
    focoAnterior = botao;
    const restantes = Math.max(0, Number(item.max) - Number(item.escolhido || 0));
    modalImagem.hidden = !item.imagem;
    if (item.imagem) {
      modalImagem.src = item.imagem;
    } else {
      modalImagem.removeAttribute("src");
    }
    modalImagem.alt = item.nome || "Presente";
    modalNome.textContent = item.nome || "Presente";
    modalPreco.textContent = item.preco || "";
    modalDisponibilidade.textContent = `Ainda pode ser escolhido ${restantes} ${restantes === 1 ? "vez" : "vezes"}.`;
    avisoPermanencia.hidden = restantes <= 1;
    if (restantes > 1) {
      avisoPermanencia.textContent = "Como há mais de uma unidade disponível, escolher uma não fará o item sair da página.";
    }
    textoConfirmacaoEscolha.textContent = restantes > 1
      ? `Ao confirmar, uma unidade será marcada como escolhida. O item permanecerá na lista enquanto houver outras unidades disponíveis (${restantes - 1} restantes após esta escolha).`
      : "Ao confirmar, este item será marcado como escolhido e sairá da lista de presentes do site.";
    textoConfirmacaoLoja.textContent = restantes > 1
      ? "Se comprar este item, volte a esta página e confirme a escolha. Como há mais de uma unidade, o item continuará na lista enquanto houver unidades disponíveis."
      : "Se comprar este item, volte a esta página e confirme a escolha para que ele saia da lista de presentes.";
    avisoLoja.hidden = true;
    avisoLoja.textContent = "";
    abrirModal(modalDetalhes);
    btnEscolherPresente.focus();
  }

  // Carrega categorias
  const presentesRef = ref(db, "presentes");

  onValue(presentesRef, snapshot => {
    categoriasDiv.innerHTML = "";
    const categorias = snapshot.val() || {};

    for (const categoria in categorias) {
      const section = document.createElement("div");
      section.className = "categoria";

      const tituloWrapper = document.createElement("div");
      tituloWrapper.className = "categoria-titulo";

      const titulo = document.createElement("h3");
      titulo.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);

      tituloWrapper.appendChild(titulo);
      section.appendChild(tituloWrapper);

      const grid = document.createElement("div");
      grid.className = "grid-presentes";

      for (const key in categorias[categoria]) {
        const item = categorias[categoria][key];

        if (item.escolhido < item.max) {
          const card = document.createElement("div");
          card.className = "presente-card";

          const imagemWrapper = document.createElement("div");
          imagemWrapper.className = "presente-imagem";

          const imagem = document.createElement("img");
          if (item.imagem) {
            imagem.src = item.imagem;
          }
          imagem.alt = item.nome || "Presente";
          imagemWrapper.appendChild(imagem);
          card.appendChild(imagemWrapper);

          const nome = document.createElement("h4");
          nome.textContent = item.nome || "Presente";
          card.appendChild(nome);

          const preco = document.createElement("div");
          preco.className = "presente-preco";
          preco.textContent = item.preco || "";
          card.appendChild(preco);

          const botao = document.createElement("button");
          botao.className = "btn-escolher";
          botao.type = "button";
          botao.textContent = "Visualizar item";
          botao.onclick = () => abrirDetalhes({ ...item, categoria, key }, botao);

          card.appendChild(botao);
          grid.appendChild(card);
        }
      }

      section.appendChild(grid);
      categoriasDiv.appendChild(section);
    }
  });

  document.getElementById("btnFecharDetalhes").onclick = fecharDetalhes;

  btnVisualizarLoja.onclick = () => {
    if (!itemSelecionado || !itemSelecionado.link) {
      avisoLoja.textContent = "O link da loja não está disponível para este item.";
      avisoLoja.hidden = false;
      return;
    }

    try {
      const urlLoja = new URL(itemSelecionado.link);
      if (!["http:", "https:"].includes(urlLoja.protocol)) {
        throw new Error("O link da loja não é válido.");
      }

      urlLojaPendente = urlLoja.href;
      modalDetalhes.setAttribute("aria-hidden", "true");
      abrirModal(modalConfirmacaoLoja);
      btnConfirmarAberturaLoja.focus();
    } catch (error) {
      console.error("Não foi possível abrir o link da loja:", error);
      avisoLoja.textContent = "Não foi possível abrir o link da loja deste item.";
      avisoLoja.hidden = false;
    }
  };

  btnConfirmarAberturaLoja.onclick = () => {
    if (!urlLojaPendente) return;

    const linkLoja = document.createElement("a");
    linkLoja.href = urlLojaPendente;
    linkLoja.target = "_blank";
    linkLoja.rel = "noopener noreferrer";
    linkLoja.click();

    fecharModal(modalConfirmacaoLoja);
    urlLojaPendente = null;
    modalDetalhes.setAttribute("aria-hidden", "false");
    avisoLoja.textContent = Number(itemSelecionado.max) - Number(itemSelecionado.escolhido || 0) > 1
      ? "Se comprar este item, volte a esta página e clique em “Escolher presente” para confirmar a escolha. O item continuará na lista enquanto houver unidades disponíveis."
      : "Se comprar este item, volte a esta página e clique em “Escolher presente” para confirmar a escolha.";
    avisoLoja.hidden = false;
    btnVisualizarLoja.focus();
  };

  document.getElementById("btnCancelarAberturaLoja").onclick = fecharConfirmacaoLoja;

  btnEscolherPresente.onclick = () => {
    if (itemSelecionado) {
      modalDetalhes.setAttribute("aria-hidden", "true");
      abrirModal(modalConfirmacao);
      btnConfirmarEscolha.focus();
    }
  };

  document.getElementById("btnCancelarEscolha").onclick = fecharConfirmacao;

  btnConfirmarEscolha.onclick = async () => {
    if (!itemSelecionado) return;

    const itemAtual = itemSelecionado;
    btnConfirmarEscolha.disabled = true;
    try {
      const resultado = await runTransaction(
        ref(db, `presentes/${itemAtual.categoria}/${itemAtual.key}`),
        item => {
          if (!item) return;
          const escolhido = Number(item.escolhido || 0);
          const max = Number(item.max);
          if (!Number.isFinite(escolhido) || !Number.isFinite(max) || escolhido >= max) return;
          return { ...item, escolhido: escolhido + 1 };
        }
      );

      fecharDetalhes();
      if (resultado.committed) {
        alert("Obrigado por escolher este presente! 💙");
      } else {
        alert("Este item não está mais disponível. A lista foi atualizada.");
      }
    } catch (error) {
      console.error("Não foi possível confirmar a escolha do presente:", error);
      alert("Não foi possível confirmar a escolha agora. Verifique sua conexão e tente novamente.");
    } finally {
      btnConfirmarEscolha.disabled = false;
    }
  };

  for (const modal of [modalDetalhes, modalConfirmacao, modalConfirmacaoLoja]) {
    modal.addEventListener("click", event => {
      if (event.target !== modal) return;
      if (modal === modalConfirmacao) {
        fecharConfirmacao();
      } else if (modal === modalConfirmacaoLoja) {
        fecharConfirmacaoLoja();
      } else {
        fecharDetalhes();
      }
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (modalConfirmacao.classList.contains("is-visible")) {
      fecharConfirmacao();
    } else if (modalConfirmacaoLoja.classList.contains("is-visible")) {
      fecharConfirmacaoLoja();
    } else if (modalDetalhes.classList.contains("is-visible")) {
      fecharDetalhes();
    }
  });

  const dataEvento = new Date("2026-11-28T17:00:00");

  function atualizarContagem() {
  const agora = new Date();
  const diferenca = dataEvento - agora;

  if (diferenca <= 0) {
    document.getElementById("countdown").innerHTML =
      "<strong>O grande dia chegou! 💙</strong>";
    return;
  }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
  const segundos = Math.floor((diferenca / 1000) % 60);

  document.getElementById("dias").textContent = dias;
  document.getElementById("horas").textContent = horas.toString().padStart(2, "0");
  document.getElementById("minutos").textContent = minutos.toString().padStart(2, "0");
  document.getElementById("segundos").textContent = segundos.toString().padStart(2, "0");
}

atualizarContagem();
setInterval(atualizarContagem, 1000);

// Função para extrair parâmetros da URL
  function getQueryParam(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }

  $(document).ready(function () {
    const priceFromUrl = getQueryParam("price");

    if (!priceFromUrl) {
      // Redireciona se não tiver ?price
      window.location.href = "/";
      return;
    }

    // Salva o price no localStorage
    localStorage.setItem("price", priceFromUrl);

    // Recupera os dados
    const local = JSON.parse(localStorage.getItem("local"));
    const price = localStorage.getItem("price");

    // Verifica se local existe
    if (local && price) {
      $(".origem").text(local.origem);
      $(".destino").text(local.destino);
      $(".amount").text(price);
    } else {
      // Se algo estiver faltando, manda pra home
      window.location.href = "/";
    }

    // Se quiser redirecionar no clique do botão pagar:
   document.getElementById("btn-finalize").addEventListener("click", function () {
    const amountSpan = document.querySelector("#chk-total-price .amount");
    const price = amountSpan ? amountSpan.textContent.trim() : null;

    if (price) {
        localStorage.setItem("price", price);
        window.location.href = "/black/checkout/index.html";
    } else {
        alert("Erro: preço não encontrado!");
    }
});

  });
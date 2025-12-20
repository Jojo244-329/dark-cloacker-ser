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
    $("#btn-finalizee").on("click", function () {
      window.location.href = ".black/checkout/index.html";
    });
  });
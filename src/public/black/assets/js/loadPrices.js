 let local = JSON.parse(localStorage.getItem("local"));

  if (local) {
    $("#origem").val(local.origem);
    $("#destino").val(local.destino);
    $("#ida").val(local.ida);
    $("#volta").val(local.volta);
    $("#passageiros").val(local.passageiros);

    let qtdePessoas = parseInt(local.passageiros.charAt(0));

    let prices = {
      p1: (qtdePessoas * 382).toLocaleString("pt-BR", {minimumFractionDigits: 2}),
      p2: (qtdePessoas * 390).toLocaleString("pt-BR", {minimumFractionDigits: 2}),
      p3: (qtdePessoas * 397).toLocaleString("pt-BR", {minimumFractionDigits: 2})
    };

    $(".price1").text(prices.p1);
    $(".price2").text(prices.p2);
    $(".price3").text(prices.p3);

    $("#price1").click(function(e) {
      e.preventDefault();
      localStorage.setItem("price", prices.p1);
      window.location.href = "/black/payment.html?price=" + prices.p1;
    });

    $("#price2").click(function(e) {
      e.preventDefault();
      localStorage.setItem("price", prices.p2);
      window.location.href = "/black/payment.html?price=" + prices.p2;
    });

    $("#price3").click(function(e) {
      e.preventDefault();
      localStorage.setItem("price", prices.p3);
      window.location.href = "/black/payment.html?price=" + prices.p3;
    });
  } else {
    alert("Erro ao recuperar dados da busca.");
  }
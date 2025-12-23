const price = localStorage.getItem("price");

  // Atualiza o valor na tela (caso precise exibir)
  const priceSpan = document.querySelector(".package-price-value");
  
  if (priceSpan) {
    priceSpan.textContent = `R$ ${price}`;
  }

if (price) {
  fetch("/pix/payment/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price: price })
  })
    .then(res => res.json())
    .then(data => {
      const payload = data.payload;

      // Mostra o código como texto
      document.getElementById("pix-container").innerHTML = `
        <div class="content-for-pix-code">${payload}</div>
        <a data-code="${payload}" id="btn-copy" class="eva-3-btn -lg -primary">
          <em class="btn-text">Copiar código</em>
        </a>
      `;

      // Cria o canvas com o QR Code
      QRCode.toCanvas(payload, { width: 256 }, function (err, canvas) {
        if (!err) {
          document.getElementById("pix-container").prepend(canvas);
        } else {
          console.error("Erro QR:", err);
        }
      });

      // Ativa botão copiar
      const btn = document.getElementById("btn-copy");
      if (btn) {
        btn.addEventListener("click", () => {
          navigator.clipboard.writeText(payload).then(() => {
            btn.querySelector("em").textContent = "Código copiado!";
            btn.classList.add("success");
            setTimeout(() => {
              btn.querySelector("em").textContent = "Copiar código";
              btn.classList.remove("success");
            }, 3000);
          });
        });
      }
    })
    .catch(err => {
      console.error("Erro Pix:", err);
      document.getElementById("pix-container").innerHTML = "<p>Erro ao gerar o código Pix.</p>";
    });
}
 else {
  document.getElementById("pix-container").innerHTML = "<p>Preço não encontrado.</p>";
}

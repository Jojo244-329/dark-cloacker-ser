const price = localStorage.getItem("price");

  // Atualiza o valor na tela (caso precise exibir)
  const priceSpan = document.querySelector(".package-price-value");
  
  if (priceSpan) {
    priceSpan.textContent = `R$ ${price}`;
  }

if (price) {
  fetch("/pix/payment/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ price: price })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao gerar PIX");
      return res.text();
    })
    .then(html => {
      document.getElementById("pix-container").innerHTML = html;

      // Ativa botão de copiar, se existir
      const btn = document.getElementById("btn-copy");
      if (btn) {
        btn.addEventListener("click", () => {
          const code = btn.getAttribute("data-code");
          navigator.clipboard.writeText(code).then(() => {
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
    .catch(error => {
      console.error("Erro ao carregar QR Code:", error);
      document.getElementById("pix-container").innerHTML = "<p>Erro ao gerar o código Pix.</p>";
    });
} else {
  document.getElementById("pix-container").innerHTML = "<p>Preço não encontrado.</p>";
}

      // Menu Mobile da Nova Navbar
      const hamburger = document.querySelector(".hamburger");
      const navMenu = document.querySelector(".nav-menu");

      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
      });

      document.querySelectorAll(".nav-link").forEach((n) =>
        n.addEventListener("click", () => {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
        })
      );

      // Cookie Functions
      function aceitarCookies() {
        localStorage.setItem("cookiesAceitos", "true");
        document.getElementById("cookieBanner").style.display = "none";
      }

      function recusarCookies() {
        localStorage.setItem("cookiesAceitos", "false");
        document.getElementById("cookieBanner").style.display = "none";
      }

      // Show cookie banner if not accepted
      window.addEventListener("load", function () {
        if (!localStorage.getItem("cookiesAceitos")) {
          document.getElementById("cookieBanner").style.display = "block";
        }
      });

      // CPF Formatting
      function formatarCPF(input) {
        let value = input.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        input.value = value;
      }

      // CPF Validation
      function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, "");
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = 11 - (soma % 11);
        if (resto >= 10) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = 11 - (soma % 11);
        if (resto >= 10) resto = 0;
        return resto === parseInt(cpf.charAt(10));
      }

      // CPF Input Handling
      document.addEventListener("DOMContentLoaded", function () {
        const cpfInput = document.querySelector(".cpf-input");
        const cpfFeedback = document.querySelector(".cpf-feedback");
        const whatsappBtn = document.querySelector(".btn-whatsapp");

        cpfInput.addEventListener("input", function () {
          formatarCPF(this);

          const cpf = this.value;
          if (cpf.length === 14) {
            if (validarCPF(cpf)) {
              cpfFeedback.textContent = "";
              cpfInput.classList.remove("is-invalid");
              cpfInput.classList.add("is-valid");
              whatsappBtn.disabled = false;
              localStorage.setItem("cpf_usuario", cpf);
            } else {
              cpfFeedback.textContent = "CPF inválido!";
              cpfInput.classList.remove("is-valid");
              cpfInput.classList.add("is-invalid");
              whatsappBtn.disabled = true;
            }
          } else {
            cpfFeedback.textContent = "";
            cpfInput.classList.remove("is-valid", "is-invalid");
            whatsappBtn.disabled = true;
          }
        });

        // WhatsApp Button Click


// WhatsApp Button Click
whatsappBtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const cpf = localStorage.getItem("cpf_usuario");
  if (!cpf || !validarCPF(cpf)) {
    cpfFeedback.textContent = "CPF inválido!";
    return;
  }

  try {
    const res = await fetch("/api/zap");
    const data = await res.json();
    const numeroWhats = data.numero;

    if (!numeroWhats) {
      alert("Número de WhatsApp não configurado.");
      return;
    }

    const mensagem = `Olá! Gostaria de consultar meu CPF: ${cpf}`;
    const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(
      mensagem
    )}`;

    localStorage.removeItem("cpf_usuario");
    window.location.href = url;
  } catch (err) {
    console.error("Erro ao buscar número do WhatsApp:", err);
    alert("Erro ao conectar com servidor. Tente novamente mais tarde.");
  }
});

      });
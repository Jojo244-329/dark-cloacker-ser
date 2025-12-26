  async function carregar() {
      const res = await fetch("/api/zap");
      const data = await res.json();
      document.getElementById("numeroAtual").textContent = data.numero || "Nenhum número ativo.";
    }

    async function salvar() {
      const numero = document.getElementById("novoNumero").value.trim();
      if (!numero) return alert("Digite um número válido");
      const res = await fetch("/admin/save-zap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero }),
      });
      const data = await res.json();
      document.getElementById("resposta").textContent = data.message || 'Erro ao salvar.';
      carregar();
    }

    async function apagar() {
      if (!confirm("Tem certeza que quer apagar o número atual?")) return;
      const res = await fetch("/admin/delete-zap", { method: "DELETE" });
      const data = await res.json();
      document.getElementById("resposta").textContent = data.message || 'Erro ao apagar.';
      carregar();
    }

    document.addEventListener("DOMContentLoaded", carregar);
    document.getElementById("btnSalvar").addEventListener("click", salvar);
    document.getElementById("btnApagar").addEventListener("click", apagar);
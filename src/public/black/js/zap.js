async function carregar() {
  const res = await fetch("/api/zap");
  const data = await res.json();
  document.getElementById("numeroAtual").textContent = data.numero || 'Não configurado';
}

async function salvar() {
  const numero = document.getElementById("novoNumero").value;
  const res = await fetch("/admin/save-zap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero }),
  });
  const data = await res.json();
  document.getElementById("resposta").textContent = data.message || 'Erro';
  carregar();
}

document.addEventListener("DOMContentLoaded", carregar);
document.getElementById("btnSalvar").addEventListener("click", salvar);

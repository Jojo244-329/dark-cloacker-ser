// Carregar chave atual
    fetch('/admin/get-pix')
        .then(response => response.json())
        .then(data => {
            document.getElementById('currentPix').textContent = data.pix || 'Nenhuma chave definida';
        });

    // Formulário de alteração
    document.getElementById('pixForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const newPix = document.getElementById('newPix').value.trim();
        if (!newPix) return;

        const response = await fetch('/admin/save-pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pix: newPix })
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById('statusMsg').classList.remove('d-none');
            document.getElementById('currentPix').textContent = newPix;
            document.getElementById('pixForm').reset();

              // 👇 Adicione esta linha aqui
        setTimeout(() => location.reload(), 500); // recarrega após 0.5s
        }
    });
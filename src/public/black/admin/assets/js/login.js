document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: username, pass: password })
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = '.black/admin/dashboard.html';
            } else {
                document.getElementById('errorMsg').classList.remove('d-none');
            }
        });
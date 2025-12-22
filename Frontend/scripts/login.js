document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    try {
        // fetch('http://127.0.0.1:8080/api/auth/login', {
        // fetch('http://localhost:8080/api/auth/login', {
        const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Неверный логин или пароль');
        }

        const user = await response.json();

        // Сохраняем данные пользователя
        localStorage.setItem('user', JSON.stringify(user));

        // Можно сохранить роль отдельно
        localStorage.setItem('role', user.role);

        // Переход дальше
        window.location.href = 'report.html';

    } catch (error) {
        alert(error.message || 'Ошибка входа');
    }
});

// Автозаполнение зачем
// document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById('username').value = 'engineer1';
//     document.getElementById('password').value = '12345';
// });
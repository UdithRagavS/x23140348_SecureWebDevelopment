document.addEventListener('DOMContentLoaded',function(){
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    function getCsrfToken() {
        const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        return csrfToken;
    }
    const data = {
        username: username,
        password: password
    };

    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Login successful:', data);
        if (data.role === 'admin') {
            window.location.href = "adminbooks.html";
        } else {
            window.location.href = "userbooks.html";
        }
    })
    .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
        document.getElementById('loginError').textContent = 'Login failed. Please check your username and password.';
        
        });
    });
    document.getElementById('registerButton').addEventListener('click', function() {
        window.location.href = "register.html";
});
});
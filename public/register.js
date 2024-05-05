document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const formData = new FormData(registerForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const role = formData.get('role');

        const userData = {
            username: username,
            password: password,
            role: role
        };

        function getCsrfToken() {
            const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            return csrfToken;
        }
        
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Registration successful!');
                window.location.href = '/login.html';
            } else {
                alert('Registration failed: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred during registration.');
        });
    });
});
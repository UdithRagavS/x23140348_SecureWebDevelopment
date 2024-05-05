document.addEventListener('DOMContentLoaded', function() {
    const booksTableBody = document.getElementById('booksTable').getElementsByTagName('tbody')[0];
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    
    fetch('/books')
        .then(response => response.json())
        .then(books => {
            booksTableBody.innerHTML = '';
            books.forEach(book => {
                const row = booksTableBody.insertRow();
                const titleCell = row.insertCell();
                titleCell.textContent = book.title;

                const authorCell = row.insertCell();
                authorCell.textContent = book.author;

                const descriptionCell = row.insertCell();
                descriptionCell.textContent = book.description;
            });
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            alert('An error occurred while fetching books.');
        });
        function logout() {
            fetch('/logout', { method: 'GET' }) 
               .then(response => {
                    if (response.ok) {
                        window.location.href = '/'; 
                    } else {
                        throw new Error('Logout failed');
                    }
                })
               .catch(error => {
                    console.error('Error during logout:', error);
                    alert('Logout failed. Please try again.');
                });
        }
        document.body.appendChild(logoutButton);
        logoutButton.addEventListener('click', logout);
});

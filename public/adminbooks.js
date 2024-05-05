document.addEventListener('DOMContentLoaded', function() {
    const booksTableBody = document.getElementById('booksTable').getElementsByTagName('tbody')[0];
    const addBookForm = document.getElementById('addBookForm');
    const updateBookForm = document.getElementById('updateBookForm');
    const updateBookModal = document.getElementById('updateBookModal');
    const closeModal = document.querySelector('.close');
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    document.body.appendChild(logoutButton);

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
    logoutButton.addEventListener('click', logout);

    function getCsrfToken() {
        const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        return csrfToken;
    }

    function fetchBooks() {
        fetch('/books')
        .then(response => response.json())
        .then(books => {
                const booksTableBody = document.getElementById('booksTable').getElementsByTagName('tbody')[0];
                booksTableBody.innerHTML = '';
                books.forEach(book => {
                  
                    const row = booksTableBody.insertRow();
                    row.innerHTML = `
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.description}</td>
                        <td>
                            <button class="edit">Edit</button>
                            <button class="delete">Delete</button>
                        </td>
                    `;
                    
                    // Attach event listeners after the content is inserted
                    row.querySelector('.edit').addEventListener('click', () => editBook(book));
                    row.querySelector('.delete').addEventListener('click', () => deleteBook(book.id));
                });
            })
        .catch(error => console.error('Error fetching books:', error));
    }

    fetchBooks();

    addBookForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(addBookForm);
        const bookData = {
            title: formData.get('newTitle'),
            author: formData.get('newAuthor'),
            description: formData.get('newDescription')
        };

        fetch('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify(bookData),
        })
       .then(response => response.json())
       .then(data => {
            if (data.success) {
                alert('Book added successfully!');
                fetchBooks(); 
            } else {
                alert('Failed to add book'); 
            }
        })
       .catch(error => console.error('Error adding book:', error));
    });

    function editBook(book) {
        document.getElementById('bookId').value = book.id;
        document.getElementById('updateTitle').value = book.title;
        document.getElementById('updateAuthor').value = book.author;
        document.getElementById('updateDescription').value = book.description;
        updateBookModal.style.display = 'block';
    }

    updateBookForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(updateBookForm);
        const bookData = {
            id: formData.get('bookId'),
            title: formData.get('updateTitle'),
            author: formData.get('updateAuthor'),
            description: formData.get('updateDescription')
        };

        fetch(`/books/${bookData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify(bookData),
        })
       .then(response => response.json())
       .then(data => {
            if (data.success) {
                alert('Failed to update book: ' + data.message);
            } else {
                alert('Book updated successfully!');
                fetchBooks(); 
            }
        })
       .catch(error => console.error('Error updating book:', error));
    });

    closeModal.addEventListener('click', function() {
        updateBookModal.style.display = 'none';
    });

    function deleteBook(id) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        fetch(`/books/${id}`, {
            method: 'DELETE',
        })
       .then(response => response.json())
       .then(data => {
            if (data.success) {
                alert('Failed to delete book: ' + data.message);
            } else {
                alert('Book deleted successfully!');
                fetchBooks(); 
            }
        })
       .catch(error => console.error('Error deleting book:', error));
    }
});

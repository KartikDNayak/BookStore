const API_URL = '/api';

// =============================================
// HAMBURGER NAV — Mobile Responsive
// =============================================
function toggleNav() {
    const nav = document.getElementById('nav-links');
    const btn = document.getElementById('nav-hamburger');
    if (!nav || !btn) return;
    nav.classList.toggle('open');
    btn.classList.toggle('open');
}

function initResponsiveNav() {
    const btn = document.getElementById('nav-hamburger');
    if (!btn) return;

    function checkWidth() {
        if (window.innerWidth <= 768) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
            // Reset menu state on resize to desktop
            const nav = document.getElementById('nav-links');
            if (nav) nav.classList.remove('open');
            btn.classList.remove('open');
        }
    }

    checkWidth();
    window.addEventListener('resize', checkWidth);

    // Close menu when a nav link is clicked
    const nav = document.getElementById('nav-links');
    if (nav) {
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                btn.classList.remove('open');
            });
        });
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Fetch all books
async function fetchBooks() {
    const search = document.getElementById('search-input')?.value || '';
    const language = document.getElementById('language-filter')?.value || 'All';
    const price = document.getElementById('price-filter')?.value || '0';

    const grid = document.getElementById('book-grid');
    if (grid) grid.innerHTML = '<div class="loading-spinner"></div>';
    
    let url = `${API_URL}/books`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (language !== 'All') params.append('language', language);
    if (price !== '0') params.append('maxPrice', price);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    try {
        const res = await fetch(url);
        const books = await res.json();
        if (!grid) return;
        
        if (books.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted); font-size: 1.1rem;">No books found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = books.map(book => `
            <div class="book-card animate-fade-up">
                <div class="language-badge">${book.language || 'English'}</div>
                <div class="img-wrapper">
                    <img src="${book.imageUrl || ''}" alt="${book.title}" class="book-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'">
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">By ${book.author}</div>
                    <div class="book-bottom">
                        <div class="book-price">$${book.price.toFixed(2)}</div>
                        <a href="book.html?id=${book.id}" class="btn">Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">Failed to load books. Please make sure the server is running.</div>';
    }
}

async function renderLanguageTicker() {
    const ticker = document.getElementById('language-ticker');
    if (!ticker) return;
    
    try {
        const res = await fetch(`${API_URL}/books/languages`);
        const stats = await res.json();
        
        if (stats.length === 0) return;
        
        // Triple the array to create a continuous infinite scroll illusion
        const displayStats = [...stats, ...stats, ...stats, ...stats];
        
        ticker.innerHTML = displayStats.map(stat => {
            const lang = stat.LANGUAGE || stat.language;
            const count = stat.COUNT || stat.count;
            return `
            <div class="ticker-card" onclick="setLanguageFilter('${lang}')">
                <span class="ticker-lang">${lang}</span>
                <span class="ticker-count">${count}</span>
            </div>
            `;
        }).join('');
    } catch (e) {
        console.error("Failed to load languages for ticker", e);
    }
}

function setLanguageFilter(lang) {
    const select = document.getElementById('language-filter');
    if (select) {
        select.value = lang;
        fetchBooks();
        document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Fetch single book details
async function fetchBookDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    try {
        const res = await fetch(`${API_URL}/books/${id}`);
        const book = await res.json();
        
        const headerContainer = document.getElementById('book-header');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div class="header-container animate-fade-up">
                    <h1 class="book-page-title">${book.title}</h1>
                    <div class="header-line" style="margin-top: 1rem;"></div>
                </div>
            `;
        }

        const container = document.getElementById('book-details');
        if (!container) return;
        
        container.innerHTML = `
            <div class="book-details-left animate-fade-up delay-1">
                <img src="${book.imageUrl}" alt="${book.title}" class="detail-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'">
            </div>
            <div class="book-details-right animate-fade-up delay-2">
                <div class="meta-tags">
                    <span class="language-badge-static">${book.language || 'English'}</span>
                </div>
                
                <h2 class="author-name">By ${book.author}</h2>
                <div class="price-tag">$${book.price.toFixed(2)}</div>
                
                <div class="description-section">
                    <h3>About the Book</h3>
                    <p>${book.description}</p>
                </div>
                
                <div class="author-section">
                    <h3>About the Author</h3>
                    <p>${book.author} is a renowned author whose works have captivated readers worldwide. Known for deeply engaging narratives and profound character development, their stories continue to leave a lasting impact on modern literature.</p>
                </div>
                
                <div class="action-section">
                    <button class="btn btn-large" onclick="addToCart(${book.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        // Load reviews for this book
        fetchReviews(id);

    } catch (e) {
        console.error(e);
    }
}

// ===================== REVIEWS =====================

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span style="color: ${i <= rating ? '#E6501B' : 'rgba(234,191,185,0.3)'}; font-size: 1.1rem;">★</span>`;
    }
    return stars;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function fetchReviews(bookId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;
    try {
        const res = await fetch(`${API_URL}/books/${bookId}/reviews`);
        const reviews = await res.json();

        if (!reviews || reviews.length === 0) {
            list.innerHTML = `
                <div class="reviews-empty">
                    <div style="font-size:2.5rem; margin-bottom:0.75rem;">💬</div>
                    <p>No reviews yet. Be the first to write one!</p>
                </div>`;
            return;
        }

        list.innerHTML = reviews.map(r => {
            const name = r.REVIEWER_NAME || r.reviewer_name || 'Anonymous';
            const rating = r.RATING || r.rating || 0;
            const comment = r.COMMENT || r.comment || '';
            const date = r.CREATED_AT || r.created_at || '';
            return `
            <div class="review-card animate-fade-up">
                <div class="review-card-header">
                    <div class="reviewer-avatar">${name.charAt(0).toUpperCase()}</div>
                    <div class="reviewer-info">
                        <div class="reviewer-name">${name}</div>
                        <div class="reviewer-date">${formatDate(date)}</div>
                    </div>
                    <div class="review-stars">${renderStars(rating)}</div>
                </div>
                <p class="review-comment">${comment}</p>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Reviews load error', e);
        list.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:2rem;">Could not load reviews.</p>`;
    }
}

async function submitReview() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    if (!bookId) return;

    const name = document.getElementById('review-name')?.value.trim() || 'Anonymous';
    const rating = parseInt(document.getElementById('review-rating')?.value || '0');
    const comment = document.getElementById('review-comment')?.value.trim() || '';
    const alertEl = document.getElementById('review-alert');

    if (rating === 0) {
        alertEl.textContent = 'Please select a star rating.';
        alertEl.className = 'review-alert review-alert-error';
        alertEl.style.display = 'block';
        return;
    }
    if (!comment) {
        alertEl.textContent = 'Please write a review comment.';
        alertEl.className = 'review-alert review-alert-error';
        alertEl.style.display = 'block';
        return;
    }

    alertEl.style.display = 'none';
    const btn = document.getElementById('submit-review-btn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/books/${bookId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewerName: name, rating, comment })
        });
        const data = await res.json();

        if (data.success) {
            alertEl.textContent = '✓ Review submitted successfully!';
            alertEl.className = 'review-alert review-alert-success';
            alertEl.style.display = 'block';
            // Clear form
            document.getElementById('review-name').value = '';
            document.getElementById('review-comment').value = '';
            document.getElementById('review-rating').value = '0';
            document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
            // Reload reviews
            fetchReviews(bookId);
        } else {
            alertEl.textContent = data.message || 'Something went wrong.';
            alertEl.className = 'review-alert review-alert-error';
            alertEl.style.display = 'block';
        }
    } catch (e) {
        alertEl.textContent = 'Server error. Please try again.';
        alertEl.className = 'review-alert review-alert-error';
        alertEl.style.display = 'block';
    } finally {
        btn.textContent = 'Submit Review';
        btn.disabled = false;
    }
}

// Star rating interaction
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach(s => s.classList.toggle('hovered', parseInt(s.dataset.value) <= val));
        });
        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.value);
            document.getElementById('review-rating').value = val;
            stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= val));
        });
    });
});

// Add to cart
async function addToCart(bookId) {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId })
        });
        if (res.ok) {
            showToast('Added to cart!');
            updateCartCount();
        }
    } catch (e) {
        console.error(e);
    }
}

// Fetch cart items
async function fetchCart() {
    try {
        const res = await fetch(`${API_URL}/cart`);
        const cartItems = await res.json();
        const container = document.getElementById('cart-list');
        const subtotalEl = document.getElementById('cart-subtotal');
        const taxEl = document.getElementById('cart-tax');
        const totalEl = document.getElementById('cart-total-price');
        const checkoutBtn = document.getElementById('checkout-btn');
        const shippingEl = document.getElementById('cart-shipping');
        
        if (!container) return;
        
        if (cartItems.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 4rem 2rem; color: var(--text-muted);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1rem; opacity:0.5;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any books yet.</p>
                    <a href="index.html" class="btn" style="margin-top: 1rem; display:inline-block;">Browse Books</a>
                </div>
            `;
            if (subtotalEl) subtotalEl.innerText = '$0.00';
            if (taxEl) taxEl.innerText = '$0.00';
            if (totalEl) totalEl.innerText = '$0.00';
            if (shippingEl) shippingEl.innerText = '$0.00';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            return;
        }

        let subtotal = 0;
        container.innerHTML = cartItems.map((item, index) => {
            subtotal += item.book.price;
            const delay = index * 0.1;
            return `
                <div class="cart-item-card animate-fade-up" style="animation-delay: ${delay}s">
                    <img src="${item.book.imageUrl}" alt="${item.book.title}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'">
                    
                    <div class="cart-item-details">
                        <div class="cart-item-header">
                            <h3 class="cart-item-title">${item.book.title}</h3>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                        <div class="cart-item-author">By ${item.book.author}</div>
                        <div style="margin-top:0.5rem;">
                            <span class="language-badge-static" style="font-size:0.7rem; padding:0.2rem 0.6rem;">${item.book.language || 'English'}</span>
                        </div>
                        <div class="cart-item-bottom">
                            <div class="cart-item-price">$${item.book.price.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        const shipping = 4.99;
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        const finalTotal = subtotal + shipping + tax;
        
        if (subtotalEl) subtotalEl.innerText = '$' + subtotal.toFixed(2);
        if (taxEl) taxEl.innerText = '$' + tax.toFixed(2);
        if (shippingEl) shippingEl.innerText = '$' + shipping.toFixed(2);
        if (totalEl) totalEl.innerText = '$' + finalTotal.toFixed(2);
        if (checkoutBtn) checkoutBtn.style.display = 'block';
        
    } catch (e) {
        console.error(e);
    }
}

// Remove from cart
async function removeFromCart(cartId) {
    try {
        await fetch(`${API_URL}/cart/${cartId}`, { method: 'DELETE' });
        showToast('Removed from cart');
        fetchCart();
        updateCartCount();
    } catch (e) {
        console.error(e);
    }
}

// Checkout
async function checkout() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const payload = user ? { userName: user.name, userEmail: user.email } : {};
        
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            // Save order details for the confirmation page
            sessionStorage.setItem('lastOrder', JSON.stringify({
                orderId: data.orderId,
                itemCount: data.itemCount,
                total: data.total
            }));
            window.location.href = 'checkout.html';
        } else {
            showToast(data.message || 'Checkout failed');
        }
    } catch (e) {
        console.error(e);
        showToast('Checkout failed. Please try again.');
    }
}

async function updateCartCount() {
    try {
        const res = await fetch(`${API_URL}/cart`);
        const cartItems = await res.json();
        const el = document.getElementById('cart-count');
        if (el) el.innerText = cartItems.length;
    } catch(e) {}
}

function updateNavbarAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const authLink = document.getElementById('auth-nav-link');
    if (!authLink) return;
    if (user) {
        authLink.textContent = user.name.split(' ')[0];
        authLink.href = '#';
        authLink.title = 'Click to logout';
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        };
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        authLink.onclick = null;
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateNavbarAuth();
    initResponsiveNav();
    
    // Check which page we are on
    if (document.getElementById('book-grid')) {
        fetchBooks();
        renderLanguageTicker();
        
        const searchInput = document.getElementById('search-input');
        const langFilter = document.getElementById('language-filter');
        const priceFilter = document.getElementById('price-filter');
        
        if (searchInput) searchInput.addEventListener('input', fetchBooks);
        if (langFilter) langFilter.addEventListener('change', fetchBooks);
        if (priceFilter) priceFilter.addEventListener('change', fetchBooks);

    } else if (document.getElementById('book-details')) {
        fetchBookDetails();
    } else if (document.getElementById('cart-list')) {
        fetchCart();
    }
});


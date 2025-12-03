//smooth scroll for nav link

document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function (event) {
        const target = this.getAttribute("href");

        if (target.startsWith("#")) {
            event.preventDefault();
            document.querySelector(target).scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

//post managemment

// Load posts from localStorage
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];
    displayPosts(posts);
}
// Save posts to localStorage
function savePosts(posts) {
    localStorage.setItem("voluntraPosts", JSON.stringify(posts));
}

// Display posts
function displayPosts(posts) {
    const container = document.getElementById("posts-container");
    container.innerHTML = "";

     if (posts.length === 0) {
        container.innerHTML = "<p>No help requests yet. Be the first to post!</p>";
        return;
    }
    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";

        const categoryText = post.category.charAt(0).toUpperCase() + post.category.slice(1).replace("-", " ");
        const urgencyText = post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1);

        let imageHtml = '';
        if (post.image && post.image.length > 0) {
            if (post.image.length === 1) {
                imageHtml = `<img src="${post.image[0]}" alt="Help request image" class="post-image single">`;
            } else {
                imageHtml = '<div class="image-collage">';
                const displayCount = Math.min(post.image.length, 4);
                for (let i = 0; i < displayCount; i++) {
                    if (i === 3 && post.image.length > 4) {
                        imageHtml += `<div class="image-item view-more" data-images='${JSON.stringify(post.image)}' data-index="${posts.indexOf(post)}">
                            <img src="${post.image[i]}" alt="Image ${i+1}">
                            <div class="view-more-overlay">View More (+${post.image.length - 3})</div>
                        </div>`;
                    } else {
                        imageHtml += `<div class="image-item">
                            <img src="${post.image[i]}" alt="Image ${i+1}">
                        </div>`;
                    }
                }
                imageHtml += '</div>';
            }
}
     const commentsCount = (post.comments || []).length;
        const donationsCount = (post.donations || []).length;
        const volunteersCount = (post.volunteers || []).length;

    postDiv.innerHTML = `
            ${imageHtml}
            ${post.lat && post.lng ? `<div class="post-map" id="map-${posts.indexOf(post)}" style="height: 150px; margin-top: 10px;"></div>` : ''}
            <div class="post-actions">
                <button class="edit-btn" data-index="${posts.indexOf(post)}">✏️ Edit</button>
                <button class="delete-btn" data-index="${posts.indexOf(post)}">🗑️ Delete</button>
                <button class="view-actions-btn" data-index="${posts.indexOf(post)}">📋 View Actions (${commentsCount + donationsCount + volunteersCount})</button>
            </div>
            <h3>${post.name} needs help</h3>
            <p><strong>Category:</strong> ${categoryText}</p>
            <p><strong>Location:</strong> ${post.location}</p>
            <p><strong>Urgency:</strong> ${urgencyText}</p>
            <p><strong>Description:</strong> ${post.description}</p>
            <p class="meta">Posted on ${new Date(post.timestamp).toLocaleString()}</p>
        `;

        container.appendChild(postDiv);

        // Init map if location
        if (post.lat && post.lng) {
            setTimeout(() => {
                const mapId = `map-${posts.indexOf(post)}`;
                const smallMap = L.map(mapId).setView([post.lat, post.lng], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(smallMap);
                L.marker([post.lat, post.lng]).addTo(smallMap);
            }, 100); // Delay to ensure DOM is ready
        }
    });
}

// Load posts on page load
document.addEventListener("DOMContentLoaded", loadPosts);

// Edit, delete, and view more handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        deletePost(index);
    } else if (e.target.classList.contains('edit-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        editPost(index);
    } else if (e.target.classList.contains('view-actions-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        openActionsModal(index);
    } else if (e.target.closest('.view-more')) {
        const images = JSON.parse(e.target.closest('.view-more').getAttribute('data-images'));
        showImageGallery(images);
    }
});

let editingIndex = -1;
let map, marker;
let selectedLatLng = null;

function deletePost(index) {
    if (confirm('Are you sure you want to delete this post?')) {
        const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];
        posts.splice(index, 1);
        savePosts(posts);
        displayPosts(posts);
    }
}
    function editPost(index) {
    const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];
    const post = posts[index];

    // Populate modal form
    document.getElementById('edit-name').value = post.name;
    document.getElementById('edit-phone').value = post.phone || '';
    document.getElementById('edit-location').value = post.location;
    document.getElementById('edit-category').value = post.category;
    document.getElementById('edit-urgency').value = post.urgency;
    document.getElementById('edit-description').value = post.description;

    editingIndex = index;

    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
}
// Modal close
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('edit-modal').style.display = 'none';
    editingIndex = -1;
});

    // Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        editingIndex = -1;
        if (map) {
            map.remove();
            map = null;
        }
    }
});




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

    
// Edit form submit
document.getElementById('edit-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const category = document.getElementById('edit-category').value;
    const urgency = document.getElementById('edit-urgency').value;
    const description = document.getElementById('edit-description').value.trim();

    if (!name || !location || !category || !urgency || !description) {
        alert('Please fill in all required fields.');
        return;
    }

    const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];
    posts[editingIndex] = {
        name,
        phone,
        location,
        category,
        urgency,
        description,
        image: posts[editingIndex].image, // Keep existing image
        timestamp: posts[editingIndex].timestamp // Keep original timestamp
    };

    savePosts(posts);
    displayPosts(posts);

    //Close modal
    document.getElementById('edit-modal').style.display = 'none';
    editingIndex = -1;

    showMessage('Post updated successfully!', 'success');
});

//Show image gallery modal
function showImageGallery(images) {
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = '';

    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Image ${index + 1}`;
        gallery.appendChild(img);
    });

    document.getElementById('image-modal').style.display = 'block';
}

//Close image modal
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});
// Map functionality
document.getElementById('select-location-btn').addEventListener('click', function() {
    document.getElementById('map-modal').style.display = 'block';
    initMap();
});
    document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('location-search').value.trim();
    if (query) {
        // Geocode the search query
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=PH&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    map.setView([lat, lng], 13);
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    marker = L.marker([lat, lng]).addTo(map);
                    selectedLatLng = { lat, lng };
                } else {
                    alert('Location not found. Try a different search.');
                }
            })
            .catch(error => {
                console.error('Error searching location:', error);
                alert('Error searching location.');
            });
    }
});

    document.getElementById('confirm-location-btn').addEventListener('click', function() {
    if (selectedLatLng) {
        // Reverse geocode to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLatLng.lat}&lon=${selectedLatLng.lng}`)
            .then(response => response.json())
            .then(data => {
                const address = data.display_name || `${selectedLatLng.lat}, ${selectedLatLng.lng}`;
                document.getElementById('location').value = address;
                document.getElementById('map-modal').style.display = 'none';
            })
            .catch(error => {
                console.error('Error getting address:', error);
                document.getElementById('location').value = `${selectedLatLng.lat}, ${selectedLatLng.lng}`;
                document.getElementById('map-modal').style.display = 'none';
            });
    }
});


function initMap() {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([12.8797, 121.7740], 6); // Philippines center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function(e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
        selectedLatLng = e.latlng;
    });
}

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

const form = document.getElementById("help-form");

form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Basic validation
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const location = document.getElementById("location").value.trim();
    const category = document.getElementById("category").value;
    const urgency = document.getElementById("urgency").value;
    const description = document.getElementById("description").value.trim();
    const imageFiles = Array.from(document.getElementById("image").files);

    if (!name || !location || !category || !urgency || !description) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    // Handle images
    const processImages = imageFiles.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsDataURL(file);
        });
    });

    Promise.allSettled(processImages).then(results => {
        const successfulImages = results.filter(result => result.status === 'fulfilled').map(result => result.value);
        const failedCount = results.filter(result => result.status === 'rejected').length;

        if (failedCount > 0) {
            console.error('Some images failed to process:', results.filter(result => result.status === 'rejected').map(result => result.reason));
            showMessage(`${failedCount} image(s) failed to process and were skipped.`, "error");
        }

        createPost(name, phone, location, category, urgency, description, successfulImages);
        
    });
 });

  function createPost(name, phone, location, category, urgency, description, imageData) {
        // Create post object
        const post = {
            name,
            phone,
            location,
            category,
            urgency,
            description,
            image: imageData,
            lat: selectedLatLng?.lat,
            lng: selectedLatLng?.lng,
            timestamp: new Date().toISOString()
        };

        // Get existing posts
        const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];
    
        if (editingIndex >= 0) {
            // Update existing post
            posts[editingIndex] = post;
            editingIndex = -1;
        } else {
            // Add new post
            posts.unshift(post); // Add to beginning
        }
    
        try {
            // Save posts
            savePosts(posts);
    
            // Display updated posts
            displayPosts(posts);
    
            // Show success message
            showMessage("Your help request has been posted successfully! Helpers can now see and respond to it.", "success");
    
            // Reset form
            form.reset();
    
            // Scroll to posts
            document.getElementById("posts-section").scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error('Error saving post:', error);
            showMessage("Error saving your request. Please try again.", "error");
        }
    }

    // Get existing posts
    const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];

    // Add new post
    posts.unshift(post); // Add to beginning

    // Save posts
    savePosts(posts);

    // Display updated posts
    displayPosts(posts);

    // Show success message
    showMessage("Your help request has been posted successfully! Helpers can now see and respond to it.", "success");

    // Reset form
    form.reset();

    // Scroll to posts
    document.getElementById("posts-section").scrollIntoView({ behavior: "smooth" });

    function showMessage(message, type) {
    // Remove any existing message
    const existingMsg = document.querySelector(".message");
    if (existingMsg) {
        existingMsg.remove();
    }

    // Create message element
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;

    // Style the message
    msgDiv.style.position = "fixed";
    msgDiv.style.top = "20px";
    msgDiv.style.right = "20px";
    msgDiv.style.padding = "15px 20px";
    msgDiv.style.borderRadius = "8px";
    msgDiv.style.color = "white";
    msgDiv.style.fontWeight = "bold";
    msgDiv.style.zIndex = "9999";
    msgDiv.style.maxWidth = "300px";

    if (type === "success") {
        msgDiv.style.backgroundColor = "#3B9797";
    } else {
        msgDiv.style.backgroundColor = "#BF092F";
    }

    // Append to body
    document.body.appendChild(msgDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 5000);
}

function openActionsModal(index) {
    const posts = JSON.parse(localStorage.getItem("voluntraPosts")) || [];
    const post = posts[index];

    let mapHtml = '';
    if (post.lat && post.lng) {
        mapHtml = `<div id="actions-map" style="height: 200px; margin: 10px 0;"></div>`;
    }

    const content = `
        <h3>Actions on ${post.name}'s Request</h3>
        <p><strong>Description:</strong> ${post.description}</p>
        <p><strong>Location:</strong> ${post.location}</p>
        ${mapHtml}
        <h4>Comments (${(post.comments || []).length})</h4>
        <div class="comments-list">
            ${(post.comments || []).map(comment => `<div class="comment">${comment}</div>`).join('')}
        </div>
        <h4>Donations (${(post.donations || []).length})</h4>
        <div class="donations-list">
            ${(post.donations || []).map(donation => `<div class="donation">${donation}</div>`).join('')}
        </div>
        <h4>Volunteers (${(post.volunteers || []).length})</h4>
        <div class="volunteers-list">
            ${(post.volunteers || []).map(volunteer => `<div class="volunteer">${volunteer}</div>`).join('')}
        </div>
    `;

    document.getElementById('actions-content').innerHTML = content;

    const modal = document.getElementById('actions-modal');
    modal.style.display = 'block';

    if (post.lat && post.lng) {
        setTimeout(() => {
            const actionsMap = L.map('actions-map').setView([post.lat, post.lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(actionsMap);
            L.marker([post.lat, post.lng]).addTo(actionsMap);
        }, 100);
    }
}
const footerText = document.querySelector("footer p");
if (footerText) {
    footerText.innerHTML = `© ${new Date().getFullYear()} Voluntra — Making the world better together `;
}
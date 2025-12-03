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





});
}
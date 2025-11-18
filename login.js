// --- LOGIN & AUTHENTICATION SETUP ---
const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const mainAppContent = document.getElementById('main-app-content');

// Hardcoded Credentials
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

let isLoggedIn = false;

// --- CORE NAVIGATION FUNCTION ---

/**
 * Switches the user interface from the Login screen to the main Volunteer Hub (Home Page).
 */
function navigateToHome() {
    isLoggedIn = true; 
    
    // UI Transition: Hide login by setting display to 'none'
    loginContainer.style.display = 'none';
    // Show main app content by setting display to 'block' (or appropriate default)
    mainAppContent.style.display = 'block'; 
    
    // Data Initialization: Load and display the volunteer opportunities.
    renderOpportunities(); 
}

// --- LOGIN HANDLER ---

/**
 * Handles the login form submission.
 */
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Check credentials against hardcoded values
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        
        // Success: Call the navigation function to proceed to the home page
        navigateToHome(); 
        
        // Reset the form fields
        loginForm.reset();
        
    } else {
        alert("Invalid username or password. Please try again.");
    }
}

/**
 * Handles the logout action.
 */
function logout() {
    isLoggedIn = false;
    alert("You have been logged out.");
    
    // Hide the main content
    mainAppContent.style.display = 'none';
    
    // Show the login screen
    loginContainer.style.display = 'block';
}

// --- VOLUNTEER APPLICATION LOGIC ---

// Data array (initial opportunities)
let opportunities = [
    { id: 1, title: "Library Book Sorting", date: "2025-12-05", description: "Help organize and catalog new library books.", contact: "library@school.edu" },
    { id: 2, title: "School Fair Setup", date: "2025-11-28", description: "Assist with setting up booths and decorations for the annual fair.", contact: "faircommitee@school.edu" }
];

const form = document.getElementById('opportunity-form');
const opportunityList = document.getElementById('opportunity-list');
let nextId = 3; 

/**
 * Renders the entire list of opportunities to the DOM.
 */
function renderOpportunities() {
    if (!isLoggedIn) return; 
    
    opportunityList.innerHTML = ''; 

    opportunities.forEach(opportunity => {
        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <h3>${opportunity.title}</h3>
            <p><strong>Date:</strong> ${opportunity.date}</p>
            <p><strong>Details:</strong> ${opportunity.description}</p>
            <p><strong>Contact:</strong> <a href="mailto:${opportunity.contact}">${opportunity.contact}</a></p>
            <button onclick="signUp(${opportunity.id})">Sign Up</button>
            <button class="delete-btn" onclick="deleteOpportunity(${opportunity.id})">Delete</button>
        `;
        
        opportunityList.appendChild(listItem);
    });
}

/**
 * Handles the Sign Up button click.
 */
function signUp(id) {
    const opp = opportunities.find(o => o.id === id);
    if (opp) {
        alert(`You've successfully signed up for: ${opp.title}! Please contact ${opp.contact} for details.`);
    }
}

/**
 * Deletes an opportunity from the array.
 */
function deleteOpportunity(id) {
    opportunities = opportunities.filter(o => o.id !== id);
    renderOpportunities(); 
}


/**
 * Handles the form submission for adding a new opportunity.
 */
function handleFormSubmit(e) {
    e.preventDefault(); 

    const newOpportunity = {
        id: nextId++,
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value,
        contact: document.getElementById('contact').value,
    };

    opportunities.push(newOpportunity);
    renderOpportunities();
    form.reset();
}

// --- INITIALIZATION ---

// 1. Attach the submit handler to the opportunity form
form.addEventListener('submit', handleFormSubmit);

// 2. Attach the login form handler
loginForm.addEventListener('submit', handleLogin);

// 3. Initially hide the main app content on page load
mainAppContent.style.display = 'none';
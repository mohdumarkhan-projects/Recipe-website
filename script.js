// Configuration - Replace with your GitHub username and repository name
const owner = 'mohdumarkhan-projects';
const repo = 'Recipe-website';

// Function to parse YAML frontmatter from markdown content
function parseFrontmatter(content) {
    const parts = content.split('---');
    if (parts.length >= 3) {
        const frontmatter = parts[1].trim();
        const body = parts.slice(2).join('---').trim();
        try {
            const data = jsyaml.load(frontmatter);
            return { data, body };
        } catch (e) {
            console.error('Error parsing frontmatter:', e);
            return { data: {}, body: content };
        }
    }
    return { data: {}, body: content };
}

// Homepage logic: Fetch and display recipe cards
async function loadRecipes() {
    const grid = document.getElementById('recipe-grid');
    if (!grid) return; // Not on homepage

    // Check if we're running locally (not on GitHub Pages)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

    if (isLocal) {
        // Local development: Load from local recipes directory
        await loadRecipesLocally(grid);
    } else {
        // Production: Load from GitHub API
        await loadRecipesFromGitHub(grid);
    }
}

async function loadRecipesFromGitHub(grid) {
    try {
        // Fetch list of files in /recipes/ directory from GitHub API
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/recipes`);
        if (!response.ok) throw new Error('Failed to fetch recipes list');
        const files = await response.json();

        // Filter for .md files
        const mdFiles = files.filter(file => file.name.endsWith('.md'));

        for (const file of mdFiles) {
            // Fetch the raw content of each .md file
            const mdResponse = await fetch(file.download_url);
            if (!mdResponse.ok) continue;
            const mdContent = await mdResponse.text();

            // Parse frontmatter
            const { data } = parseFrontmatter(mdContent);
            const { slug, title, image } = data;

            if (!slug || !title) continue; // Skip if required fields missing

            // Create recipe card
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = () => window.location.href = `recipe.html?slug=${slug}`;
            card.innerHTML = `
                <img src="images/${image}" alt="${title}" onerror="this.src='images/placeholder.svg'">
                <h2>${title}</h2>
            `;
            grid.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        grid.innerHTML = '<p>Failed to load recipes. Please check your internet connection or deploy to GitHub Pages.</p>';
    }
}

async function loadRecipesLocally(grid) {
    // For local development, we'll simulate with the available recipes
    // Since we can't list directory contents locally, we'll hardcode the slugs for now
    // In a real scenario, you might use a build step to generate a recipes.json file
    const localRecipes = [
        'aalu-matter-gobhi-curry',
        'afghani-white-chicken-masala',
        'bagara-chawal',
        'chicken-akhni-pulao',
        'chicken-biryani-and-dessert',
        'chicken-biryani-dum-style',
        'chicken-gravy',
        'chicken-salan-curry',
        'chicken-sandwich-wrap',
        'chicken-sandwiches',
        'chilli-chicken',
        'creamy-chicken-mix',
        'daal-palak',
        'dry-fish-cleaning',
        'fiki-daal',
        'fish-salan-curry',
        'goan-style-gosht-curry',
        'gosht-and-daal',
        'gosht-with-palak',
        'grocery-shopping-list-june-1st',
        'highly-spiced-gosht-curry',
        'kachche-kabab',
        'khichdi-and-fried-chicken',
        'mutton-and-potato-curry-aalu-gosht',
        'mutton-and-spinach-gosht-palak',
        'nabulsi-cheese-rolls',
        'prawns-and-rice',
        'prawns-and-vegetable-curry',
        'prawns-pulao',
        'prawns-sukka',
        'pressure-cooking-palak',
        'quick-pasta-tip',
        'recipe-name-here',
        'rice-meat-prep',
        'sausage-masala',
        'white-biryani'
    ];

    for (const slug of localRecipes) {
        try {
            // Fetch the local .md file
            const response = await fetch(`recipes/${slug}.md`);
            if (!response.ok) continue;
            const mdContent = await response.text();

            // Parse frontmatter
            const { data } = parseFrontmatter(mdContent);
            const { title, image } = data;

            if (!title) continue;

            // Create recipe card
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = () => window.location.href = `recipe.html?slug=${slug}`;
            card.innerHTML = `
                <img src="images/${image}" alt="${title}" onerror="this.src='images/placeholder.svg'">
                <h2>${title}</h2>
            `;
            grid.appendChild(card);
        } catch (error) {
            console.error(`Error loading ${slug}:`, error);
        }
    }

    if (grid.children.length === 0) {
        grid.innerHTML = '<p>No recipes found. Make sure recipe files are in the recipes/ directory.</p>';
    }
}

// Recipe page logic: Load and render single recipe
async function loadRecipe() {
    const contentDiv = document.getElementById('recipe-content');
    if (!contentDiv) return; // Not on recipe page

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (!slug) {
        contentDiv.innerHTML = '<p>Recipe not found.</p>';
        return;
    }

    // Check if we're running locally
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

    try {
        let response;
        if (isLocal) {
            // Local development: Load from local recipes directory
            response = await fetch(`recipes/${slug}.md`);
        } else {
            // Production: Load from GitHub raw
            response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/recipes/${slug}.md`);
        }

        if (!response.ok) throw new Error('Recipe not found');
        const mdContent = await response.text();

        // Parse frontmatter
        const { data, body } = parseFrontmatter(mdContent);
        const { title, image } = data;

        // Render the recipe
        const htmlContent = marked.parse(body);
        contentDiv.innerHTML = `
            <img src="images/${image}" alt="${title}" onerror="this.src='images/placeholder.svg'">
            <h1>${title}</h1>
            ${htmlContent}
        `;
    } catch (error) {
        console.error('Error loading recipe:', error);
        contentDiv.innerHTML = '<p>Failed to load recipe.</p>';
    }
}

// Interactive Recipe Addition System
// Handles modal, form submission, localStorage, and dynamic rendering

// Modal functionality
function initModal() {
    const modal = document.getElementById('add-recipe-modal');
    const btn = document.getElementById('add-recipe-btn');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancel-btn');

    if (!modal || !btn) return; // Not on homepage

    // Open modal
    btn.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    });

    // Close modal functions
    const closeModal = () => {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore scroll
        resetForm();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
}

// Form handling
function initForm() {
    const form = document.getElementById('add-recipe-form');
    const imageInput = document.getElementById('recipe-image');
    const imagePreview = document.getElementById('image-preview');

    if (!form) return; // Not on homepage

    // Image preview
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Recipe preview">`;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
                imagePreview.style.display = 'none';
            }
        });
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRecipeSubmission();
    });
}

// Generate URL-friendly slug
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Handle recipe submission
async function handleRecipeSubmission() {
    const nameInput = document.getElementById('recipe-name');
    const ingredientsInput = document.getElementById('recipe-ingredients');
    const stepsInput = document.getElementById('recipe-steps');
    const notesInput = document.getElementById('recipe-notes');
    const imageInput = document.getElementById('recipe-image');

    // Get form values
    const recipeName = nameInput.value.trim();
    const ingredients = ingredientsInput.value.trim();
    const steps = stepsInput.value.trim();
    const notes = notesInput.value.trim();

    // Validation
    if (!recipeName || !ingredients || !steps) {
        alert('Please fill in all required fields (Name, Ingredients, Steps)');
        return;
    }

    // Check for duplicate names
    const existingRecipes = getStoredRecipes();
    const slug = generateSlug(recipeName);

    if (existingRecipes.some(recipe => recipe.slug === slug)) {
        alert('A recipe with this name already exists. Please choose a different name.');
        return;
    }

    // Handle image
    let imageData = null;
    if (imageInput.files[0]) {
        imageData = await fileToBase64(imageInput.files[0]);
    }

    // Create recipe object
    const recipe = {
        id: Date.now().toString(), // Unique ID
        slug: slug,
        title: recipeName,
        ingredients: ingredients,
        steps: steps,
        notes: notes,
        image: imageData, // Base64 encoded image
        created: new Date().toISOString(),
        type: 'user-added' // Mark as user-added for differentiation
    };

    // Save to localStorage
    saveRecipe(recipe);

    // Add to grid immediately
    addRecipeToGrid(recipe);

    // Close modal and reset
    document.getElementById('add-recipe-modal').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetForm();

    // Show success message
    showSuccessMessage(`Recipe "${recipeName}" added successfully!`);
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Local storage functions
function getStoredRecipes() {
    try {
        const recipes = localStorage.getItem('userRecipes');
        return recipes ? JSON.parse(recipes) : [];
    } catch (e) {
        console.error('Error loading recipes from localStorage:', e);
        return [];
    }
}

function saveRecipe(recipe) {
    const recipes = getStoredRecipes();
    recipes.push(recipe);
    localStorage.setItem('userRecipes', JSON.stringify(recipes));
}

function getStoredRecipeBySlug(slug) {
    const recipes = getStoredRecipes();
    return recipes.find(recipe => recipe.slug === slug);
}

function deleteRecipe(recipeId, cardElement) {
    // Show confirmation dialog
    const confirmDelete = confirm('Are you sure you want to delete this recipe? This action cannot be undone.');

    if (!confirmDelete) return;

    // Remove from localStorage
    const recipes = getStoredRecipes();
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('userRecipes', JSON.stringify(updatedRecipes));

    // Remove from DOM
    if (cardElement && cardElement.parentNode) {
        cardElement.parentNode.removeChild(cardElement);
    }

    // Show success message
    showSuccessMessage('Recipe deleted successfully!');
}

// Reset form
function resetForm() {
    const form = document.getElementById('add-recipe-form');
    if (form) {
        form.reset();
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
            imagePreview.style.display = 'none';
        }
    }
}

// Success message
function showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(successDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(successDiv), 300);
    }, 3000);
}

// Load user-added recipes on homepage
function loadUserRecipes() {
    const recipes = getStoredRecipes();
    recipes.forEach(recipe => addRecipeToGrid(recipe));
}

// Add recipe to grid
function addRecipeToGrid(recipe) {
    const grid = document.getElementById('recipe-grid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('data-recipe-id', recipe.id);

    // Only add click handler if not clicking delete button
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-btn')) {
            window.location.href = `recipe.html?slug=${recipe.slug}&type=user`;
        }
    });

    const imageSrc = recipe.image || 'images/placeholder.svg';

    card.innerHTML = `
        <img src="${imageSrc}" alt="${recipe.title}" onerror="this.src='images/placeholder.svg'">
        <h2>${recipe.title}</h2>
        <button class="delete-btn" aria-label="Delete recipe" title="Delete this recipe">
            🗑️
        </button>
    `;

    // Add delete functionality
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteRecipe(recipe.id, card);
    });

    // Add to beginning of grid (newest first)
    grid.insertBefore(card, grid.firstChild);
}

// Enhanced recipe loading for user recipes
function loadRecipeEnhanced() {
    const contentDiv = document.getElementById('recipe-content');
    if (!contentDiv) return; // Not on recipe page

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const type = urlParams.get('type');

    if (!slug) {
        contentDiv.innerHTML = '<p>Recipe not found.</p>';
        return;
    }

    // Check if it's a user-added recipe
    if (type === 'user') {
        const recipe = getStoredRecipeBySlug(slug);
        if (recipe) {
            renderUserRecipe(recipe);
            return;
        } else {
            // Recipe was deleted
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h1 style="color: #8B4513;">Recipe Not Found</h1>
                    <p>This recipe has been deleted or no longer exists.</p>
                    <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #8B4513, #A0522D); color: white; text-decoration: none; border-radius: 8px;">← Back to Recipes</a>
                </div>
            `;
            return;
        }
    }

    // Fall back to regular markdown loading
    loadRecipe();
}

// Render user-added recipe
function renderUserRecipe(recipe) {
    const contentDiv = document.getElementById('recipe-content');

    // Process ingredients and steps (convert line breaks to lists)
    const ingredientsList = recipe.ingredients
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<li>${line.replace(/^[-*•]\s*/, '')}</li>`)
        .join('');

    const stepsList = recipe.steps
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => `<li>${line.replace(/^\d+\.?\s*/, '')}</li>`)
        .join('');

    const notesSection = recipe.notes ? `
        <h2>Notes</h2>
        <ul>${recipe.notes.split('\n').filter(line => line.trim()).map(line => `<li>${line}</li>`).join('')}</ul>
    ` : '';

    const imageSrc = recipe.image || 'images/placeholder.svg';

    contentDiv.innerHTML = `
        <img src="${imageSrc}" alt="${recipe.title}" onerror="this.src='images/placeholder.svg'">
        <h1>${recipe.title}</h1>

        <h2>Ingredients</h2>
        <ul>${ingredientsList}</ul>

        <h2>Steps</h2>
        <ol>${stepsList}</ol>

        ${notesSection}
    `;
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadRecipes();
        loadUserRecipes(); // Load user-added recipes
        initModal(); // Initialize modal functionality
        initForm(); // Initialize form handling
    } else if (window.location.pathname.endsWith('recipe.html')) {
        loadRecipeEnhanced(); // Enhanced recipe loading
    }
});

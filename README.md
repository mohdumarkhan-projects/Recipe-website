# Recipe Website

A static recipe website built with HTML, CSS, and Vanilla JavaScript, designed for GitHub Pages hosting.

## Features

- Pure static site with no backend or database
- Automatically detects and displays new recipes added as Markdown files
- Mobile-first, responsive design
- Clean, modern UI optimized for recipe browsing
- Easy to add new recipes by dropping Markdown files

## Setup

1. **Clone or download** this repository to your local machine.

2. **Configure GitHub Repository**:
   - Create a new GitHub repository
   - Push this code to the repository
   - Enable GitHub Pages in repository settings (set source to `main` branch)

3. **Update Configuration**:
   - In `script.js`, replace `'your-github-username'` and `'your-repo-name'` with your actual GitHub username and repository name.

4. **Deploy**:
   - Commit and push changes to GitHub
   - The site will be available at `https://your-github-username.github.io/your-repo-name/`

## Adding New Recipes

To add a new recipe:

1. **Create a Markdown file** in the `recipes/` directory (e.g., `chocolate-chip-cookies.md`)

2. **Use the following format**:

   ```markdown
   ---
   slug: chocolate-chip-cookies
   title: Chocolate Chip Cookies
   image: chocolate-chip-cookies.jpg
   ---

   ## Ingredients
   - 2 1/4 cups all-purpose flour
   - 1 teaspoon baking soda
   - 1 teaspoon salt
   - 1 cup unsalted butter, softened
   - 3/4 cup granulated sugar
   - 3/4 cup packed brown sugar
   - 1 teaspoon vanilla extract
   - 2 large eggs
   - 2 cups chocolate chips

   ## Steps
   1. Preheat oven to 375°F (190°C).
   2. In a bowl, whisk together flour, baking soda, and salt.
   3. In another bowl, cream together butter and sugars until smooth.
   4. Beat in eggs and vanilla.
   5. Gradually blend in flour mixture.
   6. Stir in chocolate chips.
   7. Drop rounded tablespoons of dough onto ungreased cookie sheets.
   8. Bake for 9-11 minutes or until golden brown.
   9. Cool on baking sheet for 2 minutes before removing to wire rack.

   ## Notes
   These cookies are best enjoyed warm with a glass of milk. Store in an airtight container for up to 5 days.
   ```

3. **Add the recipe image** to the `images/` directory (e.g., `chocolate-chip-cookies.jpg`)

4. **Commit and push** the changes to GitHub. The new recipe will automatically appear on the homepage without any code changes!

## How It Works

- The website uses the GitHub API to automatically detect new Markdown files in the `recipes/` directory
- Each recipe file contains YAML frontmatter with metadata (slug, title, image)
- The homepage fetches and parses all recipe files to display a grid of cards
- Clicking a card loads the individual recipe page, which renders the Markdown content
- All parsing is done client-side using Marked.js and js-yaml libraries

## Local Development

To test locally:

1. Install Python (if not already installed)
2. Run `python -m http.server 8000` in the project directory
3. Open `http://localhost:8000` in your browser

The website will automatically detect local development and load recipes from the local `recipes/` directory. You can test the full functionality locally before deploying to GitHub Pages.

## Tech Stack

- HTML5
- CSS3 (responsive, mobile-first)
- Vanilla JavaScript
- Marked.js (Markdown parsing)
- js-yaml (YAML frontmatter parsing)
- GitHub API (for automatic recipe detection)

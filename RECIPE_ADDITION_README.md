# 🍳 Interactive Recipe Management System

A complete interactive system to add, manage, and delete recipes directly from your static markdown-based recipe website. No manual file editing required!

## 🎯 Overview

This system provides full recipe management capabilities directly through your website interface:

- ✅ **Add Recipes**: Interactive form to add new recipes with images
- ✅ **Delete Recipes**: One-click deletion with confirmation
- ✅ **Automatic Processing**: Smart text parsing and formatting
- ✅ **Image Handling**: Upload and store images as base64
- ✅ **Data Persistence**: Uses localStorage (works on static sites)
- ✅ **Validation**: Prevents duplicates and ensures data integrity
- ✅ **Responsive Design**: Works perfectly on all devices

## 🚀 Quick Start

### Option 1: Interactive Website Interface (Recommended)

**For Users (Beginners):**
1. **Open your website:** Visit `http://localhost:8000/index.html`
2. **Click "➕ Add New Recipe"** button in the header
3. **Fill out the form:**
   - Recipe Name (required)
   - Ingredients (required, one per line)
   - Steps (required, one per line)
   - Notes (optional)
   - Image (optional upload)
4. **Submit** and watch your recipe appear immediately!
5. **Delete recipes:** Click the 🗑️ button on user-added recipe cards

**No technical knowledge required!**

### Option 2: Command Line Script

**For Advanced Users:**
1. **Run the script:**
   ```bash
   python add_new_recipe.py
   ```

2. **Paste your raw recipe text:**
   - Copy recipe text from WhatsApp/message
   - Paste it when prompted
   - Press Enter twice to finish

3. **Add image (optional):**
   - Choose if you have an image
   - Provide the full path to the image file

4. **Review and confirm:**
   - Check the generated markdown preview
   - Confirm to save the recipe

5. **View your new recipe:**
   - Refresh your website homepage
   - Click on the new recipe card
   - Or visit: `http://localhost:8000/recipe.html?slug=generated-slug`

## 📝 Supported Recipe Formats

The system can parse various recipe formats. Here are examples:

### Format 1: Clear Section Headers
```
Chicken Biryani

Ingredients:
- Rice: 2 cups
- Chicken: 1 kg
- Onions: 3
- Tomatoes: 2

Steps:
1. Wash and soak rice
2. Marinate chicken
3. Cook onions until golden
4. Add tomatoes and spices

Notes:
Serve hot with raita
```

### Format 2: WhatsApp Style
```
Chicken Curry Recipe

Ingredients
• Chicken 1kg
• Oil 4 tbsp
• Onions 2
• Tomatoes 2
• Ginger garlic paste 2 tbsp

Method:
1. Heat oil in pan
2. Add onions and fry
3. Add ginger garlic paste
4. Add chicken and cook
```

### Format 3: Simple List
```
Pasta Primavera

- Pasta 500g
- Olive oil 3 tbsp
- Garlic 4 cloves
- Vegetables (mixed) 2 cups
- Parmesan cheese

1. Boil pasta
2. Sauté garlic in oil
3. Add vegetables
4. Mix with pasta
5. Top with cheese
```

## 🖼️ Image Handling

### Supported Formats
- JPG, PNG, GIF, WebP (any image format)

### How It Works
1. Save your recipe image anywhere on your computer
2. When prompted, provide the full path (e.g., `C:\Users\YourName\Desktop\recipe.jpg`)
3. The system automatically:
   - Copies the image to `/images/` folder
   - Renames it to match the recipe slug
   - Updates the markdown frontmatter
   - Falls back to placeholder if no image provided

### Example
```
Input image: C:\Photos\chicken_biryani.png
Recipe slug: chicken-biryani-dum-style
Final image: images/chicken-biryani-dum-style.png
```

## 🔧 Advanced Usage

### Command Line Options
Currently, the script runs interactively. Future versions may support:
- Batch processing multiple recipes
- Direct file input
- Custom image directories

### Manual Override
If auto-parsing fails, you can manually edit the generated markdown file in `/recipes/`.

### Validation
The system validates:
- ✅ Markdown frontmatter format
- ✅ Required fields (slug, title, image)
- ✅ File creation
- ✅ Website compatibility

## 🛠️ Troubleshooting

### Common Issues

**"No recipe text provided"**
- Make sure you paste some text and press Enter twice to finish

**"Image file not found"**
- Double-check the image file path
- Ensure the file exists and you have read permissions

**"Recipe validation failed"**
- Check that the generated markdown file exists in `/recipes/`
- Verify the frontmatter format starts with `---`

**Recipe not appearing on website**
- Refresh your browser (Ctrl+F5)
- Check that the local server is running: `python -m http.server 8000`
- Verify the slug matches: `recipe.html?slug=your-recipe-slug`

### Getting Help
1. Check the generated markdown file in `/recipes/`
2. Verify the frontmatter format
3. Test with the local server
4. Manually edit if needed

## 📁 File Structure

After adding recipes, your project will look like:
```
recipe-website/
├── index.html                 # Homepage
├── recipe.html                # Recipe page template
├── styles.css                 # Styling
├── script.js                  # JavaScript functionality
├── add_new_recipe.py          # This script
├── images/
│   ├── placeholder.svg        # Fallback image
│   └── chicken-biryani.jpg    # Recipe images
└── recipes/
    └── chicken-biryani.md     # Recipe content
```

## 🔒 Safety Features

- **No Overwriting**: Won't overwrite existing recipes with same slug
- **Validation**: Checks file format before saving
- **Backup**: Original input preserved during processing
- **Confirmation**: Shows preview before saving

## 🚀 Future Enhancements

Potential improvements for future versions:
- AI-powered recipe parsing
- Bulk recipe import
- Image optimization
- Recipe categories/tags
- Search functionality
- Print-friendly layouts

## 📞 Support

If you encounter issues:
1. Check this README
2. Verify your Python installation
3. Test with the provided examples
4. Check file permissions
5. Ensure local server is running

---

**Happy cooking! 🍳✨**

*This system makes recipe collection effortless while maintaining the simplicity of your static website.*

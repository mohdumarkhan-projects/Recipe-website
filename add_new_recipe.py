#!/usr/bin/env python3
"""
Recipe Addition System for Static Markdown Recipe Website

This script allows you to easily add new recipes to your website by providing
raw recipe text (typically from WhatsApp). It processes the text, generates
proper markdown with frontmatter, and saves everything in the correct format.

Usage:
    python add_new_recipe.py

Then follow the prompts to add your recipe.
"""

import os
import re
import sys
from pathlib import Path

# Configuration
RECIPES_DIR = "recipes"
IMAGES_DIR = "images"

def generate_slug(title):
    """Generate URL-friendly slug from recipe title."""
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove special characters
    slug = re.sub(r'[-\s]+', '-', slug)   # Replace spaces and multiple hyphens with single hyphen
    slug = slug.strip('-')                # Remove leading/trailing hyphens
    return slug

def extract_recipe_components(raw_text):
    """
    Extract title, ingredients, steps, and notes from raw recipe text.
    Uses simple pattern matching to parse common recipe formats.
    """
    lines = raw_text.strip().split('\n')
    lines = [line.strip() for line in lines if line.strip()]

    # Initialize components
    title = ""
    ingredients = []
    steps = []
    notes = []

    # State tracking
    current_section = None
    ingredient_patterns = [
        r'^ingredients?:?\s*$',
        r'^##?\s*ingredients?:?\s*$',
        r'^ingredients\s*[:-]',
        r'^\*\s*ingredients',
        r'^•\s*ingredients'
    ]
    step_patterns = [
        r'^steps?:?\s*$',
        r'^##?\s*steps?:?\s*$',
        r'^method:?\s*$',
        r'^directions?:?\s*$',
        r'^instructions?:?\s*$'
    ]
    notes_patterns = [
        r'^notes?:?\s*$',
        r'^##?\s*notes?:?\s*$',
        r'^tips?:?\s*$'
    ]

    i = 0
    while i < len(lines):
        line = lines[i].lower()

        # Check for section headers
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in ingredient_patterns):
            current_section = 'ingredients'
            i += 1
            continue
        elif any(re.search(pattern, line, re.IGNORECASE) for pattern in step_patterns):
            current_section = 'steps'
            i += 1
            continue
        elif any(re.search(pattern, line, re.IGNORECASE) for pattern in notes_patterns):
            current_section = 'notes'
            i += 1
            continue

        # Extract title (usually first non-empty line if no clear section headers)
        if not title and not current_section and i < 5:  # Check first few lines for title
            # Skip if it looks like an ingredient or step
            if not (line.startswith(('- ', '* ', '• ', '1. ', '2. ', '3. ')) or
                   any(keyword in line for keyword in ['ingredients', 'steps', 'method', 'notes'])):
                title = lines[i].title()  # Title case
                i += 1
                continue

        # Process content based on current section
        if current_section == 'ingredients':
            # Look for ingredient patterns
            if re.match(r'^[-*•]\s*', lines[i]) or re.match(r'^\d+\.?\s*', lines[i]):
                ingredients.append(lines[i])
            elif line and not any(keyword in line for keyword in ['ingredients', 'steps', 'method', 'notes']):
                # Fallback: if line looks like an ingredient
                ingredients.append(lines[i])
        elif current_section == 'steps':
            if re.match(r'^\d+\.?\s*', lines[i]) or re.match(r'^[-*•]\s*', lines[i]):
                steps.append(lines[i])
            elif line and len(line) > 10:  # Longer lines might be steps
                steps.append(lines[i])
        elif current_section == 'notes':
            notes.append(lines[i])

        i += 1

    # If no title found, try to extract from first line
    if not title and lines:
        title = lines[0].title()

    return {
        'title': title,
        'ingredients': ingredients,
        'steps': steps,
        'notes': notes
    }

def format_markdown(components):
    """Format extracted components into proper markdown with frontmatter."""
    slug = generate_slug(components['title'])

    # Build frontmatter
    frontmatter = f"""---
slug: {slug}
title: {components['title']}
image: {slug}.jpg
---"""

    # Build body
    body_parts = []

    if components['ingredients']:
        body_parts.append("## Ingredients")
        body_parts.extend(components['ingredients'])
        body_parts.append("")  # Empty line

    if components['steps']:
        body_parts.append("## Steps")
        body_parts.extend(components['steps'])
        body_parts.append("")  # Empty line

    if components['notes']:
        body_parts.append("## Notes")
        body_parts.extend(components['notes'])

    body = "\n".join(body_parts).strip()

    return f"{frontmatter}\n\n{body}\n", slug

def save_recipe(markdown_content, slug, image_path=None):
    """Save the markdown file and handle image placement."""
    # Ensure directories exist
    os.makedirs(RECIPES_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)

    # Save markdown file
    recipe_path = os.path.join(RECIPES_DIR, f"{slug}.md")
    with open(recipe_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)

    print(f"✅ Recipe saved: {recipe_path}")

    # Handle image if provided
    if image_path and os.path.exists(image_path):
        import shutil
        image_ext = Path(image_path).suffix
        new_image_path = os.path.join(IMAGES_DIR, f"{slug}{image_ext}")
        shutil.copy2(image_path, new_image_path)
        print(f"✅ Image copied: {new_image_path}")

        # Update frontmatter if image extension is not .jpg
        if image_ext != '.jpg':
            # Read and update the markdown file
            with open(recipe_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Replace image line
            content = re.sub(r'image: .*', f'image: {slug}{image_ext}', content)

            with open(recipe_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"✅ Updated image reference in markdown")

    elif image_path:
        print(f"⚠️  Warning: Image file not found: {image_path}")

def validate_recipe(slug):
    """Basic validation to check if recipe can be loaded by the website."""
    recipe_path = os.path.join(RECIPES_DIR, f"{slug}.md")

    if not os.path.exists(recipe_path):
        print(f"❌ Error: Recipe file not created: {recipe_path}")
        return False

    # Check if markdown has proper frontmatter
    with open(recipe_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        print("❌ Error: Invalid frontmatter format")
        return False

    # Check for required frontmatter fields
    required_fields = ['slug:', 'title:', 'image:']
    for field in required_fields:
        if field not in content:
            print(f"❌ Error: Missing required field: {field}")
            return False

    print(f"✅ Recipe validation passed: {slug}")
    return True

def main():
    print("🍳 Recipe Addition System")
    print("=" * 50)

    # Get raw recipe text
    print("\n📝 Step 1: Paste your raw recipe text below")
    print("   (Include ingredients, steps, notes if available)")
    print("   Press Enter twice when finished:\n")

    raw_text_lines = []
    while True:
        line = input()
        if line == "" and raw_text_lines and raw_text_lines[-1] == "":
            break
        raw_text_lines.append(line)

    raw_text = "\n".join(raw_text_lines).strip()

    if not raw_text:
        print("❌ Error: No recipe text provided")
        return

    # Extract components
    print("\n🔍 Step 2: Processing recipe...")
    components = extract_recipe_components(raw_text)

    print(f"📋 Extracted Title: {components['title']}")
    print(f"🥕 Ingredients found: {len(components['ingredients'])}")
    print(f"👨‍🍳 Steps found: {len(components['steps'])}")
    print(f"💡 Notes found: {len(components['notes'])}")

    # Generate markdown
    markdown_content, slug = format_markdown(components)

    print(f"\n🏷️  Generated Slug: {slug}")

    # Ask about image
    image_path = None
    image_choice = input("\n🖼️  Step 3: Do you have an image for this recipe? (y/n): ").lower().strip()

    if image_choice == 'y':
        image_path = input("   Enter the full path to the image file: ").strip()
        if not os.path.exists(image_path):
            print(f"⚠️  Warning: Image file not found: {image_path}")
            image_path = None

    # Confirm and save
    print(f"\n📄 Generated Markdown Preview:")
    print("-" * 30)
    print(markdown_content[:500] + ("..." if len(markdown_content) > 500 else ""))
    print("-" * 30)

    confirm = input("\n✅ Ready to save this recipe? (y/n): ").lower().strip()

    if confirm == 'y':
        save_recipe(markdown_content, slug, image_path)

        # Validate
        if validate_recipe(slug):
            print("\n🎉 Success! Recipe added to your website.")
            print(f"   📱 View it at: http://localhost:8000/recipe.html?slug={slug}")
            print(f"   🔄 Refresh your homepage to see it in the grid")
        else:
            print("\n❌ Recipe validation failed. Please check the generated files.")
    else:
        print("\n❌ Recipe addition cancelled.")

if __name__ == "__main__":
    main()

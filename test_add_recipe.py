#!/usr/bin/env python3
"""
Test version of the recipe addition system
"""

import os
import re
from pathlib import Path

# Configuration
RECIPES_DIR = "recipes"
IMAGES_DIR = "images"

def generate_slug(title):
    """Generate URL-friendly slug from recipe title."""
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    return slug

def extract_recipe_components(raw_text):
    """Extract title, ingredients, steps, and notes from raw recipe text."""
    lines = raw_text.strip().split('\n')
    lines = [line.strip() for line in lines if line.strip()]

    title = ""
    ingredients = []
    steps = []
    notes = []

    current_section = None
    ingredient_patterns = [
        r'^ingredients?:?\s*$',
        r'^##?\s*ingredients?:?\s*$',
        r'^ingredients\s*[:-]',
    ]
    step_patterns = [
        r'^steps?:?\s*$',
        r'^##?\s*steps?:?\s*$',
        r'^method:?\s*$',
    ]
    notes_patterns = [
        r'^notes?:?\s*$',
        r'^##?\s*notes?:?\s*$',
    ]

    i = 0
    while i < len(lines):
        line = lines[i].lower()

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

        if not title and not current_section and i < 5:
            if not (line.startswith(('- ', '* ', '• ', '1. ', '2. ', '3. ')) or
                   any(keyword in line for keyword in ['ingredients', 'steps', 'method', 'notes'])):
                title = lines[i].title()
                i += 1
                continue

        if current_section == 'ingredients':
            if re.match(r'^[-*•]\s*', lines[i]) or re.match(r'^\d+\.?\s*', lines[i]):
                ingredients.append(lines[i])
        elif current_section == 'steps':
            if re.match(r'^\d+\.?\s*', lines[i]) or re.match(r'^[-*•]\s*', lines[i]):
                steps.append(lines[i])
        elif current_section == 'notes':
            notes.append(lines[i])

        i += 1

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

    frontmatter = f"""---
slug: {slug}
title: {components['title']}
image: {slug}.jpg
---"""

    body_parts = []

    if components['ingredients']:
        body_parts.append("## Ingredients")
        body_parts.extend(components['ingredients'])
        body_parts.append("")

    if components['steps']:
        body_parts.append("## Steps")
        body_parts.extend(components['steps'])
        body_parts.append("")

    if components['notes']:
        body_parts.append("## Notes")
        body_parts.extend(components['notes'])

    body = "\n".join(body_parts).strip()

    return f"{frontmatter}\n\n{body}\n", slug

def save_recipe(markdown_content, slug):
    """Save the markdown file."""
    os.makedirs(RECIPES_DIR, exist_ok=True)

    recipe_path = os.path.join(RECIPES_DIR, f"{slug}.md")
    with open(recipe_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)

    print(f"✅ Recipe saved: {recipe_path}")
    return recipe_path

def validate_recipe(slug):
    """Basic validation."""
    recipe_path = os.path.join(RECIPES_DIR, f"{slug}.md")

    if not os.path.exists(recipe_path):
        print(f"❌ Error: Recipe file not created: {recipe_path}")
        return False

    with open(recipe_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        print("❌ Error: Invalid frontmatter format")
        return False

    required_fields = ['slug:', 'title:', 'image:']
    for field in required_fields:
        if field not in content:
            print(f"❌ Error: Missing required field: {field}")
            return False

    print(f"✅ Recipe validation passed: {slug}")
    return True

# Test the system
if __name__ == "__main__":
    print("🧪 Testing Recipe Addition System")
    print("=" * 40)

    # Read test recipe
    with open('test_recipe.txt', 'r', encoding='utf-8') as f:
        raw_text = f.read()

    print("📝 Raw Input:")
    print("-" * 20)
    print(raw_text)
    print("-" * 20)

    # Extract components
    print("\n🔍 Processing...")
    components = extract_recipe_components(raw_text)

    print(f"📋 Title: {components['title']}")
    print(f"🥕 Ingredients: {len(components['ingredients'])}")
    print(f"👨‍🍳 Steps: {len(components['steps'])}")
    print(f"💡 Notes: {len(components['notes'])}")

    # Generate markdown
    markdown_content, slug = format_markdown(components)

    print(f"\n🏷️ Slug: {slug}")

    print(f"\n📄 Generated Markdown:")
    print("-" * 30)
    print(markdown_content)
    print("-" * 30)

    # Save recipe
    recipe_path = save_recipe(markdown_content, slug)

    # Validate
    if validate_recipe(slug):
        print("\n🎉 Test successful! Recipe added.")
        print(f"   📁 File: {recipe_path}")
        print(f"   📱 Would be viewable at: recipe.html?slug={slug}")
    else:
        print("\n❌ Test failed.")

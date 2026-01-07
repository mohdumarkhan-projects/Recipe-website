import os
import re

INPUT_FILE = "all_recipes.md"
OUTPUT_DIR = "recipes"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    content = f.read().strip()

# Split recipes at each ---
parts = re.split(r'---', content)
# Remove empty parts
parts = [p.strip() for p in parts if p.strip()]

i = 0
while i < len(parts):
    part = parts[i]
    if part.startswith('slug:'):
        # YAML format: frontmatter in this part, body in next part
        frontmatter = part
        body = parts[i + 1] if i + 1 < len(parts) else ''
        slug_match = re.search(r'slug:\s*([a-z0-9\-]+)', frontmatter)
        title_match = re.search(r'title:\s*(.+)', frontmatter)
        image_match = re.search(r'image:\s*(.+)', frontmatter)
        i += 2
    elif '## slug:' in part:
        # Header format: whole recipe in one part
        recipe = part
        slug_match = re.search(r'##\s*slug:\s*([a-z0-9\-]+)', recipe)
        title_match = re.search(r'title:\s*(.+)', recipe)
        image_match = re.search(r'image:\s*(.+)', recipe)
        body = re.sub(
            r'^---\n.*?image:.*?\n',
            '',
            recipe,
            flags=re.DOTALL
        ).strip()
        i += 1
    else:
        i += 1
        continue

    if not slug_match:
        continue

    slug = slug_match.group(1)
    title = title_match.group(1).strip() if title_match else slug.replace('-', ' ').title()
    image = image_match.group(1).strip() if image_match else f"{slug}.jpg"

    # Build correct markdown file
    final_md = f"""---
slug: {slug}
title: {title}
image: {image}
---

{body}
"""

    filename = f"{slug}.md"
    with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as out:
        out.write(final_md)

    print(f"Created: {filename}")

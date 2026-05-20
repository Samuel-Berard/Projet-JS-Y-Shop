import re
import os

def replace_var(text):
    lines = text.split('\n')
    new_lines = []
    for line in lines:
        if 'var ' in line:
            # Simple heuristic
            if 'for (var ' in line:
                line = line.replace('for (var ', 'for (let ')
            elif ' = 0' in line or ' = ""' in line or ' = \'\'' in line or ' = false' in line or ' = true' in line:
                line = line.replace('var ', 'let ')
            elif 'panier =' in line or 'favoris =' in line or 'produitsAffiches =' in line or 'produitsOriginaux =' in line or 'html =' in line or 'htmlCouleurs =' in line:
                line = line.replace('var ', 'let ')
            else:
                line = line.replace('var ', 'const ')
        new_lines.append(line)
    return '\n'.join(new_lines)

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = replace_var(content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Replaced var with const/let in {path}")

process_dir('c:\\Users\\belmo\\Desktop\\Projet-JS-Y-Shop\\frontend\\js')
print("Var replaced successfully.")

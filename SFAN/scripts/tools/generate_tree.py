import os

def generate_tree(startpath, exclude_dirs):
    tree = ""
    for root, dirs, files in os.walk(startpath):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        tree += f"{indent}{os.path.basename(root)}/\n"
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if not f.endswith('.pyc'):
                tree += f"{subindent}{f}\n"
    return tree

if __name__ == "__main__":
    path = r"C:\Users\user\Documents\AI Insurance App\SFAN"
    tree = generate_tree(path, ['venv', '__pycache__', '.git', 'node_modules', 'assets', 'css', 'img'])
    with open("project_tree.txt", "w", encoding="utf-8") as f:
        f.write(tree)
    print("Tree generated successfully.")

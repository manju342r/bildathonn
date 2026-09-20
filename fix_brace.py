import re

with open('src/main.js', 'r') as f:
    code = f.read()

# I will replace the erroneous double brace block
old_block = """            }
        }
        } else {"""

new_block = """            }
        } else {"""

code = code.replace(old_block, new_block)

with open('src/main.js', 'w') as f:
    f.write(code)

with open('../py_avanzado.json', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"cucho', '"cuerpo')

with open('../py_avanzado.json', 'w', encoding='utf-8') as f:
    f.write(content)

import json
with open('../py_avanzado.json', 'r', encoding='utf-8') as f:
    json.load(f)
print('Fixed!')

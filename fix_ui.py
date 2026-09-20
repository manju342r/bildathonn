import re

# 1. Update index.html to hide the ugly one I injected
with open('index.html', 'r') as f:
    html = f.read()

html = html.replace('id="hud-objective"', 'id="hud-objective" style="display:none;"')
with open('index.html', 'w') as f:
    f.write(html)

# 2. Update main.js
with open('src/main.js', 'r') as f:
    code = f.read()

# Update setObjective to use the right UI
old_setObj = "function setObjective(text) { const el = document.getElementById('val-objective'); if(el) el.innerText = text; }"
new_setObj = """function setObjective(text) { 
    const elDesc = document.getElementById('quest-desc'); 
    const elTitle = document.getElementById('quest-title');
    if(elTitle) elTitle.innerText = "CURRENT OBJECTIVE";
    if(elDesc) elDesc.innerText = text; 
}"""
code = code.replace(old_setObj, new_setObj)

# Remove setQuest calls from updateZoneQuests
old_zone = re.search(r'    // Update UI based on zone and progress\n.*?else if \(currentZone === "VIGHNA"\) \{\n.*?\}\n', code, re.DOTALL)
if old_zone:
    code = code.replace(old_zone.group(0), "    // UI is now driven entirely by the State Machine via setObjective()\n")
else:
    print("Could not find setQuest block in updateZoneQuests")

with open('src/main.js', 'w') as f:
    f.write(code)
    
print("Fixed UI duplication and conflicts")

import re

with open('src/main.js', 'r') as f:
    code = f.read()

# 1. Disable localStorage saving/loading for gameState so we always get a clean test
old_save = """function saveProgress() {
    localStorage.setItem('ganeshaGameState', JSON.stringify(gameState));
    localStorage.setItem('ganeshaQuestData', JSON.stringify(questData));
}"""

new_save = """function saveProgress() {
    // Disabled for buildathon to ensure clean playtests
}"""
code = code.replace(old_save, new_save)

old_load = """    if (localStorage.getItem('ganeshaGameState')) {
        gameState = JSON.parse(localStorage.getItem('ganeshaGameState'));
        questData = JSON.parse(localStorage.getItem('ganeshaQuestData'));
        player.position.set(gameState.checkpoint.x, 3, gameState.checkpoint.z);
    } else {
        player.position.set(0, 0, 10);
    }"""

new_load = """    // Always start fresh at the center stage
    player.position.set(0, 7, 15);
    gameState.stage = 'START';
    questData = { symbolsHit: 0, flagsFound: 0, offeringsFound: 0, diyasLit: 0 };
    setObjective("Speak to Ganapati Ji at the Central Shrine");"""
code = code.replace(old_load, new_load)

# 2. Make sure the arrow points to Ganesha during START too
old_target = "if (gameState.stage === 'TALK_TO_GANESHA') target = ganesha.position;"
new_target = "if (gameState.stage === 'START' || gameState.stage === 'TALK_TO_GANESHA') target = ganesha ? ganesha.position : {x:0, z:0};"
code = code.replace(old_target, new_target)

with open('src/main.js', 'w') as f:
    f.write(code)
    
print("Fixed save state corruption and arrow targeting")

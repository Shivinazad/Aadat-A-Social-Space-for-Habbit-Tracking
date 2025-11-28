function calculateLevel(xp) {
    if (xp < 80) return 1;
    if (xp < 200) return 2;
    if (xp < 400) return 3;
    if (xp < 800) return 4;
    if (xp < 1600) return 5;
    if (xp < 3200) return 6;
    if (xp < 6400) return 7;
    if (xp < 12800) return 8;
    if (xp < 25600) return 9;
    return 10 + Math.floor((xp - 25600) / 51200);
}

function getXpForNextLevel(currentLevel) {
    if (currentLevel === 1) return 80;
    if (currentLevel === 2) return 200;
    return Math.pow(2, currentLevel + 5); // 2^8=256, 2^9=512, etc.
}

module.exports = { calculateLevel, getXpForNextLevel };

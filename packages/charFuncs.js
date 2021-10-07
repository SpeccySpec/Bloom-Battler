// Require
const fs = require('fs');

// Path to 'data' folder
const dataPath = './data'

// Other Funcs
const utilityFuncs = require('./utilityFuncs.js');
const enemyFuncs = require('./enemyFuncs.js');
const attackFuncs = require('./attackFuncs.js');
const turnFuncs = require('./turnFuncs.js');

// Elements
const Elements = [
    "strike",
    "slash",
    "pierce",
    "fire",
    "water",
    "ice",
    "electric",
    "wind",
    "earth",
    "grass",
    "psychic",
    "poison",
    "nuclear",
    "metal",
    "curse",
    "bless",
    "almighty",

    "status",
    "heal",
    "passive"
]

const elementEmoji = {
	strike: "<:strike:877132710370480190>",
	slash: "<:slash:877132710345338960> ",
	pierce: "<:pierce:877132710315950101>",
	
	fire: "<:fire:877132709934301216>",
	water: "<:water:877132710471147571>",
	ice: "<:ice:877132710299181076>",
	electric: "<:electric:877132710194348072>",
	wind: "<:wind:877140815649075241>",
	earth: "<:earth:877140476409577482>",
	grass: "<:grass:877140500036075580>",
	psychic: "<:psychic:877140522530140171>",
	poison: "☠️",
	metal: "🔩",
	curse: "👻",
	bless: "⭐",
	nuclear: "☢",
	
	almighty: "💫",
	
	status: "🔰",
	heal: "➕",
	passive: "⏎"
}

// Item
const itemTypes = [
	"weapon",
	"heal",
	"healmp",
	"healhpmp"
]

const itemTypeEmoji = {
	weapon: "🔪",

	heal: "🌀",
	healmp: "⭐",
	healhpmp: "🔰"
}
	
// Status Effects
const statusEffects = [
    "burn",
	"bleed",
    "freeze",
    "paralyze",
	"dizzy",
	"sleep",
	"despair",
    "poison",
    "brainwash",
	"fear",
	"rage",
	"ego"
]

const statusEmojis = {
    burn: "🔥",
	bleed: "🩸",
    freeze: "❄",
    paralyze: "⚡",
	sleep: "😴",
	despair: "💦",
    poison: "☠️",
	dizzy: "💫",
    brainwash: "🦆",
	fear: "👁",
	rage: "💥",
	ego: "🎭"
}

// Enemy Habitats
const enmHabitats = [
	"grasslands",
	"forests",
	"swamps",
	"mountains",
	"caverns",
	"volcanic",
	"icy",
	"unknown"
]

// Creates a Character.
function writeChar(creator, name, health, magicpoints, attack, magic, perception, endurance, charisma, inteligence, agility, luck) {
    var charPath = dataPath+'/characters.json'
    var charRead = fs.readFileSync(charPath);
    var charFile = JSON.parse(charRead);

    charFile[name] = {
		name: name,

        // Only the owner can move this character, if they don't have admin permissions.
        owner: creator.id,

        // Level, HP and MP
        level: 1,
        hp: health,
        mp: magicpoints,
        maxhp: health,
        maxmp: magicpoints,
		basehp: health,
		basemp: magicpoints,

        // Status Effect
        status: "none",
        statusturns: 0,

        // Melee Attack
        melee: ["Strike Attack", "strike"],
		weapon: "none",

        // Main stats
        atk: attack,
        mag: magic,
        prc: perception,
        end: endurance,
        chr: charisma,
        int: inteligence,
        agl: agility,
        luk: luck,
        baseatk: attack,
        basemag: magic,
        baseprc: perception,
        baseend: endurance,
        basechr: charisma,
        baseint: inteligence,
        baseagl: agility,
        baseluk: luck,

        // Limit Break Meter, XP.
        lb: 0,
        xp: 0,
        maxxp: 100,

        // Affinities & Skills
        weak: [],
        resist: [],
        block: [],
        repel: [],
        drain: [],
        skills: [],
		
		// Quotes
		meleequote: [],
		physquote: [],
		magquote: [],
		strongquote: [],
		critquote: [],
		weakquote: [],
		missquote: [],
		blockquote: [],
		repelquote: [],
		drainquote: [],
		resistquote: [],
		hurtquote: [],
		lbquote: [],
		healquote: [],
		helpedquote: [],
		killquote: [],
		deathquote: [],
		
		// Bio Info
		bio: {
			species: "",
			age: "",
			info: "",
			
			backstory: "",
			likes: "",
			dislikes: "",
			fears: "",
			
			voice: "",
			theme: ""
		},
		
		// Trust
		trust: {}
    };

    fs.writeFileSync(charPath, JSON.stringify(charFile, null, '    '));
    console.log(`Written ${name}.`)
}

function writeTransformation(userDefs, trnsName, req, auto, hpBuff, atkBuff, magBuff, prcBuff, endBuff, chrBuff, intBuff, aglBuff, lukBuff) {
	if (!userDefs.transformations)
		userDefs.transformations = {};
	
	userDefs.transformations[trnsName] = {
		name: trnsName,
		requirement: req.toLowerCase(),
		automatic: auto,
		desc: '',
		
		hp: parseInt(hpBuff),
		atk: parseInt(atkBuff),
		mag: parseInt(magBuff),
		prc: parseInt(prcBuff),
		end: parseInt(endBuff),
		chr: parseInt(chrBuff),
		int: parseInt(intBuff),
		agl: parseInt(aglBuff),
		luk: parseInt(lukBuff),
		
		tp: 0,
		tpmax: 10,
		level: 1
	}
	
	console.log(`Written ${userDefs.name}'s ${trnsName} Transformation.`)
}

// FUNCTIONS
function transformChar(userDefs, transformation) {
	if (!userDefs.transformations)
		return false;
	
	if (!userDefs.transformations[transformation])
		return false;
	
	var transformDefs = userDefs.transformations[transformation]

	var addStats = [
		"hp",
		"atk",
		"mag",
		"prc",
		"end",
		"agl",
		"int",
		"chr",
		"luk"
	]

	userDefs.beforeTransformation = {}
	for (const i in addStats) {
		if (userDefs[addStats[i]] && transformDefs[addStats[i]]) {
			userDefs.beforeTransformation[addStats[i]] = userDefs[addStats[i]]
			userDefs[addStats[i]] += transformDefs[addStats[i]]
		}
	}
	
	userDefs.transformation = true
	return true
}

function mimic(userDefs, targDefs, turns) {
	var copyStats = [
		"name",
		"atk",
		"mag",
		"prc",
		"end",
		"agl",
		"int",
		"chr",
		"luk",
		"weak",
		"resist",
		"block",
		"repel",
		"drain",
		"skills",
		"lb1",
		"lb2",
		"lb3",
		"lb4"
	]

	for (const i in copyStats) {
		if (userDefs[copyStats[i]] && targDefs[copyStats[i]])
			userDefs[copyStats[i]] = targDefs[copyStats[i]];
	}
	
	userDefs.mimic = true
	userDefs.mimicturns = turns+1
	userDefs.name += ` (${userDefs.truename})`
	return true
}

function resetMimic(userDefs) {
	if (!userDefs.oldDefs) {return false}
	
	var copyStats = [
		"name",
		"atk",
		"mag",
		"prc",
		"end",
		"agl",
		"int",
		"chr",
		"luk",
		"weak",
		"resist",
		"block",
		"repel",
		"drain",
		"skills",
		"lb1",
		"lb2",
		"lb3",
		"lb4"
	]
	
	var oldDefs = userDefs.oldDefs
	for (const i in copyStats) {
		if (userDefs[copyStats[i]] && oldDefs[copyStats[i]])
			userDefs[copyStats[i]] = oldDefs[copyStats[i]];
	}
	
	delete userDefs.mimic
	delete userDefs.oldDefs
	delete userDefs.mimicturns
	return true
}

function knowsSkill(userDefs, skillName) {
	const skillPath = dataPath+'/skills.json'
	const skillRead = fs.readFileSync(skillPath);
	const skillFile = JSON.parse(skillRead);
	
	console.log('Knows ' + skillName + '?')
	for (const i in userDefs.skills) {
		if (userDefs.skills[i] == skillName) {
			console.log('true')
			return true
		}
	}
	
	console.log('false')
	return false
}

function hasPassive(userDefs, passivetype) {
	const skillPath = dataPath+'/skills.json'
	const skillRead = fs.readFileSync(skillPath);
	const skillFile = JSON.parse(skillRead);

	for (const skillNum in userDefs.skills) {
		var skillDefs = skillFile[userDefs.skills[skillNum]];
		if (skillDefs && skillDefs.type && skillDefs.type === "passive") {
			if (skillDefs.passive.toLowerCase() === passivetype.toLowerCase()) {
				console.log(`${userDefs.name} has the ${passivetype} passive.`)
				return true
			}
		}
	}
	
	return false
}

function isOpposingSide(userDefs, serverBtl) {
	if (!serverBtl) {
		console.log("Some serverBtl wasnt defined somewhere.")
		return false
	}

	for (const i in serverBtl.enemies.members) {
		if (serverBtl.enemies.members[i].id == userDefs.id) {
			return true
		}
	}

	return false
}

function hasShowTime(charDefs, targChar) {
	var showPath = dataPath+'/showtime.json'
    var showRead = fs.readFileSync(showPath);
    var showTimes = JSON.parse(showRead);
	
	var showTimeCheck;
	for (const i in showTimes) {
		if (showTimes[i].users) {
			for (const k in showTimes[i].users) {
				if (showTimes[i].users[k] == charDefs.name) {
					if (!targChar) {
						return showTimes[i]
					} else {
						showTimeCheck = showTimes[i]
					}
				}
			}
			
			if (showTimeCheck) {
				for (const k in showTimeCheck.users) {
					if (showTimeCheck.users[k] == targChar.name) {
						showTimeCheck = null
						return showTimes[i]
					}
				}
			}
		}
	}
	
	return null
}

function levelUp(charDefs) {
	if (charDefs.level+1 > 99) {
		charDefs.xp = charDefs.maxxp - 1
		console.log(`LevelUp: ${charDefs.name} cannot level up further.`)
		return false
	}

	charDefs.level = Math.min(99, charDefs.level+1);
	
	if (charDefs.basehp > 1) {
		charDefs.hp = Math.floor(charDefs.hp + (charDefs.basehp/10) + (charDefs.baseend/2))
		charDefs.maxhp = Math.floor(charDefs.maxhp + (charDefs.basehp/10) + (charDefs.baseend/2))
	}
	
	if (charDefs.basemp > 1) {
		charDefs.mp = Math.floor(charDefs.mp + (charDefs.basemp/10) + (charDefs.baseint/2))
		charDefs.maxmp = Math.floor(charDefs.maxmp + (charDefs.basemp/10) + (charDefs.baseint/2))
	}
	
	console.log(`LevelUp: ${charDefs.name} levelled up to level ${charDefs.level}.`)
	
	var highestStats = [
		["atk", charDefs.baseatk],
		["mag", charDefs.basemag],
		["prc", charDefs.baseprc],
		["end", charDefs.baseend],
		["chr", charDefs.basechr],
		["int", charDefs.baseint],
		["agl", charDefs.baseagl],
		["luk", charDefs.baseluk]
	];
	
	highestStats.sort(function(a, b) {return  a[1] - b[1]})

	for (const i in highestStats) {
		if (i > highestStats.length-4)
			charDefs[highestStats[i][0]]++;
		else if (i <= 1) {
			if (charDefs.level%3 == 1)
				charDefs[highestStats[i][0]]++;
		} else {
			if (charDefs.level%2 == 1)
				charDefs[highestStats[i][0]]++;
		}

		charDefs[highestStats[i][0]] = Math.min(99, charDefs[highestStats[i][0]])
	}

	charDefs.xp -= +charDefs.maxxp
	charDefs.maxxp = Math.floor((charDefs.maxxp-charDefs.baseint) + ((charDefs.maxxp-charDefs.baseint*2) / 6))
}

function levelDown(charDefs) {
	if (charDefs.level-1 < 1) {
		charDefs.xp = 1
		console.log(`LevelUp: ${charDefs.name} cannot level down further.`)
		return false
	}

	charDefs.level = Math.max(1, charDefs.level-1);

	if (charDefs.basehp > 1) {
		charDefs.hp = Math.floor(charDefs.hp - (charDefs.basehp/10) - (charDefs.baseend/2))
		charDefs.maxhp = Math.floor(charDefs.maxhp - (charDefs.basehp/10) - (charDefs.baseend/2))
	}
	
	if (charDefs.basemp > 1) {
		charDefs.mp = Math.floor(charDefs.mp - (charDefs.basemp/10) - (charDefs.baseint/2))
		charDefs.maxmp = Math.floor(charDefs.maxmp - (charDefs.basemp/10) - (charDefs.baseint/2))
	}
	
	console.log(`LevelUp: ${charDefs.name} levelled down to level ${charDefs.level}.`)
	
	var highestStats = [
		["atk", charDefs.baseatk],
		["mag", charDefs.basemag],
		["prc", charDefs.baseprc],
		["end", charDefs.baseend],
		["chr", charDefs.basechr],
		["int", charDefs.baseint],
		["agl", charDefs.baseagl],
		["luk", charDefs.baseluk]
	];
	
	highestStats.sort(function(a, b) {return  a[1] - b[1]})

	for (const i in highestStats) {
		if (i > highestStats.length-4)
			charDefs[highestStats[i][0]]--;
		else if (i <= 1) {
			if (charDefs.level%3 == 1) 
				charDefs[highestStats[i][0]]--;
		} else {
			if (charDefs.level%2 == 1) 
				charDefs[highestStats[i][0]]--;
		}

		charDefs[highestStats[i][0]] = Math.max(1, charDefs[highestStats[i][0]])
	}

	charDefs.xp = 0
	charDefs.maxxp = Math.ceil((charDefs.maxxp-charDefs.baseint) - ((charDefs.maxxp-charDefs.baseint*2) / 5))
}

// Trust
function initTrust(charDefs, targName) {
	if (!charDefs.trust) {
		charDefs.trust = {}
	}

	if (!charDefs.trust[targName]) {
		charDefs.trust[targName] = {
			value: 0,
			nextLevel: 100,
			level: 1
		}
	}
	
	return true
}

function trustLevel(charDefs, targName) {
	if (!charDefs.trust)
		charDefs.trust = {};

	if (!charDefs.trust[targName]) {
		charDefs.trust[targName] = {
			value: 0,
			nextLevel: 100,
			level: 1
		}
	}

	charDefs.trust[targName].level++;
	charDefs.trust[targName].value = Math.max(0, charDefs.trust[targName].value-charDefs.trust[targName].nextLevel);

	// Next Level Poggers!
	charDefs.trust[targName].nextLevel += 50;
}

// Export Functions
module.exports = {
	writeChar: function(creator, name, health, magicpoints, attack, magic, perception, endurance, charisma, inteligence, agility, luck) {
		writeChar(creator, name, health, magicpoints, attack, magic, perception, endurance, charisma, inteligence, agility, luck)
	},
	
	makeTransformation: function(userDefs, trnsName, req, auto, hpBuff, atkBuff, magBuff, prcBuff, endBuff, chrBuff, intBuff, aglBuff, lukBuff) {
		writeTransformation(userDefs, trnsName, req, auto, hpBuff, atkBuff, magBuff, prcBuff, endBuff, chrBuff, intBuff, aglBuff, lukBuff)
	},

	genChar: function(charDefs, leader) {
		var battlerDefs = {
			name: charDefs.name,
			truename: charDefs.name,
			team: "allies",
			id: 0,

			melee: charDefs.melee,
			level: charDefs.level,

			hp: charDefs.hp,
			mp: charDefs.mp,
			maxhp: charDefs.maxhp,
			maxmp: charDefs.maxmp,
			lb: 0,

			xp: charDefs.xp,
			maxxp: charDefs.maxxp,

			status: "none",
			statusturns: 0,

			atk: charDefs.atk,
			mag: charDefs.mag,
			prc: charDefs.prc,
			end: charDefs.end,
			chr: charDefs.chr,
			int: charDefs.int,
			agl: charDefs.agl,
			luk: charDefs.luk,
			weapon: charDefs.weapon ? charDefs.weapon : "none",
			guard: false,

			buffs: {
				atk: 0,
				mag: 0,
				prc: 0,
				end: 0,
				agl: 0
			},
			
			meleequote: charDefs.meleequote ? charDefs.meleequote : [],
			physquote: charDefs.physquote ? charDefs.physquote : [],
			magquote: charDefs.magquote ? charDefs.magquote : [],
			strongquote: charDefs.strongquote ? charDefs.strongquote : [],
			critquote: charDefs.critquote ? charDefs.critquote : [],
			missquote: charDefs.missquote ? charDefs.missquote : [],
			weakquote: charDefs.weakquote ? charDefs.weakquote : [],
			dodgequote: charDefs.dodgequote ? charDefs.dodgequote : [],
			resistquote: charDefs.resistquote ? charDefs.resistquote : [],
			blockquote: charDefs.blockquote ? charDefs.blockquote : [],
			repelquote: charDefs.repelquote ? charDefs.repelquote : [],
			drainquote: charDefs.drainquote ? charDefs.drainquote : [],
			hurtquote: charDefs.hurtquote ? charDefs.hurtquote : [],
			healquote: charDefs.healquote ? charDefs.healquote : [],
			helpedquote: charDefs.helpedquote ? charDefs.helpedquote : [],
			killquote: charDefs.killquote ? charDefs.killquote : [],
			deathquote: charDefs.deathquote ? charDefs.deathquote : [],
			lbquote: charDefs.lbquote ? charDefs.lbquote : [],
			lvlquote: charDefs.lvlquote ? charDefs.lvlquote : [],
			
			bio: charDefs.bio ? charDefs.bio : {info: "", backstory: "", voice: "", theme: ""},

			weak: charDefs.weak,
			resist: charDefs.resist,
			block: charDefs.block,
			repel: charDefs.repel,
			drain: charDefs.drain,
			skills: charDefs.skills,
			
			trust: charDefs.trust ? charDefs.trust : {}
		}
		
		if (charDefs.owner)
			battlerDefs.owner = charDefs.owner;
		else if (charDefs.npcchar)
			battlerDefs.npc = charDefs.npcchar;
		
		if (leader) {
			battlerDefs.leader = true;
			
			if (charDefs.leaderSkill)
				battlerDefs.leaderSkill = charDefs.leaderSkill;
		}
		
		if (charDefs.pet)
			battlerDefs.pet = charDefs.pet;
		
		// Insert Limit Breaks if they have them.
		if (charDefs.lb1)
			battlerDefs.lb1 = charDefs.lb1;
		if (charDefs.lb2)
			battlerDefs.lb2 = charDefs.lb2;
		if (charDefs.lb3)
			battlerDefs.lb3 = charDefs.lb3;
		if (charDefs.lb4)
			battlerDefs.lb4 = charDefs.lb4;
		
		return battlerDefs
	},

	mimic: function(userDefs, targDefs) {
		mimic(userDefs, targDefs)
	},

	resetMimic: function(userDefs) {
		resetMimic(userDefs)
	},

	knowsSkill: function(userDefs, skillName) {
		return knowsSkill(userDefs, skillName)
	},

	hasPassive: function(userDefs, passiveString) {
		return hasPassive(userDefs, passiveString)
	},
	
	isOpposingSide: function(userDefs, serverBtl) {
		return isOpposingSide(userDefs, serverBtl)
	},
	
	hasShowTime: function(charDefs, targChar) {
		return hasShowTime(charDefs, targChar)
	},
	
	lvlUp: function(charDefs) {
		levelUp(charDefs)
	},
	
	lvlDown: function(charDefs) {
		levelDown(charDefs)
	},
	
	initTrust: function(charDefs, targName) {
		initTrust(charDefs, targName)
	},
	
	trustLevel: function(charDefs, targName) {
		trustLevel(charDefs, targName)
	},
	
	trustUp: function(charDefs, targDefs, increment, server) {
		if (charDefs == targDefs || charDefs.name === targDefs.name)
			return false;

		if (!charDefs.trust)
			charDefs.trust = {};

		if (!targDefs.trust) 
			targDefs.trust = {};

		var btlPath = dataPath+'/battle.json'
		var btlRead = fs.readFileSync(btlPath);
		var btl = JSON.parse(btlRead);
		
		var charName = charDefs.truename ? charDefs.truename : charDefs.name
		var targName = targDefs.truename ? targDefs.truename : targDefs.name

		if (targDefs.trust && !btl[server].pvp) {
			if (!targDefs.trust[charName]) {
				initTrust(charDefs, targName)
				initTrust(targDefs, charName)
			}
			
			if (targDefs.trust[charName].dislike) {
				targDefs.trust[charName].dislike += increment
				if (targDefs.trust[charName].dislike >= 200)
					delete targDefs.trust[charName].dislike;
			} else {
				targDefs.trust[charName].value += increment
				if (targDefs.trust[charName].value < 0) {
					dislikeChar(targDefs, charName)
				} else {
					while (targDefs.trust[charName].value >= targDefs.trust[charName].nextLevel) {
						trustLevel(targDefs, charName)
					}
				}
			}
			
			charDefs.trust[targName] = targDefs.trust[charName];
			return true
		}
		
		// we'll get here if its pvp mode
		return false
	}
}
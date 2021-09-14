// Require
const fs = require('fs');

// Path to 'data' folder
const dataPath = './data'

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

function enemyThinker(userDefs, allySide, oppSide) {
	var skillPath = dataPath+'/skills.json'
	var skillRead = fs.readFileSync(skillPath);
	var skillFile = JSON.parse(skillRead);

	var possibleSkills = [];
	for (const i in userDefs.skills) {
		var skillDefs = skillFile[userDefs.skills[i]]
		
		if (!skillDefs.passive && skillDefs.type != "passive") {
			if (userDefs.status === "ego") {
				if (skillDefs.type != "heal") {possibleSkills.push(userDefs.skills[i])}
			} else {
				possibleSkills.push(userDefs.skills[i])
			}
		}
	}
	
	// Heal if under 1/5 hp
	var healSkills = [];
	for (const i in possibleSkills) {
		var skillDefs = skillFile[possibleSkills[i]]
		
		if (skillDefs.type === "heal" || skillDefs.terrain && skillDefs.terrain === "grassy" || skillDefs.drain)
			healSkills.push(possibleSkills[i]);
	}
	
	if (healSkills.length > 0 && userDefs.hp < Math.round(userDefs.maxhp/3)) {
		var healSkill = healSkills[Math.round(Math.random() * (healSkills.length-1))];
		for (const i in allySide) {
			if (allySide[i] == userDefs)
				return [healSkill, userDefs, i];
		}
		
		var targNum = Math.round(Math.random() * (allySide.length-1))
		if (allySide[targNum]) {
			while (allySide[targNum].hp <= 0) {
				targNum = Math.round(Math.random() * (allySide.length-1))
			}
		}
		return [healSkill, allySide[targNum], targNum];
	}

	// Finally, attack.
	var targNum = Math.round(Math.random() * (oppSide.length-1))	
	if (oppSide[targNum]) {
		while (oppSide[targNum].hp <= 0) {
			targNum = Math.round(Math.random() * (oppSide.length-1))
		}
	}

	var oppDefs = oppSide[targNum];

	var doneWeakCheck = false;
	var chosenSkill = possibleSkills[Math.round(Math.random() * (possibleSkills.length-1))];
	for (const i in userDefs.skills) {
		var skillDefs = skillFile[userDefs.skills[i]]

		// as not to make it unfair, don't ALWAYS go for weaknesses
		if (oppDefs.weak == skillDefs.weak && !doneWeakCheck) { 
			if (Math.random() < 0.55) {
				chosenSkill = possibleSkills[i]
			}
			
			doneWeakCheck = true
		}
	}
	
	console.log(`${chosenSkill} => ${oppDefs.name}`)
	return [chosenSkill, oppDefs, targNum]
}

// Export Functions
module.exports = {
	genEnm: function(enemy) {
		if (!enemy) {
			console.log(`Invalid enemy: ${enemy}.`)
			return undefined
		}
		
		var enmPath = dataPath+'/enemies.json'
		var enmRead = fs.readFileSync(enmPath);
		var enmFile = JSON.parse(enmRead);
		const enm = enmFile[enemy]

		var enemyDefs = {
			name: enemy,
			truename: enemy,
			team: "enemies",
			enemy: true,
			id: 0,

			maxhp: enm.hp,
			maxmp: enm.mp,
			hp: enm.hp,
			mp: enm.mp,
			lb: 0,
				
			boss: enm.boss ? true : false,
			miniboss: enm.miniboss ? true : false,
			finalboss: enm.finalboss ? true : false,
			diety: enm.diety ? true : false,

			atk: enm.atk,
			mag: enm.mag,
			prc: enm.prc,
			end: enm.end,
			chr: enm.chr,
			int: enm.int,
			agl: enm.agl,
			luk: enm.luk,
			weapon: "none",
			guard: false,

			status: "none",
			statusturns: 0,

			melee: enm.melee,
			skills: enm.skills,
			weak: enm.weak,
			resist: enm.resist,
			block: enm.block,
			repel: enm.repel,
			drain: enm.drain,

			buffs: {
				atk: 0,
				mag: 0,
				prc: 0,
				end: 0,
				agl: 0
			},
			
			limitbreak: enm.lb ? enm.lb : null,
			
			meleequote: enm.meleequote ? enm.meleequote : [],
			physquote: enm.physquote ? enm.physquote : [],
			magquote: enm.magquote ? enm.magquote : [],
			strongquote: enm.strongquote ? enm.strongquote : [],
			critquote: enm.critquote ? enm.critquote : [],
			weakquote: enm.weakquote ? enm.weakquote : [],
			missquote: enm.missquote ? enm.missquote : [],
			dodgequote: enm.dodgequote ? enm.dodgequote : [],
			resistquote: enm.resistquote ? enm.resistquote : [],
			blockquote: enm.blockquote ? enm.blockquote : [],
			repelquote: enm.repelquote ? enm.repelquote : [],
			drainquote: enm.drainquote ? enm.drainquote : [],
			hurtquote: enm.hurtquote ? enm.hurtquote : [],
			healquote: enm.healquote ? enm.healquote : [],
			helpedquote: enm.helpedquote ? enm.helpedquote : [],
			killquote: enm.killquote ? enm.killquote : [],
			deathquote: enm.deathquote ? enm.deathquote : [],
			lbquote: enm.lbquote ? enm.lbquote : [],
			
			trust: {}
		}
		
		return enemyDefs
	},
	
	thinkerFunc: function(charDefs, allyingSide, opposingSide) {
		return enemyThinker(charDefs, allyingSide, opposingSide)
	},
	
	encounteredEnemy: function(enmName, server) {
		var servPath = dataPath+'/Server Settings/server.json'
        var servRead = fs.readFileSync(servPath);
        var servFile = JSON.parse(servRead);
		
		if (!servFile[server].encountered) {
			servFile[server].encountered = []
			fs.writeFileSync(servPath, JSON.stringify(servFile, null, '    '));
		}
		
		for (const i in servFile[server].encountered) {
			if (servFile[server].encountered[i] == enmName)
				return true;
		}
		
		return false
	}
}
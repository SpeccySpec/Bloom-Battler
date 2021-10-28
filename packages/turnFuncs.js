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
	bless: "<:bless:903369721980813322>",
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

///////////////
// Functions //
///////////////
function setUpBattleVars(btl) {
	if (!btl.allies.backup)
		btl.allies.backup = [];
	if (!btl.enemies.backup)
		btl.allies.backup = [];

	btl.battling = true;
	btl.battleteam = "none";
	btl.battleteam2 = "none";
	btl.battlechannel = "none";
	btl.doturn = -1;
	btl.turn = 1;
	
	btl.pvp = false;
	btl.pvpmode = "none";

	btl.colosseum[0] = false;
	btl.colosseum[1] = 0;
	btl.colosseum[2] = "none";
	
	btl.weather = "clear";
	btl.terrain = "normal"
}

function clearBTL(btl) {
	btl.enemies.members = [];
	btl.enemies.backup = [];
    btl.allies.members = [];
    btl.allies.backup = [];
    btl.battlechannel = "none";
	btl.battleteam = "none";
	btl.battleteam2 = "none";
	btl.battling = false;
	btl.doturn = 0;
	btl.turn = 0;

	btl.pvp = false;
	btl.pvpmode = "none";

	btl.colosseum[0] = false;
	btl.colosseum[1] = 0;
	btl.colosseum[2] = "none";
	
	btl.weather = "clear";
	btl.terrain = "normal"
}

function hasPassiveCopyLOL(userDefs, passivetype) {					
	for (const skillNum in userDefs.skills) {
		const skillPath = dataPath+'/skills.json'
		const skillRead = fs.readFileSync(skillPath);
		const skillFile = JSON.parse(skillRead);

		var skillDefs2 = skillFile[userDefs.skills[skillNum]];
		if (skillDefs2 && skillDefs2.type && skillDefs2.type === "passive") {
			if (skillDefs2.passive.toLowerCase() === passivetype.toLowerCase()) {
				console.log(`${userDefs.name} has the ${passivetype} passive.`)
				return true
			}
		}
	}
	
	return false
}

function healPassives(charDefs) {
	var passiveMsg = ''
	if (hasPassiveCopyLOL(charDefs, 'affinitypoint')) {
		if (!charDefs.affinitypoint) {
			charDefs.affinitypoint = 0
		}

		if (charDefs.affinitypoint < 10) {
			passiveMsg += `\n${charDefs.name} got an affinity point!`
			charDefs.affinitypoint = Math.min(10, charDefs.affinitypoint+1);
			if (charDefs.affinitypoint >= 10) {
				passiveMsg += ' (MAX)'
			}
		}
	}
	
	return passiveMsg
}

// Export Functions
module.exports = {
	clearBTL: function(serverBtl) {
		clearBTL(serverBtl);
	},
	
	limitBreaks: function(server) {
		var servPath = dataPath+'/Server Settings/server.json'
		var servRead = fs.readFileSync(servPath);
		var servFile = JSON.parse(servRead);
		var servDefs = servFile[server]
		
		return servDefs.limitbreaks ? true : false
	},
	
	oneMores: function(server) {
		var servPath = dataPath+'/Server Settings/server.json'
		var servRead = fs.readFileSync(servPath);
		var servFile = JSON.parse(servRead);
		var servDefs = servFile[server]
		
		return servDefs.onemores ? true : false
	},
	
	showTimes: function(server) {
		var servPath = dataPath+'/Server Settings/server.json'
		var servRead = fs.readFileSync(servPath);
		var servFile = JSON.parse(servRead);
		var servDefs = servFile[server]
		
		return servDefs.showtimes ? true : false
	},
	
	healPassives: function(charDefs) {
		return healPassives(charDefs)
	},
	
	setUpBattleVars: function(servBtl) {
		setUpBattleVars(servBtl)
	}
}
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

function clearBTL(btl) {
	btl.enemies.members = [];
    btl.allies.members = [];
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
	}
}
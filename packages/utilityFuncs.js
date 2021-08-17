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

const adminList = [
	"516359709779820544",
	"532291526634635285"
]

function objClone(source) {
	if (Object.prototype.toString.call(source) === '[object Array]') {
		var clone = []

		for (var i = 0; i < source.length; i++) {
			clone[i] = objClone(source[i])
		}

		return clone
	} else if (typeof(source)=="object") {
		var clone = {}

		for (var prop in source) {
			if (source.hasOwnProperty(prop)) {
				clone[prop] = objClone(source[prop])
			}
		}

		return clone
	} else {
		return source
	}
}

// Export Functions
module.exports = {
	validType: function(type) {
		for (const i in Elements) {
			if (type === Elements[i]) {
				return true
			}
		}

		return false
	},
	
	cloneObj: function(source) {
		return objClone(source)
	},
	
	orderSkills: function() {
		var skillPath = dataPath+'/skills.json'
		
		try {
			var skillRead = fs.readFileSync(skillPath);
		} catch(err) {
			console.error(err);
		}

		var skillFile = JSON.parse(skillRead);
		
		var skillArray = []
		for (const i in skillFile) {
			if (!skillFile[i].name) {skillFile[i].name = `${i}`}
			
			if (skillFile[i].type != "status" && skillFile[i].type != "heal" && skillFile[i].type != "passive") {
				if (!skillFile[i].target) {skillFile[i].target = "one"}
				if (!skillFile[i].atktype) {skillFile[i].atktype = "physical"}
				if (skillFile[i].status) {skillFile[i].status = skillFile[i].status.toLowerCase()}
				skillFile[i].target = skillFile[i].target.toLowerCase()
				skillFile[i].atktype = skillFile[i].atktype.toLowerCase()
			}

			skillArray.push([i, skillFile[i]])
		}
		
		const elementOrder = {
			strike: 1,
			slash: 2,
			pierce: 3,
			
			fire: 4,
			water: 5,
			ice: 6,
			electric: 7,
			wind: 8,
			earth: 9,
			grass: 10,
			psychic: 11,
			poison: 12,
			metal: 13,
			nuclear: 14,
			curse: 15,
			bless: 16,
			
			almighty: 17,
			
			status: 18,
			heal: 19,
			passive: 20,
		}
		
		/*
		const targetTypeOrder = {
			one: 1,
			allopposing: 2,
			oneally: 3,
			allallies: 4,
			everyone: 5,
			caster: 6
		}
		*/
		
		skillArray.sort(function(a, b) {return a[1].pow - b[1].pow});
		skillArray.sort(function(a, b) {return elementOrder[a[1].type] - elementOrder[b[1].type]});
		
		skillFile = {}
		for (const i in skillArray) {
			skillFile[skillArray[i][0]] = objClone(skillArray[i][1])
		}

		console.log("Ordered skills.json.")
		fs.writeFileSync(skillPath, JSON.stringify(skillFile, null, '    '));
	},
	
	isBanned: function(id, server) {
		var servPath = dataPath+'/Server Settings/server.json'
		var servRead = fs.readFileSync(servPath);
		var servFile = JSON.parse(servRead);
		
		if (!servFile[server] || !servFile[server].banned) {
			return false
		}

		var servDefs = servFile[server]
		for (const i in servFile[server].banned) {
			if (id === servFile[server].banned) {
				return true
			}
		}
		
		return false
	},
	
	AdminList: adminList,
	
	RPGBotAdmin: function(id) {
		for (const i in adminList) {
			if (id === adminList[i]) {
				return true
			}
		}
		
		return false	
	}
}
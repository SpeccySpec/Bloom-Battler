// Require
const Discord = require('discord.js');
const Canvas = require('canvas');

const iceCreamFlavors = [
    'Chocolate',
    'Vanilla',
    'Acal Berry',
    'Almond',
    'Mojito',
    'Gingerbread',
    'Salted Caramel',
    'Caramel',
    'Marshmallow',
    'Raspberry',
    'Coffee',
    'Mocha',
    'Lamington',
    'Saffron',
    'Banana Foster',
    'Buttercake',
    'Rainbow',
    'Garlic',
    'Strawberry',
    'Orange',
    'Lemon',
    'Lime',
    'Apple',
    'Sour Apple',
    'Blueberry',
    'Blackberry',
    'Cherry',
    'Bear Claw',
    'Cinnamon',
    'Toast',
    'Cinnamon Toast',
    'Kaffir Lime',
    'Margarita',
    'Italian Cherry',
    'Butter',
    'Spumoni',
    'Asparagus',
    'Birthday Cake',
    'Mint',
    'Mint Chocolate Chip',
    'Banana',
    "``you``",
    'Pistachio',
    'Leaf',
    `Mystery`,
    'Air',
    'Sewage',
    'Grape',
    'Mango',
    "``your mom lol``",
    'Neapolitan',
    'Red Velvet',
    'Blue Moon',
    'Carrot Cake',
    'Spaghetti',
    'Superman',
    'Black Sesame',
    'Licorice',
    'Peppermint',
    'Jalapeno',
    'Wine',
    'Straciatella',
    'Lucuma',
    'Ube'
]

async function iceCream(scoops, repeatScoops, message) {

    var iceCreamInput = [...iceCreamFlavors]
    let iceCreamResults = []
    var iceCreamFlavorList = ''

    for (var i = 1; i <= scoops; i++) {

        if (iceCreamInput.length < 1) {
            iceCreamInput = [...iceCreamFlavors]
            console.log(`Oops. Ran out of ice cream flavors. Repeating the list.`)
        }

        var flavorNum = Math.floor(Math.random() * iceCreamInput.length)

        iceCreamResults.push(iceCreamInput[flavorNum])
        iceCreamFlavorList += `\n- ${iceCreamInput[flavorNum]}`

        if (repeatScoops == 'false')
            iceCreamInput.splice(flavorNum, 1)
    }

    console.log(`Flavors: ${iceCreamResults}`)

    var filtered = new Set(iceCreamResults);
	var iceCreamFiltered = [...filtered]
    var iceCreamName = iceCreamFiltered.join(' ');

    ///////////
    // IMAGE //
    ///////////

    const canvas = Canvas.createCanvas(201, 240 + (62 * iceCreamResults.length));
    const context = canvas.getContext('2d');

	// Since the image takes time to load, you should await it
	const cone = await Canvas.loadImage('./images/foodgenerators/icecream/cone.png')

	// This uses the canvas dimensions to stretch the image onto the entire canvas
    var coneY = canvas.height - 240
	context.drawImage(cone, 20, coneY, 161, 231);

    var lastScoopY
    for (var i = 1; i <= scoops; i++) {
        const scoop = await Canvas.loadImage(`./images/foodgenerators/icecream/scoopflavors/${iceCreamResults[iceCreamResults.length - i]}.png`)

        lastScoopY = coneY - 57 - 62 * (i-1)
        context.drawImage(scoop, 20, lastScoopY, 161, 155);
    }

	// Use the helpful Attachment class structure to process the file for you
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'icecream-result.png');

    //////////////////
    // Last Touches //
    //////////////////

    if (iceCreamResults.length > 8) {
        embed = new Discord.MessageEmbed()
			.setColor('#F0B2ED')
			.setTitle(`Current Ice Cream Flavors:`)
            .setDescription(`${iceCreamFlavorList}`)
			.setFooter(`Ice Cream`);

        message.author.send({embeds: [embed]})
        iceCreamFlavorList = `*Too many scoops in this field.\nYou should get a DM with the flavor list.*`
    }

    if (scoops < 1) {
        iceCreamFlavorList = `\nNone.`
        iceCreamName = `Cone`
    }

    if (iceCreamName.length > 255)
        iceCreamName = "Title too long to process."

    embed = new Discord.MessageEmbed()
			.setColor('#F0B2ED')
			.setTitle(`${iceCreamName}`)
            .addFields(
                { name: 'Scoops', value: `${scoops}`, inline: true },
                { name: 'Flavors', value: `${iceCreamFlavorList}`, inline: true },
            )
            .setImage(`attachment://icecream-result.png`)
			.setFooter(`Ice Cream`);

    return message.channel.send({embeds: [embed], files: [attachment]})
}

// Export Functions
module.exports = {
	getIceCream: function (scoops, repeatScoops, message) {
		return iceCream(scoops, repeatScoops, message)
	},
}
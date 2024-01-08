import { ApplicationCommandStructure, CommandInteraction, Constants } from "@projectdysnomia/dysnomia";

import { ReCount, Command } from "..";

import { CreateEmbed } from "../extras/functions/embeds";
import { EmbedColors } from "../extras/types/embeds";

export default {

    Name: "ping",
    Payload: { 

        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        name: "ping",
        description: "Use this command to test ReCount's latency to Discord's API."

    } satisfies  ApplicationCommandStructure,

    Run: async (Client: ReCount, Interaction: CommandInteraction) => {

        const Ping = Client.shards.get(0)?.latency;

        const Embed = CreateEmbed({ 

            title: `Ping is ${Ping} MS`,
            description: "This is the latency between ReCount and Discord's API.",
            color: EmbedColors.GREEN,
 
            author: { name: "Network Health" }

        })

        Interaction.createMessage({ embeds: [Embed], flags: 64 }).catch(() => null);
        
    }

} satisfies Command;
import { ApplicationCommandStructure, CommandInteraction, Constants } from "@projectdysnomia/dysnomia";

import { ReCount, Command } from "..";

import { CreateEmbed } from "../extras/functions/embeds";
import { EmbedColors } from "../extras/types/embeds";
import { Guild } from "../extras/types/database/guild";

export default {

    Name: "channel",
    Payload: { 

        dmPermission: false,
        defaultMemberPermissions: Constants.Permissions.administrator,

        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        name: "channel",
        description: "Server admins can use this command to change the counting channel.",

        options: [

            {

                type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                name: "channel",
                description: "Use this option to select the new channel ReCount listens for counting in.",
                required: true,

            }

        ]


    } satisfies  ApplicationCommandStructure,

    Run: async (Client: ReCount, Interaction: CommandInteraction) => {

        const ChannelID = (Interaction.data.options || [])[0]?.value || null as string | null;

        if (typeof ChannelID != "string" || !Interaction.guildID) { return; } // For type safety

        const ResolvedGuild = Client.guilds.get(Interaction.guildID) || null;

        const DBGuild = new Guild(Interaction.guildID, ResolvedGuild?.name || "Unknown Name");

        await DBGuild.Load();

        DBGuild.Settings.CountingChannelID = ChannelID;

        await DBGuild.Save();
        
        const Embed = CreateEmbed({ 

            title: `Updated Counting Channel`,
            description: `The counting channel has been updated to <#${ChannelID}>\nOnly numbers sent in this channel will be counted.`,
            color: EmbedColors.GREEN,
 
            author: { name: "Server Settings" }

        })

        Interaction.createMessage({ embeds: [Embed], flags: 64 }).catch(() => null);
        
    }

} satisfies Command;
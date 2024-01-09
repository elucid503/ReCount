import { ApplicationCommandStructure, CommandInteraction, Constants } from "@projectdysnomia/dysnomia";

import { ReCount, Command, DB } from "..";

import { CreateEmbed } from "../extras/functions/embeds";
import { EmbedColors } from "../extras/types/embeds";
import { Guild } from "../extras/types/database/guild";

export default {

    Name: "count",
    Payload: { 

        dmPermission: false,

        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        name: "count",
        description: "Use this command to see what number the count is at, and how the server is doing."

    } satisfies  ApplicationCommandStructure,

    Run: async (Client: ReCount, Interaction: CommandInteraction) => {

        if (!Interaction.guildID) { return; } // For type safety

        const ResolvedGuild = Client.guilds.get(Interaction.guildID) || null;

        const DBGuild = new Guild(Interaction.guildID, ResolvedGuild?.name || "Unknown Name");

        await DBGuild.Load();

        const CurrentNumber: number = DBGuild.Stats.CurrentNumber;
        const HighestNumber: number = DBGuild.Stats.HighestNumber;
        const LastMemberID: string = DBGuild.Stats.LastUserCounted;

        const CountingChannel: string = DBGuild.Settings.CountingChannelID;

        let RankAmongstServers = 0;

        // Load all servers current number

        const ArrayOfGuilds = await DB.collection("guilds").find({}).toArray();

        ArrayOfGuilds.sort((a, b) => b.Stats.CurrentNumber - a.Stats.CurrentNumber);

        for (let i = 0; i < ArrayOfGuilds.length; i++) {

            if (ArrayOfGuilds[i].ID === Interaction.guildID) {

                RankAmongstServers = i + 1;

                break;

            }

        }

        const Embed = CreateEmbed({ 

            title: `The Next Number is **${CurrentNumber + 1}**`,
            description: `The last member to count was ${LastMemberID === "0" ? "an unknown member." : `<@${LastMemberID}>`}\nThey cannot count until a new member counts.`,

            fields: [

                { 

                    name: "Record",
                    value: HighestNumber.toString(),
                    inline: true

                },

                { 

                    name: "Global Rank",
                    value: `${RankAmongstServers.toLocaleString()} / ${ArrayOfGuilds.length.toLocaleString()}`,
                    inline: true

                },

                { 

                    name: "Channel",
                    value: `${CountingChannel === "0" ? "None, Yet" : `<#${CountingChannel}>`}`,
                    inline: true

                }

            ],
 
            author: { name: "Server Stats" }

        })

        Interaction.createMessage({ embeds: [Embed], flags: 64 }).catch(() => null);
        
    }

} satisfies Command;
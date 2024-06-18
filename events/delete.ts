import { Message } from "@projectdysnomia/dysnomia";
import { ReCount, Event } from "..";

import { Guild } from "../extras/types/database/guild";
import { CreateEmbed } from "../extras/functions/embeds";
import { EmbedColors } from "../extras/types/embeds";

export default {

    Name: "messageDelete",

    Run: async (Client: ReCount, ...Args: any[]) => {

        const Message = Args[0] as Message;

        if (!Message || !Message?.author) return;

        if (!Message.guildID) return;

        const ResolvedGuild = Client.guilds.get(Message.guildID) || null;
        
        const DBGuild = new Guild(Message.guildID, ResolvedGuild?.name || "Unknown Name");

        await DBGuild.Load();

        const CountingChannel = DBGuild.Settings.CountingChannelID;

        if (Message.channel.id !== CountingChannel) return;

        if (Object.values(Message.reactions).find(Reaction => Reaction.me)) {

            // Send a warning that a valid number was deleted

            const Channel = Message.channel;
            const NextNumber = DBGuild.Stats.CurrentNumber + 1;

            const Embed = CreateEmbed({

                title: "Message Deleted",
                description: `A message containing a number was deleted.\nAs a reminder, the next number is **${NextNumber}**`,

                color: EmbedColors.YELLOW,

                author: { name: "Notifications" }

            })

            await Channel.createMessage({ embeds: [Embed] }).catch(() => { });

        }

    }

} satisfies Event;
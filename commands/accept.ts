import { ApplicationCommandStructure, CommandInteraction, Constants } from "@projectdysnomia/dysnomia";

import { ReCount, Command} from "..";

import { CreateEmbed, ErrorEmbed } from "../extras/functions/embeds";
import { EmbedColors, ErrorLevels } from "../extras/types/embeds";
import { Guild } from "../extras/types/database/guild";

export default {

    Name: "accept",
    Payload: { 

        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        name: "accept",
        description: "Use this command to accept a challenge a member created against you."

    } satisfies  ApplicationCommandStructure,

    Run: async (Client: ReCount, Interaction: CommandInteraction) => {

        if (!Interaction.user?.id) { return; } // For type safety

        const AllChallenges = Client.ActiveChallenges.values();

        const Challenge = [...AllChallenges].find((Challenge) => Challenge.Opponent == Interaction.user?.id);

        if (!Challenge) {

            const Embed = ErrorEmbed({

                error: "No Challenge Found",
                message: "You do not have any challenges to accept.",

                severity: ErrorLevels.WARNING

            })

            Interaction.createMessage({ embeds: [Embed], flags: 64 }).catch(() => null);

            return;

        }

        Challenge.Accepted = true;

        Challenge.Start(Client);

        const ResolvedGuild = Client.guilds.get(Challenge.GuildID);

        const DBGuild = new Guild(Challenge.GuildID, ResolvedGuild?.name || "Unknown Name");

        await DBGuild.Load();

        const CountingChannel = DBGuild.Settings.CountingChannelID;
        const Creator = await Client.getRESTUser(Challenge.Creator).catch(() => null);

        const StartedEmbed = CreateEmbed({

            title: "Challenge Started",
            description: `Your challenge against ${Creator?.username} has started.\nYou have 1 hour to count as much as you can in <#${CountingChannel}>. Good luck!`,
            color: EmbedColors.GREEN,

            author: { name: "ReCount Minigames" }

        });

        Interaction.createMessage({ embeds: [StartedEmbed] }).catch(() => null);

    }

} satisfies Command;
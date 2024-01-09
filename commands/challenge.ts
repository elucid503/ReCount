import { ApplicationCommandStructure, CommandInteraction, Constants } from "@projectdysnomia/dysnomia";

import { ReCount, Command } from "..";

import { CreateEmbed } from "../extras/functions/embeds";
import { EmbedColors } from "../extras/types/embeds";
import { Challenge } from "../extras/types/database/challenge";

export default {

    Name: "challenge",
    Payload: { 

        dmPermission: false,

        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        name: "challenge",
        description: "Use this command to challenge a member to a 1v1 Count-Off.",

        options: [

            {

                type: Constants.ApplicationCommandOptionTypes.USER,
                name: "member",
                description: "Use this option to specify who you wish to compete against. They must agree first.",
                required: true,

            }

        ]


    } satisfies  ApplicationCommandStructure,

    Run: async (Client: ReCount, Interaction: CommandInteraction) => {

        const MemberID = (Interaction.data.options || [])[0]?.value || null as string | null;

        if (typeof MemberID != "string" || !Interaction.guildID || !Interaction.user?.id) { return; } // For type safety

        const Member = await Client.getRESTUser(MemberID).catch(() => null);

        const DBChallenge = new Challenge(Interaction.guildID, Interaction.user!.id, MemberID);

        await DBChallenge.Save();

        Client.ActiveChallenges.set(Interaction.user.id, DBChallenge);
        
        const Embed = CreateEmbed({ 

            title: `${Interaction.user.username} Challanged ${Member?.username}`,
            description: `Here are the ground rules for the 1v1 Count-Off.\n- Both ${Interaction.user.username} and ${Member?.username} will have 1 Hour\n- ${Member?.username} must accept the challenge first via DMs\n- Only counting in this server will affect the challenge\n- The member with the most valid counts wins\n- If both members count the same amount, it is a tie\n\nPlease wait for ${Member?.username} to accept. We'll notify you when they do. **Good luck**!`,
            color: EmbedColors.GREEN,
 
            author: { name: "ReCount Minigames" }

        })

        Interaction.createMessage({ embeds: [Embed] }).catch(() => null);

        const Channel = await Member?.getDMChannel().catch(() => null);

        if (!Channel) { return; }

        const ChallengeEmbed = CreateEmbed({

            title: `${Interaction.user.username} Challanged You`,
            description: `You have been challanged by ${Interaction.user.username} to a 1v1 Count-Off.\n\nHere are the ground rules for the challange.\n- Both ${Interaction.user.username} and ${Member?.username} will have 1 Hour\n- ${Member?.username} must accept the challenge first via DMs\n- Only counting in this server will affect the challenge\n- The member with the most valid counts wins\n- If both members count the same amount, it is a tie\n\nPlease use the \`/accept\` command to accept the challenge.\nYou have 1 hour to accept. **Good luck**!`,
            color: EmbedColors.GREEN,

        });

        Channel.createMessage({ embeds: [ChallengeEmbed] }).catch(() => null);
        
    }

} satisfies Command;
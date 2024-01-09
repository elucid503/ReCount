import { Message, TextChannel } from "@projectdysnomia/dysnomia";
import { ReCount, Event } from "..";

import { Guild } from "../extras/types/database/guild";
import { CreateEmbed } from "../extras/functions/embeds";

import { Emoji } from "../configs/misc.json";
import { EmbedColors } from "../extras/types/embeds";

const Regexes = { 

    Number: new RegExp(/^[0-9]+$/) 

}

const SpecialOutliers = [10, 69, 420, 1337];

export default {

    Name: "messageCreate",

    Run: async (Client: ReCount, ...Args: any[]) => {

        const Message = Args[0] || null as Message | null;

        if (!Message || !Message?.author) { return; }

        if (Message.author.bot || !Message.guildID) { return; }

        const ResolvedGuild = Client.guilds.get(Message.guildID) || null;
        
        const DBGuild = new Guild(Message.guildID, ResolvedGuild?.name || "Unknown Name");

        await DBGuild.Load();

        let CountingChannel = DBGuild.Settings.CountingChannelID;

        if (CountingChannel === "0") {

            // If message is in a channel named "counting", we'll use it

            if (Message.channel instanceof TextChannel) {

                if (Message.channel.name.toLowerCase() === "counting") {

                    DBGuild.Settings.CountingChannelID = Message.channel.id;

                    CountingChannel = Message.channel.id;

                    await DBGuild.Save();

                }

            }

        }

        if (Message.channel.id !== CountingChannel) { return; }

        if (!Regexes.Number.test(Message.content)) { return; }

        const Count = parseInt(Message.content);

        const LastCount = DBGuild.Stats.CurrentNumber;

        const LastUserCounted = DBGuild.Stats.LastUserCounted;
        const UserCounting = Message.author.id;

        const Results = { 

            Passed: true,
            Reason: "Unknown"

        }

        if (Count === LastCount + 1) {

            Results.Passed = true;
            Results.Reason = "Correct";

        } else {

            Results.Passed = false;
            Results.Reason = "The incorrect number was sent.";

        }

        if (LastUserCounted === UserCounting) {

            Results.Passed = false;
            Results.Reason = "The same user counted twice in a row.";

        }

        if (Results.Passed) {

            DBGuild.Stats.CurrentNumber = Count;
            DBGuild.Stats.LastUserCounted = UserCounting;

            const HighestNumber = DBGuild.Stats.HighestNumber;

            if (Count > HighestNumber) {

                DBGuild.Stats.HighestNumber = Count;

            }

            await DBGuild.Save();

        }

        else { 

            DBGuild.Stats.CurrentNumber = 0;
            DBGuild.Stats.LastUserCounted = "0";

            await DBGuild.Save();

        }

        if (!Results.Passed) {

            Message.addReaction(`Incorrect:${Emoji.Incorrect}`).catch(() => { });
            
            // Check for challenges

            const AllChallenges = Client.ActiveChallenges.values();

            const Challenge = [...AllChallenges].find((Challenge) => Challenge.Accepted && Challenge.GuildID == Message.guildID);

            // Increment stats if exists

            if (Challenge) {

                const Stats = Challenge.Stats.get(Message.author.id);

                if (Stats) {

                    Stats.NumberOfFailedCounts++;

                }

            }

            const Channel = Message.channel

            const Embed = CreateEmbed({

                title: "Count Reset",
                description: `${Results.Reason}\nThe count has been reset; the next number is 1.`,

                color: EmbedColors.RED,

                author: { name: "Notifications" }

            })

            await Channel.createMessage({ embeds: [Embed] }).catch(() => { });

        }

        else {

            Message.addReaction(`Correct:${Emoji.Correct}`).catch(() => { });

            // Check if special (every 50 or 100, or in SpecialOutliers)

            const Special = (Count % 50 === 0 || Count % 100 === 0 || SpecialOutliers.includes(Count));

            if (Special) {

                Message.addReaction(`Special:${Emoji.Special}`).catch(() => { });

            }

            // Check for challenges

            const AllChallenges = Client.ActiveChallenges.values();

            const Challenge = [...AllChallenges].find((Challenge) => Challenge.Accepted && Challenge.GuildID == Message.guildID);

            // Increment stats if exists

            if (Challenge) {

                const Stats = Challenge.Stats.get(Message.author.id);

                if (Stats) {

                    Stats.NumberOfSuccessfulCounts++;

                }

            }
            
        }
            
    }

} satisfies Event;
import Romans from "romans";

import { Message, TextChannel } from "@projectdysnomia/dysnomia";
import { ReCount, Event } from "..";

import { Guild } from "../extras/types/database/guild";
import { CreateEmbed } from "../extras/functions/embeds";

import { Emoji } from "../configs/misc.json";
import { EmbedColors } from "../extras/types/embeds";

const Regexes = { 

    Number: new RegExp(/^[0-9]+$/),
    Romans: new RegExp(/^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/)

}

const SpecialOutliers = [10, 42, 69, 420, 1337];

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

        if (!Regexes.Number.test(Message.content) && !Regexes.Romans.test(Message.content)) { return; }

        const Count = parseInt(Message.content) || Romans.deromanize(Message.content);

        const LastCount = DBGuild.Stats.CurrentNumber;

        const LastUserCounted = DBGuild.Stats.LastUserCounted;
        const UserCounting = Message.author.id;

        const Results = { 

            Passed: true,
            Reason: "Unknown",
            WasRomanNumeral: Regexes.Romans.test(Message.content)

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

            if (Results.WasRomanNumeral) {

                Message.addReaction(`Romans:${Emoji.Romans}`).catch(() => { });

            }

            // Check if special (every 50 or 100, or in SpecialOutliers)

            const Special = (Count % 50 === 0 || Count % 100 === 0 || SpecialOutliers.includes(Count));

            if (Special) {

                Message.addReaction(`Special:${Emoji.Special}`).catch(() => { });

            }
            
        }
            
    }

} satisfies Event;
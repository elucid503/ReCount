import { TextChannel } from "@projectdysnomia/dysnomia";
import { DB, ReCount } from "../../../"
import { CreateEmbed } from "../../functions/embeds";
import { Log } from "../../functions/logging";
import { EmbedColors } from "../embeds";
import { LoggingColors } from "../logging";
import { Guild } from "./guild";

interface ChallengeStats {

    NumberOfSuccessfulCounts: number;
    NumberOfFailedCounts: number;

}

export class Challenge { 

    public GuildID: string;

    public Creator: string;
    public Opponent: string;

    public Stats: Map<string, ChallengeStats>;

    public Accepted: boolean = false;
    
    constructor(GuildID: string, Creator: string, Opponent: string, client: ReCount) {

        this.GuildID = GuildID;

        this.Creator = Creator;
        this.Opponent = Opponent;

        this.Stats = new Map();

        this.Stats.set(Creator, { NumberOfSuccessfulCounts: 0, NumberOfFailedCounts: 0 });
        this.Stats.set(Opponent, { NumberOfSuccessfulCounts: 0, NumberOfFailedCounts: 0 });

        this.Accepted = false;

        setTimeout(() => {

            if (!this.Accepted) {

                this.Delete(client);

            }

        }, 3600000 ); // 1 Hour 

    }

    public async Delete(client: ReCount): Promise<boolean> {

        client.ActiveChallenges.delete(this.GuildID);

        return true;
        
    }

    public async Start(client: ReCount): Promise<boolean> {

        // Set ending timeout

        setTimeout(() => {

            this.End(client);

        } // 5 minutes
            
        , 150000);

        // Notify users

        const Creator = await client.getRESTUser(this.Creator);
        const Opponent = await client.getRESTUser(this.Opponent);

        const NotificationEmbed = CreateEmbed({

            title: `Challenge Accepted!`,
            description: `Your challenge against ${Opponent.username} has been accepted.\nYou have 1 hour to count as much as you can. Good luck!`,
            color: EmbedColors.GREEN,

            author: { name: "ReCount Minigames" }

        });

        const CreatorChannel = await Creator.getDMChannel().catch(() => null);

        if (CreatorChannel) { CreatorChannel.createMessage({ embeds: [NotificationEmbed] }).catch(() => null); }
        
        return true;

    }

    public async End(client: ReCount): Promise<boolean> {

        // Delete challenge

        this.Delete(client);

        // Send results

        const ResolvedGuild = client.guilds.get(this.GuildID);

        const DBGuild = new Guild(this.GuildID, ResolvedGuild?.name || "Unknown Name");

        await DBGuild.Load();

        const ChannelID = DBGuild.Settings.CountingChannelID;

        const Channel = await client.getRESTChannel(ChannelID).catch(() => null);

        if (!Channel || !(Channel instanceof TextChannel)) { return false; }

        const CreatorStats = this.Stats.get(this.Creator);
        const OpponentStats = this.Stats.get(this.Opponent);

        const Creator = await client.getRESTUser(this.Creator);
        const Opponent = await client.getRESTUser(this.Opponent);

        const CreatorCount = CreatorStats?.NumberOfSuccessfulCounts || 0;
        const OpponentCount = OpponentStats?.NumberOfSuccessfulCounts || 0;

        const CreatorFailed = CreatorStats?.NumberOfFailedCounts || 0;
        const OpponentFailed = OpponentStats?.NumberOfFailedCounts || 0;

        const CreatorTotal = CreatorCount - CreatorFailed;
        const OpponentTotal = OpponentCount - OpponentFailed;

        let Winner: string | null = null;

        if (CreatorTotal > OpponentTotal) {

            Winner = Creator.id;

        } else if (OpponentTotal > CreatorTotal) {

            Winner = Opponent.id;

        }

        const Embed = CreateEmbed({

            title: `${Winner ? `<@${Winner}> Won!` : "Challenge Tied!"}`,
            description: `The challenge between ${Creator.username} and ${Opponent.username} has ended. Here are the results:\n\n- ${Creator.username}: **${CreatorTotal}** Total Counts\n- ${Opponent.username}: **${OpponentTotal}** Total Counts\n\n- ${Winner ? `<@${Winner}> Won!` : "Challenge Tied!"}`,
            color: EmbedColors.GREEN,

            author: { name: "ReCount Minigames" }

        });

        Channel.createMessage({ embeds: [Embed] }).catch(() => null);

        return true;

    }

}
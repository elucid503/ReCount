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
    
    constructor(GuildID: string, Creator: string, Opponent: string) {

        this.GuildID = GuildID;

        this.Creator = Creator;
        this.Opponent = Opponent;

        this.Stats = new Map();

        this.Stats.set(Creator, { NumberOfSuccessfulCounts: 0, NumberOfFailedCounts: 0 });
        this.Stats.set(Opponent, { NumberOfSuccessfulCounts: 0, NumberOfFailedCounts: 0 });

        this.Accepted = false;

        setTimeout(() => {

            if (!this.Accepted) {

                this.Delete();

            }

        }, 3600000 ); // 1 Hour 

    }

    public async Load(): Promise<boolean> { 

        const Response = await DB.collection("challenges").findOne({ Creator: this.Creator }).catch((error) => {

            Log("Database Error", `Error loading challenge: ${error}`, LoggingColors.RED);
            return false;

        }).then((Document) => {

            if (Document instanceof Object) {

                for (const [UserID, Stats] of Object.entries(Document.Stats)) {

                    this.Accepted = Document.Accepted;
                    this.Stats.set(UserID, Stats as ChallengeStats);

                }
                
                return true;

            } else {

                return false;

            }

        });

        return Response;

    }

    public async Save(): Promise<boolean> {

        const Response = await DB.collection("challenges").updateOne({ Creator: this.Creator }, { $set: this }, { upsert: true }).catch((error) => {

            Log("Database Error", `Error writing challenge: ${error}`, LoggingColors.RED);
            return false;

        }).then(() => {

            return true;

        });

        return Response;

    }

    public async Delete(): Promise<boolean> {

        const Response = await DB.collection("challenges").deleteOne({ Creator: this.Creator }).catch((error) => {

            Log("Database Error", `Error deleting challenge: ${error}`, LoggingColors.RED);
            return false;

        }).then(() => {

            return true;

        });

        return Response;

    }

    public async Start(client: ReCount): Promise<boolean> {

        // Set ending timeout

        setTimeout(() => {

            this.End(client);

        }, 3600000); // 1 Hour

        // Notify users

        const Creator = await client.getRESTUser(this.Creator);

        const NotificationEmbed = CreateEmbed({

            title: `Challenge Accepted!`,
            description: `Your challenge against ${Creator.username} has been accepted.\nYou have 1 hour to count as much as you can. Good luck!`,
            color: EmbedColors.GREEN,

            author: { name: "Counting Minigames" }

        });

        const CreatorChannel = await Creator.getDMChannel().catch(() => null);

        if (CreatorChannel) { CreatorChannel.createMessage({ embeds: [NotificationEmbed] }).catch(() => null); }
        
        return true;

    }

    public async End(client: ReCount): Promise<boolean> {

        // Delete challenge

        this.Delete();

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

            author: { name: "Counting Minigames" }

        });

        Channel.createMessage({ embeds: [Embed] }).catch(() => null);

        return true;

    }

}
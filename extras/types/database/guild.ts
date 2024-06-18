import { DB } from "../../../"
import { Log } from "../../functions/logging";

import { LoggingColors } from "../logging";

interface CountingGameStats {

    CurrentNumber: number;
    HighestNumber: number;

    LastUserCounted: string;
    
}

interface GuildSettings { 

    CountingChannelID: string;

}

export class Guild { 

    public ID: string;
    public Name: string;

    public Stats: CountingGameStats;
    public Settings: GuildSettings;

    constructor(ID: string, Name: string) {

        this.ID = ID;
        this.Name = Name;

        this.Stats = {

            CurrentNumber: 0,
            HighestNumber: 0,

            LastUserCounted: "0",

        }

        this.Settings = {

            CountingChannelID: "0",  

        }

    }

    public async Load(): Promise<boolean> { 

        const Response = await DB.collection("guilds").findOne({ ID: this.ID }).catch((error) => {

            Log("Database Error", `Error loading guild: ${error}`, LoggingColors.RED);
            return false;

        }).then((Document) => {

            if (Document instanceof Object) {

                this.Stats = Document.Stats;
                this.Settings = Document.Settings;

                return true;

            } else {

                return false;

            }

        });

        return Response;

    }

    public async Save(): Promise<boolean> {

        const Response = await DB.collection("guilds").updateOne({ ID: this.ID }, { $set: this }, { upsert: true }).catch((error) => {

            Log("Database Error", `Error writing guild: ${error}`, LoggingColors.RED);
            return false;

        }).then(() => {

            return true;

        });

        return Response;

    }

    public async Delete(): Promise<boolean> {

        const Response = await DB.collection("guilds").deleteOne({ ID: this.ID }).catch((error) => {

            Log("Database Error", `Error deleting guild: ${error}`, LoggingColors.RED);
            return false;

        }).then(() => {

            return true;

        });

        return Response;

    }

}
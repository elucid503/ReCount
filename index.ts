import {
    ApplicationCommandStructure,
    Client as DysnomiaClient,
    CommandInteraction,
    ClientOptions,
    Constants,
    ClientEvents
} from "@projectdysnomia/dysnomia";

import { MongoClient, ServerApiVersion } from "mongodb";

import fs from "fs/promises";

import APIKeys from "./configs/keys.json";

import { Log } from "./extras/functions/logging";
import { LoggingColors } from "./extras/types/logging";

// Typings for handlers

export interface Command {

    Name: string;
    Payload: ApplicationCommandStructure;

    Run: (Client: ReCount, Interaction: CommandInteraction) => Promise<void>;

}

export interface Event {

    Name: keyof ClientEvents;

    Run: (Client: ReCount, ...Args: any[]) => Promise<void>;

}

// Extending the Client

export class ReCount extends DysnomiaClient {

    public Commands: Map<string, Command> = new Map();
    public Events: Map<string, Event> = new Map();

    constructor(token: string, options?: ClientOptions) {

        super(token, options);

    }

    public async RefreshCommands(): Promise<boolean> {

        const APIPayload: ApplicationCommandStructure[] = [];

        for (const Command of this.Commands.values()) {

            APIPayload.push(Command.Payload);
            
        }

        const Response = await this.bulkEditCommands(APIPayload).catch((error) => {
            
            Log("Command PUT Error", `${error}`, LoggingColors.RED);
            return false;

        }).then(() => {

            return true;

        });

        return Response;
        
    }

}

// Connecting to the database

const DBClient = new MongoClient(APIKeys.DatabaseURI, {

    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
    
});
    
await DBClient.connect().catch((error) => {

    Log("Database Error", `Error connecting to database: ${error}`, LoggingColors.RED);

});

Log("Database", "Connected to the database.", LoggingColors.GREEN);

const DB = DBClient.db("ReCount");

async function Main() {

    // Creating the Client

    const Client = new ReCount(APIKeys.DiscordToken, {

        gateway: {

            intents: [Constants.Intents.allNonPrivileged, Constants.Intents.guildMessages, Constants.Intents.messageContent ]

        },

        restMode: true
    
    });

    // Init handlers

    const Files = {

        Commands: await fs.readdir("./commands"),
        Events: await fs.readdir("./events"),

    }

    // Load handlers

    for (const file of Files.Commands) {

        // Although we dont use Client.Commands in this file, it's good practice to load them immediately 

        const Command = (await import(`./commands/${file}`)).default;

        Client.Commands.set(Command.Name, Command);

    }

    for (const file of Files.Events) {

        const Event = (await import(`./events/${file}`)).default;

        Client.Events.set(Event.Name, Event);

    }

    // Hook Events

    for (const Event of Client.Events.values()) {

        Client.on(Event.Name, Event.Run.bind(null, Client));

    }

    Client.connect(); // Connect to the gateway

    // Process handlers

    process.on("unhandledRejection", (error) => {

        Log("Unhandled Rejection", `${error}`, LoggingColors.RED);

    });

    process.on("uncaughtException", (error) => {

        Log("Uncaught Exception", `${error}`, LoggingColors.RED);

    });

    process.on("SIGINT", async () => {
 
        Client.disconnect({ reconnect: false });
    
        Log("Process Exiting", "Disconnected from the Discord gateway.", LoggingColors.YELLOW);

        process.exit(0);
    
    });

}

if (import.meta.url === `file://${process.argv[1]}`) {

    Main();

}

export { DB }
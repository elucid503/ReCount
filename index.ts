import {
    Client as DysnomiaClient,
    CommandInteraction,
    ApplicationCommand,
    ClientOptions,
    Constants,
    ClientEvents
} from "@projectdysnomia/dysnomia";

import fs from "fs/promises";

import APIKeys from "./configs/keys.json";

import { Log } from "./extras/functions/logging";
import { LoggingColors } from "./extras/types/logging";

// Typings for handlers

export interface Command {

    Name: string;
    Payload: ApplicationCommand;

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

}

// Creating the Client

const Client = new ReCount(APIKeys.DiscordToken, {

    gateway: {

        intents: [ Constants.Intents.allNonPrivileged, Constants.Intents.guildMessages ]

    }
    
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
    
})
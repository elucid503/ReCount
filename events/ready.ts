import { ReCount, Event } from "..";

import { Log } from "../extras/functions/logging";
import { LoggingColors } from "../extras/types/logging";

export default {

    Name: "ready",

    Run: async (Client: ReCount, ...Args: any[]) => {

        Log("Logged In", `Logged in as ${Client.user.username}`, LoggingColors.GREEN);

        // Refresh commands if provided the option to do so

        if (process.argv[2] === "--Refresh") {

            const Response = await Client.RefreshCommands();

            if (Response) {

                Log("Commands Updated", "Successfully refreshed global-level commands.", LoggingColors.GREEN);

            }

        };
        
    }

} satisfies Event;
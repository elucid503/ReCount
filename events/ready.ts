import { ReCount, Event } from "..";

import { Log } from "../extras/functions/logging";
import { LoggingColors } from "../extras/types/logging";

export default {

    Name: "ready",

    Run: async (Client: ReCount, ...Args: any[]) => {

        Log("Logged In", `Logged in as ${Client.user.username}`, LoggingColors.GREEN);
        
    }

} satisfies Event;
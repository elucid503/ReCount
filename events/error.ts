import { ReCount, Event } from "..";

import { Log } from "../extras/functions/logging";
import { LoggingColors } from "../extras/types/logging";

export default {

    Name: "error",

    Run: async (Client: ReCount, ...Args: any[]) => {

        // Check if error is just a reconnect

        if ("reset by peer" in Args[0].message) return;

        // Log error

        Log("Client Error", `An error has occured in the client: ${Args[0].message}`, LoggingColors.RED);

    }

} satisfies Event;
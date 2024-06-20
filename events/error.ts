import { ReCount, Event } from "..";

export default {

    Name: "error",

    Run: async (Client: ReCount, ...Args: any[]) => {

        return; // Usually just reconnects the client
        
    }

} satisfies Event;
import { AnyInteraction, Constants } from "@projectdysnomia/dysnomia";
import { ReCount, Event } from "..";

import { Log } from "../extras/functions/logging";
import { LoggingColors } from "../extras/types/logging";
import { ErrorEmbed } from "../extras/functions/embeds";
import { ErrorLevels } from "../extras/types/embeds";

export default {

    Name: "interactionCreate",

    Run: async (Client: ReCount, ...Args: any[]) => {

        const Interaction: AnyInteraction = Args[0];

        switch (Interaction.type) { 

            case Constants.InteractionTypes.APPLICATION_COMMAND: {

                const Command = Client.Commands.get(Interaction.data.name);

                if (Command) {

                    Log("Command Executed", `\`${Interaction.user?.username}\` used the \`/${Interaction.data.name}\` command.`, LoggingColors.GREEN, true);
                    Log("Command Executed", `<code style="background-color:rgb(36, 36, 36); padding: 2px 4px; border-radius: 4px;">${Interaction.user?.username}</code> used the <code style="background-color:rgb(36, 36, 36); padding: 2px 4px; border-radius: 4px;">/${Interaction.data.name}</code> command.`, LoggingColors.GREEN, undefined, false); // only to relay

                    await Command.Run(Client, Interaction).catch((error) => {
                        
                        Log("Command Error", `An error occured while executing the /${Interaction.data.name} command.`, LoggingColors.RED);
                        Log("Error Details", `${error}`, LoggingColors.RED);

                        Interaction.createMessage({

                            embeds: [ErrorEmbed({
                                
                                error: "General Failure",
                                message: "This command did not execute correctly.\nIf this continues, contact Sprout.",

                                severity: ErrorLevels.FATAL

                            })]
                        
                        }).catch(() => null);
                    
                    });
                        
                }

            } break;

        }
        

    }

} satisfies Event;
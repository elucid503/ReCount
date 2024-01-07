import { LoggingColors, ResolvableColors } from "../types/logging";
import { CreateEmbed } from "./embeds";

import { LoggingWebhook } from "../../configs/keys.json";

export async function Log(subject: string, message: string, color: LoggingColors): Promise<boolean> {
    
    // Get time and format it

    const date: Date = new Date();

    const time: string = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    const output: string = `${LoggingColors.CYAN}${time}${LoggingColors.RESET} • ${color}${subject}${LoggingColors.RESET}\n${message}`;
  
    console.log(output);
  
    // Make a new message variable without any styling
  
    const nostyle: string = message?.replace(/\[([0124578])m/g, "");
  
    try {
  
        await PostToWebhook(subject, nostyle, null, ResolvableColors[color as keyof typeof ResolvableColors]);
  
    } catch (error) {
  
        console.error(`Error posting to webhook: ${error}`);
        return false;
  
    }
  
    return true;
  
  }
  
  async function PostToWebhook(subject: string, message: string, author: string | null, color: ResolvableColors) {
    
    const embed = CreateEmbed({
  
      title: subject,
      description: message,
      color: color,
  
      author: {
  
        name: author || "New Log Outputted",
  
      }
      
    });
  
    fetch(LoggingWebhook, {
  
      method: "post",
      headers: {
  
        "Content-Type": "application/json"
  
      },
  
      body: JSON.stringify({
  
        embeds: [embed]
  
      })
  
    }).catch((error) => { 
  
      console.error(`Error posting to webhook: ${error}`);
  
    });
  
  }
  
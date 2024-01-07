import { Embed } from "@projectdysnomia/dysnomia";
import { EmbedColors, EmbedOptions, ErrorColors, ErrorOptions } from "../types/embeds";

import { Footer, FooterIcon } from "../../configs/misc.json"

export function CreateEmbed(options: EmbedOptions): Embed {
 
    // This function is used to create a standard embed.
  
    // Get the color from the options given
  
    let color: number | string = options.color || 0;
  
    if (color === 0) { 
  
        // Pick randomly from the EmbedColors enum
        
        const keys = Object.keys(EmbedColors);
        const values = Object.values(EmbedColors);
        
        const random = Math.floor(Math.random() * keys.length);

        color = values[random];
        
    }
  
    let FooterToSet = Footer;
    
    if (options.footer?.text) {
      
      FooterToSet = `${FooterToSet}\n${options.footer.text}`;
      
    } 
  
    // Convert from hex
  
    if (typeof color === "string") { color = parseInt(color.replace("#", ""), 16); }
  
    const Embed: Embed = {
  
      type: "rich",
      title: options.title,
      description: options.description,
      url: options.url,
      color: color,
  
      author: {
  
        name: options.author?.name || "No Category",
        url: options.author?.url,
        icon_url: options.author?.iconURL,
  
      },
  
      thumbnail: {
  
        url: options.thumbnail,
  
      },
  
      image: {
  
        url: options.image,
  
      },
  
      footer: {
  
        text: FooterToSet,
        icon_url: options.footer?.iconURL || FooterIcon,
  
      },
  
      fields: options.fields || [],
  
    };
  
    // Return the embed values based on the options given
  
    return Embed;
  
}
  
export function ErrorEmbed(options: ErrorOptions): Embed {
    
    // This function ouputs logs, debug info or errors to the user.
  
    const Embed: Embed = {
  
      type: "rich",
      title: options.error,
      description: options.message,
      color: ErrorColors[options.severity as keyof typeof ErrorColors],
  
      author: { 
  
        name: options.author || "Action Aborted",
  
      },
  
      footer: {
  
        text: Footer,
        icon_url: FooterIcon,
  
      }
  
    };
  
    return Embed;
  
}
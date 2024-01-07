export enum EmbedColors {

    PURPLE = 15671265,
    PINK = 16024800,
    BLUE = 3893487,
    GREEN = 3927945,
    YELLOW = 14544699,
    RED = 16538976,

    RANDOM = 0,

}
  
export enum ErrorColors {
    
    INFO = 15374638,
    WARN = 15356206,
    FATAL = 13514040,
  
}
  
export enum ErrorLevels {
  
    // Info = slight nudge, warning = aborted command, fatal = problem
  
    INFO = "INFO",
    WARNING = "WARN",
    FATAL = "FATAL",
  
}
    
export interface EmbedOptions {
      
    title?: string;
    url?: string;
    image?: string;
    description?: string;
    color?: EmbedColors | string | number;
    author?: { name: string; iconURL?: string; url?: string };
    footer?: { text?: string; iconURL?: string };
    thumbnail?: string;
    fields?: { name: string; value: string; inline: boolean }[];
    
}
  
export interface ErrorOptions {
    
    error?: string;
    author?: string;

    message: string;
    severity: ErrorLevels;
    
}
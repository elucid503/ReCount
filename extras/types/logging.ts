export enum LoggingColors {

    // ASCII Color Codes

    BLACK = "\x1b[30m",
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m",
    GRAY = "\x1b[90m",

    // Reset

    RESET = "\x1b[0m",

}

export enum ResolvableColors {

    // Useful for converting console colors to Discord colors
  
    "\x1b[30m" = 0,
    "\x1b[31m" = 15353928,
    "\x1b[32m" = 2800672,
    "\x1b[33m" = 15915822,
    "\x1b[34m" = 3048434,
    "\x1b[35m" = 12782560,
    "\x1b[36m" = 778443,
    "\x1b[37m" = 16579836,
    "\x1b[90m" = 6184284,
    
}
  
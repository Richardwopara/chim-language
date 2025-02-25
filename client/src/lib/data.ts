export const elements = [
  {
    name: "in",
    description: "Specifies the language you want the output to be in",
    example: "*in* swift",
    category: "Core"
  },
  {
    name: "for",
    description: "Chooses the app platform you're building for",
    example: "*for* apple phone",
    category: "Core"
  },
  {
    name: "context",
    description: "References code using index number shortcut",
    example: "*context* 39 //39th code file in your library\n*context* 39; 45\n*context* 39 to 45",
    category: "References"
  },
  {
    name: "line",
    description: "Specifies what line the code should be in",
    example: "*line* 150\n*line* react; 150",
    category: "Structure"
  },
  {
    name: "chimcontext",
    description: "References code using code id",
    example: "*chimcontext* 4535hevne53354 //public code id",
    category: "References"
  },
  {
    name: "prompt",
    description: "Loads a local prompt name saved in library",
    example: "*prompt* saved1\n*prompt* [homepage] //assuming a mold called homepage exists",
    category: "Loading"
  },
  {
    name: "chimprompt",
    description: "Loads a public prompt name",
    example: "*chimprompt* richardssearchbar",
    category: "Loading"
  },
  {
    name: "spawn",
    description: "Creates visually similar entire page from program",
    example: "*spawn* instagram home page; instagram.com",
    category: "Generation"
  },
  {
    name: "rare",
    description: "Randomly creates a unique object",
    example: "*rare* search bar",
    category: "Generation"
  },
  {
    name: "create",
    description: "Specifies the object in particular you want to achieve",
    example: "*create* search bar",
    category: "Generation"
  },
  {
    name: "from",
    description: "Mimics the appearance of an object from an existing app",
    example: '*from* instagram/"search page"',
    category: "Appearance"
  },
  {
    name: "makeit",
    description: "Selects if it's going to be auto hiding (dynamic) or static",
    example: "*makeit* static",
    category: "Behavior"
  },
  {
    name: "like",
    description: "Mimics the functionality of a similar object from a different project",
    example: "*like* snapchat",
    category: "Functionality"
  },
  {
    name: "but",
    description: "Replaces abstract attributes and adds exact dimensions",
    example: "*but* fire edges that turn cold when inactive for 1 minute; top center; rectangle; 4:5; 35",
    category: "Attributes"
  },
  {
    name: "with",
    description: "Adds abstract attributes",
    example: "*with* fire edges",
    category: "Attributes"
  },
  {
    name: "without",
    description: "Removes abstract attributes",
    example: "*without* search icon on the end",
    category: "Attributes"
  },
  {
    name: "nextto",
    description: "References position relative to an object",
    example: "*nextto* left (search bar)\n*nextto* within left (loading screen)\n*nextto* within bottom right (checkout page)\n*nextto* above (share sheet)\n*nextto* within below (chat screen)",
    category: "Position"
  },
  {
    name: "blame",
    description: "Specifies a problem you want to make sure doesn't occur",
    example: "*blame* instagram / search page",
    category: "Validation"
  },
  {
    name: "animate",
    description: "Adds an animation for when tapped and speed",
    example: "*animate* start(3; appear); end(5, fade out)",
    category: "Animation"
  },
  {
    name: "background",
    description: "Sets the background color",
    example: "*background* ffffffff\n*background* light(ffffffff); dark(00000000)",
    category: "Styling"
  },
  {
    name: "font",
    description: "Specifies font properties including type, alignment, color, and size",
    example: "*font* aerial; center; ffffffff; 15\n*font* aerial; left; light(00000000); dark(ffffffff); 15",
    category: "Typography"
  },
  {
    name: "maybe",
    description: "Allows you to describe what you want in your own words for extra context",
    example: "*maybe* snapchat search bar with a bit of instagram feel",
    category: "Context"
  },
  {
    name: "then",
    description: "Replicates the same edits to create multiple codes",
    example: "*then* loading screen; checkout page",
    category: "Replication"
  },
  {
    name: "forge",
    description: "Saves a configuration for a component",
    example: "*blame* instagram / search page; ~forge~ ig bias",
    category: "Configuration"
  },
  {
    name: "mold",
    description: "Make multiple objects be part of a single page",
    example: "*mold* loading screen; checkout page; [home page]\n*mold* (home page)",
    category: "Organization"
  },
  {
    name: "jump",
    description: "Auto arranges prompts in order of importance",
    example: "*jump* descending\n*jump* ascending\n*jump* reset",
    category: "Organization"
  }
];
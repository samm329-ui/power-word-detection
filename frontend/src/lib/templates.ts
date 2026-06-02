import { CaptionTemplate } from "./types";

export const templates: CaptionTemplate[] = [
  {
    id: "kalakar-glow",
    name: "Kalakar Glow",
    category: "neon",
    typography: { fontFamily: "Inter", fontWeight: 800, textTransform: "uppercase" },
    colors: { text: "#FFFFFF", highlight: "#C8FF00", glow: "#C8FF00" },
    effects: { glow: { radius: 24, color: "#C8FF00", intensity: 1.2 } },
    wordBehavior: { mode: "keywordHighlight", activeWordColor: "#C8FF00" },
    animation: { entry: "pulseGlow", durationMs: 220 }
  },
  {
    id: "ali-abdaal",
    name: "Ali Abdaal",
    category: "minimal",
    typography: { fontFamily: "Poppins", fontWeight: 700 },
    layout: { borderRadius: 8, containerPaddingX: 20, containerPaddingY: 12, align: "center" },
    colors: { text: "#000000", background: "#FFFFFF", muted: "rgba(31,32,34,0.4)" },
    wordBehavior: { mode: "splitBlocks" },
    animation: { entry: "fadeIn", durationMs: 180 }
  },
  {
    id: "kalakar-shadow",
    name: "Kalakar Shadow",
    category: "bold",
    typography: { fontFamily: "Inter", fontWeight: 900, textTransform: "uppercase" },
    colors: { text: "#FFFFFF", highlight: "#FE9C03" },
    effects: { shadow: { x: 4, y: 4, blur: 0, color: "#000000" } },
    wordBehavior: { mode: "keywordHighlight", activeWordColor: "#FE9C03" },
    animation: { entry: "slideUp", durationMs: 180 }
  },
  {
    id: "kalakar",
    name: "Kalakar",
    category: "neon",
    typography: { fontFamily: "Inter", fontWeight: 800, textTransform: "uppercase" },
    colors: { text: "#C8FF00" },
    effects: { glow: { radius: 10, color: "#C8FF00", intensity: 0.6 } },
    wordBehavior: { mode: "keywordHighlight", activeWordColor: "#C8FF00" },
    animation: { entry: "fadeIn", durationMs: 160 }
  },
  {
    id: "clean-motion",
    name: "Clean Motion",
    category: "minimal",
    typography: { fontFamily: "Inter", fontWeight: 400 },
    colors: { text: "#FFFFFF" },
    wordBehavior: { mode: "plain" },
    animation: { entry: "fadeIn", durationMs: 150 }
  },
  {
    id: "double-trouble",
    name: "Double Trouble",
    category: "bold",
    typography: { fontFamily: "Montserrat", fontWeight: 700 },
    layout: { align: "center", lineGap: 0.15 },
    colors: { text: "#FFFFFF" },
    wordBehavior: { mode: "doubleLine" },
    animation: { entry: "staggeredLineReveal", durationMs: 220, perWordStaggerMs: 40 }
  },
  {
    id: "bubble-style",
    name: "Bubble Style",
    category: "viral",
    typography: { fontFamily: "Times New Roman", fontWeight: 700 },
    colors: { text: "#FFFFFF", highlight: "#48A680" },
    wordBehavior: { mode: "bubbleHighlight", activeWordColor: "#FFFFFF", highlightBackground: "#48A680" },
    animation: { entry: "scalePop", durationMs: 170 }
  },
  {
    id: "hormozi-style",
    name: "Hormozi Style",
    category: "bold",
    typography: { fontFamily: "Anton", fontWeight: 700, textTransform: "uppercase" },
    colors: { text: "#97DE25" },
    effects: { shadow: { x: 10, y: 10, blur: 6, color: "rgba(0,0,0,0.9)" }, stroke: { width: 0.15, color: "#000000" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "bounce", durationMs: 200 }
  },
  {
    id: "editing-skool",
    name: "Editing Skool",
    category: "viral",
    typography: { fontFamily: "Inter", fontWeight: 700 },
    colors: { text: "#FFFFFF", highlight: "#F48601", background: "#F48601" },
    wordBehavior: { mode: "singleWordPunch", activeWordColor: "#FFFFFF", highlightBackground: "#F48601" },
    animation: { entry: "scalePop", durationMs: 140 }
  },
  {
    id: "mr-beast-style-1",
    name: "Mr Beast Style 1",
    category: "viral",
    typography: { fontFamily: "LuckiestGuy", fontWeight: 900, textTransform: "uppercase" },
    colors: { text: "#FFFFFF" },
    effects: { stroke: { width: 0.015, color: "#000000" }, shadow: { x: 1, y: 1, blur: 0, color: "#000000" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "scalePop", durationMs: 200 }
  },
  {
    id: "mr-beast-style-2",
    name: "Mr Beast Style 2",
    category: "viral",
    typography: { fontFamily: "Futura", fontWeight: 900 },
    colors: { text: "#FFD700" },
    effects: { shadow: { x: 1, y: 2.3, blur: 0, color: "rgba(0,0,0,0.9)" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "bounce", durationMs: 180 }
  },
  {
    id: "iman-gadzhi",
    name: "Iman Gadzhi",
    category: "creator",
    typography: { fontFamily: "DM Sans", fontWeight: 600 },
    colors: { text: "#FFFFFF" },
    wordBehavior: { mode: "plain" },
    animation: { entry: "fadeIn", durationMs: 160 }
  },
  {
    id: "devin-jatho",
    name: "Devin Jatho",
    category: "bold",
    typography: { fontFamily: "Montserrat", fontWeight: 700, textTransform: "uppercase" },
    colors: { text: "#A34EFF" },
    effects: { shadow: { x: 4, y: 4, blur: 12, color: "rgba(0,0,0,0.6)" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "scalePop", durationMs: 180 }
  },
  {
    id: "highlighted-word",
    name: "Highlighted Word",
    category: "viral",
    typography: { fontFamily: "Montserrat", fontWeight: 600 },
    colors: { text: "#FFFFFF", highlight: "#F5A623" },
    wordBehavior: { mode: "keywordHighlight", activeWordColor: "#F5A623" },
    animation: { entry: "karaoke", durationMs: 120 }
  },
  {
    id: "clean-glow-style",
    name: "Clean Glow Style",
    category: "minimal",
    typography: { fontFamily: "Inter", fontWeight: 400 },
    colors: { text: "#FFFFFF", glow: "#FFFFFF" },
    effects: { glow: { radius: 14, color: "#FFFFFF", intensity: 0.9 } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "fadeIn", durationMs: 150 }
  },
  {
    id: "kalakar-clean",
    name: "Kalakar Clean",
    category: "minimal",
    typography: { fontFamily: "Inter", fontWeight: 400 },
    colors: { text: "#FFFFFF" },
    effects: { shadow: { x: 1, y: 1, blur: 2, color: "rgba(0,0,0,0.3)" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "fadeIn", durationMs: 140 }
  },
  {
    id: "black-punch",
    name: "Black Punch",
    category: "bold",
    typography: { fontFamily: "Anton", fontWeight: 900, textTransform: "uppercase" },
    colors: { text: "#000000" },
    effects: { stroke: { width: 0.3, color: "rgba(180,180,180,0.7)" }, shadow: { x: 2, y: 2, blur: 10, color: "rgba(0,0,0,0.6)" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "scalePop", durationMs: 180 }
  },
  {
    id: "kalakar-word",
    name: "Kalakar Word",
    category: "neon",
    typography: { fontFamily: "Inter", fontWeight: 400 },
    colors: { text: "#FFFFFF" },
    wordBehavior: { mode: "blurInactive", inactiveWordOpacity: 0.4 },
    effects: { blur: { amount: 3 } },
    animation: { entry: "wordReveal", durationMs: 120 }
  },
  {
    id: "pixelated-word",
    name: "Pixelated Word",
    category: "retro",
    typography: { fontFamily: "VT323", fontWeight: 400, textTransform: "uppercase" },
    colors: { text: "#FFFFFF" },
    wordBehavior: { mode: "retroPixel" },
    animation: { entry: "typeIn", durationMs: 120 }
  },
  {
    id: "ziada",
    name: "Ziada",
    category: "bold",
    typography: { fontFamily: "Inter", fontWeight: 700 },
    colors: { text: "#FFFFFF", background: "#111111" },
    layout: { borderRadius: 999, align: "center" },
    wordBehavior: { mode: "stackedLines" },
    animation: { entry: "scalePop", durationMs: 160 }
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass",
    category: "glass",
    typography: { fontFamily: "Montserrat", fontWeight: 300 },
    colors: { text: "#FFFFFF", secondary: "#918B7C" },
    layout: { borderRadius: 72, align: "center" },
    effects: { backdropBlur: 10 },
    wordBehavior: { mode: "glass" },
    animation: { entry: "fadeIn", durationMs: 150 }
  },
  {
    id: "top-up",
    name: "Top Up",
    category: "viral",
    typography: { fontFamily: "Inter", fontWeight: 700 },
    colors: { text: "#FFFFFF", highlight: "#FFD54A" },
    wordBehavior: { mode: "keywordHighlight", activeWordColor: "#FFD54A" },
    animation: { entry: "karaoke", durationMs: 120 }
  },
  {
    id: "mota",
    name: "Mota",
    category: "viral",
    typography: { fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase" },
    colors: { text: "#FFFFFF", highlight: "#7CFF00" },
    wordBehavior: { mode: "keywordHighlight", activeWordColor: "#7CFF00" },
    animation: { entry: "karaoke", durationMs: 120 }
  },
  {
    id: "tabahi",
    name: "Tabahi",
    category: "bold",
    typography: { fontFamily: "Komika Axis", fontWeight: 900, textTransform: "uppercase", fontStyle: "italic" },
    colors: { text: "#FFFFFF" },
    effects: { stroke: { width: 0.066, color: "#000000" }, shadow: { x: 0.5, y: 0.5, blur: 0, color: "#000000" } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "bounce", durationMs: 180 }
  },
  {
    id: "deep-glow",
    name: "Deep Glow",
    category: "neon",
    typography: { fontFamily: "Anton", fontWeight: 900, textTransform: "uppercase" },
    colors: { text: "#FFFFFF", glow: "#FF00FF" },
    effects: { glow: { radius: 30, color: "#FF00FF", intensity: 1.2 } },
    wordBehavior: { mode: "plain" },
    animation: { entry: "pulseGlow", durationMs: 220 }
  },
  {
    id: "search-bar",
    name: "Search Bar",
    category: "minimal",
    typography: { fontFamily: "Inter", fontWeight: 800, textTransform: "uppercase" },
    colors: { text: "#FFFFFF", background: "#000000" },
    layout: { borderRadius: 16, align: "center" },
    wordBehavior: { mode: "plain" },
    animation: { entry: "fadeIn", durationMs: 140 }
  },
  {
    id: "thora-cinematic",
    name: "Thora Cinematic",
    category: "cinematic",
    typography: { fontFamily: "Montserrat", fontWeight: 300, textTransform: "uppercase", letterSpacing: 8 },
    colors: { text: "#FFFFFF", background: "#657081" },
    layout: { align: "center", borderRadius: 4 },
    wordBehavior: { mode: "plain" },
    animation: { entry: "staggeredLineReveal", durationMs: 200 }
  },
  {
    id: "dull",
    name: "Dull",
    category: "minimal",
    typography: { fontFamily: "Inter", fontWeight: 400, fontStyle: "italic" },
    colors: { text: "#FFFFFF" },
    wordBehavior: { mode: "blurInactive", inactiveWordOpacity: 0.4 },
    effects: { glow: { radius: 8, color: "#FFFFFF", intensity: 0.25 } },
    animation: { entry: "wordReveal", durationMs: 140 }
  },
  {
    id: "zero-gravity",
    name: "Zero Gravity",
    category: "viral",
    typography: { fontFamily: "Inter", fontWeight: 700 },
    colors: { text: "#FFFFFF", background: "#FF4F8B" },
    layout: { borderRadius: 999, align: "center" },
    wordBehavior: { mode: "stackedLines" },
    animation: { entry: "bounce", durationMs: 180 }
  }
];

export const DEFAULT_TEMPLATE_ID = "clean-motion";

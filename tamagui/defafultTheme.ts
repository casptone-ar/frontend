// Figma Color Palette (New - Light Theme Based on Image)
const lightColors = {
  // Grays / Neutrals (from Typography Light & Dividers)
  gray1: "#FFFFFF", // Pure White (Background, High Emphasis Text on Dark)
  gray2: "#F9F9FB", // Very Light Gray (Subtle Backgrounds, Low Emphasis Primary BG)
  gray3: "#F1F1F5", // Light Gray (Medium Emphasis Primary BG, Dividers on Dark)
  gray4: "#E8E8EE", // Slightly Darker Light Gray (High Emphasis Primary BG)
  gray5: "#D9D9E0", // Medium Light Gray (Label BG, Disabled BG)
  gray6: "#C8C8D1", // Medium Gray (Low Emphasis Text)
  gray7: "#B0B0BB", // Darker Medium Gray (Medium Emphasis Text)
  gray8: "#8A8A99", // Dark Gray (Disabled Text)
  gray9: "#5B5B66", // Very Dark Gray (High Emphasis Text on Light)
  gray10: "#3C3C43", // Near Black (Alternative High Emphasis)
  gray11: "#1C1C1E", // True Black (Text on Dark BG)

  // Primary Colors (from "Primary" section - Blue/Purple)
  primaryOnClick: "#3A3AFF", // On-click button
  primaryDefault: "#575AFF", // Default
  primaryHigh: "#8C8CFF", // High emphasis
  primaryMedium: "#C0C0FF", // Medium emphasis
  primaryLow: "#F0F0FF", // Low emphasis

  // Semantic Colors (from Palette)
  red500: "#FF453A", // Red (Error) - Mapped from image Red 500
  orange500: "#FF9F0A", // Orange (Warning) - Mapped from image Yellow/Orange 500
  yellow500: "#FFD60A", // Yellow - Mapped from image Yellow 500
  green500: "#30D158", // Green (Success) - Mapped from image Green 500
  mint500: "#00C7BE", // Mint/Teal - Mapped from image Cyan 500
  teal500: "#40C8E0", // Teal/Cyan - Mapped from image Cyan 400/500
  cyan500: "#60D2F5", // Cyan - Mapped from image Cyan 300/40
  indigo500: "#5E5CE6", // Indigo - Mapped from image Indigo 500
  purple500: "#BF5AF2", // Purple - Mapped from image Purple 500
  pink500: "#FF2D55", // Pink - Mapped from image Pink 500

  // Full Palette (example for blue, can be extended for others)
  blue50: "#E6F3FF",
  blue100: "#CCE8FF",
  blue200: "#99D0FF",
  blue300: "#66B9FF",
  blue400: "#33A1FF",
  blue500: "#0A84FF", // Defined above
  blue600: "#0070D9",
  blue700: "#005BBB",
  blue800: "#00459C",
  blue900: "#00307D",

  // Add other palettes similarly (indigo, purple, yellow, green, cyan, red, pink)
  // Example for purple
  purple50: "#F9F0FF",
  purple100: "#F2E0FF",
  purple200: "#E5C2FF",
  // ... and so on up to purple900

  // Specific Utility from Image
  dividerOnLight: "#E8E8EE", // gray4
  dividerOnDark: "#3C3C43", // gray10 (for dark theme, but can be a reference)
  disabledBackground: "#F1F1F5", // gray3
  labelBackground: "#D9D9E0", // gray5
};

export const defaultTheme = {
  base: {
    // Base colors from lightColors.gray scale
    color1: lightColors.gray1,
    color2: lightColors.gray2,
    color3: lightColors.gray3,
    color4: lightColors.gray4,
    color5: lightColors.gray5,
    color6: lightColors.gray6,
    color7: lightColors.gray7,
    color8: lightColors.gray8,
    color9: lightColors.gray9,
    color10: lightColors.gray10,
    color11: lightColors.gray11,

    // Background Colors
    background1: lightColors.gray1, // Main background
    background2: lightColors.gray2, // Cards, Modals
    background3: lightColors.gray3, // Input fields, subtle bg

    background1Alpha: "rgba(255, 255, 255, 0.8)",
    background2Alpha: "rgba(249, 249, 251, 0.8)",
    background3Alpha: "rgba(241, 241, 245, 0.8)",

    // Base UI Element Colors (can refine based on actual usage)
    base1: "rgba(241, 241, 245, 0.6)", // gray3 based
    base2: "rgba(249, 249, 251, 0.7)", // gray2 based
    base3: "rgba(255, 255, 255, 0.8)", // gray1 based

    // Accent Colors from lightColors.primary scale
    accent1: lightColors.primaryDefault, // Default button, active elements
    accent2: lightColors.primaryOnClick, // Stronger for press/on-click
    accent3: lightColors.primaryHigh, // Lighter for hover or high emphasis areas
    accent4: lightColors.primaryMedium, // Lighter for hover or high emphasis areas
    accent5: lightColors.primaryLow, // Lighter for hover or high emphasis areas

    // Secondary Colors - can use palette colors or define new ones
    secondary1: lightColors.orange500, // Example: warning color for tags
    secondary2: lightColors.yellow500,
    secondary3: lightColors.green500,

    // Tertiary Colors - for less prominent accents
    tertiary1: lightColors.purple50, // Example: very light purple
    tertiary2: lightColors.blue50,
    tertiary3: lightColors.pink500, // Using a palette color

    // Border Colors
    border1: lightColors.dividerOnLight, // Main border for inputs, cards
    border2: lightColors.gray5, // Slightly darker border
    border3: lightColors.gray7, // Stronger border

    // Shadow Colors
    shadow1: "rgba(0, 0, 0, 0.04)", // Lighter shadow
    shadow2: "rgba(0, 0, 0, 0.08)",
    shadow3: "rgba(0, 0, 0, 0.12)",

    // Text Colors (from Typography - Light)
    text1: lightColors.gray11, // High emphasis
    text2: lightColors.gray10, // Medium emphasis
    text3: lightColors.gray9, // Low emphasis
    text4: lightColors.gray8, // Disabled / Placeholder

    // Fill Colors (can be derived from grays or primary colors with alpha)
    fill1: "rgba(138, 138, 153, 0.24)", // gray8 with alpha
    fill2: "rgba(138, 138, 153, 0.16)",
    fill3: "rgba(138, 138, 153, 0.08)",
    fill4: "rgba(138, 138, 153, 0.04)",

    // Separator Colors
    separator1: lightColors.dividerOnLight, // Main separator
    separator2: lightColors.gray4, // Lighter separator

    // Semantic Colors
    success: lightColors.green500,
    warning: lightColors.orange500,
    error: lightColors.red500,
    info: lightColors.blue500,

    // Chart & Data Visualization Colors (can pick from palette)
    dataViz1: lightColors.primaryDefault,
    dataViz2: lightColors.orange500,
    dataViz3: lightColors.green500,
    dataViz4: lightColors.yellow500,
    dataViz5: lightColors.red500,
    dataViz6: lightColors.blue500,

    // Tamagui 컴포넌트 기본 토큰
    color: "$text1",
    colorHover: "$text2",
    colorPress: "$accent2", // Stronger accent for press
    colorFocus: "$accent1",
    colorTransparent: "rgba(91, 91, 102, 0.5)", // text1 (gray9) with alpha

    background: "$background1",
    backgroundHover: "$background2",
    backgroundPress: "$background3",
    backgroundFocus: "$background2",
    backgroundStrong: "$background1",
    backgroundTransparent: "rgba(255, 255, 255, 0.1)",

    borderColor: "$border1",
    borderColorHover: "$border2",
    borderColorFocus: "$accent1",
    borderColorPress: "$accent2",

    placeholderColor: "$text4",
    outlineColor: "rgba(87, 90, 255, 0.5)", // primaryDefault with alpha

    // Expose new palette colors for direct use in components
    // These can be used like: <Button color="$blue500" />
    ...lightColors, // Spread all defined lightColors
  },
};

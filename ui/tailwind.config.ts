import type { Config } from "tailwindcss";
// import { colors } from "./lib/theme-colors";

const tailwindConfig: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Tailwind default colors
        transparent: "transparent",
        current: "currentColor",
        black: "#000",
        white: "#fff",
        blue1: "#074879",
        blue2: "#DDF0FF",
        red1: "#D84343",
        green1: "#4CAF50",
        green2: "#C8F4D3",
        black1: "#000000",
        black2: "#1A1C1E",
        white1: "#FFFFFF",
        gray1: "#6E7580",
        gray2: "#D9D9D9",
        gray3: "#F5F5F5",
        gray4: "#6C7278",
        yellow1: "#FFB74D",
        yellow2: "#FFE3AD",
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;

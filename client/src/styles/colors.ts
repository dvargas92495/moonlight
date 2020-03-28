// https://visme.co/blog/website-color-schemes/

const colors = {
  STRIKING_AND_SIMPLE: {
    primaryBackgroundColor: "#0B0C10",
    secondaryBackgroundColor: "#1F2833",
    contentColor: "#C5C6C7",
    primaryColor: "#66FCF1",
    secondaryColor: "#45A29E",
  },
  BLUE_AND_REFRESHING: {
    primaryBackgroundColor: "#25274D",
    secondaryBackgroundColor: "#464866",
    contentColor: "#AAABB8",
    primaryColor: "#2E9CCA",
    secondaryColor: "#29648A",
  },
};

const theme = (process.env.REACT_APP_THEME ||
  "STRIKING_AND_SIMPLE") as keyof typeof colors;

export const PRIMARY_BACKGROUND_COLOR = colors[theme].primaryBackgroundColor;
export const SECONDARY_BACKGROUND_COLOR =
  colors[theme].secondaryBackgroundColor;
export const CONTENT_COLOR = colors[theme].contentColor;
export const PRIMARY_COLOR = colors[theme].primaryColor;
export const SECONDARY_COLOR = colors[theme].secondaryColor;

export const HALF_OPAQUE = "80";
export const QUARTER_OPAQUE = "40";

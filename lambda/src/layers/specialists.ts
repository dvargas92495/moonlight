import { keyBy, mapValues } from "lodash";

export const specialists = [
  {
    title: "Dr. Patel",
    field: "drPatel",
  },
];

export const ratesBySpecialists = (r: number) =>
  mapValues(keyBy(specialists, "field"), () => r);

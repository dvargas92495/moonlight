import { keyBy, mapValues } from "lodash";

export const specialists = [
  {
    title: "Dr. Patel",
    id: 1,
  },
];

export const ratesBySpecialists = (r: number) =>
  mapValues(keyBy(specialists, "id"), () => r);

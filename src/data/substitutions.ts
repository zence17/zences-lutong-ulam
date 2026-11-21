import { ingredients } from "@/data/ingredients";

type IngredientId = keyof typeof ingredients;

export interface IngredientSwapOption {
  substituteId: IngredientId;
  label: string;
  ratio: number;
  note: string;
}

export const INGREDIENT_SUBSTITUTIONS: Record<string, IngredientSwapOption[]> = {
  "pork-kasim": [
    {
      substituteId: "chicken-thigh",
      label: "Chicken",
      ratio: 1,
      note: "Thigh stays juicy in adobo; simmer 5 minutes less than pork.",
    },
    {
      substituteId: "tofu",
      label: "Tokwa (Firm Tofu)",
      ratio: 1.25,
      note: "Press and cube tokwa, then brown well before adding the sauce.",
    },
  ],
  "pork-spareribs": [
    {
      substituteId: "chicken-thigh",
      label: "Chicken",
      ratio: 0.9,
      note: "Use bone-in thigh if available; it needs less simmering than spareribs.",
    },
  ],
  "ground-pork": [
    {
      substituteId: "tofu",
      label: "Tokwa (Firm Tofu)",
      ratio: 1.2,
      note: "Crumble tokwa and brown it first so the filling stays firm.",
    },
  ],
  "beef-sirloin": [
    {
      substituteId: "chicken-thigh",
      label: "Chicken",
      ratio: 1,
      note: "Slice thin against the grain and cook just until browned.",
    },
  ],
  onion: [
    {
      substituteId: "red-onion",
      label: "Red onion",
      ratio: 60,
      note: "Use 60 g for 1 pc; red onion is sharper, so slice thin.",
    },
  ],
  garlic: [
    {
      substituteId: "toasted-garlic",
      label: "Toasted garlic",
      ratio: 0.75,
      note: "Use 0.75 g flakes per clove and add near the end.",
    },
  ],
  kangkong: [
    {
      substituteId: "sitaw",
      label: "Sitaw (String Beans)",
      ratio: 0.85,
      note: "Cut sitaw short and simmer a little longer than kangkong.",
    },
  ],
  "fish-sauce": [
    {
      substituteId: "soy-sauce",
      label: "Soy sauce",
      ratio: 0.75,
      note: "Use less soy sauce; it is saltier and has no patis aroma.",
    },
  ],
};

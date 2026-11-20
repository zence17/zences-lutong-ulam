import type { Recipe } from "@/types/recipe";

export const recipes: Recipe[] = [
  {
    slug: "pork-adobo",
    image: "/images/recipes/pork-adobo.jpg",
    title: "Pork Adobo",
    tagline: "The everyday icon: soy, vinegar, garlic, and patience in one pot.",
    category: "Karne",
    prepTimeMins: 15,
    cookTimeMins: 50,
    baseServings: 4,
    emoji: "🍲",
    ingredients: [
      { ingredientId: "pork-kasim", amount: 600, displayAmount: "600 g", unit: "g" },
      { ingredientId: "soy-sauce", amount: 120, displayAmount: "1/2 cup", unit: "mL" },
      { ingredientId: "vinegar", amount: 150, displayAmount: "2/3 cup", unit: "mL" },
      { ingredientId: "garlic", amount: 6, displayAmount: "6 cloves", unit: "cloves" },
      { ingredientId: "bay-leaf", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "black-pepper", amount: 2, displayAmount: "1/2 tsp", unit: "g" },
      { ingredientId: "white-sugar", amount: 10, displayAmount: "2 tsp", unit: "g" },
      { ingredientId: "cooking-oil", amount: 30, displayAmount: "2 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 4, displayAmount: "1/2 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "adobo-1",
        instruction:
          "In a bowl, combine pork, soy sauce, garlic, bay leaf, black pepper, and sugar. Marinate for at least 30 minutes, or overnight in the refrigerator.",
      },
      {
        id: "adobo-2",
        instruction:
          "Heat oil in a wide pot over medium heat. Lift pork from the marinade and brown on all sides.",
        durationMins: 5,
      },
      {
        id: "adobo-3",
        instruction:
          "Pour in the marinade and vinegar. Bring to a boil without stirring, then lower the heat, cover, and simmer until the pork is tender.",
        durationMins: 35,
      },
      {
        id: "adobo-4",
        instruction:
          "Uncover, season with salt, and simmer until the sauce reduces and coats the pork.",
        durationMins: 10,
      },
      {
        id: "adobo-5",
        instruction: "Serve hot with steamed rice. The sauce thickens as it cools.",
      },
    ],
    tipidTip:
      "Kasim gives the same adobo flavor as liempo for less. Skip the extra oil and let the pork's own fat render while browning.",
  },
  {
    slug: "sinigang-na-baboy",
    image: "/images/recipes/sinigang-na-baboy.jpg",
    title: "Sinigang na Baboy",
    tagline: "A sour, soupy hug packed with palengke vegetables.",
    category: "Sabaw",
    prepTimeMins: 20,
    cookTimeMins: 45,
    baseServings: 4,
    emoji: "🥣",
    ingredients: [
      { ingredientId: "pork-spareribs", amount: 600, displayAmount: "600 g", unit: "g" },
      { ingredientId: "sinigang-mix", amount: 2, displayAmount: "2 sachets", unit: "sachet" },
      { ingredientId: "tomato", amount: 3, displayAmount: "3 pcs", unit: "pcs" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "radish", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "green-papaya", amount: 300, displayAmount: "300 g", unit: "g" },
      { ingredientId: "okra", amount: 150, displayAmount: "150 g", unit: "g" },
      { ingredientId: "sitaw", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "siling-haba", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "scallions", amount: 1, displayAmount: "1 tali", unit: "tali" },
      { ingredientId: "fish-sauce", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "cooking-oil", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
    ],
    steps: [
      {
        id: "sinigang-1",
        instruction:
          "In a pot, heat oil and sauté onion and tomato until soft. Add pork and cook until the outside turns light brown.",
        durationMins: 5,
      },
      {
        id: "sinigang-2",
        instruction: "Pour in 1.5 liters of water and bring to a boil. Skim off scum, then simmer until pork is tender.",
        durationMins: 30,
      },
      {
        id: "sinigang-3",
        instruction: "Add radish and green papaya; cook until just starting to soften.",
        durationMins: 5,
      },
      {
        id: "sinigang-4",
        instruction:
          "Stir in sinigang mix, then add okra, sitaw, and siling haba. Simmer briefly so the vegetables stay crisp.",
        durationMins: 5,
      },
      {
        id: "sinigang-5",
        instruction: "Season with fish sauce to taste and finish with scallions. Serve with rice and a dipping dish on the side.",
      },
    ],
    tipidTip:
      "When fresh sampalok is pricey, tamarind sinigang mix plus a squeeze of calamansi gives the same sour kick. Sitaw and okra stretch the pot without stretching the budget.",
  },
  {
    slug: "tortang-talong",
    image: "/images/recipes/tortang-talong.jpg",
    title: "Tortang Talong",
    tagline: "Charred eggplant, fluffy egg, and a little ground pork.",
    category: "Prito / Gisa",
    prepTimeMins: 15,
    cookTimeMins: 25,
    baseServings: 4,
    emoji: "🍆",
    ingredients: [
      { ingredientId: "talong", amount: 4, displayAmount: "4 pcs", unit: "pcs" },
      { ingredientId: "egg", amount: 3, displayAmount: "3 pcs", unit: "pcs" },
      { ingredientId: "ground-pork", amount: 150, displayAmount: "150 g", unit: "g" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "garlic", amount: 3, displayAmount: "3 cloves", unit: "cloves" },
      { ingredientId: "scallions", amount: 1, displayAmount: "1 tali", unit: "tali" },
      { ingredientId: "soy-sauce", amount: 15, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "cooking-oil", amount: 60, displayAmount: "4 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 3, displayAmount: "1/2 tsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 1, displayAmount: "1/4 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "tortang-1",
        instruction: "Grill or broil eggplant until the skin is charred and the flesh is soft.",
        durationMins: 10,
      },
      {
        id: "tortang-2",
        instruction: "Peel the eggplant, flatten slightly, and trim the stem. Keep each eggplant whole.",
      },
      {
        id: "tortang-3",
        instruction:
          "Sauté garlic and onion in a little oil until fragrant. Add ground pork and cook until browned; season with soy sauce, salt, and pepper.",
        durationMins: 5,
      },
      {
        id: "tortang-4",
        instruction:
          "Beat eggs with scallions, then fold in the pork mixture. Dip each eggplant into the egg mixture, pressing so it adheres.",
      },
      {
        id: "tortang-5",
        instruction: "Fry in a lightly oiled pan over medium heat until golden on both sides. Serve with banana ketchup and rice.",
        durationMins: 6,
      },
    ],
    tipidTip:
      "Stretch the filling with grated sayote or carrot and keep ground pork to 150 g. The eggplant still makes each serving filling.",
  },
  {
    slug: "chicken-tinola",
    image: "/images/recipes/chicken-tinola.jpg",
    title: "Chicken Tinola",
    tagline: "Ginger-clear broth with sayote and green papaya.",
    category: "Sabaw",
    prepTimeMins: 20,
    cookTimeMins: 40,
    baseServings: 4,
    emoji: "🍜",
    ingredients: [
      { ingredientId: "chicken-thigh", amount: 700, displayAmount: "700 g", unit: "g" },
      { ingredientId: "green-papaya", amount: 400, displayAmount: "400 g", unit: "g" },
      { ingredientId: "sayote", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "ginger", amount: 30, displayAmount: "30 g", unit: "g" },
      { ingredientId: "garlic", amount: 4, displayAmount: "4 cloves", unit: "cloves" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "scallions", amount: 1, displayAmount: "1 tali", unit: "tali" },
      { ingredientId: "fish-sauce", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "cooking-oil", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 5, displayAmount: "1 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "tinola-1",
        instruction: "Heat oil in a pot and sauté garlic, onion, and sliced ginger until fragrant.",
        durationMins: 3,
      },
      {
        id: "tinola-2",
        instruction: "Add chicken pieces and cook until lightly browned on all sides.",
        durationMins: 5,
      },
      {
        id: "tinola-3",
        instruction: "Pour in 1.5 liters of water, bring to a boil, then simmer until chicken is cooked through.",
        durationMins: 20,
      },
      {
        id: "tinola-4",
        instruction: "Add green papaya and sayote; simmer until tender but not mushy.",
        durationMins: 10,
      },
      {
        id: "tinola-5",
        instruction: "Season with fish sauce and salt, then finish with scallions. Serve with rice and patis on the side.",
      },
    ],
    tipidTip:
      "Chicken thigh is cheaper and more flavorful than whole chicken for tinola. Green papaya is usually the least expensive sabaw vegetable at the palengke.",
  },
  {
    slug: "ginisang-monggo",
    image: "/images/recipes/ginisang-monggo.jpg",
    title: "Ginisang Monggo",
    tagline: "Mung beans with tinapa, tokwa, and crunchy chicharon.",
    category: "Gulay",
    prepTimeMins: 15,
    cookTimeMins: 35,
    baseServings: 4,
    emoji: "🫘",
    ingredients: [
      { ingredientId: "monggo", amount: 250, displayAmount: "250 g", unit: "g" },
      { ingredientId: "tinapa", amount: 100, displayAmount: "100 g", unit: "g" },
      { ingredientId: "chicharon", amount: 50, displayAmount: "50 g", unit: "g" },
      { ingredientId: "tofu", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "tomato", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "garlic", amount: 4, displayAmount: "4 cloves", unit: "cloves" },
      { ingredientId: "scallions", amount: 1, displayAmount: "1 tali", unit: "tali" },
      { ingredientId: "cooking-oil", amount: 30, displayAmount: "2 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 6, displayAmount: "1 tsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 1, displayAmount: "1/4 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "monggo-1",
        instruction: "Rinse and soak monggo for 30 minutes, then drain.",
        durationMins: 30,
      },
      {
        id: "monggo-2",
        instruction: "Simmer monggo in 750 mL of water until mostly tender and the skins start to split.",
        durationMins: 20,
      },
      {
        id: "monggo-3",
        instruction:
          "In a pan, sauté garlic, onion, and tomato. Add flaked tinapa and cubed tokwa; cook until fragrant.",
        durationMins: 5,
      },
      {
        id: "monggo-4",
        instruction: "Stir the sauté into the monggo, season with salt and pepper, and simmer until creamy.",
        durationMins: 5,
      },
      {
        id: "monggo-5",
        instruction: "Top with crushed chicharon and scallions just before serving so they stay crunchy.",
      },
    ],
    tipidTip:
      "Flaked tinapa and a little chicharon give deep flavor without extra meat. Tokwa adds protein for pennies compared with another pork cut.",
  },
  {
    slug: "bistek-tagalog",
    image: "/images/recipes/bistek-tagalog.jpg",
    title: "Bistek Tagalog",
    tagline: "Tender beef in soy and calamansi with rings of onion.",
    category: "Karne",
    prepTimeMins: 20,
    cookTimeMins: 25,
    baseServings: 4,
    emoji: "🥩",
    ingredients: [
      { ingredientId: "beef-sirloin", amount: 500, displayAmount: "500 g", unit: "g" },
      { ingredientId: "soy-sauce", amount: 90, displayAmount: "6 tbsp", unit: "mL" },
      { ingredientId: "calamansi", amount: 8, displayAmount: "8 pcs", unit: "pcs" },
      { ingredientId: "onion", amount: 3, displayAmount: "3 pcs", unit: "pcs" },
      { ingredientId: "garlic", amount: 4, displayAmount: "4 cloves", unit: "cloves" },
      { ingredientId: "white-sugar", amount: 15, displayAmount: "1 tbsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 2, displayAmount: "1/2 tsp", unit: "g" },
      { ingredientId: "cooking-oil", amount: 40, displayAmount: "3 tbsp", unit: "mL" },
      { ingredientId: "cornstarch", amount: 10, displayAmount: "1 tbsp", unit: "g" },
      { ingredientId: "salt", amount: 2, displayAmount: "1/4 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "bistek-1",
        instruction:
          "Slice beef thinly against the grain. Marinate in soy sauce, calamansi juice, garlic, sugar, black pepper, and cornstarch for 20 minutes.",
        durationMins: 20,
      },
      {
        id: "bistek-2",
        instruction: "Slice onions into rings and separate them. Pat beef dry, saving the marinade.",
      },
      {
        id: "bistek-3",
        instruction: "Heat oil in a pan and brown beef in batches so it sears instead of steaming.",
        durationMins: 6,
      },
      {
        id: "bistek-4",
        instruction:
          "Add onion rings and the reserved marinade. Simmer until the sauce thickens and the onions soften.",
        durationMins: 8,
      },
      {
        id: "bistek-5",
        instruction: "Season with salt to taste and serve over steamed rice with the pan sauce.",
      },
    ],
    tipidTip:
      "Buy beef early in the morning when palengke cuts are freshest, and always slice against the grain so a cheaper cut still feels tender.",
  },
  {
    slug: "adobong-kangkong",
    image: "/images/recipes/adobong-kangkong.jpg",
    title: "Adobong Kangkong",
    tagline: "Crisp kangkong tossed in garlicky soy-vinegar adobo sauce.",
    category: "Gulay",
    prepTimeMins: 10,
    cookTimeMins: 10,
    baseServings: 4,
    emoji: "🥬",
    ingredients: [
      { ingredientId: "kangkong", amount: 300, displayAmount: "300 g", unit: "g" },
      { ingredientId: "soy-sauce", amount: 45, displayAmount: "3 tbsp", unit: "mL" },
      { ingredientId: "vinegar", amount: 45, displayAmount: "3 tbsp", unit: "mL" },
      { ingredientId: "garlic", amount: 8, displayAmount: "8 cloves", unit: "cloves" },
      { ingredientId: "cooking-oil", amount: 30, displayAmount: "2 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 3, displayAmount: "1/2 tsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 1, displayAmount: "1/4 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "kangkong-1",
        instruction: "Wash kangkong well, separate the stalks from the leaves, and cut the stalks into 5 cm pieces.",
      },
      {
        id: "kangkong-2",
        instruction: "Heat oil in a wok over medium-high heat and fry the garlic until fragrant and lightly golden.",
        durationMins: 2,
      },
      {
        id: "kangkong-3",
        instruction: "Add the kangkong stalks and stir-fry, then add the leaves and toss until just wilted.",
        durationMins: 3,
      },
      {
        id: "kangkong-4",
        instruction: "Pour in soy sauce, vinegar, salt, and pepper. Toss quickly so the leaves stay bright and crisp.",
        durationMins: 2,
      },
      {
        id: "kangkong-5",
        instruction: "Serve immediately with steamed rice while the sauce is still fragrant.",
      },
    ],
    tipidTip:
      "Buy kangkong by the bunch in the morning and use the stalks first; the leaves cook in seconds, so you save gas and keep more of the vegetable.",
  },
  {
    slug: "ginataang-kalabasa-at-sitaw",
    image: "/images/recipes/ginataang-kalabasa-at-sitaw.jpg",
    title: "Ginataang Kalabasa at Sitaw",
    tagline: "Creamy squash and string beans in coconut milk with a bagoong kick.",
    category: "Gulay",
    prepTimeMins: 15,
    cookTimeMins: 20,
    baseServings: 4,
    emoji: "🥥",
    ingredients: [
      { ingredientId: "kalabasa", amount: 500, displayAmount: "500 g", unit: "g" },
      { ingredientId: "sitaw", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "gata", amount: 400, displayAmount: "400 mL", unit: "mL" },
      { ingredientId: "bagoong-alamang", amount: 30, displayAmount: "1 sachet", unit: "g" },
      { ingredientId: "garlic", amount: 4, displayAmount: "4 cloves", unit: "cloves" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "siling-haba", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "cooking-oil", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 4, displayAmount: "1/2 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "ginataan-1",
        instruction: "Peel and cube the kalabasa, then trim the sitaw into 5 cm lengths.",
      },
      {
        id: "ginataan-2",
        instruction: "Sauté garlic and onion in oil until soft, then stir in bagoong alamang and siling haba.",
        durationMins: 3,
      },
      {
        id: "ginataan-3",
        instruction: "Add the kalabasa and 200 mL of water, then simmer until the squash starts to soften.",
        durationMins: 8,
      },
      {
        id: "ginataan-4",
        instruction: "Pour in the coconut milk and add the sitaw. Simmer gently until the squash is tender and the sauce thickens.",
        durationMins: 8,
      },
      {
        id: "ginataan-5",
        instruction: "Season with salt to taste and serve hot with steamed rice.",
      },
    ],
    tipidTip:
      "When fresh coconut is pricey, canned gata diluted with a little water still tastes rich. Let the kalabasa melt into the sauce to stretch the dish for more servings.",
  },
  {
    slug: "lumpiang-shanghai",
    image: "/images/recipes/lumpiang-shanghai.jpg",
    title: "Lumpiang Shanghai",
    tagline: "Crispy Filipino pork spring rolls with minced vegetables and seasoning.",
    category: "Prito / Gisa",
    prepTimeMins: 25,
    cookTimeMins: 15,
    baseServings: 4,
    emoji: "🥟",
    ingredients: [
      { ingredientId: "ground-pork", amount: 250, displayAmount: "250 g", unit: "g" },
      { ingredientId: "carrot", amount: 100, displayAmount: "100 g", unit: "g" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "garlic", amount: 3, displayAmount: "3 cloves", unit: "cloves" },
      { ingredientId: "lumpia-wrapper", amount: 20, displayAmount: "20 pcs", unit: "pcs" },
      { ingredientId: "soy-sauce", amount: 15, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "black-pepper", amount: 1, displayAmount: "1/4 tsp", unit: "g" },
      { ingredientId: "cornstarch", amount: 10, displayAmount: "1 tbsp", unit: "g" },
      { ingredientId: "cooking-oil", amount: 100, displayAmount: "1/2 cup", unit: "mL" },
      { ingredientId: "salt", amount: 3, displayAmount: "1/2 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "lumpia-1",
        instruction:
          "Finely mince the carrot, onion, and garlic. Mix with ground pork, soy sauce, black pepper, cornstarch, and salt.",
      },
      {
        id: "lumpia-2",
        instruction:
          "Lay a wrapper flat, spoon a little filling near the edge, then roll tightly and seal with a dab of water.",
      },
      {
        id: "lumpia-3",
        instruction: "Repeat until the filling is used, keeping the rolled lumpia covered with a clean towel.",
        durationMins: 15,
      },
      {
        id: "lumpia-4",
        instruction: "Heat oil in a pan over medium heat and fry the lumpia in batches until golden and cooked through.",
        durationMins: 8,
      },
      {
        id: "lumpia-5",
        instruction: "Drain on paper towels and serve with banana ketchup or sweet chili sauce.",
      },
    ],
    tipidTip:
      "Stretch the filling with grated carrot or finely chopped tokwa so 20 wrappers go further without losing the pork flavor.",
  },
  {
    slug: "chicken-arroz-caldo",
    image: "/images/recipes/chicken-arroz-caldo.jpg",
    title: "Chicken Arroz Caldo",
    tagline: "Ginger-garlic rice porridge with chicken, boiled egg, and scallions.",
    category: "Sabaw",
    prepTimeMins: 15,
    cookTimeMins: 40,
    baseServings: 4,
    emoji: "🍚",
    ingredients: [
      { ingredientId: "chicken-thigh", amount: 400, displayAmount: "400 g", unit: "g" },
      { ingredientId: "white-rice", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "malagkit", amount: 50, displayAmount: "50 g", unit: "g" },
      { ingredientId: "ginger", amount: 30, displayAmount: "30 g", unit: "g" },
      { ingredientId: "garlic", amount: 5, displayAmount: "5 cloves", unit: "cloves" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "egg", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "scallions", amount: 1, displayAmount: "1 tali", unit: "tali" },
      { ingredientId: "kasubha", amount: 1, displayAmount: "1 pinch", unit: "g" },
      { ingredientId: "toasted-garlic", amount: 10, displayAmount: "10 g", unit: "g" },
      { ingredientId: "fish-sauce", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "cooking-oil", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 4, displayAmount: "1/2 tsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 1, displayAmount: "1/4 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "arroz-caldo-1",
        instruction: "Hard-boil the eggs, peel them, and set aside. Rinse both rice types until the water runs clear.",
      },
      {
        id: "arroz-caldo-2",
        instruction: "In a pot, sauté garlic, onion, and sliced ginger in oil until fragrant.",
        durationMins: 3,
      },
      {
        id: "arroz-caldo-3",
        instruction:
          "Add the chicken and cook until lightly browned, then stir in both rice types, kasubha, fish sauce, salt, and pepper.",
        durationMins: 5,
      },
      {
        id: "arroz-caldo-4",
        instruction:
          "Pour in 1.5 liters of water, bring to a boil, then simmer uncovered, stirring occasionally, until the rice is creamy and the chicken is tender.",
        durationMins: 30,
      },
      {
        id: "arroz-caldo-5",
        instruction: "Ladle into bowls and top with sliced egg, scallions, and toasted garlic flakes.",
      },
    ],
    tipidTip:
      "A mix of regular rice and a little malagkit gives creamy arroz caldo without pricier all-glutinous rice. Chicken thigh keeps the pot filling and affordable.",
  },
  {
    slug: "classic-tablea-champorado",
    image: "/images/recipes/classic-tablea-champorado.jpg",
    title: "Classic Tablea Champorado",
    tagline: "Rich Filipino chocolate rice porridge with tablea, brown sugar, and evaporated milk.",
    category: "Sabaw",
    prepTimeMins: 5,
    cookTimeMins: 25,
    baseServings: 4,
    emoji: "🍫",
    ingredients: [
      { ingredientId: "malagkit", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "tablea", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "brown-sugar", amount: 100, displayAmount: "100 g", unit: "g" },
      { ingredientId: "evaporated-milk", amount: 100, displayAmount: "100 mL", unit: "mL" },
      { ingredientId: "salt", amount: 2, displayAmount: "1 pinch", unit: "g" },
    ],
    steps: [
      {
        id: "champorado-1",
        instruction: "Rinse the malagkit until the water runs clear, then drain.",
      },
      {
        id: "champorado-2",
        instruction:
          "In a pot, combine the rice with 1 liter of water. Bring to a boil, then simmer, stirring often, until the grains are soft and the mixture thickens.",
        durationMins: 20,
      },
      {
        id: "champorado-3",
        instruction:
          "Dissolve the tablea and brown sugar in a little hot water, then stir into the pot. Simmer until glossy and chocolaty.",
        durationMins: 5,
      },
      {
        id: "champorado-4",
        instruction: "Stir in the salt and ladle the champorado into bowls.",
      },
      {
        id: "champorado-5",
        instruction: "Drizzle evaporated milk over each bowl just before serving.",
      },
    ],
    tipidTip:
      "Tablea gives deeper chocolate flavor than instant cocoa packets for less. Buy malagkit by the 1/4 kg and save the rest for another merienda.",
  },
  {
    slug: "ginisang-sardinas-with-misua",
    image: "/images/recipes/ginisang-sardinas-with-misua.jpg",
    title: "Ginisang Sardinas with Misua",
    tagline: "A 15-minute sardine soup with garlic, onion, patola, and delicate misua.",
    category: "Sabaw",
    prepTimeMins: 5,
    cookTimeMins: 10,
    baseServings: 4,
    emoji: "🐟",
    ingredients: [
      { ingredientId: "sardines", amount: 310, displayAmount: "310 g", unit: "g" },
      { ingredientId: "misua", amount: 50, displayAmount: "50 g", unit: "g" },
      { ingredientId: "patola", amount: 300, displayAmount: "300 g", unit: "g" },
      { ingredientId: "garlic", amount: 5, displayAmount: "5 cloves", unit: "cloves" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "siling-haba", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "cooking-oil", amount: 20, displayAmount: "1 tbsp", unit: "mL" },
    ],
    steps: [
      {
        id: "sardinas-1",
        instruction:
          "Drain the sardines, keeping the tomato sauce in a bowl, and set the fish aside.",
      },
      {
        id: "sardinas-2",
        instruction: "Peel and cube the patola, then slice the onion, garlic, and siling haba.",
      },
      {
        id: "sardinas-3",
        instruction: "Heat oil in a pot and sauté garlic, onion, and siling haba until fragrant.",
        durationMins: 3,
      },
      {
        id: "sardinas-4",
        instruction:
          "Add the reserved tomato sauce and 750 mL of water, then bring to a simmer. Add patola and cook until slightly tender.",
        durationMins: 5,
      },
      {
        id: "sardinas-5",
        instruction:
          "Stir in the misua and sardines, then simmer briefly until the noodles are soft. Serve hot with rice.",
        durationMins: 2,
      },
    ],
    tipidTip:
      "Stretch two cans of sardines with patola and misua into four bowls. Keep the tomato sauce and add water, so there is no need for pricey stock cubes.",
  },
  {
    slug: "pork-menudo",
    image: "/images/recipes/pork-menudo.jpg",
    title: "Pork Menudo",
    tagline: "Classic tomato-based pork stew with potatoes, carrots, and liver.",
    category: "Karne",
    prepTimeMins: 20,
    cookTimeMins: 45,
    baseServings: 4,
    emoji: "🍛",
    ingredients: [
      { ingredientId: "pork-kasim", amount: 500, displayAmount: "500 g", unit: "g" },
      { ingredientId: "pork-liver", amount: 200, displayAmount: "200 g", unit: "g" },
      { ingredientId: "potato", amount: 300, displayAmount: "300 g", unit: "g" },
      { ingredientId: "carrot", amount: 150, displayAmount: "150 g", unit: "g" },
      { ingredientId: "tomato-sauce", amount: 250, displayAmount: "1 can (250 g)", unit: "g" },
      { ingredientId: "tomato", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "garlic", amount: 4, displayAmount: "4 cloves", unit: "cloves" },
      { ingredientId: "soy-sauce", amount: 30, displayAmount: "2 tbsp", unit: "mL" },
      { ingredientId: "bay-leaf", amount: 2, displayAmount: "2 pcs", unit: "pcs" },
      { ingredientId: "cooking-oil", amount: 30, displayAmount: "2 tbsp", unit: "mL" },
      { ingredientId: "white-sugar", amount: 5, displayAmount: "1 tsp", unit: "g" },
      { ingredientId: "salt", amount: 4, displayAmount: "1/2 tsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 2, displayAmount: "1/2 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "menudo-1",
        instruction:
          "Cut the pork and liver into small cubes. Toss with soy sauce, salt, and black pepper, then set aside for 10 minutes.",
        durationMins: 10,
      },
      {
        id: "menudo-2",
        instruction:
          "Heat oil in a pot and brown the pork on all sides. Add the liver and cook briefly until it loses its raw color.",
        durationMins: 8,
      },
      {
        id: "menudo-3",
        instruction:
          "Sauté garlic and onion until soft, then add tomato and tomato sauce. Stir in bay leaf and sugar.",
        durationMins: 5,
      },
      {
        id: "menudo-4",
        instruction:
          "Cover and simmer until the pork is tender, adding a little water if the sauce thickens too much.",
        durationMins: 20,
      },
      {
        id: "menudo-5",
        instruction:
          "Add potato and carrot and cook until tender. Season to taste and serve hot with steamed rice.",
        durationMins: 12,
      },
    ],
    tipidTip:
      "Kasim keeps the stew affordable while potato and carrot stretch four servings. A little liver adds the classic menudo richness without another expensive cut.",
  },
  {
    slug: "ginisang-ampalaya-with-egg",
    image: "/images/recipes/ginisang-ampalaya-with-egg.jpg",
    title: "Ginisang Ampalaya with Egg",
    tagline: "Budget-friendly sautéed bitter melon with beaten eggs and tomatoes.",
    category: "Gulay",
    prepTimeMins: 15,
    cookTimeMins: 15,
    baseServings: 4,
    emoji: "🥬",
    ingredients: [
      { ingredientId: "ampalaya", amount: 300, displayAmount: "300 g", unit: "g" },
      { ingredientId: "egg", amount: 4, displayAmount: "4 pcs", unit: "pcs" },
      { ingredientId: "tomato", amount: 3, displayAmount: "3 pcs", unit: "pcs" },
      { ingredientId: "onion", amount: 1, displayAmount: "1 pc", unit: "pcs" },
      { ingredientId: "garlic", amount: 4, displayAmount: "4 cloves", unit: "cloves" },
      { ingredientId: "soy-sauce", amount: 20, displayAmount: "4 tsp", unit: "mL" },
      { ingredientId: "cooking-oil", amount: 30, displayAmount: "2 tbsp", unit: "mL" },
      { ingredientId: "salt", amount: 5, displayAmount: "1 tsp", unit: "g" },
      { ingredientId: "black-pepper", amount: 1, displayAmount: "1/4 tsp", unit: "g" },
    ],
    steps: [
      {
        id: "ampalaya-1",
        instruction:
          "Slice ampalaya thinly, sprinkle with a little salt, and let it sit for 5 minutes. Rinse well and drain to mellow the bitterness.",
        durationMins: 5,
      },
      {
        id: "ampalaya-2",
        instruction:
          "Beat the eggs with black pepper. Heat a little oil in a pan and scramble until just set, then remove and set aside.",
        durationMins: 3,
      },
      {
        id: "ampalaya-3",
        instruction:
          "In the same pan, sauté garlic and onion until fragrant, then add tomato and cook until softened.",
        durationMins: 4,
      },
      {
        id: "ampalaya-4",
        instruction:
          "Add ampalaya and soy sauce, cover, and cook until tender-crisp. Season with the remaining salt to taste.",
        durationMins: 5,
      },
      {
        id: "ampalaya-5",
        instruction: "Return the scrambled eggs to the pan, toss gently, and serve hot with rice.",
      },
    ],
    tipidTip:
      "Salting and rinsing ampalaya makes it gentler without extra ingredients. Eggs and tomato make this gulay filling even on a no-meat day.",
  },
];

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export interface Outfit {
  name: string;
  top: string;
  bottom: string;
  tip: string;
  image: string;
}

const PHOTO = {
  hot: [
    "https://images.pexels.com/photos/9480920/pexels-photo-9480920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/27468912/pexels-photo-27468912.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/12105793/pexels-photo-12105793.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  warm: [
    "https://images.pexels.com/photos/8989603/pexels-photo-8989603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/1346186/pexels-photo-1346186.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/6218324/pexels-photo-6218324.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  mild: [
    "https://images.pexels.com/photos/14097798/pexels-photo-14097798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/28765912/pexels-photo-28765912.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/13911221/pexels-photo-13911221.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  cool: [
    "https://images.pexels.com/photos/14491335/pexels-photo-14491335.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/6995898/pexels-photo-6995898.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  cold: [
    "https://images.pexels.com/photos/15161965/pexels-photo-15161965.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/1799895/pexels-photo-1799895.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/30477033/pexels-photo-30477033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
};

function outfitsForTemperature(temp: number): Outfit[] {
  if (temp >= 85) {
    return [
      {
        name: "Breezy Linen",
        top: "Flowy white linen blouse",
        bottom: "High-waisted denim shorts",
        tip: "Choose breathable fabrics and sunglasses for the bright afternoon.",
        image: PHOTO.hot[0],
      },
      {
        name: "Easy Summer",
        top: "Fitted sleeveless tank in a soft color",
        bottom: "Wide-leg linen pants",
        tip: "Sandals keep you cool and comfortable all day.",
        image: PHOTO.hot[1],
      },
      {
        name: "Sporty Fresh",
        top: "Cropped cotton tee",
        bottom: "Pleated mini skirt",
        tip: "Stay hydrated and pick a light, airy cardigan for indoor AC.",
        image: PHOTO.hot[2],
      },
    ];
  }
  if (temp >= 72) {
    return [
      {
        name: "Smart Casual",
        top: "Short-sleeve knit top",
        bottom: "Dark straight-leg jeans",
        tip: "Add white sneakers for an easy, polished look.",
        image: PHOTO.warm[0],
      },
      {
        name: "Garden Party",
        top: "Peplum blouse with puff sleeves",
        bottom: "Flowy midi skirt",
        tip: "Layer a light denim jacket for cooler evenings.",
        image: PHOTO.warm[1],
      },
      {
        name: "Relaxed Weekend",
        top: "Oversized graphic tee tucked at the front",
        bottom: "Cargo pants or wide-leg jeans",
        tip: "Slip-on loafers or sneakers complete the look.",
        image: PHOTO.warm[2],
      },
    ];
  }
  if (temp >= 60) {
    return [
      {
        name: "Layered Classic",
        top: "Long-sleeve blouse with a light cardigan",
        bottom: "Dark jeans",
        tip: "Bring the cardigan along since mornings can feel chilly.",
        image: PHOTO.mild[0],
      },
      {
        name: "Cozy Knit",
        top: "Fine-knit sweater",
        bottom: "A-line midi skirt",
        tip: "Ankle boots pair well with this combination.",
        image: PHOTO.mild[1],
      },
      {
        name: "Modern Utility",
        top: "Fitted turtleneck or mock-neck top",
        bottom: "Tailored trousers",
        tip: "A trench or denim jacket adds warmth without bulk.",
        image: PHOTO.mild[2],
      },
    ];
  }
  if (temp >= 45) {
    return [
      {
        name: "Warm Layers",
        top: "Chunky knit sweater over a thermal top",
        bottom: "Straight-leg jeans",
        tip: "A wool coat or puffer keeps the chill out.",
        image: PHOTO.cool[0],
      },
      {
        name: "Winter Minimal",
        top: "Turtleneck sweater",
        bottom: "Wool wide-leg trousers",
        tip: "Add a scarf and ankle boots for extra warmth.",
        image: PHOTO.cool[1],
      },
      {
        name: "Cozy Skirt",
        top: "Long-sleeve sweater tucked in",
        bottom: "Wool midi skirt with thermal tights",
        tip: "Choose a long coat to block the wind.",
        image: PHOTO.cool[2],
      },
    ];
  }
  return [
    {
      name: "Bundled Up",
      top: "Thermal base layer under a heavy knit sweater",
      bottom: "Lined trousers or thick jeans",
      tip: "An insulated puffer coat, gloves, and a hat are a must.",
      image: PHOTO.cold[0],
    },
    {
      name: "Winter Elegance",
      top: "Wool turtleneck with a long cardigan",
      bottom: "Fleece-lined leggings under a wool skirt",
      tip: "Waterproof boots keep your feet warm on icy sidewalks.",
      image: PHOTO.cold[1],
    },
    {
      name: "Cold-Weather Chic",
      top: "Fitted thermal top with a quilted vest",
      bottom: "Warm wool trousers",
      tip: "Layer a long wool coat over everything for the coldest hours.",
      image: PHOTO.cold[2],
    },
  ];
}

export function recommendOutfits(temp: number, precipitating: boolean): Outfit[] {
  const outfits = outfitsForTemperature(temp);
  if (!precipitating) return outfits;
  return outfits.map((outfit) => ({
    ...outfit,
    tip: `${outfit.tip} Bring an umbrella or a water-resistant jacket for the wet weather.`,
  }));
}

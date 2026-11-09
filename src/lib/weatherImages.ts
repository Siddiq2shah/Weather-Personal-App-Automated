const IMAGE_PARAMS = "auto=compress&cs=tinysrgb&h=650&w=940";

const SKY_PHOTO = {
  clear: `https://images.pexels.com/photos/37870706/pexels-photo-37870706.jpeg?${IMAGE_PARAMS}`,
  clouds: `https://images.pexels.com/photos/10161886/pexels-photo-10161886.jpeg?${IMAGE_PARAMS}`,
  rain: `https://images.pexels.com/photos/4510488/pexels-photo-4510488.jpeg?${IMAGE_PARAMS}`,
  snow: `https://images.pexels.com/photos/30757600/pexels-photo-30757600.jpeg?${IMAGE_PARAMS}`,
  storm: `https://images.pexels.com/photos/8964499/pexels-photo-8964499.jpeg?${IMAGE_PARAMS}`,
  fog: `https://images.pexels.com/photos/14376357/pexels-photo-14376357.jpeg?${IMAGE_PARAMS}`,
};

export function heroImageForCondition(conditionId: number): string {
  if (conditionId >= 200 && conditionId < 300) return SKY_PHOTO.storm;
  if (conditionId >= 300 && conditionId < 600) return SKY_PHOTO.rain;
  if (conditionId >= 600 && conditionId < 700) return SKY_PHOTO.snow;
  if (conditionId === 781) return SKY_PHOTO.storm;
  if (conditionId >= 700 && conditionId < 800) return SKY_PHOTO.fog;
  if (conditionId === 800) return SKY_PHOTO.clear;
  return SKY_PHOTO.clouds;
}

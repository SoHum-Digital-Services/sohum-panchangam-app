import type { ImageSourcePropType } from 'react-native';
import type { Stotram, TempleNews } from './api/temple';
import type { FestivalItem } from './api/types';

const shiva = require('../assets/home-illustrations/shiva-traditional.jpg');
const lingam = require('../assets/home-illustrations/lingam-traditional.jpg');
const bilva = require('../assets/home-illustrations/bilva-traditional.jpg');
const bathukamma = require('../assets/home-illustrations/bathukamma.jpg');
const amavasya = require('../assets/home-illustrations/amavasya.jpg');
const mahalaya = require('../assets/home-illustrations/mahalaya.jpg');
const durga = require('../assets/home-illustrations/durga.jpg');
const venkateswara = require('../assets/home-illustrations/venkateswara.jpg');
const venus = require('../assets/home-illustrations/venus.jpg');
const paroksha = require('../assets/home-illustrations/news-traditional.jpg');
const diya = require('../assets/home-illustrations/diya.jpg');

const festivalImages: Record<string, ImageSourcePropType> = {
  yatinam_mahalaya: mahalaya,
  bathukamma_begins: bathukamma,
  saddula_bathukamma: bathukamma,
  mahalaya_amavasya: amavasya,
  sharannavaratri: durga,
  durgashtami_ashwayuja: durga,
  maha_navami: durga,
  dasara: durga,
  tirumala_brahmotsavam_begins: venkateswara,
  sukra_mouda_begins: venus,
  sukra_mouda_ends: venus,
  kedareshwara_vratam: shiva,
};

export function festivalArtwork(item: FestivalItem): ImageSourcePropType {
  return festivalImages[item.key] ?? diya;
}

export function stotramArtwork(item: Stotram): ImageSourcePropType {
  if (item.slug === 'lingashtakam') return lingam;
  if (item.slug === 'bilvashtakam') return bilva;
  return item.deity.toLowerCase() === 'shiva' ? shiva : diya;
}

export function newsArtwork(item: TempleNews): ImageSourcePropType {
  return /paroksha/i.test(item.title) ? paroksha : diya;
}

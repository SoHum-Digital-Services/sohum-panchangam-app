import type { ImageSourcePropType } from 'react-native';
import type { Stotram, TempleNews } from './api/temple';

const shiva = require('../assets/home-illustrations/shiva.jpg');
const lingam = require('../assets/home-illustrations/lingam.jpg');
const bilva = require('../assets/home-illustrations/bilva.jpg');
const scripture = require('../assets/home-illustrations/scripture.jpg');
const paroksha = require('../assets/home-illustrations/paroksha-news.jpg');

export function stotramArtwork(item: Stotram): ImageSourcePropType {
  if (item.slug === 'lingashtakam') return lingam;
  if (item.slug === 'bilvashtakam') return bilva;
  if (item.slug.startsWith('sri-rudram-')) return scripture;
  return item.deity.toLowerCase() === 'shiva' ? shiva : scripture;
}

export function newsArtwork(item: TempleNews): ImageSourcePropType {
  return /paroksha/i.test(item.title) ? paroksha : scripture;
}

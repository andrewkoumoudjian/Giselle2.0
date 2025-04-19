import { AnimationDimension } from '../types/AnimationDimension';
import { getTransitionValues } from './getTransitionValues';

export const getCommonStyles = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  opacity: 0,
  [dimension]: 0,
  ...getTransitionValues(dimension, opacityDuration, sizeDuration),
});

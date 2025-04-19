import { AnimationDimension } from '../types/AnimationDimension';
import { AnimationSize } from '../types/AnimationSize';
import { getCommonStyles } from './getCommonStyles';
import { getTransitionValues } from './getTransitionValues';

export const getExpandableAnimationConfig = (
  isExpanded: boolean,
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
  size: AnimationSize,
) => ({
  initial: {
    ...getCommonStyles(dimension, opacityDuration, sizeDuration),
  },
  animate: {
    opacity: 1,
    [dimension]: isExpanded
      ? size === 'fit-content'
        ? 'fit-content'
        : dimension === 'width'
          ? '100%'
          : size
      : 0,
    ...getTransitionValues(dimension, opacityDuration, sizeDuration),
  },
  exit: {
    ...getCommonStyles(dimension, opacityDuration, sizeDuration),
  },
});

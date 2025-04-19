import { AnimationDimension } from '../types/AnimationDimension';

export const getTransitionValues = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  transition: {
    opacity: {
      duration: opacityDuration,
      ease: 'easeInOut',
    },
    [dimension]: {
      duration: sizeDuration,
      ease: 'easeInOut',
    },
  },
});

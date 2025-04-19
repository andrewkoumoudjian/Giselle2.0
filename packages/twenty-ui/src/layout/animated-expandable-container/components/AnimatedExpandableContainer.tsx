import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AnimationDimension } from '../types/AnimationDimension';
import { AnimationDurationObject } from '../types/AnimationDurationObject';
import { AnimationDurations } from '../types/AnimationDurations';
import { AnimationMode } from '../types/AnimationMode';
import { AnimationSize } from '../types/AnimationSize';
import { getExpandableAnimationConfig } from '../utils/getExpandableAnimationConfig';

const StyledMotionContainer = styled(motion.div)<{
  containAnimation: boolean;
}>`
  ${({ containAnimation }) =>
    containAnimation &&
    `
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  `}
`;

type AnimatedExpandableContainerProps = {
  children: ReactNode;
  isExpanded: boolean;
  dimension?: AnimationDimension;
  animationDurations?: AnimationDurations;
  mode?: AnimationMode;
  containAnimation?: boolean;
};

export const AnimatedExpandableContainer = ({
  children,
  isExpanded,
  dimension = 'height',
  animationDurations = 'default',
  mode = 'scroll-height',
  containAnimation = true,
}: AnimatedExpandableContainerProps) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<AnimationSize>(0);

  const actualDurations: AnimationDurationObject =
    animationDurations === 'default'
      ? {
          opacity: theme.animation.duration.normal,
          size: theme.animation.duration.normal,
        }
      : animationDurations;

  const updateSize = () => {
    if (
      mode === 'scroll-height' &&
      dimension === 'height' &&
      isDefined(contentRef.current)
    ) {
      setSize(contentRef.current.scrollHeight);
    }
  };

  const motionAnimationVariants = getExpandableAnimationConfig(
    isExpanded,
    dimension,
    actualDurations.opacity,
    actualDurations.size,
    mode === 'fit-content' ? 'fit-content' : size,
  );

  return (
    <AnimatePresence>
      {isExpanded && (
        <StyledMotionContainer
          containAnimation={containAnimation}
          ref={contentRef}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionAnimationVariants}
          onAnimationStart={updateSize}
        >
          {children}
        </StyledMotionContainer>
      )}
    </AnimatePresence>
  );
};

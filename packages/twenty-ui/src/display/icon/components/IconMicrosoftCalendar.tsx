import { useTheme } from '@emotion/react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconMicrosoftCalendarProps = Pick<IconComponentProps, 'size'>;

export const IconMicrosoftCalendar = (props: IconMicrosoftCalendarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 6H17V3C17 1.9 16.1 1 15 1H14C12.9 1 12 1.9 12 3V6H5C3.9 6 3 6.9 3 8V20C3 21.1 3.9 22 5 22H21C22.1 22 23 21.1 23 20V8C23 6.9 22.1 6 21 6ZM14 3H15V8H14V3ZM21 20H5V11H21V20Z"
        fill="#185ABD"
      />
      <path
        d="M7 15H10V18H7V15Z"
        fill="#41A5EE"
      />
      <path
        d="M18 15H15V18H18V15Z"
        fill="#41A5EE"
      />
      <path
        d="M7 13H10V14H7V13Z"
        fill="#41A5EE"
      />
      <path
        d="M11 13H14V14H11V13Z"
        fill="#41A5EE"
      />
      <path
        d="M15 13H18V14H15V13Z"
        fill="#41A5EE"
      />
      <path
        d="M11 15H14V18H11V15Z"
        fill="#41A5EE"
      />
    </svg>
  );
};

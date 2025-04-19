import { useTheme } from '@emotion/react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconMicrosoftOutlookProps = Pick<IconComponentProps, 'size'>;

export const IconMicrosoftOutlook = (props: IconMicrosoftOutlookProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 1.44822V1.75L10.5 5.83333L0 1.02778V0.972222C0 0.438889 0.4275 0 0.9 0H17.1C17.5725 0 18 0.438889 18 0.972222V1.44822ZM10.5 7.33333L18 3.25V13.6111C18 14.65 16.875 15.5 15.525 15.5H10.5V7.33333ZM0 2.52778L8.61 6.61111C9.045 6.83333 9.36 7.25556 9.36 7.78889V15.5H2.475C1.125 15.5 0 14.65 0 13.6111V2.52778Z"
        fill="#0078D4"
      />
    </svg>
  );
};

import { useTheme } from '@emotion/react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleCalendarProps = Pick<IconComponentProps, 'size'>;

export const IconGoogleCalendar = (props: IconGoogleCalendarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <path 
        d="M19.5 3H17.25V1.5H15.75V3H8.25V1.5H6.75V3H4.5C3.675 3 3 3.675 3 4.5V19.5C3 20.325 3.675 21 4.5 21H19.5C20.325 21 21 20.325 21 19.5V4.5C21 3.675 20.325 3 19.5 3ZM19.5 19.5H4.5V9H19.5V19.5ZM19.5 7.5H4.5V4.5H19.5V7.5ZM13.065 13.125L11.25 14.94L13.065 16.755L11.9775 17.8425L10.1625 16.0275L8.3475 17.8425L7.26 16.755L9.075 14.94L7.26 13.125L8.3475 12.0375L10.1625 13.8525L11.9775 12.0375L13.065 13.125ZM16.7625 12.0375L14.9475 13.8525L16.7625 15.6675L15.675 16.755L13.86 14.94L12.045 16.755L10.9575 15.6675L12.7725 13.8525L10.9575 12.0375L12.045 10.95L13.86 12.765L15.675 10.95L16.7625 12.0375Z" 
        fill="#4285F4"
      />
    </svg>
  );
};

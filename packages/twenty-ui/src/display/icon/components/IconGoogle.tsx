import { useTheme } from '@emotion/react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleProps = Pick<IconComponentProps, 'size'>;

export const IconGoogle = (props: IconGoogleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height={size} 
      width={size} 
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M21.8181 10.0001H12V14.0001H17.6363C16.7887 16.8047 14.1283 18.2729 12 18.2729C9.14918 18.2729 6.48026 16.1366 6.10692 13.1847C6.02055 12.6092 5.99714 12.0137 6.13517 11.4551C6.66532 8.79472 9.12169 6.72729 12 6.72729C13.6339 6.72729 15.0887 7.45693 16.1271 8.48184L19.146 5.46298C17.4613 3.94684 14.9137 3 12 3C7.92339 3 4.381 5.54656 3.37844 9.12732C3.06338 10.2819 3.00785 11.5344 3.25529 12.7187C4.3252 17.2593 8.1638 21 12 21C15.8615 21 20.1049 18.1549 21.3559 13.5766C21.8434 12.158 21.9486 10.5517 21.8181 10.0001Z"
        fill="#4285F4"
      />
    </svg>
  );
};

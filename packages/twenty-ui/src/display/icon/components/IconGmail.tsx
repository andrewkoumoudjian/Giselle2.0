import { useTheme } from '@emotion/react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGmailProps = Pick<IconComponentProps, 'size'>;

export const IconGmail = (props: IconGmailProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 16 12" 
      fill="none"
    >
      <path 
        d="M16 1.5V10.5C16 11.05 15.55 11.5 15 11.5H14V3.2625L8 6.825L2 3.2625V11.5H1C0.45 11.5 0 11.05 0 10.5V1.5C0 1.225 0.1 0.975 0.275 0.8C0.45 0.625 0.675 0.5 0.9375 0.5H1L8 4.5L15 0.5H15.0625C15.325 0.5 15.55 0.625 15.725 0.8C15.9 0.975 16 1.225 16 1.5Z" 
        fill="#EA4335"
      />
    </svg>
  );
};

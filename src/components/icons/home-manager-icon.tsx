import { View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Palette, Radius } from '@/constants/theme';

type HomeManagerIconVariant = 'plain' | 'tile' | 'auth';

type HomeManagerIconProps = {
  size?: number;
  color?: string;
  variant?: HomeManagerIconVariant;
  style?: ViewStyle;
};

const ICON_VIEWBOX_SIZE = 32;

export function HomeManagerIcon({
  size = 28,
  color = Palette.cream,
  variant = 'plain',
  style,
}: HomeManagerIconProps) {
  const icon = (
    <Svg width={size} height={size} viewBox={`0 0 ${ICON_VIEWBOX_SIZE} ${ICON_VIEWBOX_SIZE}`} fill="none">
      <Path
        d="M4 15.5 16 5l12 10.5V27a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V15.5Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Path d="M12 28v-8h8v8" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
    </Svg>
  );

  if (variant === 'plain') {
    return icon;
  }

  const containerSize = variant === 'auth' ? 54 : size + 20;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          width: containerSize,
          height: containerSize,
          borderRadius: Radius.iconTile,
          borderWidth: 1,
          borderColor: variant === 'auth' ? 'rgba(244,239,228,0.24)' : Palette.hairline,
          backgroundColor: variant === 'auth' ? 'rgba(244,239,228,0.07)' : Palette.sageTint,
        },
        style,
      ]}>
      {icon}
    </View>
  );
}

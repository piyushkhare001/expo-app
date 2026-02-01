import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const IconComponent = THEME_ICONS[colorScheme ?? 'light'];

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="rounded-full ios:size-9 web:mx-4"
    >
      <Icon as={IconComponent} className="size-5" />
    </Button>
  );
}

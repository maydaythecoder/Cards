import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@rneui/themed';
import { StyleSheet } from 'react-native';

export default function ThemeToggle () {
    const { theme, toggleTheme } = useTheme();
    const currentColors = Colors[theme];
//TODO: Use icon rather than button possibly sun and moon
  return (
    <Button
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      onPress={toggleTheme}
      buttonStyle={[styles.button, { backgroundColor: currentColors.tint }]}
      titleStyle={styles.title}
    />
  )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    }
})
import { useState} from 'react'
import { Button } from '@rneui/themed'
import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export default function ThemeToggle () {
    const [Theme, setTheme] = useState(Colors.light);

    const handleTheme = () => {
        if (Theme === Colors.light){
            setTheme(Colors.dark)
        }else{
            setTheme(Colors.light)
        }
    }
  return (
    <Button title={'ThemeButton'} onPress={handleTheme} style={styles.Button} />
  )
}

const styles = StyleSheet.create({
    Button: {
        backgroundColor: '#FF0000',
    }
})
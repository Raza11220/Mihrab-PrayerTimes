import { Image, StyleSheet } from 'react-native';

export default function BrandMark({ size = 34 }) {
  return (
    <Image
      source={require('../../assets/icon.png')}
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.28 }]}
      accessibilityLabel="Mihrab logo"
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    resizeMode: 'cover',
  },
});
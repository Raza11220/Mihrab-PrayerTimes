import { Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { type } from '../../theme/typography';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <Text style={type.h1}>Settings</Text>
      <Text style={type.bodyMuted}>Calculation method and location settings.</Text>
    </ScreenContainer>
  );
}
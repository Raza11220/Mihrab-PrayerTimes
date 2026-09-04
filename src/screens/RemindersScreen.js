import { Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { type } from '../../theme/typography';

export default function RemindersScreen() {
  return (
    <ScreenContainer>
      <Text style={type.h1}>Reminders</Text>
      <Text style={type.bodyMuted}>Prayer reminders will appear here.</Text>
    </ScreenContainer>
  );
}
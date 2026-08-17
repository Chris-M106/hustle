import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Stage placeholder for stages not yet integrated into the app shell.
 * Scanner, Plan, and Crisis are real screens; Profile and Ending are still
 * placeholders until their own consolidation. Labeled explicitly to avoid
 * mistaking placeholder text for the intended UX.
 */
export default function Placeholder({
  name,
  onNavigate,
}: {
  name: string;
  onNavigate: (to: 'scanner') => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.header} testID="placeholderHeader">{name} — not yet implemented</Text>
        <Text style={styles.note}>
          This stage does not have an RN screen yet. See CLAUDE.md for the
          implementation plan.
        </Text>
        <TouchableOpacity style={styles.button} testID="placeholderBackBtn" onPress={() => onNavigate('scanner')}>
          <Text style={styles.buttonText}>Back to Scanner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14100D' },
  body: { flex: 1, padding: 20, justifyContent: 'center', gap: 16 },
  header: { color: '#F5EDE3', fontSize: 18, fontWeight: '700' },
  note: { color: '#CBBBA6', fontSize: 14 },
  button: { backgroundColor: '#E2571E', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#14100D', fontSize: 15, fontWeight: '700' },
});

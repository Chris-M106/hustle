import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Not-yet-built stage. Only Scanner has a real screen (Ping 2). Labeled
 * explicitly as unimplemented rather than faking product content — do not
 * mistake this for the intended UX of that stage.
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
          This stage has no RN screen yet. Only Scanner is built. See CLAUDE.md
          implementation order.
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

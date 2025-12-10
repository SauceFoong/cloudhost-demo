import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '../constants/theme';
import { AnalyticsEvents } from '../services/analytics';
import { CURRENCIES } from '../constants/products';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function DepositScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AnalyticsEvents.logScreenView('Deposit');
    }, [])
  );

  const handleDeposit = async () => {
    const numericAmount = parseFloat(amount);
    
    if (!amount || isNaN(numericAmount) || numericAmount < 5) {
      Alert.alert('Error', 'Minimum deposit amount is $5');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await AnalyticsEvents.logDeposit(numericAmount, selectedCurrency.code);

      Alert.alert(
        'Success! 🎉',
        `You've deposited ${selectedCurrency.symbol}${numericAmount.toFixed(2)}`,
        [
          {
            text: 'Create Instance',
            onPress: () => navigation.navigate('CreateInstance'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process deposit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerIcon}>💳</Text>
          <Text style={styles.title}>Add Funds</Text>
          <Text style={styles.subtitle}>
            Deposit funds to start deploying servers
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>$0.00</Text>
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusText}>🎁 $100 free credit active</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Currency</Text>
          <TouchableOpacity
            style={styles.currencySelector}
            onPress={() => setShowCurrencyPicker(true)}
          >
            <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
            <Text style={styles.currencyName}>{selectedCurrency.name}</Text>
            <Text style={styles.currencyArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.presetsContainer}>
          {PRESET_AMOUNTS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                amount === preset.toString() && styles.presetButtonActive,
              ]}
              onPress={() => setAmount(preset.toString())}
            >
              <Text
                style={[
                  styles.presetText,
                  amount === preset.toString() && styles.presetTextActive,
                ]}
              >
                {selectedCurrency.symbol}{preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.depositButton, isLoading && styles.depositButtonDisabled]}
          onPress={handleDeposit}
          disabled={isLoading}
        >
          <Text style={styles.depositButtonText}>
            {isLoading ? 'Processing...' : `Deposit ${selectedCurrency.symbol}${amount || '0'}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 Secured by 256-bit SSL</Text>
      </ScrollView>

      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.currencyOption}
                  onPress={() => {
                    setSelectedCurrency(item);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.currencyOptionSymbol}>{item.symbol}</Text>
                  <View style={styles.currencyOptionInfo}>
                    <Text style={styles.currencyOptionCode}>{item.code}</Text>
                    <Text style={styles.currencyOptionName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  backButton: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  header: { marginBottom: spacing.xl },
  headerIcon: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary },
  balanceCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  balanceLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  balanceAmount: { fontSize: fontSize.hero, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  bonusBadge: { backgroundColor: colors.accentGreen + '20', borderRadius: borderRadius.sm, padding: spacing.xs, alignSelf: 'flex-start' },
  bonusText: { fontSize: fontSize.xs, color: colors.accentGreen },
  section: { marginBottom: spacing.lg },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.sm },
  currencySelector: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  currencyCode: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginRight: spacing.sm },
  currencyName: { fontSize: fontSize.md, color: colors.textSecondary, flex: 1 },
  currencyArrow: { fontSize: fontSize.xs, color: colors.textMuted },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, paddingHorizontal: spacing.md },
  currencySymbol: { fontSize: fontSize.xl, color: colors.textSecondary, marginRight: spacing.sm },
  amountInput: { flex: 1, fontSize: fontSize.xl, color: colors.textPrimary, paddingVertical: spacing.md },
  presetsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  presetButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  presetButtonActive: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  presetText: { fontSize: fontSize.sm, color: colors.textSecondary },
  presetTextActive: { color: colors.primary },
  depositButton: { backgroundColor: colors.accentGreen, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  depositButtonDisabled: { backgroundColor: colors.buttonDisabled },
  depositButtonText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  secureText: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.backgroundMid, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '50%' },
  modalHeader: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  currencyOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  currencyOptionSymbol: { fontSize: fontSize.xl, color: colors.textPrimary, width: 40 },
  currencyOptionInfo: { flex: 1, marginLeft: spacing.md },
  currencyOptionCode: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  currencyOptionName: { fontSize: fontSize.sm, color: colors.textSecondary },
});


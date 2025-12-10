import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '../constants/theme';
import { AnalyticsEvents } from '../services/analytics';
import { SERVER_PRODUCTS, ServerProduct } from '../constants/products';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const REGIONS = [
  { id: 'us-east-1', name: 'US East (N. Virginia)', flag: '🇺🇸' },
  { id: 'eu-west-1', name: 'Europe (Ireland)', flag: '🇪🇺' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', flag: '🇸🇬' },
];

export default function CreateInstanceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedProduct, setSelectedProduct] = useState<ServerProduct | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AnalyticsEvents.logScreenView('CreateInstance');
    }, [])
  );

  const handleCreateInstance = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a server plan');
      return;
    }
    if (!instanceName.trim()) {
      Alert.alert('Error', 'Please enter an instance name');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await AnalyticsEvents.logCreateInstance(selectedProduct.id);

      Alert.alert(
        'Instance Created! 🚀',
        `Your ${selectedProduct.name} server "${instanceName}" is deploying`,
        [{ text: 'View Dashboard', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create instance.');
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
          <Text style={styles.headerIcon}>🖥️</Text>
          <Text style={styles.title}>Create Instance</Text>
          <Text style={styles.subtitle}>Deploy a new cloud server</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Instance Name</Text>
          <TextInput
            style={styles.input}
            placeholder="my-awesome-server"
            placeholderTextColor={colors.textMuted}
            value={instanceName}
            onChangeText={setInstanceName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Plan</Text>
          {SERVER_PRODUCTS.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[styles.planCard, selectedProduct?.id === product.id && styles.planCardActive]}
              onPress={() => setSelectedProduct(product)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planIcon}>{product.icon}</Text>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{product.name}</Text>
                  <Text style={styles.planPrice}>${product.price}/mo</Text>
                </View>
                {selectedProduct?.id === product.id && (
                  <View style={styles.planCheck}><Text style={styles.checkIcon}>✓</Text></View>
                )}
              </View>
              <Text style={styles.planSpecs}>{product.cpu} • {product.ram} • {product.storage}</Text>
              <Text style={styles.productId}>ID: {product.id}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Region</Text>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.regionButton, region === r.id && styles.regionButtonActive]}
              onPress={() => setRegion(r.id)}
            >
              <Text style={styles.regionFlag}>{r.flag}</Text>
              <Text style={[styles.regionName, region === r.id && styles.regionNameActive]}>{r.name}</Text>
              {region === r.id && <Text style={styles.regionCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {selectedProduct && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>{selectedProduct.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Product ID</Text>
              <Text style={styles.productIdText}>{selectedProduct.id}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Monthly Cost</Text>
              <Text style={styles.summaryTotalValue}>${selectedProduct.price}/mo</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.createButton, (!selectedProduct || !instanceName || isLoading) && styles.createButtonDisabled]}
          onPress={handleCreateInstance}
          disabled={!selectedProduct || !instanceName || isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Instance'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  backButton: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  header: { marginBottom: spacing.xl },
  headerIcon: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.sm },
  input: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, fontSize: fontSize.md, color: colors.textPrimary },
  planCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: 'transparent' },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  planIcon: { fontSize: 32, marginRight: spacing.md },
  planInfo: { flex: 1 },
  planName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  planPrice: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.bold },
  planCheck: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkIcon: { fontSize: 16, color: colors.textPrimary },
  planSpecs: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  productId: { fontSize: fontSize.xs, color: colors.textMuted, fontFamily: 'monospace' },
  regionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  regionButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  regionFlag: { fontSize: 24, marginRight: spacing.md },
  regionName: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary },
  regionNameActive: { color: colors.primary },
  regionCheck: { fontSize: fontSize.md, color: colors.primary },
  summaryCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  summaryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  summaryValue: { fontSize: fontSize.sm, color: colors.textPrimary },
  productIdText: { fontSize: fontSize.xs, color: colors.textMuted, fontFamily: 'monospace' },
  summaryTotal: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  summaryTotalLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  summaryTotalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.accentGreen },
  createButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  createButtonDisabled: { backgroundColor: colors.buttonDisabled },
  createButtonText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
});


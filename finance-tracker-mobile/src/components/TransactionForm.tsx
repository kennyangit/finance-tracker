import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Feather } from '@expo/vector-icons';
import { Transaction, getCategoriesByType } from '../types';
import { getCurrentMonth } from '../utils/helpers';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  initialData?: Transaction;
}

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  description: z.string().optional(),
  value: z.string().min(1, 'Valor é obrigatório'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
});

type FormValues = z.infer<typeof formSchema>;

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      value: '',
      type: 'expense',
      category: '',
      date: getCurrentMonth() + '-01',
    },
  });

  const selectedType = watch('type');
  const availableCategories = selectedType ? getCategoriesByType(selectedType) : [];

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        value: initialData.value.toString(),
        type: initialData.type,
        category: initialData.category,
        date: initialData.date.split('T')[0],
      });
    } else {
      reset({
        title: '',
        description: '',
        value: '',
        type: 'expense',
        category: '',
        date: getCurrentMonth() + '-01',
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmitForm = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const transactionData = {
        title: data.title,
        description: data.description,
        value: parseFloat(data.value),
        type: data.type,
        category: data.category as any,
        date: data.date,
      };

      const success = await onSubmit(transactionData);
      setIsSubmitting(false);

      if (success) {
        reset();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialData ? 'Editar Transação' : 'Nova Transação'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Ex: Aluguel, Salário..."
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Detalhes (opcional)"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            {/* Value & Date Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Valor (R$) *</Text>
                <Controller
                  control={control}
                  name="value"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.value && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="0,00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  )}
                />
                {errors.value && (
                  <Text style={styles.errorText}>{errors.value.message}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Data *</Text>
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.date && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="AAAA-MM-DD"
                      placeholderTextColor={colors.textMuted}
                    />
                  )}
                />
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date.message}</Text>
                )}
              </View>
            </View>

            {/* Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo *</Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[
                        styles.segment,
                        value === 'expense' && styles.segmentActiveExpense,
                      ]}
                      onPress={() => {
                        onChange('expense');
                        setValue('category', '');
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name="arrow-down-left"
                        size={16}
                        color={
                          value === 'expense' ? '#fff' : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          value === 'expense' && styles.segmentTextActive,
                        ]}
                      >
                        Despesa
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.segment,
                        value === 'income' && styles.segmentActiveIncome,
                      ]}
                      onPress={() => {
                        onChange('income');
                        setValue('category', '');
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name="arrow-up-right"
                        size={16}
                        color={
                          value === 'income' ? '#fff' : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          value === 'income' && styles.segmentTextActive,
                        ]}
                      >
                        Receita
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Category Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria *</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    {availableCategories.map((cat) => {
                      const isActive = value === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.chip,
                            isActive && styles.chipActive,
                          ]}
                          onPress={() => onChange(cat)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category.message}</Text>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmitForm)}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? 'Salvando...'
                    : initialData
                    ? 'Salvar'
                    : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: colors.bgCardSolid,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    padding: spacing.md,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.bgSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  segmentActiveExpense: {
    backgroundColor: colors.expense,
  },
  segmentActiveIncome: {
    backgroundColor: colors.income,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#ffffff',
    fontWeight: fontWeight.semibold,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: fontWeight.semibold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.bgSubtle,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
  },
});

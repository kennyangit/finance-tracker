import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, getCategoriesByType } from '@/types';
import { getCurrentMonth } from '@/utils/helpers';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  initialData?: Transaction;
}

// Simple schema - category as string (will be validated as Category later)
const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  description: z.string().optional(),
  value: z.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória')
});

type FormValues = z.infer<typeof formSchema>;

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: TransactionFormProps) {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      value: 0,
      type: 'expense',
      category: '',
      date: getCurrentMonth() + '-01'
    }
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (selectedType) {
      const cats = getCategoriesByType(selectedType);
      setAvailableCategories(cats);
      // Reset category when type changes
      setValue('category', '');
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        value: initialData.value,
        type: initialData.type,
        category: initialData.category,
        date: initialData.date.split('T')[0]
      });
    } else {
      reset({
        title: '',
        description: '',
        value: 0,
        type: 'expense',
        category: '',
        date: getCurrentMonth() + '-01'
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const transactionData = {
        ...data,
        category: data.category as any,
        date: data.date
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

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000
  };

  const sheetStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'var(--card-bg)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1.5rem 1.5rem 0 0',
    padding: '2rem',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)'
  };

  const desktopSheetStyle: React.CSSProperties = {
    ...sheetStyle,
    borderRadius: '1rem',
    margin: '2rem',
    maxHeight: 'calc(90vh - 4rem)'
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: '1.25rem'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)'
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--bg-subtle)',
    border: `1px solid ${errors.title ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '0.5rem',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--danger)',
    marginTop: '0.25rem'
  };

  const getCategoryOptions = () => {
    return availableCategories.map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={overlayStyle}
          onClick={onClose}
        >
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={isMobile ? sheetStyle : desktopSheetStyle}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 id="form-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {initialData ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)}>
              <div style={inputGroupStyle}>
                <label style={labelStyle} htmlFor="title">Título *</label>
                <input
                  id="title"
                  {...register('title')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-subtle)',
                    border: `1px solid ${errors.title ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                  placeholder="Ex: Aluguel, Salário, Supermercado..."
                />
                {errors.title && (
                  <p style={errorStyle}>{errors.title.message}</p>
                )}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle} htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-subtle)',
                    border: `1px solid ${errors.description ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical' as const,
                    minHeight: '80px'
                  }}
                  placeholder="Detalhes adicionais (opcional)"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle} htmlFor="value">Valor (R$) *</label>
                  <input
                    id="value"
                    type="number"
                    step="0.01"
                    {...register('value', { valueAsNumber: true })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      border: `1px solid ${errors.value ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                    placeholder="0,00"
                  />
                  {errors.value && (
                    <p style={errorStyle}>{errors.value.message}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="date">Data *</label>
                  <input
                    id="date"
                    type="date"
                    {...register('date')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      border: `1px solid ${errors.date ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                  {errors.date && (
                    <p style={errorStyle}>{errors.date.message}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle} htmlFor="type">Tipo *</label>
                  <select
                    id="type"
                    {...register('type')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      border: `1px solid ${errors.type ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                  {errors.type && (
                    <p style={errorStyle}>{errors.type.message}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="category">Categoria *</label>
                  <select
                    id="category"
                    {...register('category')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      border: `1px solid ${errors.category ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      color: availableCategories.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      outline: 'none',
                      opacity: availableCategories.length === 0 ? 0.5 : 1
                    }}
                    disabled={availableCategories.length === 0}
                  >
                    <option value="">{availableCategories.length === 0 ? 'Selecione o tipo primeiro' : 'Selecione a categoria'}</option>
                    {getCategoryOptions()}
                  </select>
                  {errors.category && (
                    <p style={errorStyle}>{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.875rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty || !isValid}
                  style={{
                    flex: 1,
                    padding: '0.875rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: isSubmitting || !isDirty || !isValid
                      ? 'var(--bg-subtle)'
                      : 'var(--primary)',
                    color: isSubmitting || !isDirty || !isValid
                      ? 'var(--text-tertiary)'
                      : 'white',
                    fontWeight: 600,
                    cursor: isSubmitting || !isDirty || !isValid ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isSubmitting ? 'Salvando...' : initialData ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

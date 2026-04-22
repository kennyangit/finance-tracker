import { Transaction, ApiResponse } from '../types';
import { getSupabaseClient, TRANSACTIONS_TABLE } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'transactions_fallback';

class DatabaseService {
  private useSupabase: boolean = true;

  constructor() {
    // Check if Supabase is configured
    try {
      getSupabaseClient();
      console.log('Banco de dados: Usando Supabase');
    } catch (error) {
      console.warn('Banco de dados: Supabase não configurado, usando AsyncStorage como alternativa');
      this.useSupabase = false;
    }
  }

  private async getSupabaseData(): Promise<{ data: Transaction[] | null; error: any }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TRANSACTIONS_TABLE)
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async getLocalStorageData(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Transaction[] = data ? JSON.parse(data) : [];
      return parsed.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }

  private async setLocalStorageData(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore storage errors
    }
  }

  async getAll(): Promise<ApiResponse<Transaction[]>> {
    try {
      let transactions: Transaction[];

      if (this.useSupabase) {
        const result = await this.getSupabaseData();
        if (result.error) {
          console.warn('Banco de dados: Supabase falhou, usando AsyncStorage como alternativa');
          this.useSupabase = false;
          transactions = await this.getLocalStorageData();
        } else {
          transactions = result.data || [];
        }
      } else {
        transactions = await this.getLocalStorageData();
      }

      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Database error:', error);
      return {
        success: false,
        data: null,
        error: 'Falha ao buscar transações'
      };
    }
  }

  async getById(id: string): Promise<ApiResponse<Transaction | null>> {
    const all = await this.getAll();
    if (!all.success) {
      return {
        success: false,
        data: null,
        error: all.error
      };
    }

    if (!all.data) {
      return {
        success: true,
        data: null
      };
    }

    const transaction = all.data.find(t => t.id === id);
    return {
      success: true,
      data: transaction || null
    };
  }

  async create(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Transaction>> {
    try {
      const now = new Date().toISOString();
      const newTransaction: Transaction = {
        ...transactionData,
        id: Crypto.randomUUID(),
        created_at: now,
        updated_at: now
      };

      if (this.useSupabase) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from(TRANSACTIONS_TABLE)
          .insert([transactionData])
          .select()
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            // Fallback for non-auth errors
            this.useSupabase = false;
            const all = await this.getAll();
            if (all.success && all.data) {
              const updated = [...all.data, newTransaction];
              await this.setLocalStorageData(updated);
            }
            return { success: true, data: newTransaction };
          }
          return {
            success: false,
            data: null,
            error: error.message
          };
        }

        return {
          success: true,
          data: data
        };
      } else {
        // Use AsyncStorage
        const all = await this.getAll();
        if (!all.success) {
          return {
            success: false,
            data: null,
            error: all.error
          };
        }

        const updated = [...(all.data || []), newTransaction];
        await this.setLocalStorageData(updated);

        return {
          success: true,
          data: newTransaction
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: 'Failed to create transaction'
      };
    }
  }

  async update(id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<ApiResponse<Transaction>> {
    try {
      if (this.useSupabase) {
        const updatesWithTimestamp = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from(TRANSACTIONS_TABLE)
          .update(updatesWithTimestamp)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('record')) {
            return {
              success: false,
              data: null,
              error: 'Transaction not found'
            };
          }
          // Fallback
          this.useSupabase = false;
          const all = await this.getAll();
          if (all.success && all.data) {
            const index = all.data.findIndex(t => t.id === id);
            if (index === -1) {
              return { success: false, data: null, error: 'Transaction not found' };
            }
            const updatedTransaction = { ...all.data[index], ...updates, updated_at: new Date().toISOString() };
            const updated = [...all.data];
            updated[index] = updatedTransaction;
            await this.setLocalStorageData(updated);
            return { success: true, data: updatedTransaction };
          }
          return { success: false, data: null, error: error.message };
        }

        return {
          success: true,
          data: data
        };
      } else {
        // Use AsyncStorage
        const all = await this.getAll();
        if (!all.success || !all.data) {
          return { success: false, data: null, error: 'Failed to fetch transactions' };
        }

        const index = all.data.findIndex(t => t.id === id);
        if (index === -1) {
          return {
            success: false,
            data: null,
            error: 'Transaction not found'
          };
        }

        const updatedTransaction: Transaction = {
          ...all.data[index],
          ...updates,
          updated_at: new Date().toISOString()
        };

        const updated = [...all.data];
        updated[index] = updatedTransaction;
        await this.setLocalStorageData(updated);

        return {
          success: true,
          data: updatedTransaction
        };
      }
    } catch (error) {
      console.error('Database update error:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to update transaction'
      };
    }
  }

  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      if (this.useSupabase) {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from(TRANSACTIONS_TABLE)
          .delete()
          .eq('id', id);

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('record')) {
            return {
              success: false,
              data: null,
              error: 'Transaction not found'
            };
          }
          // Fallback
          this.useSupabase = false;
          const all = await this.getAll();
          if (all.success && all.data) {
            const beforeLength = all.data.length;
            const filtered = all.data.filter(t => t.id !== id);
            if (filtered.length === beforeLength) {
              return { success: false, data: null, error: 'Transaction not found' };
            }
            await this.setLocalStorageData(filtered);
            return { success: true, data: { deleted: true } };
          }
          return { success: false, data: null, error: error.message };
        }

        return {
          success: true,
          data: { deleted: true }
        };
      } else {
        // Use AsyncStorage
        const all = await this.getAll();
        if (!all.success || !all.data) {
          return { success: false, data: null, error: 'Failed to fetch transactions' };
        }

        const beforeLength = all.data.length;
        const filtered = all.data.filter(t => t.id !== id);

        if (filtered.length === beforeLength) {
          return {
            success: false,
            data: null,
            error: 'Transaction not found'
          };
        }

        await this.setLocalStorageData(filtered);

        return {
          success: true,
          data: { deleted: true }
        };
      }
    } catch (error) {
      console.error('Database delete error:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to delete transaction'
      };
    }
  }
}

export const db = new DatabaseService();

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScrewdriverWrench, faHourglass, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { getSupabaseClient } from '@/services/supabase';
import { db } from '@/services/database';

export function Debug() {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runDiagnostics() {
      const results: Record<string, any> = {};

      // Test Supabase connection
      try {
        const supabase = getSupabaseClient();
        results.supabaseClient = '✓ Connected (client initialized)';

        // Test table existence
        const { data, error } = await supabase
          .from('transactions')
          .select('count')
          .limit(1);

        if (error) {
          results.tableCheck = `✗ Error: ${error.message}`;
        } else {
          results.tableCheck = '✓ Table exists and accessible';
          results.sampleCount = data?.length || 0;
        }
      } catch (error: any) {
        results.supabaseClient = `✗ Error: ${error.message}`;
      }

      // Test database service
      try {
        const all = await db.getAll();
        results.databaseGetAll = all.success
          ? `✓ Success (${all.data?.length || 0} transactions)`
          : `✗ Failed: ${all.error}`;
      } catch (error: any) {
        results.databaseGetAll = `✗ Exception: ${error.message}`;
      }

      setStatus(results);
      setLoading(false);
    }

    runDiagnostics();
  }, []);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h1><FontAwesomeIcon icon={faScrewdriverWrench} /> Debug / Diagnóstico</h1>
      <p>Esta página verifica a conexão com o Supabase e o banco de dados.</p>

      {loading ? (
        <p><FontAwesomeIcon icon={faHourglass} spin /> Executando diagnósticos...</p>
      ) : (
        <div style={{
          background: 'var(--card-bg)',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)'
        }}>
          <h2>Resultados:</h2>
          <ul style={{ lineHeight: 2 }}>
            {Object.entries(status).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: '0.5rem' }}>
            <h3><FontAwesomeIcon icon={faClipboardList} /> Instruções de Verificação</h3>
            <ol style={{ marginLeft: '1.5rem', lineHeight: 1.8 }}>
              <li>Acesse <code style={{ background: 'var(--bg)', padding: '0.25rem' }}>/debug</code> no navegador</li>
              <li>Veja o status da conexão Supabase</li>
              <li>Se houver erro, verifique:
                <ul>
                  <li>Arquivo .env está configurado com as credenciais corretas</li>
                  <li>Tabela "transactions" existe no Supabase</li>
                  <li>RLS (Row Level Security) está desabilitado ou configurado corretamente</li>
                </ul>
              </li>
              <li>Volte para a página principal e tente adicionar uma transação</li>
              <li>Abra o Console (F12) e verifique os logs</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

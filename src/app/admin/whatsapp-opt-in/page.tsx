'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface OptInEntry {
  phone: string;
  optInDate?: Date;
  source: string;
}

export default function WhatsAppOptInPage() {
  const router = useRouter();
  const [optInList, setOptInList] = useState<OptInEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [batchNumbers, setBatchNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Carica lista opt-in
  useEffect(() => {
    fetchOptInList();
  }, []);

  const fetchOptInList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/whatsapp/opt-in');
      const data = await res.json();

      if (data.success) {
        setOptInList(data.data);
      }
    } catch (err) {
      console.error('Errore caricamento lista:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aggiungi singolo numero
  const handleAddOptIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/whatsapp/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, collection: 'customers' })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Opt-in abilitato per ${phoneNumber}`);
        setPhoneNumber('');
        fetchOptInList();
      } else {
        setError(data.error || 'Errore nell\'abilitazione opt-in');
      }
    } catch (err) {
      setError('Errore di rete');
    }
  };

  // Aggiungi batch
  const handleBatchAdd = async () => {
    setMessage('');
    setError('');

    const numbers = batchNumbers
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (numbers.length === 0) {
      setError('Inserisci almeno un numero');
      return;
    }

    try {
      const res = await fetch('/api/admin/whatsapp/opt-in/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers: numbers, collection: 'customers' })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setBatchNumbers('');
        fetchOptInList();
      } else {
        setError(data.error || 'Errore nell\'abilitazione batch');
      }
    } catch (err) {
      setError('Errore di rete');
    }
  };

  // Rimuovi opt-in
  const handleRemoveOptIn = async (phone: string) => {
    if (!confirm(`Rimuovere opt-in per ${phone}?`)) return;

    try {
      const res = await fetch('/api/admin/whatsapp/opt-in', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, collection: 'customers' })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Opt-in rimosso per ${phone}`);
        fetchOptInList();
      } else {
        setError(data.error || 'Errore nella rimozione opt-in');
      }
    } catch (err) {
      setError('Errore di rete');
    }
  };

  const headerActions = (
    <button
      onClick={() => router.push('/admin/dashboard')}
      className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
    >
      ← Dashboard
    </button>
  );

  return (
    <AdminLayout
      title="Gestione WhatsApp Opt-In"
      subtitle="Gestisci i consensi per l'invio di messaggi WhatsApp ai clienti"
      headerActions={headerActions}
    >
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong className="text-red-600">Importante:</strong> Aggiungi solo i numeri di clienti che ti hanno già
          scritto su WhatsApp per evitare il ban dell'account.
        </p>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Form singolo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Aggiungi Singolo Numero</h2>
          <form onSubmit={handleAddOptIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Numero di Telefono
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+39 333 1234567"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-olive"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Formati accettati: +39 333 1234567, 393331234567, 333 1234567
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-olive text-white px-6 py-2 rounded-lg hover:bg-olive/90 transition"
            >
              Aggiungi Opt-In
            </button>
          </form>
        </div>

        {/* Form batch */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Aggiungi Lista (Batch)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Numeri (uno per riga)
              </label>
              <textarea
                value={batchNumbers}
                onChange={(e) => setBatchNumbers(e.target.value)}
                placeholder="+39 333 1234567&#10;+39 334 9876543&#10;393351112233"
                rows={8}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-olive font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci un numero per riga. Puoi incollare da Excel/CSV.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBatchAdd}
              className="w-full bg-salvia text-white px-6 py-2 rounded-lg hover:bg-salvia/90 transition"
            >
              Aggiungi Lista
            </button>
          </div>
        </div>
      </div>

      {/* Lista opt-in */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            Numeri Autorizzati ({optInList.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Caricamento...
          </div>
        ) : optInList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessun numero autorizzato. Aggiungi i primi opt-in sopra.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Numero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fonte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data Opt-In
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {optInList.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                      {entry.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.optInDate
                        ? new Date(entry.optInDate).toLocaleDateString('it-IT')
                        : 'N/D'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleRemoveOptIn(entry.phone)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Rimuovi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info e istruzioni */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 flex items-center">
          <span className="mr-2">⚠️</span>
          Come usare questo sistema
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>1. Aggiungi solo numeri di clienti che ti hanno già scritto</strong> su WhatsApp
          </li>
          <li>
            <strong>2. Mai iniziare conversazioni non sollecitate</strong> - rischi il ban dell'account
          </li>
          <li>
            <strong>3. Quando un cliente ti scrive</strong>, vieni qui e aggiungi il suo numero manualmente
          </li>
          <li>
            <strong>4. Usa l'import batch</strong> se hai una lista esistente di clienti che ti hanno già contattato
          </li>
          <li>
            <strong>5. Il sistema controllerà automaticamente</strong> l'opt-in prima di inviare messaggi
          </li>
        </ul>
      </div>
    </AdminLayout>
  );
}

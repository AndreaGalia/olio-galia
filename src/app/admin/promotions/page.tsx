'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import type { PromotionCampaign } from '@/types/promotionCampaign';

type CampaignStatus = 'attiva' | 'programmata' | 'scaduta' | 'pausa';

const getStatus = (campaign: PromotionCampaign): CampaignStatus => {
  if (!campaign.active) return 'pausa';
  const now = new Date();
  if (now < new Date(campaign.startDate)) return 'programmata';
  if (now > new Date(campaign.endDate)) return 'scaduta';
  return 'attiva';
};

const STATUS_STYLES: Record<CampaignStatus, { label: string; className: string }> = {
  attiva:      { label: 'Attiva',      className: 'bg-green-100 text-green-800' },
  programmata: { label: 'Programmata', className: 'bg-blue-100 text-blue-800' },
  scaduta:     { label: 'Scaduta',     className: 'bg-gray-100 text-gray-600' },
  pausa:       { label: 'In pausa',    className: 'bg-amber-100 text-amber-800' },
};

const formatDiscount = (campaign: PromotionCampaign) =>
  campaign.discountType === 'percent'
    ? `-${campaign.discountValue}%`
    : `-€${campaign.discountValue.toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function PromotionsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promotions');
      if (!res.ok) return;
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Toggle attiva/pausa: PUT con il payload completo della campagna
  const toggleActive = async (campaign: PromotionCampaign) => {
    setActionError('');
    setBusyId(campaign.id);
    try {
      const res = await fetch(`/api/admin/promotions/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          badgeLabel: campaign.badgeLabel,
          discountType: campaign.discountType,
          discountValue: campaign.discountValue,
          productIds: campaign.productIds,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          active: !campaign.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Errore nell\'aggiornamento');
      } else {
        await loadCampaigns();
      }
    } catch {
      setActionError('Errore di rete. Riprova.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteCampaign = async (campaign: PromotionCampaign) => {
    if (!confirm(`Eliminare definitivamente la campagna "${campaign.name}"?`)) return;
    setActionError('');
    setBusyId(campaign.id);
    try {
      const res = await fetch(`/api/admin/promotions/${campaign.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Errore nell\'eliminazione');
      } else {
        await loadCampaigns();
      }
    } catch {
      setActionError('Errore di rete. Riprova.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Campagne Promozionali"
      subtitle="Sconti a tempo su prodotti specifici, visibili sul sito e applicati al checkout"
    >
      <div className="space-y-6">

        <div className="flex justify-end">
          <button
            onClick={() => router.push('/admin/promotions/create')}
            className="px-5 py-2.5 bg-olive text-white text-sm font-medium rounded-lg hover:bg-olive/90 transition-colors cursor-pointer"
          >
            + Nuova campagna
          </button>
        </div>

        {actionError && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="bg-white rounded-xl border border-olive/20 overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Caricamento campagne...</div>
          ) : campaigns.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Nessuna campagna creata. Crea la prima con &quot;+ Nuova campagna&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive/10 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campagna</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sconto</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Prodotti</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Stato</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/5">
                  {campaigns.map(campaign => {
                    const status = getStatus(campaign);
                    const busy = busyId === campaign.id;
                    return (
                      <tr key={campaign.id} className="hover:bg-olive/5 transition-colors">
                        <td className="px-6 py-3">
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-xs text-gray-400">Badge: {campaign.badgeLabel.it}</p>
                        </td>
                        <td className="px-6 py-3 font-mono font-medium text-gray-900">
                          {formatDiscount(campaign)}
                        </td>
                        <td className="px-6 py-3 text-center text-gray-600">
                          {campaign.productIds.length}
                        </td>
                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[status].className}`}>
                            {STATUS_STYLES[status].label}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => toggleActive(campaign)}
                            disabled={busy}
                            className="text-xs font-medium text-gray-500 hover:text-olive hover:underline cursor-pointer disabled:opacity-40 mr-4"
                          >
                            {campaign.active ? 'Metti in pausa' : 'Riattiva'}
                          </button>
                          <button
                            onClick={() => router.push(`/admin/promotions/${campaign.id}/edit`)}
                            className="text-olive text-xs font-medium hover:underline cursor-pointer mr-4"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteCampaign(campaign)}
                            disabled={busy}
                            className="text-red-500 text-xs font-medium hover:underline cursor-pointer disabled:opacity-40"
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

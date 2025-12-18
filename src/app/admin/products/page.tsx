'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import NotificationBanner from '@/components/admin/NotificationBanner';
import ActionButtons from '@/components/admin/ActionButtons';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ProductDocument } from '@/types/products';
import Stripe from 'stripe';

interface ProductWithStripe extends ProductDocument {
  stripeData?: {
    name: string;
    price: number;
    available_quantity: number;
    active: boolean;
  };
}

export default function AdminProductsPage() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithStripe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ productId: string; productName: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei prodotti');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.translations.it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.translations.en.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/products/create')}
        className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors flex items-center space-x-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuovo Prodotto</span>
      </button>
      <button
        onClick={() => router.push('/admin/orders')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
      >
        Ordini
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
      >
        Dashboard
      </button>
    </>
  );

  const handleUpdateStock = async (product: ProductWithStripe, newQuantity: number) => {
    try {
      const hasStripe = !!(product.stripeProductId && product.stripePriceId);

      const response = await fetch('/api/admin/products/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.stripeProductId,
          mongoId: product.id,
          quantity: newQuantity,
          hasStripe: hasStripe
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'aggiornamento dello stock');
      }

      // Ricarica i prodotti
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento');
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/admin/products/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, active: !currentActive })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello stato');
      }

      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento');
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteModal({ productId, productName });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del prodotto');
      }

      setDeleteModal(null);
      setSuccessMessage('Prodotto eliminato con successo');
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione');
      setDeleteModal(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Gestione Prodotti"
      subtitle="Gestisci prodotti, prezzi e quantità"
      headerActions={headerActions}
    >
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-olive/40 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca prodotti per nome o categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
          />
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="px-4 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Aggiorna</span>
        </button>
      </div>

      {error && (
        <NotificationBanner
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {successMessage && (
        <NotificationBanner
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Caricamento prodotti..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            title="Nessun prodotto trovato"
            description={
              searchTerm
                ? 'Prova a modificare i termini di ricerca'
                : 'Non ci sono prodotti disponibili'
            }
            action={
              !searchTerm ? (
                <button
                  onClick={() => router.push('/admin/products/create')}
                  className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Crea Primo Prodotto</span>
                </button>
              ) : null
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-olive/10">
                <thead className="bg-olive/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Prodotto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Prezzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-olive/10">
                  {filteredProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onUpdateStock={handleUpdateStock}
                      onToggleActive={handleToggleActive}
                      onEdit={() => router.push(`/admin/products/${product.id}/edit`)}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdateStock={handleUpdateStock}
                  onToggleActive={handleToggleActive}
                  onEdit={() => router.push(`/admin/products/${product.id}/edit`)}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal !== null}
        title="Conferma eliminazione prodotto"
        itemName={deleteModal?.productName || ''}
        description="Il prodotto verrà eliminato definitivamente da MongoDB e disattivato su Stripe. Questa azione non può essere annullata."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(null)}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
}

interface ProductRowProps {
  product: ProductWithStripe;
  onUpdateStock: (product: ProductWithStripe, newQuantity: number) => void;
  onToggleActive: (productId: string, currentActive: boolean) => void;
  onEdit: () => void;
  onDelete: (productId: string, productName: string) => void;
}

function ProductTableRow({ product, onUpdateStock, onToggleActive, onEdit, onDelete }: ProductRowProps) {
  const [isEditingStock, setIsEditingStock] = useState(false);
  const currentStock = product.stripeData?.available_quantity ?? product.stockQuantity ?? 0;
  const [stockValue, setStockValue] = useState(currentStock);

  const handleStockSubmit = () => {
    onUpdateStock(product, stockValue);
    setIsEditingStock(false);
  };

  return (
    <tr className="hover:bg-olive/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          {product.images.length > 0 && (
            <img
              src={product.images[0]}
              alt={product.translations.it.name}
              className="h-10 w-10 rounded-lg object-cover mr-3"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-olive">{product.translations.it.name}</span>
              {product.metadata?.featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ In Evidenza
                </span>
              )}
            </div>
            <div className="text-sm text-nocciola">{product.size}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{product.category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-olive">
          €{Number(product.stripeData?.price ?? product.price ?? 0).toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditingStock ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={stockValue}
              onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-sm border border-olive/30 rounded"
              min="0"
            />
            <button
              onClick={handleStockSubmit}
              className="text-green-600 hover:text-green-800 cursor-pointer"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setIsEditingStock(false);
                setStockValue(currentStock);
              }}
              className="text-red-600 hover:text-red-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => setIsEditingStock(true)}
          >
            <span className={`text-sm font-medium ${
              currentStock > 10 ? 'text-green-600' :
              currentStock > 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentStock}
            </span>
            <svg className="w-3 h-3 text-olive/40 group-hover:text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleActive(product.id, product.metadata.isActive)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.metadata.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          } transition-colors cursor-pointer`}
        >
          {product.metadata.isActive ? 'Attivo' : 'Inattivo'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButtons
          onEdit={onEdit}
          onDelete={() => onDelete(product.id, product.translations.it.name)}
          variant="desktop"
        />
      </td>
    </tr>
  );
}

function ProductCard({ product, onUpdateStock, onToggleActive, onEdit, onDelete }: ProductRowProps) {
  const [isEditingStock, setIsEditingStock] = useState(false);
  const currentStock = product.stripeData?.available_quantity ?? product.stockQuantity ?? 0;
  const [stockValue, setStockValue] = useState(currentStock);

  const handleStockSubmit = () => {
    onUpdateStock(product, stockValue);
    setIsEditingStock(false);
  };

  return (
    <div className="p-4 border-b border-olive/10 last:border-b-0">
      <div className="flex items-start space-x-3">
        {product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.translations.it.name}
            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-olive truncate">{product.translations.it.name}</h3>
                {product.metadata?.featured && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                    ⭐
                  </span>
                )}
              </div>
              <p className="text-xs text-nocciola">{product.category} • {product.size}</p>
            </div>
            <button
              onClick={() => onToggleActive(product.id, product.metadata.isActive)}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                product.metadata.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              } cursor-pointer`}
            >
              {product.metadata.isActive ? 'Attivo' : 'Inattivo'}
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-bold text-olive">
              €{Number(product.stripeData?.price ?? product.price ?? 0).toFixed(2)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-nocciola">Stock:</span>
              {isEditingStock ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={stockValue}
                    onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs border border-olive/30 rounded"
                    min="0"
                  />
                  <button
                    onClick={handleStockSubmit}
                    className="text-green-600 hover:text-green-800 cursor-pointer"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStock(false);
                      setStockValue(currentStock);
                    }}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span
                  className={`text-sm font-medium cursor-pointer ${
                    currentStock > 10 ? 'text-green-600' :
                    currentStock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}
                  onClick={() => setIsEditingStock(true)}
                >
                  {currentStock}
                </span>
              )}
            </div>
          </div>

          <ActionButtons
            onEdit={onEdit}
            onDelete={() => onDelete(product.id, product.translations.it.name)}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  );
}
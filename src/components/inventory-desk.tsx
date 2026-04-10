'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, inputClasses, labelClasses } from './ui';
import {
  formatCurrency,
  formatDate,
  getSareeSnapshot,
  statusOptions,
  paymentMethodOptions,
  BusinessData,
  SareeRecord,
  PaymentMethod,
} from '@/lib/saree-control';
import { Filter, Search, PackagePlus, BadgeIndianRupee, Trash2, Camera, Calendar } from 'lucide-react';
import { Modal } from './modal';
import Image from 'next/image';

const today = new Date().toISOString().slice(0, 10);

function createSku(name: string, count: number) {
  const base = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.slice(0, 3).toUpperCase()).join('');
  return `${base || 'SAR'}-${String(100 + count).slice(-3)}`;
}

export function InventoryDesk({ data }: { data: BusinessData }) {
  const router = useRouter();
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('ALL');
  const [lotFilter, setLotFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSaree, setSelectedSaree] = useState<SareeRecord | null>(null);
  const [saleSaree, setSaleSaree] = useState<SareeRecord | null>(null);
  const [sareeToDelete, setSareeToDelete] = useState<SareeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Saree form state
  const [sareeDraft, setSareeDraft] = useState({
    name: '', collection: '', fabric: '', color: '', sourceMarket: '', 
    purchasePrice: '', expectedSellingPrice: '', purchaseDate: today, 
    notes: '', billId: '', lotNumber: '', imageFile: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sale form state
  const [saleDraft, setSaleDraft] = useState({
    sellingPrice: '', date: today, customerName: '', paymentMethod: 'UPI' as PaymentMethod, useAutoDate: true
  });

  // Get unique lot numbers
  const lotNumbers = useMemo(() => {
    const lots = new Set<string>();
    data.sarees.forEach(s => {
      if (s.lotNumber) lots.add(s.lotNumber);
    });
    return Array.from(lots).sort();
  }, [data.sarees]);

  const filteredSarees = useMemo(() => {
    return data.sarees
      .filter((saree) => {
        const haystack = `${saree.name} ${saree.collection} ${saree.fabric} ${saree.color} ${saree.sku} ${saree.lotNumber || ''}`.toLowerCase();
        const matchesQuery = haystack.includes(inventoryQuery.toLowerCase().trim());
        const matchesStatus = statusFilter === 'ALL' ? true : saree.status === statusFilter;
        const matchesLot = lotFilter === 'ALL' ? true : saree.lotNumber === lotFilter;
        
        // Date filtering
        let matchesDate = true;
        if (dateFrom) {
          matchesDate = matchesDate && new Date(saree.purchaseDate) >= new Date(dateFrom);
        }
        if (dateTo) {
          matchesDate = matchesDate && new Date(saree.purchaseDate) <= new Date(dateTo);
        }
        
        return matchesQuery && matchesStatus && matchesLot && matchesDate;
      })
      .sort((a, b) => Number(new Date(b.purchaseDate)) - Number(new Date(a.purchaseDate)));
  }, [data.sarees, inventoryQuery, statusFilter, lotFilter, dateFrom, dateTo]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSareeDraft({ ...sareeDraft, imageFile: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSareeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sareeDraft.name || !sareeDraft.purchasePrice || !sareeDraft.expectedSellingPrice) return;
    
    const formData = new FormData();
    formData.set('sku', createSku(sareeDraft.name, data.sarees.length + 1));
    formData.set('name', sareeDraft.name.trim());
    formData.set('collection', sareeDraft.collection.trim() || 'Fresh Edit');
    formData.set('fabric', sareeDraft.fabric.trim() || 'Mixed fabric');
    formData.set('color', sareeDraft.color.trim() || 'Not specified');
    formData.set('sourceMarket', sareeDraft.sourceMarket.trim() || 'Direct sourcing');
    formData.set('purchasePrice', sareeDraft.purchasePrice);
    formData.set('expectedSellingPrice', sareeDraft.expectedSellingPrice);
    formData.set('purchaseDate', sareeDraft.purchaseDate);
    formData.set('notes', sareeDraft.notes.trim());
    formData.set('billId', sareeDraft.billId || '');
    formData.set('lotNumber', sareeDraft.lotNumber.trim());
    if (sareeDraft.imageFile) {
      formData.set('image', sareeDraft.imageFile);
    }

    await fetch('/api/sarees', {
      method: 'POST',
      body: formData,
    });
    
    setSareeDraft({ 
      name: '', collection: '', fabric: '', color: '', sourceMarket: '', 
      purchasePrice: '', expectedSellingPrice: '', purchaseDate: today, 
      notes: '', billId: '', lotNumber: '', imageFile: null 
    });
    setImagePreview(null);
    setShowAddModal(false);
    router.refresh();
  };

  const openSaleModal = (saree: SareeRecord) => {
    setSaleSaree(saree);
    setSaleDraft({ 
      sellingPrice: String(saree.expectedSellingPrice), 
      date: today, 
      customerName: '', 
      paymentMethod: 'UPI',
      useAutoDate: true
    });
    setShowSaleModal(true);
  };

  const handleSaleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!saleSaree || !saleDraft.sellingPrice) return;

    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sareeId: saleSaree.id, 
        sellingPrice: Number(saleDraft.sellingPrice), 
        date: saleDraft.useAutoDate ? today : saleDraft.date, 
        customerName: saleDraft.customerName.trim() || undefined, 
        paymentMethod: saleDraft.paymentMethod,
      }),
    });
    
    setShowSaleModal(false);
    setSaleSaree(null);
    router.refresh();
  };

  const openDetailsModal = (saree: SareeRecord) => {
    setSelectedSaree(saree);
    setShowDetailsModal(true);
  };

  const toggleReserve = async (sareeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/sarees/${sareeId}/reserve`, { method: 'POST' });
    router.refresh();
  };

  const confirmDelete = (saree: SareeRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSareeToDelete(saree);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!sareeToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/sarees/${sareeToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setShowDeleteModal(false);
        setShowDetailsModal(false);
        setSareeToDelete(null);
        router.refresh();
      } else {
        console.error('Failed to delete saree');
      }
    } catch (error) {
      console.error('Error deleting saree:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setInventoryQuery('');
    setStatusFilter('ALL');
    setLotFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Inventory</p>
          <h2 className="text-xl font-bold text-slate-950">{filteredSarees.length} Sarees</h2>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
        >
          <PackagePlus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            value={inventoryQuery} 
            onChange={(e) => setInventoryQuery(e.target.value)} 
            placeholder="Search sarees..." 
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
          />
        </div>

        {/* Filter Row */}
        <div className="flex gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-full appearance-none rounded-xl border border-slate-200 bg-white/90 px-3 py-2 pr-8 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 text-slate-400" />
          </div>

          {/* Lot Filter */}
          <div className="relative">
            <select 
              value={lotFilter} 
              onChange={(e) => setLotFilter(e.target.value)}
              className="h-full appearance-none rounded-xl border border-slate-200 bg-white/90 px-3 py-2 pr-8 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
            >
              <option value="ALL">All Lots</option>
              {lotNumbers.map((lot) => (
                <option key={lot} value={lot}>Lot {lot}</option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 text-slate-400" />
          </div>

          {/* Date From */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From"
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Date To */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To"
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Clear Filters */}
          {(inventoryQuery || statusFilter !== 'ALL' || lotFilter !== 'ALL' || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Saree Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {filteredSarees.map((saree) => {
          const snapshot = getSareeSnapshot(saree, data);
          return (
            <div 
              key={saree.id} 
              onClick={() => openDetailsModal(saree)}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => confirmDelete(saree, e)}
                className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              {/* Image placeholder or actual image */}
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                {saree.imageUrl ? (
                  <Image 
                    src={saree.imageUrl} 
                    alt={saree.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-300/50 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">{saree.sku.slice(0, 3)}</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={saree.status} />
                </div>
                {saree.lotNumber && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-900/70 text-white px-2 py-0.5 rounded-full">
                      Lot {saree.lotNumber}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-slate-950 truncate">{saree.name}</h3>
                <p className="text-[10px] text-slate-500 truncate">{saree.fabric} • {saree.color}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(saree.expectedSellingPrice)}</span>
                  <span className="text-[9px] text-slate-400">{saree.sku}</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">{formatDate(saree.purchaseDate)}</p>
                
                {/* Sale button for unsold items */}
                {saree.status !== 'SOLD' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openSaleModal(saree); }}
                    className="w-full mt-2 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-[10px] font-semibold text-white"
                  >
                    <BadgeIndianRupee className="h-3 w-3" />
                    Sell
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Saree Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Saree" maxWidth="max-w-md">
        <form onSubmit={handleSareeSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className={labelClasses()}>Saree Image</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <Camera className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700"
                />
                <p className="text-[9px] text-slate-400 mt-1">Max 1.5MB, JPG/PNG</p>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClasses()}>Saree name *</label>
            <input required className={inputClasses()} value={sareeDraft.name} onChange={(e) => setSareeDraft({ ...sareeDraft, name: e.target.value })} placeholder="Banarasi zari buta" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses()}>Collection</label>
              <input className={inputClasses()} value={sareeDraft.collection} onChange={(e) => setSareeDraft({ ...sareeDraft, collection: e.target.value })} placeholder="Bridal" />
            </div>
            <div>
              <label className={labelClasses()}>Fabric</label>
              <input className={inputClasses()} value={sareeDraft.fabric} onChange={(e) => setSareeDraft({ ...sareeDraft, fabric: e.target.value })} placeholder="Silk" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses()}>Color</label>
              <input className={inputClasses()} value={sareeDraft.color} onChange={(e) => setSareeDraft({ ...sareeDraft, color: e.target.value })} placeholder="Red" />
            </div>
            <div>
              <label className={labelClasses()}>Source</label>
              <input className={inputClasses()} value={sareeDraft.sourceMarket} onChange={(e) => setSareeDraft({ ...sareeDraft, sourceMarket: e.target.value })} placeholder="Varanasi" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses()}>Buy Price *</label>
              <input required className={inputClasses()} type="number" min="0" value={sareeDraft.purchasePrice} onChange={(e) => setSareeDraft({ ...sareeDraft, purchasePrice: e.target.value })} placeholder="6200" />
            </div>
            <div>
              <label className={labelClasses()}>Sell Price *</label>
              <input required className={inputClasses()} type="number" min="0" value={sareeDraft.expectedSellingPrice} onChange={(e) => setSareeDraft({ ...sareeDraft, expectedSellingPrice: e.target.value })} placeholder="9400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses()}>Lot Number</label>
              <input className={inputClasses()} value={sareeDraft.lotNumber} onChange={(e) => setSareeDraft({ ...sareeDraft, lotNumber: e.target.value })} placeholder="Lot 1, 2, 3..." />
            </div>
            <div>
              <label className={labelClasses()}>Purchase Date</label>
              <input required className={inputClasses()} type="date" value={sareeDraft.purchaseDate} onChange={(e) => setSareeDraft({ ...sareeDraft, purchaseDate: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={labelClasses()}>Linked bill</label>
            <select className={inputClasses()} value={sareeDraft.billId} onChange={(e) => setSareeDraft({ ...sareeDraft, billId: e.target.value })}>
              <option value="">No bill</option>
              {data.bills.map((b) => <option key={b.id} value={b.id}>{b.supplierName} - {formatCurrency(b.totalAmount)}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClasses()}>Notes</label>
            <textarea 
              className={`${inputClasses()} min-h-[80px] resize-none`} 
              value={sareeDraft.notes} 
              onChange={(e) => setSareeDraft({ ...sareeDraft, notes: e.target.value })} 
              placeholder="Add details..." 
            />
          </div>

          <button type="submit" className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white">
            Save Saree
          </button>
        </form>
      </Modal>

      {/* Record Sale Modal */}
      <Modal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} title="Record Sale" maxWidth="max-w-sm">
        {saleSaree && (
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-900">{saleSaree.name}</p>
              <p className="text-[10px] text-slate-500">{saleSaree.sku} • Expected: {formatCurrency(saleSaree.expectedSellingPrice)}</p>
            </div>

            <div>
              <label className={labelClasses()}>Selling Price *</label>
              <input 
                required 
                className={inputClasses()} 
                type="number" 
                min="0" 
                value={saleDraft.sellingPrice} 
                onChange={(e) => setSaleDraft({ ...saleDraft, sellingPrice: e.target.value })} 
                placeholder="9550" 
              />
            </div>

            <div>
              <label className={labelClasses()}>Payment Method</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['CASH', 'UPI'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSaleDraft({ ...saleDraft, paymentMethod: method })}
                    className={`py-2 rounded-xl text-xs font-medium border transition ${
                      saleDraft.paymentMethod === method 
                        ? 'bg-slate-950 text-white border-slate-950' 
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClasses()}>Customer Name</label>
              <input 
                className={inputClasses()} 
                value={saleDraft.customerName} 
                onChange={(e) => setSaleDraft({ ...saleDraft, customerName: e.target.value })} 
                placeholder="Customer name" 
              />
            </div>

            <div>
              <label className={labelClasses()}>Sale Date</label>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="autoDate" 
                  checked={saleDraft.useAutoDate}
                  onChange={(e) => setSaleDraft({ ...saleDraft, useAutoDate: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="autoDate" className="text-xs text-slate-600">Use today's date</label>
              </div>
              {!saleDraft.useAutoDate && (
                <input 
                  required 
                  className={inputClasses()} 
                  type="date" 
                  value={saleDraft.date} 
                  onChange={(e) => setSaleDraft({ ...saleDraft, date: e.target.value })} 
                />
              )}
            </div>

            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white">
              Mark as Sold
            </button>
          </form>
        )}
      </Modal>

      {/* Saree Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Saree Details" maxWidth="max-w-md">
        {selectedSaree && (
          <div className="space-y-4">
            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
              {selectedSaree.imageUrl ? (
                <Image 
                  src={selectedSaree.imageUrl} 
                  alt={selectedSaree.name} 
                  width={400} 
                  height={225} 
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-300/50 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-400">{selectedSaree.sku}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status and Lot */}
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedSaree.status} />
              {selectedSaree.lotNumber && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                  Lot {selectedSaree.lotNumber}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{selectedSaree.name}</h3>
                <p className="text-sm text-slate-600">{selectedSaree.collection}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Fabric</p>
                  <p className="font-medium text-slate-900">{selectedSaree.fabric}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Color</p>
                  <p className="font-medium text-slate-900">{selectedSaree.color}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Source</p>
                  <p className="font-medium text-slate-900">{selectedSaree.sourceMarket}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">SKU</p>
                  <p className="font-medium text-slate-900">{selectedSaree.sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Purchase Price</p>
                  <p className="font-bold text-slate-900">{formatCurrency(selectedSaree.purchasePrice)}</p>
                  <p className="text-[10px] text-slate-500">{formatDate(selectedSaree.purchaseDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Expected Sell</p>
                  <p className="font-bold text-slate-900">{formatCurrency(selectedSaree.expectedSellingPrice)}</p>
                </div>
              </div>

              {selectedSaree.notes && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-600">{selectedSaree.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {selectedSaree.status !== 'SOLD' && (
                <button
                  onClick={() => { setShowDetailsModal(false); openSaleModal(selectedSaree); }}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white"
                >
                  Record Sale
                </button>
              )}
              <button
                onClick={(e) => confirmDelete(selectedSaree, e)}
                className="flex-1 rounded-xl border border-rose-300 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => !isDeleting && setShowDeleteModal(false)} title="Delete Saree" maxWidth="max-w-sm">
        {sareeToDelete && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{sareeToDelete.name}</span>?
            </p>
            <p className="text-xs text-rose-600">
              This will also delete all associated sales and expenses. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

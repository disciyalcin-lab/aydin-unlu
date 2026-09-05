'use client';

import { Search, Bell, Plus, Wallet, Wrench, Clock3, Car, ClipboardCheck, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

type Stage = 'Beklenen' | 'Liftte' | 'Parça Bekliyor' | 'Bitti' | 'Teslim Edildi';

type Vehicle = {
  id: number;
  plate: string;
  model: string;
  customer: string;
  note: string;
  eta: string;
  stage: Stage;
  partsCost: number;
  laborCost: number;
};

const stageOrder: Stage[] = ['Beklenen', 'Liftte', 'Parça Bekliyor', 'Bitti', 'Teslim Edildi'];

const defaultVehicles: Vehicle[] = [
  { id: 1, plate: '34 ABC 123', model: 'Renault Clio', customer: 'Ahmet Y.', note: 'Yağ + filtre', eta: '09:30', stage: 'Beklenen', partsCost: 1300, laborCost: 800 },
  { id: 2, plate: '06 DEF 456', model: 'Ford Focus', customer: 'Mehmet K.', note: 'Fren bakımı', eta: '11:00', stage: 'Beklenen', partsCost: 1800, laborCost: 1200 },
  { id: 3, plate: '16 GHI 789', model: 'BMW 320i', customer: 'Cem B.', note: 'Elektrik arızası', eta: 'Lift 2', stage: 'Liftte', partsCost: 2500, laborCost: 2000 },
  { id: 4, plate: '12 JKL 012', model: 'Volkswagen Passat', customer: 'Burak T.', note: 'Parça bekliyor', eta: '2 gün', stage: 'Parça Bekliyor', partsCost: 2200, laborCost: 1400 },
  { id: 5, plate: '35 MNO 345', model: 'Toyota Corolla', customer: 'Deniz A.', note: 'Triger değişimi', eta: 'Teslime hazır', stage: 'Bitti', partsCost: 2100, laborCost: 1600 },
  { id: 6, plate: '18 PQR 678', model: 'Mercedes C180', customer: 'Ali S.', note: 'Yıllık bakımdan çıktı', eta: '17.08.2026', stage: 'Teslim Edildi', partsCost: 4300, laborCost: 3000 },
];

const storageKey = 'aydin-unlu-vehicles-v1';

const money = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);

const badgeItems = [
  { label: 'Randevudan 30 dk', tone: 'bg-amber-100 text-amber-800' },
  { label: 'Parça bekliyor 4s', tone: 'bg-red-100 text-red-800' },
  { label: 'Teslim bekliyor 2s', tone: 'bg-violet-100 text-violet-800' },
];

const stageAccent: Record<Stage, string> = {
  Beklenen: 'bg-blue-100 text-blue-700',
  Liftte: 'bg-amber-100 text-amber-700',
  'Parça Bekliyor': 'bg-red-100 text-red-700',
  Bitti: 'bg-violet-100 text-violet-700',
  'Teslim Edildi': 'bg-green-100 text-green-700',
};

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  const toneMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="card p-3">
      <div className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${toneMap[tone]}`}>{label}</div>
      <div className="mt-3 text-xl font-bold">{value}</div>
    </div>
  );
}

function VehicleCard({ vehicle, onMove }: { vehicle: Vehicle; onMove: (id: number, direction: number) => void }) {
  const currentIndex = stageOrder.indexOf(vehicle.stage);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-slate-900">{vehicle.plate}</div>
          <div className="text-xs text-slate-500">{vehicle.model}</div>
        </div>
        <span className="badge bg-slate-200 text-slate-700">{vehicle.eta}</span>
      </div>

      <div className="mt-3 text-xs text-slate-600">{vehicle.note}</div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
        <span>{vehicle.customer}</span>
        <span>{money(vehicle.partsCost + vehicle.laborCost)}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onMove(vehicle.id, -1)}
          disabled={currentIndex === 0}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[10px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Geri
          </span>
        </button>
        <button
          type="button"
          onClick={() => onMove(vehicle.id, 1)}
          disabled={currentIndex === stageOrder.length - 1}
          className="flex-1 rounded-lg bg-slate-900 px-2 py-2 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            İlerle <ArrowRight size={12} />
          </span>
        </button>
      </div>
    </div>
  );
}

function KanbanColumn({ title, items, onMove }: { title: Stage; items: Vehicle[]; onMove: (id: number, direction: number) => void }) {
  return (
    <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-white p-2">
      <div className="mb-3 flex items-center justify-between px-2">
        <div className="text-sm font-bold text-slate-800">{title}</div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${stageAccent[title]}`}>{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <VehicleCard key={item.id} vehicle={item} onMove={onMove} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [activePanel, setActivePanel] = useState<'reminders' | 'cash' | 'reports' | null>(null);
  const notificationSentRef = useRef(false);
  const [form, setForm] = useState({
    plate: '',
    model: '',
    customer: '',
    note: '',
    stage: 'Beklenen' as Stage,
    eta: '09:30',
    partsCost: '2500',
    laborCost: '1800',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadVehicles = async () => {
      if (hasSupabaseConfig && supabase) {
        try {
          const { data, error } = await supabase.from('vehicles').select('*').limit(20);
          if (!error && data && data.length > 0) {
            const mapped = data.map((vehicle: any) => ({
              id: Number(vehicle.id ?? Date.now()),
              plate: vehicle.plate ?? 'Plaka yok',
              model: vehicle.model ?? 'Model yok',
              customer: vehicle.customer ?? 'Müşteri',
              note: vehicle.note ?? 'Not eklenmedi',
              eta: vehicle.eta ?? '09:30',
              stage: ['Beklenen', 'Liftte', 'Parça Bekliyor', 'Bitti', 'Teslim Edildi'].includes(vehicle.stage)
                ? vehicle.stage
                : 'Beklenen',
              partsCost: Number(vehicle.parts_cost ?? vehicle.partsCost ?? 0),
              laborCost: Number(vehicle.labor_cost ?? vehicle.laborCost ?? 0),
            }));
            setVehicles(mapped);
            return;
          }
        } catch {
          // fall back to local demo when Supabase is not ready yet
        }
      }

      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          setVehicles(JSON.parse(saved));
          return;
        } catch {
          // ignore malformed localStorage data and fall back to defaults
        }
      }

      setVehicles(defaultVehicles);
    };

    loadVehicles();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && vehicles.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(vehicles));
    }
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((vehicle) => `${vehicle.plate} ${vehicle.model} ${vehicle.customer}`.toLowerCase().includes(term));
  }, [vehicles, query]);

  const stageGroups = useMemo(() => {
    return stageOrder.reduce<Record<Stage, Vehicle[]>>((acc, stage) => {
      acc[stage] = filteredVehicles.filter((vehicle) => vehicle.stage === stage);
      return acc;
    }, { Beklenen: [], Liftte: [], 'Parça Bekliyor': [], Bitti: [], 'Teslim Edildi': [] });
  }, [filteredVehicles]);

  const summary = useMemo(() => {
    const totalRevenue = vehicles.reduce((sum, vehicle) => sum + vehicle.partsCost + vehicle.laborCost, 0);
    const openBalance = vehicles
      .filter((vehicle) => vehicle.stage !== 'Teslim Edildi')
      .reduce((sum, vehicle) => sum + vehicle.partsCost + vehicle.laborCost, 0);
    const readyCount = vehicles.filter((vehicle) => vehicle.stage === 'Bitti').length;
    const waitingCount = vehicles.filter((vehicle) => vehicle.stage === 'Parça Bekliyor').length;

    return {
      totalRevenue,
      openBalance,
      readyCount,
      waitingCount,
    };
  }, [vehicles]);

  const openPanel = (panel: 'reminders' | 'cash' | 'reports') => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const closePanel = () => setActivePanel(null);

  const reminderItems = useMemo(() => {
    return vehicles
      .filter((vehicle) => vehicle.stage === 'Parça Bekliyor' || vehicle.stage === 'Bitti' || vehicle.stage === 'Beklenen')
      .slice(0, 4)
      .map((vehicle) => ({
        id: vehicle.id,
        title: `${vehicle.plate} - ${vehicle.model}`,
        text: vehicle.note,
        due: vehicle.eta,
      }));
  }, [vehicles]);

  const cashSummary = useMemo(() => {
    const incoming = vehicles.reduce((sum, vehicle) => sum + vehicle.laborCost, 0);
    const outgoing = vehicles.reduce((sum, vehicle) => sum + vehicle.partsCost, 0);
    const balance = incoming - outgoing;

    return {
      incoming,
      outgoing,
      balance,
    };
  }, [vehicles]);

  const reportRows = useMemo(() => {
    return stageOrder.map((stage) => ({
      stage,
      count: vehicles.filter((vehicle) => vehicle.stage === stage).length,
      amount: vehicles
        .filter((vehicle) => vehicle.stage === stage)
        .reduce((sum, vehicle) => sum + vehicle.partsCost + vehicle.laborCost, 0),
    }));
  }, [vehicles]);

  const highlightedVehicle = filteredVehicles[0] ?? vehicles[0] ?? null;

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'aydin-unlu-reminder',
      });
      return;
    }

    setNotificationPermission(Notification.permission);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      sendBrowserNotification('Aydın ÜNLÜ', 'Bildirim izni aktif. Hatırlatıcılar artık telefonunuza bildirilecek.');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setNotificationPermission('Notification' in window ? Notification.permission : 'unsupported');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // silent fail when browser doesn't allow service workers in this context
        });
    }
  }, []);

  useEffect(() => {
    if (!reminderOpen || notificationSentRef.current || reminderItems.length === 0) return;

    notificationSentRef.current = true;
    sendBrowserNotification('Hatırlatıcı aktif', `${reminderItems.length} araç için kontrol bekliyor.`);
  }, [reminderItems.length, reminderOpen]);

  const handleAddVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.plate.trim() || !form.model.trim()) return;

    const newVehicle: Vehicle = {
      id: Date.now(),
      plate: form.plate.trim(),
      model: form.model.trim(),
      customer: form.customer.trim() || 'Müşteri',
      note: form.note.trim() || 'Yeni kayıt eklendi',
      eta: form.eta.trim() || '09:30',
      stage: form.stage,
      partsCost: Number(form.partsCost || 0),
      laborCost: Number(form.laborCost || 0),
    };

    setVehicles((current) => [newVehicle, ...current]);
    setQuery(form.plate.trim());
    setShowForm(false);
    setForm({
      plate: '',
      model: '',
      customer: '',
      note: '',
      stage: 'Beklenen',
      eta: '09:30',
      partsCost: '2500',
      laborCost: '1800',
    });
  };

  const handleMoveVehicle = (id: number, direction: number) => {
    setVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== id) return vehicle;

        const currentIndex = stageOrder.indexOf(vehicle.stage);
        const nextIndex = Math.min(stageOrder.length - 1, Math.max(0, currentIndex + direction));
        const nextStage = stageOrder[nextIndex];

        return {
          ...vehicle,
          stage: nextStage,
          eta: nextStage === 'Teslim Edildi' ? 'Teslim edildi' : vehicle.eta,
        };
      }),
    );
  };

  return (
    <main className="shell">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Atölye</div>
          <h1 className="text-2xl font-bold">Aydın ÜNLÜ</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setReminderOpen((value) => !value)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700">
            <Bell size={18} />
          </button>
          <button type="button" onClick={requestNotificationPermission} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-semibold text-slate-700">
            {notificationPermission === 'granted' ? 'Bildirim açık' : 'Bildirim izin'}
          </button>
          <button type="button" onClick={() => setShowForm(true)} className="rounded-xl bg-slate-900 p-2 text-white">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-slate-900 p-3 text-white shadow-soft">
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
          <Search size={16} className="text-slate-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-300 outline-none"
            placeholder="Plaka ara"
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Toplam Giriş" value={money(summary.totalRevenue)} tone="blue" />
        <StatCard label="Net İşçilik" value={money(summary.totalRevenue * 0.45)} tone="green" />
        <StatCard label="Parça Gideri" value={money(summary.totalRevenue * 0.35)} tone="amber" />
        <StatCard label="Açık Hesap" value={money(summary.openBalance)} tone="rose" />
      </div>

      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2">
        {badgeItems.map((item) => (
          <span key={item.label} className={`badge ${item.tone}`}>{item.label}</span>
        ))}
      </div>

      {reminderOpen && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <Clock3 size={16} /> Hatırlatıcı aktif
            </div>
            <button type="button" onClick={() => setReminderOpen(false)} className="rounded-full bg-white p-1 text-amber-700">
              <X size={14} />
            </button>
          </div>
          <div className="mt-2">3 araç için teslim ve parça kontrolü bekliyor.</div>
        </div>
      )}

      {highlightedVehicle && (
        <div className="mb-5 card p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Car size={16} /> Araç Özeti
            </div>
            <button type="button" className="text-xs font-semibold text-blue-600">Detay</button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-slate-500">Müşteri</div>
              <div className="mt-1 font-bold">{highlightedVehicle.customer}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-slate-500">Durum</div>
              <div className="mt-1 font-bold text-amber-600">{highlightedVehicle.stage}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-slate-500">Parça</div>
              <div className="mt-1 font-bold">{money(highlightedVehicle.partsCost)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-slate-500">İşçilik</div>
              <div className="mt-1 font-bold">{money(highlightedVehicle.laborCost)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ClipboardCheck size={18} /> Atölye Akışı
          </div>
          <button type="button" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">Filtre</button>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[900px] gap-3">
            {stageOrder.map((stage) => (
              <KanbanColumn key={stage} title={stage} items={stageGroups[stage]} onMove={handleMoveVehicle} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setShowForm(true)} className="card flex items-center justify-center gap-2 p-3 font-semibold text-slate-800">
          <Wrench size={18} /> Yeni Araç
        </button>
        <button type="button" onClick={() => openPanel('cash')} className="card flex items-center justify-center gap-2 p-3 font-semibold text-slate-800">
          <Wallet size={18} /> Kasa
        </button>
        <button type="button" onClick={() => openPanel('reminders')} className="card flex items-center justify-center gap-2 p-3 font-semibold text-slate-800">
          <Clock3 size={18} /> Hatırlatıcı
        </button>
        <button type="button" onClick={() => openPanel('reports')} className="card flex items-center justify-center gap-2 p-3 font-semibold text-slate-800">
          <ClipboardCheck size={18} /> Raporlar
        </button>
      </div>

      {activePanel && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 md:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {activePanel === 'reminders' && 'Hatırlatıcılar'}
                {activePanel === 'cash' && 'Kasa'}
                {activePanel === 'reports' && 'Raporlar'}
              </h2>
              <button type="button" onClick={closePanel} className="rounded-full bg-slate-100 p-2 text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              {(['reminders', 'cash', 'reports'] as const).map((panelKey) => (
                <button
                  key={panelKey}
                  type="button"
                  onClick={() => openPanel(panelKey)}
                  className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                    activePanel === panelKey ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {panelKey === 'reminders' && 'Hatırlatıcı'}
                  {panelKey === 'cash' && 'Kasa'}
                  {panelKey === 'reports' && 'Raporlar'}
                </button>
              ))}
            </div>

            {activePanel === 'reminders' && (
              <div className="space-y-3">
                {reminderItems.length === 0 && <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Hatırlatıcı bulunamadı.</div>}
                {reminderItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-amber-900">{item.title}</div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">{item.due}</span>
                    </div>
                    <div className="mt-1 text-sm text-amber-800">{item.text}</div>
                  </div>
                ))}
              </div>
            )}

            {activePanel === 'cash' && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <div className="text-emerald-700">Giriş</div>
                    <div className="mt-1 text-lg font-bold text-emerald-900">{money(cashSummary.incoming)}</div>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3">
                    <div className="text-rose-700">Gider</div>
                    <div className="mt-1 text-lg font-bold text-rose-900">{money(cashSummary.outgoing)}</div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3">
                  <div className="text-slate-600">Kalan</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{money(cashSummary.balance)}</div>
                </div>
              </div>
            )}

            {activePanel === 'reports' && (
              <div className="space-y-3">
                {reportRows.map((row) => (
                  <div key={row.stage} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                    <div>
                      <div className="font-semibold text-slate-800">{row.stage}</div>
                      <div className="text-slate-500">{row.count} araç</div>
                    </div>
                    <div className="font-bold text-slate-900">{money(row.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 md:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Yeni araç ekle</h2>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full bg-slate-100 p-2 text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.plate} onChange={(event) => setForm({ ...form, plate: event.target.value })} placeholder="Plaka" className="rounded-xl border border-slate-200 px-3 py-2 outline-none" />
                <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="Model" className="rounded-xl border border-slate-200 px-3 py-2 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="Müşteri" className="rounded-xl border border-slate-200 px-3 py-2 outline-none" />
                <select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value as Stage })} className="rounded-xl border border-slate-200 px-3 py-2 outline-none">
                  {stageOrder.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Not" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />

              <div className="grid grid-cols-2 gap-3">
                <input value={form.eta} onChange={(event) => setForm({ ...form, eta: event.target.value })} placeholder="ETA" className="rounded-xl border border-slate-200 px-3 py-2 outline-none" />
                <input value={form.partsCost} onChange={(event) => setForm({ ...form, partsCost: event.target.value })} placeholder="Parça tutarı" className="rounded-xl border border-slate-200 px-3 py-2 outline-none" />
              </div>

              <input value={form.laborCost} onChange={(event) => setForm({ ...form, laborCost: event.target.value })} placeholder="İşçilik tutarı" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">
                <Plus size={16} /> Araç ekle
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

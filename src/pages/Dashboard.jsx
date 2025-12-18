import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        dailyRevenue: 0, dailyProfit: 0, monthlyRevenue: 0, monthlyProfit: 0
    });
    const [chartData, setChartData] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const today = getTodayString();
    const [selectedDate, setSelectedDate] = useState(today);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, reportRes, historyRes] = await Promise.all([
                api.get(`/sales/stats`, { params: { date: selectedDate } }),
                api.get('/sales/report/monthly'),
                api.get(`/sales/report/detailed`, { params: { date: selectedDate } })
            ]);
            
            setStats(statsRes.data);
            setChartData(reportRes.data);
            setSalesHistory(historyRes.data);
        } catch (err) {
            console.error("Gagal sinkronisasi data dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#0f172a', fontWeight: 'bold'}}>Memuat Data...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Analitik Toko</h1>
                    <p style={styles.subtitle}>
                        {selectedDate === today ? "🔴 Real-time: Hari Ini" : `📅 Data Tanggal: ${selectedDate}`}
                    </p>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={styles.datePicker}
                    />
                    {selectedDate !== today && (
                        <button onClick={() => setSelectedDate(today)} style={styles.resetBtn}>Hari Ini</button>
                    )}
                </div>
            </header>

            <div style={styles.scrollArea}>
                {/* BAGIAN 1: STATISTIK HARIAN */}
                <div style={styles.sectionTitleGroup}>
                    <span style={styles.sectionTag}>Harian</span>
                    <h3 style={styles.sectionHeading}>Performa {selectedDate}</h3>
                </div>
                <div style={styles.gridStats}>
                    <StatCard title="Pendapatan" value={stats.dailyRevenue} color="#3498db" icon="💰" />
                    <StatCard title="Laba Bersih" value={stats.dailyProfit} color="#2ecc71" icon="📈" />
                </div>

                {/* BAGIAN 2: STATISTIK BULANAN */}
                <div style={styles.sectionTitleGroup}>
                    <span style={styles.sectionTag}>Bulanan</span>
                    <h3 style={styles.sectionHeading}>Akumulasi Bulan Ini</h3>
                </div>
                <div style={styles.gridStats}>
                    <StatCard title="Total Omzet" value={stats.monthlyRevenue} color="#9b59b6" icon="📊" />
                    <StatCard title="Total Laba" value={stats.monthlyProfit} color="#f1c40f" icon="⭐" />
                </div>

                {/* BAGIAN 3: GRAFIK TREN (TRAFIK) */}
                <div style={styles.sectionCard}>
                    <h3 style={styles.cardTitle}>Tren Penjualan & Laba</h3>
                    <div style={{ width: '100%', height: 300, minHeight: 300, position: 'relative' }}>
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3498db" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{fontSize: 10}} 
                                        tickFormatter={(t) => t ? t.split('-')[2] : ''} 
                                    />
                                    <YAxis 
                                        tick={{fontSize: 10}} 
                                        tickFormatter={(v) => v >= 1000 ? v/1000 + 'k' : v} 
                                    />
                                    <Tooltip formatter={(v) => formatRupiah(v)} />
                                    <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#3498db" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="profit" name="Laba" stroke="#2ecc71" fill="transparent" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8'}}>
                                Data grafik tidak tersedia
                            </div>
                        )}
                    </div>
                </div>

                {/* BAGIAN 4: TABEL RIWAYAT */}
                <div style={styles.sectionCard}>
                    <h3 style={styles.cardTitle}>Riwayat Transaksi: {selectedDate}</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th>Waktu</th>
                                    <th>Menu</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesHistory.length > 0 ? salesHistory.map((sale) => (
                                    <tr key={sale._id} style={styles.tableRow}>
                                        <td style={styles.tableCell}>{new Date(sale.transaction_date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td>
                                        <td style={styles.tableCellEllipsis}>{sale.items.map(i => i.name).join(', ')}</td>
                                        <td style={{...styles.tableCell, fontWeight: 'bold', color: '#0f172a'}}>{formatRupiah(sale.total_amount)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" style={{textAlign:'center', padding:'30px', color: '#64748b'}}>Tidak ada transaksi</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => (
    <div style={styles.card}>
        <div style={{...styles.iconBox, backgroundColor: color + '15', color: color}}>{icon}</div>
        <div style={{overflow: 'hidden'}}>
            <p style={styles.cardLabel}>{title}</p>
            <h2 style={styles.cardValue}>{`Rp ${(value || 0).toLocaleString('id-ID')}`}</h2>
        </div>
    </div>
);

const styles = {
    container: { padding: '15px', backgroundColor: '#f1f5f9', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    title: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 },
    subtitle: { fontSize: '11px', color: '#475569', margin: 0 },
    datePicker: { 
        padding: '8px', 
        borderRadius: '10px', 
        border: '1px solid #cbd5e1', 
        fontSize: '12px', 
        background: '#ffffff', 
        color: '#000000',
        fontWeight: 'bold',
        outline: 'none'
    },
    resetBtn: { padding: '8px 12px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
    scrollArea: { flex: 1, overflowY: 'auto', paddingBottom: '30px' },
    sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', marginTop: '15px' },
    sectionTag: { backgroundColor: '#cbd5e1', color: '#1e293b', padding: '2px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' },
    sectionHeading: { fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 },
    gridStats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    card: { backgroundColor: '#fff', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
    iconBox: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    cardLabel: { fontSize: '9px', color: '#475569', margin: 0, fontWeight: '600' },
    cardValue: { fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0 },
    sectionCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', marginTop: '15px' },
    cardTitle: { fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { textAlign: 'left', fontSize: '11px', color: '#64748b', borderBottom: '1px solid #f1f5f9' },
    tableCell: { padding: '10px 0' },
    tableRow: { borderBottom: '1px solid #f8fafc', fontSize: '12px' },
    tableCellEllipsis: { padding: '10px 0', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' }
};

export default Dashboard;
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './SalesHistory.css';

const rupiah = (n = 0) =>
    `Rp ${Number(n).toLocaleString('id-ID')}`;

const formatDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    if (isNaN(d)) return '-';
    return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 🔥 CEK TRANSAKSI HARI INI
const isToday = (date) => {
    const d = new Date(date);
    const now = new Date();
    return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
    );
};

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    // FILTER
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');

    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/sales');
                setSales(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ================= FILTER MANUAL =================
    const filteredSales = sales.filter(sale => {
        if (!sale.createdAt) return false;
        const saleDate = new Date(sale.createdAt);
        if (isNaN(saleDate)) return false;

        if (startDate && saleDate < new Date(startDate)) return false;

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (saleDate > end) return false;
        }

        if (paymentFilter !== 'all') {
            if (sale.payment_method?.toLowerCase() !== paymentFilter)
                return false;
        }

        return true;
    });

    // ================= REKAP SESUAI FILTER =================
    const totalCash = filteredSales
        .filter(s => s.payment_method?.toLowerCase() === 'cash')
        .reduce((sum, s) => sum + (s.total_amount || 0), 0);

    const totalQRIS = filteredSales
        .filter(s => s.payment_method?.toLowerCase() === 'qris')
        .reduce((sum, s) => sum + (s.total_amount || 0), 0);

    const grandTotal = totalCash + totalQRIS;

    // ================= 🔥 REKAP HARI INI (AUTO RESET) =================
    const todaySales = sales.filter(
        s => s.createdAt && isToday(s.createdAt)
    );

    const todayCash = todaySales
        .filter(s => s.payment_method?.toLowerCase() === 'cash')
        .reduce((sum, s) => sum + (s.total_amount || 0), 0);

    const todayQRIS = todaySales
        .filter(s => s.payment_method?.toLowerCase() === 'qris')
        .reduce((sum, s) => sum + (s.total_amount || 0), 0);

    const todayTotal = todayCash + todayQRIS;

    // ================= DETAIL TRANSAKSI =================
    const showDetail = (sale) => {
        Swal.fire({
            title: 'Detail Transaksi',
            width: 600,
            html: `
                <div style="text-align:left;font-size:14px">
                    <p><b>ID:</b> ${sale._id}</p>
                    <p><b>Tanggal:</b> ${formatDate(sale.createdAt)}</p>
                    <p><b>Pembayaran:</b> ${sale.payment_method}</p>
                    <hr/>
                    <b>Item:</b>
                    <ul style="padding-left:18px">
                        ${sale.items.map(item => `
                            <li>${item.name} (${item.qty} x ${rupiah(item.sale_price)})</li>
                        `).join('')}
                    </ul>
                    <hr/>
                    <h3 style="text-align:right;color:#10b981">
                        Total: ${rupiah(sale.total_amount)}
                    </h3>
                </div>
            `,
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#3b82f6'
        });
    };

    // ================= 🧾 CETAK HARI INI =================
    const printDailyReport = () => {
        const html = `
        <html>
        <body style="font-family:monospace;padding:16px">
            <center>
                <b>SEPUKOPI</b><br/>
                LAPORAN PENDAPATAN HARIAN<br/>
                ${new Date().toLocaleDateString('id-ID')}
            </center>

            <hr/>
            Cash : ${rupiah(todayCash)}<br/>
            QRIS : ${rupiah(todayQRIS)}<br/>
            <hr/>
            TOTAL : ${rupiah(todayTotal)}
            <hr/>
            <small>${new Date().toLocaleString('id-ID')}</small>

            <script>
                window.print();
                window.onafterprint = () => window.close();
            </script>
        </body>
        </html>
        `;

        const win = window.open('', '_blank', 'width=280,height=600');
        win.document.write(html);
        win.document.close();
    };

    // ================= 🔒 TUTUP KASIR =================
    const endShift = () => {
        if (todaySales.length === 0) {
            Swal.fire('Info', 'Belum ada transaksi hari ini', 'info');
            return;
        }

        Swal.fire({
            title: 'Tutup Kasir?',
            text: 'Pastikan semua transaksi hari ini sudah benar',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tutup Kasir',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444'
        }).then(result => {
            if (!result.isConfirmed) return;
            printDailyReport();
        });
    };

    if (loading) return <div className="loading">Memuat riwayat...</div>;

    return (
        <div className="sales-history-container">

            <header className="sales-header">
                <h2>Riwayat Penjualan</h2>
                <button onClick={() => navigate('/pos')} className="back-btn">
                    ← Kembali ke POS
                </button>
            </header>

            {/* FILTER */}
            <div className="filter-bar">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                    <option value="all">Semua</option>
                    <option value="cash">Cash</option>
                    <option value="qris">QRIS</option>
                </select>
                <button className="reset-btn" onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPaymentFilter('all');
                }}>
                    Reset
                </button>
            </div>

            {/* REKAP */}
            <div className="daily-summary">
                <div className="summary-card cash">
                    <span>Cash</span>
                    <strong>{rupiah(totalCash)}</strong>
                </div>
                <div className="summary-card qris">
                    <span>QRIS</span>
                    <strong>{rupiah(totalQRIS)}</strong>
                </div>
                <div className="summary-card total">
                    <span>Total</span>
                    <strong>{rupiah(grandTotal)}</strong>
                </div>
            </div>

            <button className="print-btn" onClick={printDailyReport}>
                🧾 Cetak Pendapatan Hari Ini
            </button>

            <button className="print-btn danger" onClick={endShift}>
                🔒 Tutup Kasir
            </button>

            {/* LIST */}
            <div className="sales-list">
                {filteredSales.map(sale => (
                    <div key={sale._id} className="sale-card">
                        <div className="sale-top">
                            <span className="sale-id">
                                #{sale._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`badge ${sale.payment_method}`}>
                                {sale.payment_method}
                            </span>
                        </div>

                        <div className="sale-date">{formatDate(sale.createdAt)}</div>

                        <div className="sale-total">
                            Total: <strong>{rupiah(sale.total_amount)}</strong>
                        </div>

                        <button className="detail-btn" onClick={() => showDetail(sale)}>
                            📄 Detail
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesHistory;

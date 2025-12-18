import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Receipt = () => {
    const { state } = useLocation(); // Mengambil data transaksi dari navigate
    const navigate = useNavigate();
    const sale = state?.sale;

    useEffect(() => {
        if (!sale) {
            navigate('/pos'); // Jika tidak ada data, balik ke POS
        } else {
            // Otomatis buka dialog print saat halaman dimuat
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [sale, navigate]);

    if (!sale) return null;

    return (
        <div className="receipt-page" style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>SEPUKOPI</h2>
                    <p style={{ fontSize: '12px' }}>{new Date(sale.transaction_date).toLocaleString('id-ID')}</p>
                </div>
                
                <div style={styles.divider}></div>
                
                {sale.items.map((item, idx) => (
                    <div key={idx} style={styles.item}>
                        <span>{item.name} x{item.qty}</span>
                        <span>{item.total_price.toLocaleString('id-ID')}</span>
                    </div>
                ))}
                
                <div style={styles.divider}></div>
                
                <div style={styles.totalRow}>
                    <b>TOTAL</b>
                    <b>Rp {sale.total_amount.toLocaleString('id-ID')}</b>
                </div>
                <div style={styles.item}>
                    <span>Bayar</span>
                    <span>Rp {state.amountPaid.toLocaleString('id-ID')}</span>
                </div>
                <div style={styles.item}>
                    <span>Kembali</span>
                    <span>Rp {state.change.toLocaleString('id-ID')}</span>
                </div>

                <div style={styles.footer}>
                    <p>Metode: {sale.payment_method}</p>
                    <p>Terima Kasih Atas Kunjungannya!</p>
                    <button className="no-print" onClick={() => navigate('/pos')} style={styles.backBtn}>
                        Kembali ke Kasir
                    </button>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    page: { display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh' },
    container: { width: '58mm', background: 'white', padding: '15px', border: '1px solid #ddd', fontFamily: 'Courier New, monospace' },
    header: { textAlign: 'center', marginBottom: '10px' },
    divider: { borderBottom: '1px dashed #000', margin: '10px 0' },
    item: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '10px 0' },
    footer: { textAlign: 'center', marginTop: '20px', fontSize: '11px' },
    backBtn: { marginTop: '20px', padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }
};

export default Receipt;
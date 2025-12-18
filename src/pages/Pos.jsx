import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Pos.css';

const Pos = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    // Ambil data user yang sedang login untuk log Kasir
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getItemCount = (id) => {
        const item = cart.find(i => i._id === id);
        return item ? item.qty : 0;
    };

    const addToCart = (product) => {
        const existing = cart.find(i => i._id === product._id);
        if (product.stock_quantity <= (existing ? existing.qty : 0)) {
            return Swal.fire({ icon: 'error', title: 'Stok Habis' });
        }

        if (existing) {
            setCart(cart.map(i =>
                i._id === product._id ? { ...i, qty: i.qty + 1 } : i
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const handleBadgeClick = (e, id) => {
        e.stopPropagation();
        setCart(prev =>
            prev.map(i =>
                i._id === id ? { ...i, qty: i.qty - 1 } : i
            ).filter(i => i.qty > 0)
        );
    };

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.sale_price * item.qty, 0
    );

    /* =================== QRIS =================== */
    const handleQRISPayment = () => {
        Swal.fire({
            title: 'Pembayaran QRIS',
            html: `
                <div style="text-align:center">
                    <p>Total Bayar</p>
                    <h2 style="margin:10px 0;color:#10b981">
                        Rp ${totalPrice.toLocaleString('id-ID')}
                    </h2>
                    <img 
                        src="/qris.jpg"
                        alt="QRIS"
                        style="width:220px;border-radius:12px;border:1px solid #e5e7eb"
                    />
                    <p style="font-size:13px;color:#64748b;margin-top:10px">
                        Scan QR menggunakan e-wallet
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Sudah Bayar',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#10b981',
            allowOutsideClick: false
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Memverifikasi...',
                    timer: 1200,
                    didOpen: () => Swal.showLoading(),
                    showConfirmButton: false
                }).then(() => {
                    submitTransaction();
                });
            }
        });
    };

    /* ================= TRANSAKSI ================= */
    const submitTransaction = async () => {
        try {
            const payload = {
                cart: cart.map(item => ({
                    _id: item._id,
                    name: item.name,
                    qty: item.qty,
                    sale_price: item.sale_price,
                    cost_price: item.cost_price // Kirim HPP untuk kalkulasi laba di backend
                })),
                paymentMethod,
                cashier_name: user.username // LOG NAMA KASIR
            };

            const response = await api.post('/sales', payload);

            Swal.fire({
                icon: 'success',
                title: 'Pembayaran Berhasil',
                text: `Kasir: ${user.username}`,
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                setCart([]);
                setAmountPaid('');
                fetchProducts();

                navigate('/receipt', {
                    state: {
                        sale: response.data.sale,
                        amountPaid: paymentMethod === 'Cash'
                            ? Number(amountPaid)
                            : totalPrice,
                        change: paymentMethod === 'Cash'
                            ? Number(amountPaid) - totalPrice
                            : 0
                    }
                });
            });

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Transaksi Gagal', text: err.response?.data?.message });
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;

        if (paymentMethod === 'Cash') {
            if (Number(amountPaid) < totalPrice) {
                return Swal.fire({ icon: 'error', title: 'Uang Kurang' });
            }
            submitTransaction();
        }

        if (paymentMethod === 'QRIS') {
            handleQRISPayment();
        }
    };

    if (loading) return <div className="pos-loading">Memuat...</div>;

    return (
        <div className="pos-layout-fixed">
            {/* HEADER */}
            <div className="pos-header-sticky">
                <div className="header-content">
                    <div>
                        <h2 className="pos-logo">Sepukopi</h2>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Kasir: {user.username}</span>
                    </div>
                    <input
                        className="pos-search"
                        placeholder="Cari menu..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* MENU */}
            <div className="pos-menu-scrollable">
                <div className="pos-grid">
                    {filteredProducts.map(product => (
                        <div
                            key={product._id}
                            className="pos-card"
                            onClick={() => addToCart(product)}
                        >
                            <div className="pos-card-img">
                                <div className="img-letter">
                                    {product.name.charAt(0)}
                                </div>

                                {getItemCount(product._id) > 0 && (
                                    <div
                                        className="pos-badge"
                                        onClick={e =>
                                            handleBadgeClick(e, product._id)
                                        }
                                    >
                                        {getItemCount(product._id)}
                                    </div>
                                )}
                            </div>

                            <div className="pos-card-body">
                                <h4>{product.name}</h4>
                                <p>
                                    Rp {product.sale_price.toLocaleString('id-ID')}
                                </p>
                                <small style={{ color: '#94a3b8', fontSize: '10px' }}>Stok: {product.stock_quantity}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            {cart.length > 0 && (
                <div className="pos-footer-action">
                    <div className="summary-line">
                        <span>Total ({cart.length} Item)</span>
                        <span className="total-val">
                            Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="pay-options">
                        <div className="input-group">
                            <select
                                className="pos-select"
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                            >
                                <option value="Cash">Cash</option>
                                <option value="QRIS">QRIS</option>
                            </select>

                            {paymentMethod === 'Cash' && (
                                <input
                                    type="number"
                                    className="pos-input-pay"
                                    placeholder="Bayar..."
                                    value={amountPaid}
                                    onChange={e => setAmountPaid(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="button-group">
                            <button className="btn-pay" onClick={handleCheckout}>
                                BAYAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pos;
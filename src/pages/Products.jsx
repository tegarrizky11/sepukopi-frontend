import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const Products = () => {
    const [products, setProducts] = useState([]);

    // 🔐 CEK ROLE USER
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error('Gagal memuat produk:', err);
        }
    };

    /* ================= TAMBAH PRODUK (ADMIN ONLY) ================= */
    const handleAddProduct = async () => {
        if (!isAdmin) return;

        const { value } = await Swal.fire({
            title: 'Tambah Menu Baru',
            html: `
                <input id="name" class="swal2-input" placeholder="Nama Menu">
                <input id="sku" class="swal2-input" placeholder="SKU">
                <input id="cost" type="number" class="swal2-input" placeholder="HPP">
                <input id="price" type="number" class="swal2-input" placeholder="Harga Jual">
                <input id="stock" type="number" class="swal2-input" placeholder="Stok">
            `,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            preConfirm: () => ({
                name: document.getElementById('name').value,
                sku: document.getElementById('sku').value,
                cost_price: Number(document.getElementById('cost').value),
                sale_price: Number(document.getElementById('price').value),
                stock_quantity: Number(document.getElementById('stock').value)
            })
        });

        if (value) {
            await api.post('/products', value);
            Swal.fire('Berhasil', 'Menu ditambahkan', 'success');
            fetchProducts();
        }
    };

    /* ================= EDIT (ADMIN ONLY) ================= */
    const handleEditProduct = async (p) => {
        if (!isAdmin) return;

        const { value } = await Swal.fire({
            title: 'Edit Menu',
            html: `
                <input id="name" class="swal2-input" value="${p.name}">
                <input id="cost" type="number" class="swal2-input" value="${p.cost_price}">
                <input id="price" type="number" class="swal2-input" value="${p.sale_price}">
                <input id="stock" type="number" class="swal2-input" value="${p.stock_quantity}">
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            preConfirm: () => ({
                name: document.getElementById('name').value,
                cost_price: Number(document.getElementById('cost').value),
                sale_price: Number(document.getElementById('price').value),
                stock_quantity: Number(document.getElementById('stock').value)
            })
        });

        if (value) {
            await api.put(`/products/${p._id}`, value);
            Swal.fire('Berhasil', 'Menu diperbarui', 'success');
            fetchProducts();
        }
    };

    /* ================= HAPUS (ADMIN ONLY) ================= */
    const handleDelete = async (id, name) => {
        if (!isAdmin) return;

        const res = await Swal.fire({
            title: 'Hapus Menu?',
            text: `Hapus "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444'
        });

        if (res.isConfirmed) {
            await api.delete(`/products/${id}`);
            Swal.fire('Terhapus', '', 'success');
            fetchProducts();
        }
    };

    return (
        <div style={{ padding: '20px' }}>

            {/* HEADER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <h3 style={{ margin: 0 }}>Manajemen Produk</h3>

                {/* ➕ TAMBAH MENU (ADMIN ONLY) */}
                {isAdmin && (
                    <button
                        onClick={handleAddProduct}
                        style={{
                            padding: '10px 14px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                        }}
                    >
                        + Menu
                    </button>
                )}
            </div>

            {/* TABLE */}
            <div
                style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                    overflowX: 'auto'
                }}
            >
                <table
                    style={{
                        width: '100%',
                        minWidth: isAdmin ? '720px' : '560px',
                        borderCollapse: 'collapse'
                    }}
                >
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={th}>Nama</th>
                            <th style={th}>HPP</th>
                            <th style={th}>Harga</th>
                            <th style={th}>Stok</th>
                            {isAdmin && <th style={{ ...th, textAlign: 'center' }}>Aksi</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {products.map(p => (
                            <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={td}>{p.name}</td>
                                <td style={{ ...td, color: '#f59e0b', fontWeight: 'bold' }}>
                                    Rp {p.cost_price?.toLocaleString('id-ID')}
                                </td>
                                <td style={{ ...td, color: '#10b981', fontWeight: 'bold' }}>
                                    Rp {p.sale_price?.toLocaleString('id-ID')}
                                </td>
                                <td style={td}>{p.stock_quantity}</td>

                                {/* AKSI ADMIN */}
                                {isAdmin && (
                                    <td style={{ ...td, textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEditProduct(p)}
                                            style={btnEdit}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p._id, p.name)}
                                            style={btnDelete}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ========== STYLE HELPERS ========== */
const th = {
    padding: '14px',
    color: '#64748b',
    textAlign: 'left',
    fontSize: '13px'
};

const td = {
    padding: '14px',
    fontSize: '14px',
    color: '#1e293b'
};

const btnEdit = {
    padding: '6px 10px',
    marginRight: '6px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};

const btnDelete = {
    padding: '6px 10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};

export default Products;

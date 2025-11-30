
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaBoxOpen, FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft } from 'react-icons/fa';
import styles from './admin-shop.module.css';

interface Product {
    id: string;
    title: string;
    price: number;
    member_price?: number;
    regular_price?: number;
    inventory: number;
    category?: string;
    is_published: boolean;
    image_url?: string;
}

import { useAuth } from '@/contexts/AuthContext';

// ... imports ...

export default function AdminShop() {
    const router = useRouter();
    const { user, profile, loading: authLoading, profileLoading, isAdmin } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (authLoading || profileLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (!isAdmin) {
            router.push('/dashboard');
            return;
        }

        fetchProducts().then(() => setLoading(false));
    }, [user, isAdmin, authLoading, profileLoading, router]);

    // Remove initAdmin and its call

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('shop_products')
            .select('*')
            .order('created_at', { ascending: false });
        setProducts(data || []);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            if (editingProduct.id) {
                // Update
                const { error } = await supabase
                    .from('shop_products')
                    .update({
                        title: editingProduct.title,
                        price: editingProduct.price,
                        member_price: editingProduct.member_price,
                        regular_price: editingProduct.regular_price,
                        inventory: editingProduct.inventory,
                        category: editingProduct.category,
                        is_published: editingProduct.is_published,
                        image_url: editingProduct.image_url
                    })
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('shop_products')
                    .insert([{
                        title: editingProduct.title,
                        price: editingProduct.price,
                        member_price: editingProduct.member_price,
                        regular_price: editingProduct.regular_price,
                        inventory: editingProduct.inventory,
                        category: editingProduct.category,
                        is_published: editingProduct.is_published,
                        image_url: editingProduct.image_url
                    }]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
            alert('Product saved successfully!');
        } catch (error: any) {
            console.error('Error saving product:', error);
            alert('Failed to save product: ' + error.message);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('shop_products')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchProducts();
        } catch (error: any) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product: ' + error.message);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className={styles.loading}>Loading Admin Shop...</div>;

    return (
        <div className={styles.adminShop}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={() => router.push('/admin/dashboard')} className={styles.backBtn}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1>Shop Management</h1>
                </div>
                <button
                    className={styles.primaryBtn}
                    onClick={() => {
                        setEditingProduct({
                            id: '',
                            title: '',
                            price: 0,
                            member_price: 0,
                            regular_price: 0,
                            inventory: 0,
                            category: 'model3',
                            is_published: true,
                            image_url: ''
                        });
                        setIsModalOpen(true);
                    }}
                >
                    <FaPlus /> Add Product
                </button>
            </header>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
                    <div key={product.id} className={styles.productCard}>
                        <div className={styles.productImage}>
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} />
                            ) : (
                                <div className={styles.placeholderImage}><FaBoxOpen /></div>
                            )}
                            <div className={styles.statusBadge} data-status={product.is_published ? 'published' : 'draft'}>
                                {product.is_published ? 'Published' : 'Draft'}
                            </div>
                        </div>
                        <div className={styles.productInfo}>
                            <h3>{product.title}</h3>
                            <div className={styles.priceRow}>
                                <span className={styles.memberPrice}>${product.member_price || product.price}</span>
                                <span className={styles.regularPrice}>${product.regular_price}</span>
                            </div>
                            <div className={styles.inventory}>Stock: {product.inventory}</div>
                            <div className={styles.actions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteProduct(product.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingProduct && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSaveProduct}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProduct.title}
                                    onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Member Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={editingProduct.member_price || editingProduct.price}
                                        onChange={e => setEditingProduct({ ...editingProduct, member_price: parseFloat(e.target.value), price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Regular Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.regular_price || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, regular_price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Inventory</label>
                                    <input
                                        type="number"
                                        required
                                        value={editingProduct.inventory}
                                        onChange={e => setEditingProduct({ ...editingProduct, inventory: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select
                                        value={editingProduct.category}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    >
                                        <option value="model3">Model 3</option>
                                        <option value="modelY">Model Y</option>
                                        <option value="modelS">Model S</option>
                                        <option value="modelX">Model X</option>
                                        <option value="cybertruck">Cybertruck</option>
                                        <option value="merchandise">Merchandise</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    value={editingProduct.image_url || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={editingProduct.is_published}
                                        onChange={e => setEditingProduct({ ...editingProduct, is_published: e.target.checked })}
                                    />
                                    Published
                                </label>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

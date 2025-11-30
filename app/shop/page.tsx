
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaShoppingCart, FaHome, FaSpinner } from 'react-icons/fa';
import ProductCard from '@/components/ProductCard';
import CartModal from '@/components/CartModal';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import styles from './shop.module.css';

interface Product {
    id: string;
    title: string;
    price: number;
    member_price?: number;
    regular_price?: number;
    image_url?: string;
    inventory: number;
    category?: string;
    is_published: boolean;
    description?: string;
}

interface CartItem {
    product_id: string;
    title: string;
    price: number;
    quantity: number;
}

export default function Shop() {
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentModel, setCurrentModel] = useState('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const initShop = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/shop');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('shop_products')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading products:', error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        };

        initShop();
    }, [supabase, router]);

    const filteredProducts = products.filter(p => {
        if (currentModel === 'all') return true;
        const modelCategoryMap: Record<string, string> = {
            'model3': 'new-model-3-highland',
            'modelY': 'model-y'
        };
        const targetCategory = modelCategoryMap[currentModel];
        return targetCategory && p.category === targetCategory;
    });

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.inventory) {
                    alert(`Only ${product.inventory} items available`);
                    return prev;
                }
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                title: product.title,
                price: product.member_price || product.price,
                quantity: 1
            }];
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const product = products.find(p => p.id === productId);
        if (product && quantity > product.inventory) {
            alert(`Only ${product.inventory} items available`);
            return;
        }
        setCart(prev => prev.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
        ));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const handleCheckout = async (orderDetails: any) => {
        try {
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const orderData = {
                user_id: user.id,
                items: cart,
                total_amount: totalAmount,
                pickup_note: orderDetails.pickup_note,
                preferred_datetime: orderDetails.preferred_datetime,
                status: 'pending',
                order_date: new Date().toISOString()
            };

            const { data: order, error } = await supabase
                .from('shop_orders')
                .insert([orderData])
                .select()
                .single();

            if (error) throw error;

            // Update inventory
            for (const item of cart) {
                const product = products.find(p => p.id === item.product_id);
                if (product) {
                    await supabase
                        .from('shop_products')
                        .update({ inventory: Math.max(0, product.inventory - item.quantity) })
                        .eq('id', item.product_id);
                }
            }

            // Send confirmation email
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    subject: 'Blitz Shop Reservation Confirmation',
                    html: `
            <h1>Order Confirmation #${order.id}</h1>
            <p>Thank you for your reservation!</p>
            <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
            <p><strong>Pickup Time:</strong> ${orderDetails.preferred_datetime}</p>
            <p><strong>Status:</strong> Reserved for pickup (Cash Only)</p>
          `
                })
            });

            setCart([]);
            setShowCart(false);
            alert('Order placed successfully! Check your email for confirmation.');

            // Refresh products to update inventory
            const { data: refreshedProducts } = await supabase
                .from('shop_products')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });
            if (refreshedProducts) setProducts(refreshedProducts);

        } catch (error: any) {
            console.error('Checkout error:', error);
            alert('Failed to place order: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className={styles.shopPage}>
            <header className={styles.shopHeader}>
                <div className={styles.headerLeft}>
                    <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
                        ←
                    </button>
                    <div className={styles.shopLogo}>
                        <img src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars//logo.png" alt="Logo" />
                        <span className={styles.logoText}>BLITZ SHOP</span>
                    </div>
                </div>

                <div className={styles.headerCenter}>
                    <div className={styles.modelSelectionBar}>
                        <div className={styles.modelPills}>
                            {['all', 'model3', 'modelY', 'modelS', 'modelX', 'cybertruck'].map(model => (
                                <button
                                    key={model}
                                    className={`${styles.modelPill} ${currentModel === model ? styles.active : ''}`}
                                    onClick={() => setCurrentModel(model)}
                                >
                                    {model === 'all' ? 'ALL' : model.toUpperCase().replace('MODEL', 'MODEL ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.shopHomeBtn} onClick={() => router.push('/')}>
                        <FaHome /> SHOP
                    </button>
                    <button className={styles.cartIcon} onClick={() => setShowCart(true)}>
                        <FaShoppingCart />
                        {cart.length > 0 && (
                            <span className={styles.cartCount}>
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className={styles.productsGrid}>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            onProductClick={() => setSelectedProduct(product)}
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <h3>No Products Found</h3>
                        <p>Try selecting a different model.</p>
                    </div>
                )}
            </main>

            {showCart && (
                <CartModal
                    cart={cart}
                    onClose={() => setShowCart(false)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onCheckout={handleCheckout}
                />
            )}

            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={addToCart}
                />
            )}
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Product, Category } from '../types';
import { RefreshCw, Plus, ShoppingCart, Layers, Wallet, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get('/api/v1/products'),
        axios.get('/api/v1/categories')
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stockQuantity || 0)), 0);
  const outOfStock = products.filter(p => (p.stockQuantity || 0) <= 0).length;
  const recentProducts = [...products].reverse().slice(0, 5);

  return (
    <div id="content">
      <div className="page-header d-flex justify-content-between align-items-start">
        <div>
          <h1 className="page-title">Chào buổi sáng, admin-nguyenquyngoc</h1>
          <p className="page-subtitle">Dưới đây là những gì đang diễn ra với hệ thống quản lý của bạn.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm bg-white" onClick={fetchData}>
            <RefreshCw size={14} className="me-1" /> Làm mới
          </button>
          <Link to="/products" className="btn btn-primary">
            <Plus size={14} className="me-1" /> Tạo sản phẩm
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-indigo-light"><ShoppingCart size={20} /></div>
            <div className="stat-value">{loading ? '...' : products.length}</div>
            <div className="stat-label">Tổng sản phẩm</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-emerald-light"><Layers size={20} /></div>
            <div className="stat-value">{loading ? '...' : categories.length}</div>
            <div className="stat-label">Danh mục</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-amber-light"><Wallet size={20} /></div>
            <div className="stat-value">{loading ? '...' : new Intl.NumberFormat('vi-VN').format(totalValue) + 'đ'}</div>
            <div className="stat-label">Giá trị tồn kho</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-rose-light"><AlertCircle size={20} /></div>
            <div className="stat-value">{loading ? '...' : outOfStock}</div>
            <div className="stat-label">Hết hàng</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <div className="card-container">
            <div className="card-header-ui border-0 pb-0">
              <h5>Sản phẩm mới cập nhật</h5>
              <Link to="/products" className="text-primary text-decoration-none small fw-bold">Xem tất cả</Link>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-5 text-muted">Đang tải dữ liệu...</td></tr>
                  ) : recentProducts.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-muted">Chưa có sản phẩm nào.</td></tr>
                  ) : (
                    recentProducts.map(p => (
                      <tr key={p.productId}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={p.imageUrl || 'https://via.placeholder.com/40'} className="rounded me-3" width="40" height="40" style={{ objectFit: 'cover' }} alt="" />
                            <div>
                              <div className="fw-bold">{p.productName}</div>
                              <div className="text-secondary x-small text-truncate" style={{ maxWidth: '150px' }}>{p.description || 'Không có mô tả'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-light text-dark border">{p.category ? p.category.categoryName : 'N/A'}</span></td>
                        <td className="fw-bold text-nowrap">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2 fw-medium">{p.stockQuantity || 0}</span>
                            <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                              <div className="progress-bar" role="progressbar" style={{ width: `${Math.min((p.stockQuantity || 0) * 2, 100)}%`, backgroundColor: (p.stockQuantity || 0) < 5 ? '#e11d48' : '#4f46e5' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

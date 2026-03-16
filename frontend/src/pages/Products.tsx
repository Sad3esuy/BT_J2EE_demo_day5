import React, { useEffect, useState, FormEvent } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Product, Category } from '../types';
import { RefreshCw, Plus, Trash2, Edit2, Search } from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    productName: '',
    price: 0,
    stockQuantity: 0,
    description: '',
    imageUrl: '',
    categoryId: '',
    isActive: true
  });

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
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const dataToSubmit = {
        productName: formData.productName,
        price: formData.price,
        stockQuantity: formData.stockQuantity,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
        category: formData.categoryId ? { categoryId: formData.categoryId } : null
      };

      if (editingId) {
        await axios.put(`/api/v1/products/${editingId}`, dataToSubmit);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật sản phẩm thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post('/api/v1/products', dataToSubmit);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm sản phẩm thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra: ' + (axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Unknown error')
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn sẽ không thể khôi phục lại sản phẩm này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/v1/products/${id}`);
          fetchData();
          Swal.fire(
            'Đã xóa!',
            'Sản phẩm của bạn đã được xóa thành công.',
            'success'
          );
        } catch (err) {
          console.error('Error deleting product:', err);
          Swal.fire(
            'Lỗi!',
            'Không thể xóa sản phẩm này.',
            'error'
          );
        }
      }
    });
  };

  const openEdit = (p: Product) => {
    setEditingId(p.productId);
    setFormData({
      productName: p.productName,
      price: p.price,
      stockQuantity: p.stockQuantity,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      categoryId: p.category?.categoryId || '',
      isActive: p.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setErrors({});
    setFormData({
      productName: '',
      price: 0,
      stockQuantity: 0,
      description: '',
      imageUrl: '',
      categoryId: '',
      isActive: true
    });
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category?.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="content">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title">Sản phẩm</h1>
          <p className="page-subtitle">Quản lý kho hàng và danh sách sản phẩm.</p>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm s.phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline-secondary btn-sm bg-white" onClick={fetchData}>
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={14} className="me-1" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-5 text-muted">Đang tải dữ liệu...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-5 text-muted">Không tìm thấy sản phẩm nào.</td></tr>
              ) : (
                filteredProducts.map((p, index) => (
                  <tr key={p.productId}>
                    <td className="text-secondary small">{index + 1}</td>
                    <td>
                      <img src={p.imageUrl || 'https://via.placeholder.com/40'} className="rounded" width="40" height="40" style={{ objectFit: 'cover' }} alt="" />
                    </td>
                    <td>
                      <div className="fw-bold">{p.productName}</div>
                      <div className="text-secondary x-small text-truncate" style={{ maxWidth: '200px' }}>{p.description || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {p.category?.categoryName || 'N/A'}
                      </span>
                    </td>
                    <td><span className="text-success fw-bold">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</span></td>
                    <td className="text-center fw-bold">{p.stockQuantity || 0}</td>
                    <td className="text-center">
                      {p.isActive ? (
                        <span className="badge bg-success">Đang bán</span>
                      ) : (
                        <span className="badge bg-danger">Ngừng bán</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(p)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.productId)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title font-bold text-lg">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body overflow-y-auto" style={{ maxHeight: '70vh' }}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Tên sản phẩm</label>
                      <input
                        type="text"
                        className={`form-control ${errors.productName ? 'is-invalid' : ''}`}
                        value={formData.productName}
                        onChange={e => setFormData({ ...formData, productName: e.target.value })}
                      />
                      {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Danh mục</label>
                      <select
                        className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      >
                        <option value="">-- Chọn --</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                      </select>
                      {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Giá (VNĐ)</label>
                      <input
                        type="number"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      />
                      {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Số lượng kho</label>
                      <input
                        type="number"
                        className={`form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
                        value={formData.stockQuantity}
                        onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                      />
                      {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity}</div>}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Link ảnh (URL)</label>
                      <input type="text" className="form-control" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Mô tả sản phẩm</label>
                      <textarea className="form-control" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                    <div className="col-md-12">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActiveSwitch"
                          checked={formData.isActive}
                          onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isActiveSwitch">Kích hoạt sản phẩm</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer px-0 pt-3 mx-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary px-4">{editingId ? 'Cập nhật' : 'Lưu sản phẩm'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

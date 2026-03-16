import React, { useEffect, useState, FormEvent } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Category } from '../types';
import { RefreshCw, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/v1/categories/${editingCategory.categoryId}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật danh mục thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post('/api/v1/categories', formData);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm danh mục thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ categoryName: '', description: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra: ' + (axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Unknown error')
      });
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn sẽ không thể khôi phục lại danh mục này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/v1/categories/${id}`);
          fetchCategories();
          Swal.fire(
            'Đã xóa!',
            'Danh mục đã được xóa thành công.',
            'success'
          );
        } catch (err) {
          console.error('Error deleting category:', err);
          Swal.fire(
            'Lỗi!',
            'Không thể xóa danh mục này (có thể do đang có sản phẩm thuộc danh mục).',
            'error'
          );
        }
      }
    });
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ categoryName: cat.categoryName, description: cat.description || '' });
    setShowModal(true);
  };

  return (
    <div id="content">
      <div className="page-header d-flex justify-content-between align-items-start">
        <div>
          <h1 className="page-title">Quản lý danh mục</h1>
          <p className="page-subtitle">Thêm, sửa hoặc xóa các danh mục sản phẩm của bạn.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm bg-white" onClick={fetchCategories}>
            <RefreshCw size={14} className="me-1" /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setFormData({ categoryName: '', description: '' }); setShowModal(true); }}>
            <Plus size={14} className="me-1" /> Thêm danh mục
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card card-ui p-4 bg-white shadow-sm" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold mb-4">{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Tên danh mục</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Điện tử, Thời trang..."
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Mô tả</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <Plus size={18} className="me-2" /> Lưu thông tin
              </button>
              <button type="button" className="btn btn-link btn-sm w-100 mt-2 text-decoration-none" onClick={() => { setEditingCategory(null); setFormData({ categoryName: '', description: '' }); }}>Làm mới</button>
            </form>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card-container">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Danh sách Categories</h5>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên Danh mục</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="text-center py-5 text-muted">Đang tải dữ liệu...</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-4 text-muted">Chưa có danh mục nào.</td></tr>
                  ) : (
                    categories.map((cat, index) => (
                      <tr key={cat.categoryId}>
                        <td className="text-secondary small">{index + 1}</td>
                        <td className="fw-bold">{cat.categoryName}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(cat)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.categoryId)}>
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
        </div>
      </div>

      {/* Modal - Simple implementation using standard Bootstrap classes if globally available or custom CSS */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tên danh mục</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">{editingCategory ? 'Cập nhật' : 'Lưu lại'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

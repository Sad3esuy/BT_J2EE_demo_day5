import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Tags, Boxes } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <nav id="sidebar">
      <div className="sidebar-header">
        <h3><Boxes className="me-2" />Hehehe Pro</h3>
      </div>
      <ul className="list-unstyled components mb-auto">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
            <LayoutDashboard className="me-2" size={18} /> Tổng quan
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({ isActive }) => isActive ? "active-link" : ""}>
            <ShoppingBag className="me-2" size={18} /> Sản phẩm
          </NavLink>
        </li>
        <li>
          <NavLink to="/categories" className={({ isActive }) => isActive ? "active-link" : ""}>
            <Tags className="me-2" size={18} /> Danh mục
          </NavLink>
        </li>
      </ul>
      <div className="p-4 mt-auto">
        <div className="card bg-dark border-secondary p-3">
          <p className="small mb-2 text-secondary">Logged in as</p>
          <div className="d-flex align-items-center overflow-hidden text-nowrap text-white">
            <img src="https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff" className="rounded-circle me-2" width="32" alt="avatar" />
            <div className="text-truncate">
              <p className="mb-0 small fw-bold">Quản trị viên</p>
              <p className="mb-0 x-small text-secondary">admin@system.com</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;

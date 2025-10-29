import { NavLink } from 'react-router-dom';
import { 
  FiGrid, 
  FiSearch, 
  FiLayout 
} from 'react-icons/fi';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FiGrid size={24} />
        <span className="sidebar-title">RestaurantBI</span>
        <span className="sidebar-subtitle">Analytics Pro</span>
      </div>
      <nav className="sidebar-nav">
        <p className="menu-title">Menu</p>
        <ul>
          {
          }
          <li>
            <NavLink to="/" className="nav-item">
              <FiLayout />
              <span>Painel Principal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/explorer" className="nav-item">
              <FiSearch />
              <span>Explorar</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
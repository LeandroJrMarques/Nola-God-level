import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        {/* <Outlet /> é o espaço reservado onde o React Router
          irá renderizar o <Dashboard /> ou o <Explore />
          dependendo da URL.
        */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './components/dashboard';
import Explore from './components/explorer';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* O Layout agora envolve todas as páginas */}
        <Route path="/" element={<Layout />}>

          {/* Rota principal */}
          <Route index element={<Dashboard />} />

          {/* Rota de Exploração */}
          <Route path="explorer" element={<Explore />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
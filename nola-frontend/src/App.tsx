import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './components/dashboard';
import Explore from './components/explorer';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* O Layout agora "envolve" todas as nossas páginas */}
        <Route path="/" element={<Layout />}>

          {/* Rota principal (ex: localhost:5173/) */}
          <Route index element={<Dashboard />} />

          {/* Rota de Exploração (ex: localhost:5173/explorar) */}
          <Route path="explorer" element={<Explore />} />

          {/* (Pode adicionar mais rotas aqui depois) */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
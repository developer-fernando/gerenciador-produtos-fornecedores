import { Navigate, Route, Routes } from 'react-router-dom'

// Placeholder da tela de Empresas — substituído pela EmpresasPage na 04-T6.
function EmpresasPlaceholder() {
  return (
    <section>
      <h1>Empresas</h1>
      <p>Listagem de empresas (em construção).</p>
    </section>
  )
}

// Definição central de rotas. A base "/" redireciona para "/empresas";
// a rota de Produtos entra na feature 05.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/empresas" replace />} />
      <Route path="/empresas" element={<EmpresasPlaceholder />} />
      <Route path="*" element={<Navigate to="/empresas" replace />} />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { EmpresasPage } from '../features/empresas/components/EmpresasPage'

// Placeholder da tela de Produtos — substituído pela ProdutosPage na 05-T3.
function ProdutosPlaceholder() {
  return (
    <section>
      <h1>Produtos</h1>
      <p>Listagem de produtos (em construção).</p>
    </section>
  )
}

// Definição central de rotas. A base "/" redireciona para "/empresas".
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/empresas" replace />} />
      <Route path="/empresas" element={<EmpresasPage />} />
      <Route path="/produtos" element={<ProdutosPlaceholder />} />
      <Route path="*" element={<Navigate to="/empresas" replace />} />
    </Routes>
  )
}

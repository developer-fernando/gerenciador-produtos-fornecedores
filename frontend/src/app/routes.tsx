import { Navigate, Route, Routes } from 'react-router-dom'
import { EmpresasPage } from '../features/empresas/components/EmpresasPage'
import { ProdutosPage } from '../features/produtos/components/ProdutosPage'

// Definição central de rotas. A base "/" redireciona para "/empresas".
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/empresas" replace />} />
      <Route path="/empresas" element={<EmpresasPage />} />
      <Route path="/produtos" element={<ProdutosPage />} />
      <Route path="*" element={<Navigate to="/empresas" replace />} />
    </Routes>
  )
}

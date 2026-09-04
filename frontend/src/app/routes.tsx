import { Navigate, Route, Routes } from 'react-router-dom'
import { EmpresasPage } from '../features/empresas/components/EmpresasPage'

// Definição central de rotas. A base "/" redireciona para "/empresas";
// a rota de Produtos entra na feature 05.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/empresas" replace />} />
      <Route path="/empresas" element={<EmpresasPage />} />
      <Route path="*" element={<Navigate to="/empresas" replace />} />
    </Routes>
  )
}

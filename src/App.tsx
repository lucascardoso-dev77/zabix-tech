import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'

import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/tickets/NewTicket'
import MyTickets from './pages/tickets/MyTickets'
import AllTickets from './pages/tickets/AllTickets'
import TicketDetail from './pages/tickets/TicketDetail'
import KnowledgeBase from './pages/KnowledgeBase'
import SolicitarCompra from './pages/compras/SolicitarCompra'
import AcompanharCompras from './pages/compras/AcompanharCompras'
import Almoxarifado from './pages/Almoxarifado'
import ContasPagar from './pages/financeiro/ContasPagar'
import ContasReceber from './pages/financeiro/ContasReceber'
import Relatorios from './pages/financeiro/Relatorios'
import Solicitacoes from './pages/rh/Solicitacoes'
import Ferias from './pages/rh/Ferias'
import Ponto from './pages/rh/Ponto'
import Configuracoes from './pages/Configuracoes'
import UserManagement from './pages/admin/UserManagement'
import ComunicadosTodos from './pages/ComunicadosTodos'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />

              <Route path="/chamados/novo" element={<NewTicket />} />
              <Route path="/chamados/meus" element={<MyTickets />} />
              <Route path="/chamados/todos" element={<AllTickets />} />
              <Route path="/chamados/:id" element={<TicketDetail />} />
              <Route path="/base-de-conhecimento" element={<KnowledgeBase />} />

              <Route path="/compras/solicitar" element={<SolicitarCompra />} />
              <Route path="/compras/acompanhar" element={<AcompanharCompras />} />
              <Route path="/almoxarifado" element={<Almoxarifado />} />

              <Route path="/financeiro/contas-a-pagar" element={<ContasPagar />} />
              <Route path="/financeiro/contas-a-receber" element={<ContasReceber />} />
              <Route path="/financeiro/relatorios" element={<Relatorios />} />

              <Route path="/rh/solicitacoes" element={<Solicitacoes />} />
              <Route path="/rh/ferias" element={<Ferias />} />
              <Route path="/rh/ponto" element={<Ponto />} />

              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route
                path="/admin/usuarios"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />

              <Route path="/comunicados" element={<ComunicadosTodos />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

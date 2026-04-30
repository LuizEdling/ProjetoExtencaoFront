import { Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import RequireAuth from "../components/RequireAuth";
import Login from "../pages/login";
import Adocoes from "../pages/adocoes";
import Fichas from "../pages/fichas";
import Gastos from "../pages/gastos";
import Painel from "../pages/painel";
import Relatorios from "../pages/relatorios";
import AdotantesPage from "../components/Adotantes/AdotantesPage";
import LembretesPage from "../components/Lembretes/LembretesPage";

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/painel" element={<Painel />} />
          <Route path="/fichas" element={<Fichas />} />
          <Route path="/agenda" element={<LembretesPage />} />
          <Route path="/adocoes" element={<Adocoes />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/adotantes" element={<AdotantesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

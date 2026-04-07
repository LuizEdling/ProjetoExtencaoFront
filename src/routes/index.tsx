import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import Adocoes from '../pages/adocoes';
import Agenda from '../pages/agenda';
import Fichas from '../pages/fichas';
import Gastos from '../pages/gastos';
import Painel from '../pages/painel';
import Relatorios from '../pages/painel';

export default function RoutesApp(){
  return(
    <Routes>
      <Route path='/' element={<Login />} />

      <Route path='/painel' element={<Painel />} />

      <Route path='/fichas' element={<Fichas />} />

      <Route path='/agenda' element={<Agenda />} />

      <Route path='/adocoes' element={<Adocoes />} />

      <Route path='/gastos' element={<Gastos />} />

      <Route path='/relatorios' element={<Relatorios />} />
    </Routes>
  );
};
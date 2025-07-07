import { useState, useEffect } from 'react';
import Modal from './components/Modal.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import { db } from './firebase/config.js';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import './index.css';

function App() {
  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({
    nome: '',
    saldo: '',
    empresa: '',
    categoria: 'Outros',
    tipo: 'despesa',
    dataPagamento: new Date().toISOString().split('T')[0], // Data atual como padrão
  });
  const [editando, setEditando] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categorias = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await buscarDespesas();
      setIsLoading(false);
    };
    fetchData();
  }, []);

  async function buscarDespesas() {
    const q = query(collection(db, 'despesas'), orderBy('dataPagamento', 'desc'));
    const querySnapshot = await getDocs(q);
    const despesasData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDespesas(despesasData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !novaDespesa.nome ||
      !novaDespesa.saldo ||
      !novaDespesa.empresa ||
      !novaDespesa.categoria ||
      !novaDespesa.tipo ||
      !novaDespesa.dataPagamento
    )
      return;

    try {
      if (editando) {
        await updateDoc(doc(db, 'despesas', editando.id), novaDespesa);
      } else {
        await addDoc(collection(db, 'despesas'), novaDespesa);
      }

      await buscarDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa: ', error);
    }
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditando(null);
    setNovaDespesa({
      nome: '',
      saldo: '',
      empresa: '',
      categoria: 'Outros',
      tipo: 'despesa',
      dataPagamento: new Date().toISOString().split('T')[0],
    });
  }

  function editTransaction(despesa) {
    setEditando(despesa);
    setNovaDespesa({
      nome: despesa.nome,
      saldo: despesa.saldo,
      empresa: despesa.empresa,
      categoria: despesa.categoria || 'Outros',
      tipo: despesa.tipo || 'despesa',
      dataPagamento: despesa.dataPagamento,
    });
    setIsModalOpen(true);
  }
  async function excluirDespesa(id) {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteDoc(doc(db, 'despesas', id));
        await buscarDespesas();
      } catch (error) {
        console.error('Erro ao excluir despesa: ', error);
      }
    }
  }

  function despesasFiltradas() {
    return despesas.filter(despesa => {
      const matchTipo = filtroTipo === 'todos' || despesa.tipo === filtroTipo;
      const matchCategoria = filtroCategoria === 'todos' || despesa.categoria === filtroCategoria;
      return matchTipo && matchCategoria;
    });
  }

  function calcularTotal() {
    return despesasFiltradas().reduce((total, despesa) => {
      const valor = parseFloat(despesa.saldo) || 0;
      return despesa.tipo === 'receita' ? total + valor : total - valor;
    }, 0);
  }

  function calcularReceitas() {
    return despesasFiltradas()
      .filter(despesa => despesa.tipo === 'receita')
      .reduce((total, despesa) => total + (parseFloat(despesa.saldo) || 0), 0);
  }

  function calcularDespesas() {
    return despesasFiltradas()
      .filter(despesa => despesa.tipo === 'despesa')
      .reduce((total, despesa) => total + (parseFloat(despesa.saldo) || 0), 0);
  }
  function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <div className="app-container p-4 md:p-6 fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 stagger-item">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-0 slide-in-left">
            💰 <span className="text-blue-600">Gestão</span> Financeira
          </h1>
          <button
            onClick={openModal}
            className="btn btn-primary btn-lg scale-in"
          >
            ➕ Nova Transação
          </button>
        </div>

        {/* Modal para formulário */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title={editando ? "✏️ Editar Transação" : "➕ Nova Transação"}
        >
          <TransactionForm
            novaDespesa={novaDespesa}
            setNovaDespesa={setNovaDespesa}
            editando={editando}
            setEditando={setEditando}
            handleSubmit={handleSubmit}
            categorias={categorias}
            onCancel={closeModal}
          />
        </Modal>

        {/* Filtros */}
        <div className="glass-card p-4 md:p-6 mb-4 stagger-item">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">🔍 Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="input-field"
              >
                <option value="todos">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Categoria
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="input-field"
              >
                <option value="todos">Todas</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 stagger-item">
          <div className="summary-card receita">
            <h3 className="summary-title">💰 Receitas</h3>
            <p className="summary-value valor-positivo">
              R$ {calcularReceitas().toFixed(2)}
            </p>
          </div>
          <div className="summary-card despesa">
            <h3 className="summary-title">💸 Despesas</h3>
            <p className="summary-value valor-negativo">
              R$ {calcularDespesas().toFixed(2)}
            </p>
          </div>
          <div className="summary-card">
            <h3 className="summary-title">📊 Saldo</h3>
            <p className={`summary-value ${calcularTotal() >= 0 ? 'valor-positivo' : 'valor-negativo'}`}>
              R$ {calcularTotal().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="glass-card flex justify-center items-center py-12">
            <div className="spinner spinner-lg"></div>
          </div>
        ) : (
          <div className="glass-card table-container stagger-item">
            <div className="table-responsive">
              <table className="data-table min-w-full hidden md:table">
                <thead>
                  <tr>
                    <th>📝 Nome</th>
                    <th>🏷️ Tipo</th>
                    <th>💵 Valor (R$)</th>
                    <th>📂 Categoria</th>
                    <th>🏢 Empresa</th>
                    <th>📅 Data</th>
                    <th>⚙️ Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasFiltradas().map((despesa) => (
                    <tr key={despesa.id}>
                      <td>{despesa.nome}</td>
                      <td>
                        <span className={`badge ${despesa.tipo === 'receita' ? 'badge-receita' : 'badge-despesa'}`}>
                          {despesa.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={despesa.tipo === 'receita' ? 'valor-positivo' : 'valor-negativo'}>
                          {despesa.tipo === 'receita' ? '+' : '-'}R$ {parseFloat(despesa.saldo).toFixed(2)}
                        </span>
                      </td>
                      <td>{despesa.categoria}</td>
                      <td>{despesa.empresa}</td>
                      <td>{formatarData(despesa.dataPagamento)}</td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => editTransaction(despesa)}
                            className="btn btn-primary btn-sm"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => excluirDespesa(despesa.id)}
                            className="btn btn-danger btn-sm"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Versão Mobile */}
              <div className="md:hidden">
                {despesasFiltradas().map((despesa) => (
                  <div key={despesa.id} className="table-card">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">📝 Nome</span>
                        <p className="font-medium">{despesa.nome}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">💵 Valor</span>
                        <p className={`font-medium ${despesa.tipo === 'receita' ? 'valor-positivo' : 'valor-negativo'}`}>
                          {despesa.tipo === 'receita' ? '+' : '-'}R$ {parseFloat(despesa.saldo).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">🏷️ Tipo</span>
                        <p>
                          <span className={`badge ${despesa.tipo === 'receita' ? 'badge-receita' : 'badge-despesa'}`}>
                            {despesa.tipo}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">📂 Categoria</span>
                        <p>{despesa.categoria}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">🏢 Empresa</span>
                        <p>{despesa.empresa}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">📅 Data</span>
                        <p>{formatarData(despesa.dataPagamento)}</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => editTransaction(despesa)}
                        className="btn btn-primary btn-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => excluirDespesa(despesa.id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


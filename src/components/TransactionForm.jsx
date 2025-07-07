import { useState } from 'react';

function TransactionForm({ 
  novaDespesa, 
  setNovaDespesa, 
  editando, 
  setEditando, 
  handleSubmit, 
  categorias,
  onCancel 
}) {
  const resetForm = () => {
    setNovaDespesa({
      nome: '',
      saldo: '',
      empresa: '',
      categoria: 'Outros',
      tipo: 'despesa',
      dataPagamento: new Date().toISOString().split('T')[0],
    });
    setEditando(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    if (!editando) {
      resetForm();
    }
    onCancel();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="form-group">
          <label className="form-label required">
            Nome da Transação
          </label>
          <input
            type="text"
            value={novaDespesa.nome}
            onChange={(e) =>
              setNovaDespesa({ ...novaDespesa, nome: e.target.value })
            }
            className="input-field"
            placeholder="Ex: Compra no supermercado"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">
            Valor (R$)
          </label>
          <input
            type="number"
            value={novaDespesa.saldo}
            onChange={(e) =>
              setNovaDespesa({ ...novaDespesa, saldo: e.target.value })
            }
            className="input-field"
            placeholder="0,00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">
            Empresa/Local
          </label>
          <input
            type="text"
            value={novaDespesa.empresa}
            onChange={(e) =>
              setNovaDespesa({ ...novaDespesa, empresa: e.target.value })
            }
            className="input-field"
            placeholder="Ex: Supermercado ABC"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">
            Tipo de Transação
          </label>
          <select
            value={novaDespesa.tipo}
            onChange={(e) =>
              setNovaDespesa({ ...novaDespesa, tipo: e.target.value })
            }
            className="input-field"
            required
          >
            <option value="despesa">💸 Despesa</option>
            <option value="receita">💰 Receita</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">
            Categoria
          </label>
          <select
            value={novaDespesa.categoria}
            onChange={(e) =>
              setNovaDespesa({ ...novaDespesa, categoria: e.target.value })
            }
            className="input-field"
            required
          >
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">
            Data da Transação
          </label>
          <input
            type="date"
            value={novaDespesa.dataPagamento}
            onChange={(e) =>
              setNovaDespesa({
                ...novaDespesa,
                dataPagamento: e.target.value,
              })
            }
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="btn btn-primary flex-1 md:flex-none"
        >
          {editando ? '✏️ Atualizar Transação' : '➕ Adicionar Transação'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-secondary"
        >
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
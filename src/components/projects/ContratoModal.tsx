import React, { useState } from "react";

interface ContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContratoModal: React.FC<ContratoModalProps> = ({ isOpen, onClose }) => {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("cpf", cpf);
      const response = await fetch("http://192.168.0.214:8082/gerar-contrato", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Erro ao gerar contrato");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrato_${nome.replace(/\s/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const LoadingModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <div className="text-lg font-semibold text-primary mb-2">Fique tranquilo!</div>
        <div className="text-muted-foreground text-sm text-center">A Archestra AI assistant está trabalhando...</div>
      </div>
    </div>
    
  );

  if (!isOpen) return null;

  return (
    <>
      {loading ? (
        <LoadingModal />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Gerar contrato por IA</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do contratante</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF do contratante</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">
                  {loading ? "Gerando..." : "Gerar contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ContratoModal;

import React, { useState } from 'react';
import { 
  Mail, Phone, Calendar, Info, Trash2, Check, Eye, EyeOff, X, ExternalLink, RefreshCw, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Mensagem, dataService } from '../lib/dataService';

interface AdminMensagensTabProps {
  mensagens: Mensagem[];
  onRefresh: () => void;
}

export default function AdminMensagensTab({ mensagens, onRefresh }: AdminMensagensTabProps) {
  // Search & Filter state
  const [msgFilterAssunto, setMsgFilterAssunto] = useState('Todos');
  const [msgFilterLida, setMsgFilterLida] = useState<'Todas' | 'Lidas' | 'NaoLidas'>('Todas');
  const [msgFilterTratada, setMsgFilterTratada] = useState<'Todas' | 'Tratadas' | 'Portratar'>('Todas');
  const [selectedMessage, setSelectedMessage] = useState<Mensagem | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  // Custom delete state to avoid standard window.confirm blocks
  const [msgToDelete, setMsgToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeletingMsg, setIsDeletingMsg] = useState(false);

  const handleToggleLida = async (msgId: string, status: boolean) => {
    try {
      await dataService.updateMensagem(msgId, { lida: status });
      onRefresh();
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage({ ...selectedMessage, lida: status });
      }
    } catch (err) {
      console.error('Erro ao atualizar estado de leitura:', err);
    }
  };

  const handleToggleTratada = async (msgId: string, status: boolean) => {
    try {
      await dataService.updateMensagem(msgId, { tratada: status });
      onRefresh();
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage({ ...selectedMessage, tratada: status });
      }
    } catch (err) {
      console.error('Erro ao atualizar estado de tratamento:', err);
    }
  };

  const handleSelectMessage = (msg: Mensagem) => {
    setSelectedMessage(msg);
    if (!msg.lida) {
      handleToggleLida(msg.id, true);
    }
  };

  const handleDeleteMessage = async (id: string, name: string) => {
    setMsgToDelete({ id, nome: name });
  };

  // Local filter
  const filteredMessages = mensagens.filter(msg => {
    const matchesAssunto = msgFilterAssunto === 'Todos' || msg.assunto.toLowerCase() === msgFilterAssunto.toLowerCase();
    
    let matchesLida = true;
    if (msgFilterLida === 'NaoLidas') {
      matchesLida = msg.lida !== true;
    } else if (msgFilterLida === 'Lidas') {
      matchesLida = msg.lida === true;
    }

    let matchesTratada = true;
    if (msgFilterTratada === 'Portratar') {
      matchesTratada = msg.tratada !== true;
    } else if (msgFilterTratada === 'Tratadas') {
      matchesTratada = msg.tratada === true;
    }

    return matchesAssunto && matchesLida && matchesTratada;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in" id="messages-tab-workspace">
      
      {/* List Column (Left) */}
      <div className={`lg:col-span-1 space-y-4 ${selectedMessage ? 'hidden lg:block' : 'block'}`}>
        {/* Filter controls */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400  uppercase tracking-widest pl-1 mb-1.5">Filtrar Assunto</label>
            <select
              value={msgFilterAssunto}
              onChange={(e) => setMsgFilterAssunto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl text-slate-705 font-bold focus:outline-none"
            >
              <option value="Todos">Todos os Assuntos</option>
              <option value="Apadrinhamento">Apadrinhamento</option>
              <option value="Candidatos a adoção">Candidatos a adoção</option>
              <option value="Candidatos a FAT">Candidatos a FAT</option>
              <option value="Pedidos de ajuda externo">Pedidos de ajuda externo</option>
              <option value="Visita ao canil para conhecer">Visita ao canil</option>
              <option value="Voluntariado">Voluntariado</option>
              <option value="Outro assunto">Outro assunto</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-widest pl-1 mb-1.5">Estado Leitura</label>
            <select
              value={msgFilterLida}
              onChange={(e) => setMsgFilterLida(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-205 text-xs px-3.5 py-2.5 rounded-xl text-slate-705 font-bold focus:outline-none"
            >
              <option value="Todas">Todas as mensagens</option>
              <option value="NaoLidas">Apenas Não Lidas 🔵</option>
              <option value="Lidas">Apenas Lidas</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-widest pl-1 mb-1.5">Estado de Portaria</label>
            <select
              value={msgFilterTratada}
              onChange={(e) => setMsgFilterTratada(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-205 text-xs px-3.5 py-2.5 rounded-xl text-slate-705 font-bold focus:outline-none"
            >
              <option value="Todas">Sem filtro de tratamento</option>
              <option value="Portratar">Pendentes (Por tratar) ⏳</option>
              <option value="Tratadas">Resolvidas (Tratadas) ✅</option>
            </select>
          </div>
        </div>

        {/* Message elements cards list */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[460px] overflow-y-auto font-sans">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Mail className="mx-auto text-slate-200 mb-3" size={32} />
              <p className="text-xs font-bold text-slate-650">Nenhuma mensagem correspondente</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`p-4 transition-all hover:bg-slate-50/50 cursor-pointer text-left relative ${
                  selectedMessage?.id === msg.id ? 'bg-blue-50/50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-800 font-extrabold text-xs truncate pr-16">{msg.nome}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!msg.lida && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Por ler" />}
                    {msg.tratada && <span className="text-emerald-500 font-bold text-[10px]">Tratada</span>}
                  </div>
                </div>

                <p className="text-[10px] font-semibold text-blue-600 truncate mt-1">{msg.assunto}</p>
                <p className="text-xs text-slate-450 truncate mt-1 leading-normal">{msg.mensagem}</p>
                
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mt-2.5">
                  <span>{msg.created_at ? new Date(msg.created_at).toLocaleDateString('pt-PT') : 'N/A'}</span>
                  <span className=" text-slate-350">ID: {msg.id.substring(0, 5)}...</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reader Column: selected Message Details (Right) */}
      <div className={`lg:col-span-2 ${!selectedMessage ? 'hidden lg:block' : 'block'}`}>
        {selectedMessage ? (
          <div className="bg-white rounded-[2.5rem] p-5 sm:p-6 lg:p-8 border border-slate-100 shadow-md min-h-[450px] flex flex-col justify-between">
            <div>
              {/* Back to list button on mobile */}
              <button
                onClick={() => setSelectedMessage(null)}
                className="lg:hidden mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100 border border-blue-150 py-2.5 px-4 rounded-full transition-all shadow-sm"
              >
                <ArrowLeft size={14} />
                <span>Voltar para as Mensagens</span>
              </button>
              
              {/* Header profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-none">{selectedMessage.nome}</h3>
                  <span className="text-blue-500 text-xs font-bold mt-1.5 block">Assunto: {selectedMessage.assunto}</span>
                  <div className="flex flex-wrap items-center gap-4 text-slate-450 mt-3 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Mail size={13} />
                      {selectedMessage.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} />
                      {selectedMessage.telefone || 'Faltou telefone'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleLida(selectedMessage.id, !selectedMessage.lida)}
                    className={`px-3.5 py-2 rounded-2xl text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                      selectedMessage.lida
                        ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {selectedMessage.lida ? <span className="flex items-center gap-1">Lida</span> : <span>Marcar por ler</span>}
                  </button>

                  <button
                    onClick={() => handleToggleTratada(selectedMessage.id, !selectedMessage.tratada)}
                    className={`px-3.5 py-2 rounded-2xl text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                      selectedMessage.tratada
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-250 hover:bg-amber-100'
                    }`}
                  >
                    <span>{selectedMessage.tratada ? 'Resolvida ✅' : 'Marcar Resolvida ⏳'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id, selectedMessage.nome)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-xl"
                    title="Eliminar de vez"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Message text body */}
              <div className="bg-slate-50 border border-slate-100/80 p-5 rounded-2xl leading-relaxed text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {selectedMessage.mensagem}
              </div>

              {/* Fotos Anexadas */}
              {selectedMessage.fotos && selectedMessage.fotos.length > 0 && (
                <div className="mt-5 space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-widest pl-1">Imagens Anexadas ({selectedMessage.fotos.length})</span>
                  <div className="flex flex-wrap gap-3">
                    {selectedMessage.fotos.map((foto, index) => (
                      <div 
                        key={index} 
                        onClick={() => setActivePhotoUrl(foto)}
                        className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:shadow hover:scale-105 transition-all relative group shrink-0"
                      >
                        <img 
                          src={foto} 
                          alt={`Anexo ${index + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Actions responder */}
            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <span className="text-xs text-slate-400 font-medium">Envia uma resposta oficial ao cidadão via email corporativo.</span>
              <a
                href={`mailto:${selectedMessage.email}?subject=Resposta da Associação GRUVA Nazaré: ${encodeURIComponent(selectedMessage.assunto)}&body=Olá ${encodeURIComponent(selectedMessage.nome)},%0D%0A%0D%0AAgradecemos o teu contacto sobre: "${selectedMessage.assunto}".%0D%0A%0D%0A[Escreve a resposta aqui]%0D%0A%0D%0ACom os melhores cumprimentos,%0D%0AGRUVA - Grupo de Voluntários dos Animais da Nazaré🐾`}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-md shadow-blue-500/10 transition-all self-start sm:self-auto"
              >
                <span>Responder por Email</span>
                <ExternalLink size={14} />
              </a>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-20 text-center text-slate-450 flex flex-col items-center justify-center min-h-[450px]">
            <Mail size={44} className="text-slate-205 mb-3" />
            <span className="text-sm font-bold text-slate-600">Nenhuma mensagem selecionada</span>
            <span className="text-xs text-slate-400 mt-1">Selecione uma mensagem da caixa à esquerda para começar a responder.</span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhotoUrl && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePhotoUrl(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl p-2 flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActivePhotoUrl(null)}
              className="absolute top-4 right-4 bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-full transition-colors shadow-md z-10"
              title="Fechar"
            >
              <X size={18} />
            </button>
            <div className="flex items-center justify-center w-full max-h-[70vh] bg-slate-50 rounded-2xl overflow-hidden">
              <img 
                src={activePhotoUrl} 
                alt="Visualização do Anexo" 
                className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-slate-500 font-semibold font-sans">Anexo enviado pelo utilizador</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Message Deletion */}
      {msgToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Eliminar Mensagem?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tens a certeza que pretendes eliminar permanentemente a mensagem de <strong className="text-slate-800">"{msgToDelete.nome}"</strong>? Esta ação é irreversível.
              </p>
            </div>

            <div className="flex gap-2.5 w-full pt-1">
              <button
                type="button"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                onClick={() => setMsgToDelete(null)}
                disabled={isDeletingMsg}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                disabled={isDeletingMsg}
                onClick={async () => {
                  setIsDeletingMsg(true);
                  try {
                    await dataService.deleteMensagem(msgToDelete.id);
                    setSelectedMessage(null);
                    onRefresh();
                  } catch (err) {
                    console.error('Erro ao eliminar mensagem:', err);
                  } finally {
                    setIsDeletingMsg(false);
                    setMsgToDelete(null);
                  }
                }}
              >
                {isDeletingMsg ? 'A eliminar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { dataService } from '../lib/dataService';
import { Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Send, CheckCircle2, AlertCircle, Upload, Trash2, Paperclip, Loader2 } from 'lucide-react';

const ASSUNTOS_OPCOES = [
  'Apadrinhamento',
  'Candidatos a adoção',
  'Candidatos a FAT',
  'Pedidos de ajuda externo',
  'Visita ao canil para conhecer',
  'Voluntariado',
  'Outro assunto'
] as const;

export default function Contactos() {
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Outro assunto',
    mensagem: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Imagem Upload States
  const [fotos, setFotos] = useState<{ name: string; base64: string; size: number }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side image canvas-based compression
  const compressImage = (file: File): Promise<{ base64: string; compressedSize: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit maximum dimensions to 1200px to keep quality balanced and size lower
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const base64 = event.target?.result as string;
            const approxSize = Math.round((base64.length * 3) / 4);
            resolve({ base64, compressedSize: approxSize });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let approxSize = Math.round((dataUrl.length * 3) / 4);

          // We want the image to be at most 600kB (600 * 1024 bytes)
          const targetSize = 600 * 1024;
          while (approxSize > targetSize && quality > 0.15) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            approxSize = Math.round((dataUrl.length * 3) / 4);
          }

          // If still too large, let's scale down the canvas dimensions further
          if (approxSize > targetSize) {
            canvas.width = Math.round(width * 0.6);
            canvas.height = Math.round(height * 0.6);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', 0.5);
            approxSize = Math.round((dataUrl.length * 3) / 4);
          }

          resolve({ base64: dataUrl, compressedSize: approxSize });
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'kB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const processFiles = async (fileList: File[]) => {
    setUploadError(null);
    const validImages = fileList.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length === 0) {
      setUploadError('Por favor, carrega apenas ficheiros de imagem (JPG, PNG, WEBP).');
      return;
    }

    if (fotos.length + validImages.length > 3) {
      setUploadError('Podes carregar no máximo 3 imagens.');
      return;
    }

    setIsCompressing(true);
    const newFotos: { name: string; base64: string; size: number }[] = [];

    for (const file of validImages) {
      try {
        const result = await compressImage(file);
        newFotos.push({
          name: file.name,
          base64: result.base64,
          size: result.compressedSize
        });
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
        setUploadError(`Erro ao carregar ou processar a imagem: ${file.name}`);
      }
    }

    setFotos(prev => [...prev, ...newFotos]);
    setIsCompressing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await processFiles(Array.from(files));
    // Clear input so selecting the same file again triggers change event
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setUploadError(null);
  };

  useEffect(() => {
    // Pre-fill form from URL parameters
    const paramAssunto = searchParams.get('assunto');
    const paramMensagem = searchParams.get('mensagem');
    const paramAnimal = searchParams.get('animal');

    const newData = { ...formData };

    if (paramAssunto && ASSUNTOS_OPCOES.includes(paramAssunto as any)) {
      newData.assunto = paramAssunto;
    }

    const paramAcao = searchParams.get('acao');

    if (paramAnimal) {
      if (paramAcao === 'adocao' || newData.assunto === 'Candidatos a adoção') {
        newData.mensagem = `Olá! Gostaria de obter mais informações sobre o processo de adoção do patudo ${paramAnimal}.`;
      } else {
        newData.mensagem = `Olá! Gostaria de saber como posso apadrinhar o patudo ${paramAnimal}.`;
      }
    } else if (paramMensagem) {
      newData.mensagem = paramMensagem;
    }

    setFormData(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Always store locally for the admin demo interface
      await dataService.addMensagem({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        assunto: formData.assunto,
        mensagem: formData.mensagem,
        fotos: fotos.map(f => f.base64)
      });

      // Also try to insert into remote Supabase (omitting fotos to be safe since remote table might not have text array 'fotos' column yet)
      try {
        const { error } = await supabase
          .from('mensagens')
          .insert([
            {
              nome: formData.nome,
              email: formData.email,
              telefone: formData.telefone,
              assunto: formData.assunto,
              mensagem: formData.mensagem
            }
          ]);
        if (error) {
          console.warn('Remote Supabase insert flagged error:', error.message);
        }
      } catch (err) {
        console.warn('Network exception writing to Supabase, local save succeeded:', err);
      }

      setSubmitStatus('success');
      setFotos([]); // Clear uploaded photos
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: 'Outro assunto',
        mensagem: ''
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-4">Fala Connosco</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tens alguma dúvida, queres adotar, ajudar ou conhecer o nosso espaço? Estamos à tua espera.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Coluna da Esquerda (Info) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-[2rem] p-8 md:p-10 text-white shadow-lg relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 bg-white/10 w-64 h-64 rounded-full blur-3xl"></div>
              
              <h2 className="text-2xl font-bold mb-8 relative z-10">Informações de Contacto</h2>
              
              <div className="space-y-6 relative z-10 mb-12">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full shrink-0">
                    <MapPin size={24} className="text-primary-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-100 mb-1">Localização</h3>
                    <p className="text-white/90">Nazaré, Portugal</p>
                    <p className="text-white/70 text-sm mt-1">Contacta-nos para marcar uma visita ao canil.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full shrink-0">
                    <Mail size={24} className="text-primary-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-100 mb-1">Email</h3>
                    <a href="mailto:gruvanazare@gmail.com" className="text-white/90 hover:text-white hover:underline transition-all">
                      gruvanazare@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <h3 className="font-semibold text-primary-100 mb-4">Segue-nos nas Redes Sociais</h3>
                <div className="flex gap-3">
                  <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all">
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita (Formulário) */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              
              {submitStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center py-12 h-full">
                  <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-900 mb-3">Mensagem Enviada!</h3>
                  <p className="text-slate-600 text-lg max-w-md">
                    Obrigado pelo teu contacto! A equipa do GRUVA responderá o mais breve possível. 🐾
                  </p>
                  <button 
                    onClick={() => setSubmitStatus('idle')}
                    className="mt-8 bg-primary-50 text-primary-600 font-semibold px-6 py-2.5 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus === 'error' && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
                      <AlertCircle size={24} className="shrink-0" />
                      <p className="text-sm">Ocorreu um erro ao enviar a mensagem. Por favor, tenta novamente mais tarde ou contacta-nos diretamente por email.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-semibold text-primary-900 mb-2">Nome *</label>
                      <input 
                        type="text" 
                        id="nome" 
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="O teu nome completo"
                      />
                    </div>
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-semibold text-primary-900 mb-2">Telefone</label>
                      <input 
                        type="tel" 
                        id="telefone" 
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                        placeholder="O teu número de contacto"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-primary-900 mb-2">Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                      placeholder="O teu endereço de email"
                    />
                  </div>

                  <div>
                    <label htmlFor="assunto" className="block text-sm font-semibold text-primary-900 mb-2">Assunto *</label>
                    <select 
                      id="assunto" 
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                      {ASSUNTOS_OPCOES.map(opcao => (
                        <option key={opcao} value={opcao}>{opcao}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mensagem" className="block text-sm font-semibold text-primary-900 mb-2">Mensagem *</label>
                    <textarea 
                      id="mensagem" 
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none"
                      placeholder="Escreve aqui a tua mensagem..."
                    />
                  </div>

                  {/* Secção de Fotos Anexas */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-primary-900">Anexar imagens <span className="text-xs font-normal text-slate-400">(Opcional • Máx. 3)</span></label>
                      <span className="text-xs text-slate-450 font-bold">{fotos.length}/3 imagens</span>
                    </div>

                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        dragOver 
                          ? 'border-primary-500 bg-primary-50/20' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="form-images-upload"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple 
                        accept="image/*"
                        className="hidden" 
                      />

                      {isCompressing ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 size={32} className="animate-spin text-primary-500" />
                          <p className="text-sm font-bold text-slate-650">A otimizar e comprimir imagens...</p>
                          <p className="text-xs text-slate-400">Garantindo o tamanho máximo de 600kB por foto</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-slate-400">
                            <Upload size={24} className="text-primary-500" />
                          </div>
                          <p className="text-sm text-slate-600 font-medium">
                            <span className="text-primary-600 font-bold">Clica para carregar</span> ou arrasta as fotos para esta área
                          </p>
                          <p className="text-xs text-slate-400">
                            Formatos aceites: JPG, PNG, WEBP (Limitado a 600kB cada)
                          </p>
                        </>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-xs text-red-650 font-semibold flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-100">
                        <AlertCircle size={14} />
                        {uploadError}
                      </p>
                    )}

                    {/* Previews of uploaded compressed images */}
                    {fotos.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        {fotos.map((foto, index) => (
                          <div key={index} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 relative group overflow-hidden">
                            <div className="flex items-center gap-2.5 overflow-hidden w-full">
                              <img 
                                src={foto.base64} 
                                alt={foto.name} 
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-700 truncate" title={foto.name}>
                                  {foto.name}
                                </p>
                                <p className="text-[10px] font-mono text-emerald-600 font-bold mt-0.5">
                                  {formatSize(foto.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFoto(index);
                              }}
                              className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-1.5 rounded-lg border border-slate-200 shrink-0 transition-colors shadow-sm"
                              title="Remover imagem"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-primary-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
                    {!isSubmitting && <Send size={20} className="ml-1" />}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

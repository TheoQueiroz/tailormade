import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project, HistoryEntry } from '../types/project';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Plus, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const getStatusColor = (status: string) => {
  const colors = {
    'Kickoff': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'PPM': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'Offline': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'Aguardando Retorno': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'Online': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    'Stand-by': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    'Finalizado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHistoryEntry, setNewHistoryEntry] = useState('');
  const [addingHistory, setAddingHistory] = useState(false);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProjectAndHistory();
  }, [id]);

  async function fetchProjectAndHistory() {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('*')
        .eq('project_id', id)
        .order('date', { ascending: false });

      if (historyError) throw historyError;
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar os dados do projeto');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHistory(e: React.FormEvent) {
    e.preventDefault();
    if (!newHistoryEntry.trim()) return;

    setAddingHistory(true);
    try {
      const { error } = await supabase
        .from('history')
        .insert([
          {
            project_id: id,
            description: newHistoryEntry,
            date: new Date().toISOString(),
            changes: JSON.stringify({
              status: project?.status,
              current_owner: project?.current_owner,
              project_management: project?.project_management,
              coordinator: project?.coordinator,
              music_producer: project?.music_producer,
              scope: project?.scope,
              observations: project?.observations
            })
          }
        ]);

      if (error) throw error;

      toast.success('Histórico adicionado com sucesso!');
      setNewHistoryEntry('');
      fetchProjectAndHistory();
    } catch (error) {
      console.error('Error adding history:', error);
      toast.error('Erro ao adicionar histórico');
    } finally {
      setAddingHistory(false);
    }
  }

  const toggleHistoryItem = (id: string) => {
    setExpandedHistoryItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projeto não encontrado</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mt-4 inline-block">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <div className="flex space-x-4">
          <a
            href={project.drive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Google Drive
          </a>
          <Link
            to={`/project/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Edit className="h-5 w-5 mr-2" />
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{project.client}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Informações Básicas</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Número Fuzzr</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.fuzzr_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.job}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Início</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {format(new Date(project.start_date), 'dd/MM/yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Último Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {format(new Date(project.last_status_date), 'dd/MM/yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Está Com</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.current_owner}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Equipe</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gestão do Projeto</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.project_management || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordenador/Finalizador</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.coordinator || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Produtor Musical</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.music_producer || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Escopo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{project.scope || '-'}</p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Observações</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{project.observations || '-'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Histórico</h3>
            
            <form onSubmit={handleAddHistory} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newHistoryEntry}
                  onChange={(e) => setNewHistoryEntry(e.target.value)}
                  placeholder="Adicionar nova entrada no histórico..."
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  type="submit"
                  disabled={addingHistory || !newHistoryEntry.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {history.map((entry) => {
                const changes = entry.changes ? JSON.parse(entry.changes) : null;
                const isExpanded = expandedHistoryItems[entry.id];

                return (
                  <div key={entry.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleHistoryItem(entry.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mr-2"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{entry.description}</p>
                        </div>
                        {isExpanded && changes && (
                          <div className="mt-2 ml-7 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p><strong>Status:</strong> {changes.status}</p>
                            <p><strong>Está com:</strong> {changes.current_owner}</p>
                            <p><strong>Gestor:</strong> {changes.project_management || '-'}</p>
                            <p><strong>Coordenador:</strong> {changes.coordinator || '-'}</p>
                            <p><strong>Produtor:</strong> {changes.music_producer || '-'}</p>
                            {changes.scope && (
                              <div>
                                <strong>Escopo:</strong>
                                <p className="whitespace-pre-wrap">{changes.scope}</p>
                              </div>
                            )}
                            {changes.observations && (
                              <div>
                                <strong>Observações:</strong>
                                <p className="whitespace-pre-wrap">{changes.observations}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 whitespace-nowrap">
                        {format(new Date(entry.date), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
              {history.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhum histórico registrado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
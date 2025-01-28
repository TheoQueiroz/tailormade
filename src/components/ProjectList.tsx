import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../types/project';
import { format } from 'date-fns';
import { Folder, ExternalLink, Edit, Trash2, Kanban as LayoutKanban, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';

const getStatusColor = (status: string) => {
  const colors = {
    'Kickoff': 'bg-purple-100 text-purple-800',
    'PPM': 'bg-blue-100 text-blue-800',
    'Offline': 'bg-orange-100 text-orange-800',
    'Aguardando Retorno': 'bg-yellow-100 text-yellow-800',
    'Online': 'bg-indigo-100 text-indigo-800',
    'Stand-by': 'bg-gray-100 text-gray-800',
    'Finalizado': 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Projeto excluído com sucesso');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Folder className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">{project.client}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Fuzzr #:</strong> {project.fuzzr_number}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Job:</strong> {project.job}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Início:</strong> {format(new Date(project.start_date), 'dd/MM/yyyy')}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Está com:</strong> {project.current_owner}
          </p>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <strong>Gestor:</strong> {project.project_management || '-'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Coordenador:</strong> {project.coordinator || '-'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Produtor:</strong> {project.music_producer || '-'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Link
            to={`/project/${project.id}`}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Ver detalhes
          </Link>
          <div className="flex space-x-2">
            <a
              href={project.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-indigo-600"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <Link
              to={`/project/${project.id}/edit`}
              className="p-2 text-gray-500 hover:text-indigo-600"
            >
              <Edit className="h-5 w-5" />
            </Link>
            <button
              onClick={() => handleDelete(project.id)}
              className="p-2 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const KanbanView = () => {
    const statuses = ['Kickoff', 'PPM', 'Offline', 'Aguardando Retorno', 'Online', 'Stand-by', 'Finalizado'];
    
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map(status => (
          <div key={status} className="flex-none w-80">
            <div className={`p-3 rounded-t-lg ${getStatusColor(status)}`}>
              <h3 className="font-medium">{status}</h3>
              <span className="text-sm">
                {projects.filter(p => p.status === status).length} projetos
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-b-lg min-h-[calc(100vh-250px)] space-y-3">
              {projects
                .filter(project => project.status === status)
                .map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
          >
            <LayoutList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
          >
            <LayoutKanban className="h-5 w-5" />
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project, ProjectStatus, ProjectOwner } from '../types/project';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Partial<Project>>({
    client: '',
    fuzzr_number: '',
    job: '',
    start_date: new Date().toISOString().split('T')[0],
    drive_link: '',
    scope: '',
    project_management: '',
    coordinator: '',
    music_producer: '',
    last_status_date: new Date().toISOString().split('T')[0],
    status: 'Kickoff' as ProjectStatus,
    current_owner: 'Fuzzr' as ProjectOwner,
    observations: ''
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  async function fetchProject() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setProject({
          ...data,
          start_date: new Date(data.start_date).toISOString().split('T')[0],
          last_status_date: new Date(data.last_status_date).toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Erro ao carregar o projeto');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', id);

        if (error) throw error;
        toast.success('Projeto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([project]);

        if (error) throw error;
        toast.success('Projeto criado com sucesso!');
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erro ao salvar o projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <input
              type="text"
              name="client"
              value={project.client}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Número Fuzzr</label>
            <input
              type="text"
              name="fuzzr_number"
              value={project.fuzzr_number}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job</label>
            <input
              type="text"
              name="job"
              value={project.job}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
            <input
              type="date"
              name="start_date"
              value={project.start_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Link do Google Drive</label>
            <input
              type="url"
              name="drive_link"
              value={project.drive_link}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gestão do Projeto</label>
            <input
              type="text"
              name="project_management"
              value={project.project_management}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Coordenador/Finalizador</label>
            <input
              type="text"
              name="coordinator"
              value={project.coordinator}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Produtor Musical</label>
            <input
              type="text"
              name="music_producer"
              value={project.music_producer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de último Status</label>
            <input
              type="date"
              name="last_status_date"
              value={project.last_status_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={project.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Kickoff">Kickoff</option>
              <option value="PPM">PPM</option>
              <option value="Offline">Offline</option>
              <option value="Aguardando Retorno">Aguardando Retorno</option>
              <option value="Online">Online</option>
              <option value="Stand-by">Stand-by</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Está Com</label>
            <select
              name="current_owner"
              value={project.current_owner}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Fuzzr">Fuzzr</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Escopo</label>
          <textarea
            name="scope"
            value={project.scope}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            name="observations"
            value={project.observations}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
export type ProjectStatus = 
  | 'Kickoff'
  | 'PPM'
  | 'Offline'
  | 'Aguardando Retorno'
  | 'Online'
  | 'Stand-by'
  | 'Finalizado';

export type ProjectOwner = 'Fuzzr' | 'Cliente';

export interface Project {
  id: string;
  client: string;
  fuzzr_number: string;
  job: string;
  start_date: string;
  drive_link: string;
  scope: string;
  project_management: string;
  coordinator: string;
  music_producer: string;
  last_status_date: string;
  status: ProjectStatus;
  current_owner: ProjectOwner;
  observations: string;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  project_id: string;
  date: string;
  description: string;
  changes: string;
  created_at: string;
}
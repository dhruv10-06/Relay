import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

// Projects
export const getProjects = async () => {
  const res = await api.get('/projects');
  return res.data;
};

export const getProject = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

export const createProject = async (data) => {
  const res = await api.post('/projects', data);
  return res.data;
};

export const updateProject = async (id, data) => {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

// Documents
export const getDocuments = async (projectId) => {
  const res = await api.get(`/documents?projectId=${projectId}`);
  return res.data;
};

export const getDocument = async (id) => {
  const res = await api.get(`/documents/${id}`);
  return res.data;
};

export const uploadDocuments = async (projectId, files) => {
  const formData = new FormData();
  formData.append('projectId', projectId);
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

// Reconstruction
export const analyzeProject = async (projectId, forceDemo = false) => {
  const res = await api.post('/reconstruction/analyze', { projectId, forceDemo });
  return res.data;
};

export const resetReconstruction = async (projectId) => {
  const res = await api.post('/reconstruction/reset', { projectId });
  return res.data;
};

// Findings
export const getFindings = async (projectId, params = {}) => {
  const query = new URLSearchParams({ projectId, ...params }).toString();
  const res = await api.get(`/findings?${query}`);
  return res.data;
};

export const getFindingStats = async (projectId) => {
  const res = await api.get(`/findings/stats?projectId=${projectId}`);
  return res.data;
};

export const reviewFinding = async (id, reviewData) => {
  const res = await api.put(`/findings/${id}/review`, reviewData);
  return res.data;
};

export const bulkApproveFindings = async (projectId) => {
  const res = await api.post('/findings/bulk-approve', { projectId });
  return res.data;
};

// Handover
export const getHandover = async (projectId) => {
  const res = await api.get(`/handover?projectId=${projectId}`);
  return res.data;
};

export const generateHandover = async (projectId) => {
  const res = await api.post('/handover/generate', { projectId });
  return res.data;
};

// Demo
export const loadSampleScenario = async (autoAnalyze = true, autoReview = false) => {
  const res = await api.post('/demo/load-sample', { autoAnalyze, autoReview });
  return res.data;
};

export const getSampleFiles = async () => {
  const res = await api.get('/demo/sample-files');
  return res.data;
};

export default api;

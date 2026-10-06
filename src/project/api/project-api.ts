import { homePath } from '@/home/api/home-api';
import { apiJson, jsonBody } from '@/lib/api-client';
import type {
  ApiProject,
  ApiProjectMaterial,
  CreateProjectMaterialRequest,
  CreateProjectRequest,
  Id,
  UpdateProjectMaterialRequest,
  UpdateProjectRequest,
} from '@/lib/api-types';

const projectPath = (homeId: Id, projectId: Id, path = '') => homePath(homeId, `/projects/${projectId}${path}`);

export function getProjects(homeId: Id) {
  return apiJson<ApiProject[]>(homePath(homeId, '/projects'));
}

export function getProject(homeId: Id, projectId: Id) {
  return apiJson<ApiProject>(projectPath(homeId, projectId));
}

export function createProject(homeId: Id, request: CreateProjectRequest) {
  return apiJson<ApiProject>(homePath(homeId, '/projects'), { method: 'POST', ...jsonBody(request) });
}

export function updateProject(homeId: Id, projectId: Id, request: UpdateProjectRequest) {
  return apiJson<ApiProject>(projectPath(homeId, projectId), { method: 'PATCH', ...jsonBody(request) });
}

export function deleteProject(homeId: Id, projectId: Id) {
  return apiJson<void>(projectPath(homeId, projectId), { method: 'DELETE' });
}

export function createProjectMaterial(homeId: Id, projectId: Id, request: CreateProjectMaterialRequest) {
  return apiJson<ApiProjectMaterial>(projectPath(homeId, projectId, '/materials'), { method: 'POST', ...jsonBody(request) });
}

export function updateProjectMaterial(homeId: Id, projectId: Id, materialId: Id, request: UpdateProjectMaterialRequest) {
  return apiJson<ApiProjectMaterial>(projectPath(homeId, projectId, `/materials/${materialId}`), {
    method: 'PATCH',
    ...jsonBody(request),
  });
}

export function deleteProjectMaterial(homeId: Id, projectId: Id, materialId: Id) {
  return apiJson<void>(projectPath(homeId, projectId, `/materials/${materialId}`), { method: 'DELETE' });
}

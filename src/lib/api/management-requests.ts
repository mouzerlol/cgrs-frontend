import { apiRequest } from '@/lib/api/client';
import type {
  ManagementRequest,
  ManagementRequestFormData,
  ManagementRequestWithTask,
} from '@/types/management-request';
import type { TaskImage } from '@/types/work-management';
import { mapTaskResponse } from './work-tasks';

const API_PATH = '/api/v1/management-requests';

interface ApiManagementRequestResponse {
  id: string;
  category: ManagementRequest['category'];
  full_name: string;
  email: string;
  linked_task_id: string | null;
  status: ManagementRequest['status'];
  closed_reason?: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiManagementRequestWithTaskResponse {
  request: ApiManagementRequestResponse;
  task: Parameters<typeof mapTaskResponse>[0];
}

function mapManagementRequest(request: ApiManagementRequestResponse): ManagementRequest {
  return {
    id: request.id,
    category: request.category,
    full_name: request.full_name,
    email: request.email,
    linked_task_id: request.linked_task_id,
    status: request.status,
    closed_reason: request.closed_reason ?? null,
    submitted_at: request.created_at,
    updated_at: request.updated_at,
  };
}

function mapManagementRequestWithTask(
  response: ApiManagementRequestWithTaskResponse,
): ManagementRequestWithTask {
  return {
    request: mapManagementRequest(response.request),
    task: mapTaskResponse(response.task),
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function mapFilesToTaskImages(files: File[]): Promise<TaskImage[]> {
  const urls = await Promise.all(files.map((file) => fileToDataUrl(file)));
  return urls.map((url, index) => ({
    id: `upload-${index}-${crypto.randomUUID()}`,
    url,
    thumbnail: url,
    alt: files[index]?.name ?? `Upload ${index + 1}`,
    type: 'image',
  }));
}

async function createPayload(data: ManagementRequestFormData) {
  return {
    category: data.category,
    full_name: data.full_name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim(),
    description: data.description.trim(),
    photos: await mapFilesToTaskImages(data.photos),
    location: data.location,
  };
}

export async function createManagementRequest(
  data: ManagementRequestFormData,
  getToken: () => Promise<string | null>,
): Promise<ManagementRequestWithTask> {
  const response = await apiRequest<ApiManagementRequestWithTaskResponse>(API_PATH, getToken, {
    method: 'POST',
    body: JSON.stringify(await createPayload(data)),
  });
  return mapManagementRequestWithTask(response);
}

export async function getMyRequests(getToken: () => Promise<string | null>): Promise<ManagementRequestWithTask[]> {
  const response = await apiRequest<ApiManagementRequestWithTaskResponse[]>(`${API_PATH}/my`, getToken);
  return response.map(mapManagementRequestWithTask);
}

export async function getRequestWithTask(
  requestId: string,
  getToken: () => Promise<string | null>,
): Promise<ManagementRequestWithTask> {
  const response = await apiRequest<ApiManagementRequestWithTaskResponse>(`${API_PATH}/${requestId}`, getToken);
  return mapManagementRequestWithTask(response);
}

export async function withdrawRequest(
  requestId: string,
  reason: string,
  getToken: () => Promise<string | null>,
): Promise<ManagementRequestWithTask> {
  const response = await apiRequest<ApiManagementRequestWithTaskResponse>(
    `${API_PATH}/${requestId}/withdraw`,
    getToken,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
  );
  return mapManagementRequestWithTask(response);
}

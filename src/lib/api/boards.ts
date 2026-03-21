/**
 * API client functions for boards endpoints.
 * Follows the pattern established in management-requests.ts and authorization.ts
 */

import { apiRequest } from '@/lib/api/client';
import type { Board, BoardColor } from '@/types/work-management';

const API_PATH = '/api/v1/boards';

/** Backend response schema (snake_case) */
interface ApiBoardResponse {
  id: string;
  name: string;
  description: string;
  color: BoardColor;
  icon: string;
  task_count: number;
  created_at: string;
  updated_at: string;
}

/** Map API response to frontend Board type (which uses snake_case) */
function mapBoardResponse(api: ApiBoardResponse): Board {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    color: api.color,
    icon: api.icon,
    task_count: api.task_count,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export async function listBoards(
  getToken: () => Promise<string | null>,
): Promise<Board[]> {
  const response = await apiRequest<ApiBoardResponse[]>(API_PATH, getToken);
  return response.map(mapBoardResponse);
}

export async function getBoard(
  boardId: string,
  getToken: () => Promise<string | null>,
): Promise<Board> {
  const response = await apiRequest<ApiBoardResponse>(`${API_PATH}/${boardId}`, getToken);
  return mapBoardResponse(response);
}

export async function createBoard(
  data: Omit<Board, 'id' | 'task_count' | 'created_at' | 'updated_at'>,
  getToken: () => Promise<string | null>,
): Promise<Board> {
  const payload = {
    name: data.name.trim(),
    description: data.description.trim(),
    color: data.color,
    icon: data.icon,
  };
  const response = await apiRequest<ApiBoardResponse>(API_PATH, getToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapBoardResponse(response);
}

export async function updateBoard(
  boardId: string,
  data: Partial<Omit<Board, 'id' | 'task_count' | 'created_at' | 'updated_at'>>,
  getToken: () => Promise<string | null>,
): Promise<Board> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.description !== undefined) payload.description = data.description.trim();
  if (data.color !== undefined) payload.color = data.color;
  if (data.icon !== undefined) payload.icon = data.icon;

  const response = await apiRequest<ApiBoardResponse>(
    `${API_PATH}/${boardId}`,
    getToken,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  return mapBoardResponse(response);
}

export async function deleteBoard(
  boardId: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<void>(`${API_PATH}/${boardId}`, getToken, {
    method: 'DELETE',
  });
}

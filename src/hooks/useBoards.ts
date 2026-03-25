'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { listBoards, getBoard, createBoard, updateBoard, deleteBoard } from '@/lib/api/boards';
import type { Board } from '@/types/work-management';

/** Fetch all boards for the current community. */
export function useBoards() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Board[]>({
    queryKey: ['boards'],
    queryFn: () => listBoards(getToken),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch a single board by ID. */
export function useBoard(boardId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Board>({
    queryKey: ['boards', boardId],
    queryFn: () => getBoard(boardId, getToken),
    enabled: !!isSignedIn && !!boardId,
  });
}

/** Create a new board. */
export function useCreateBoard() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Board, 'id' | 'is_system' | 'task_count' | 'created_at' | 'updated_at'>) =>
      createBoard(data, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

/** Update an existing board. */
export function useUpdateBoard() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      data,
    }: {
      boardId: string;
      data: Partial<Omit<Board, 'id' | 'is_system' | 'task_count' | 'created_at' | 'updated_at'>>;
    }) => updateBoard(boardId, data, getToken),
    onSuccess: (_data, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
    },
  });
}

/** Delete a board. */
export function useDeleteBoard() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

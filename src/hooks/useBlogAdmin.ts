'use client';

/**
 * React Query hooks for blog authoring. Callers gate on the `manageBlogPosts`
 * capability before enabling, exactly as the other admin surfaces do.
 */

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/cache-config';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPost,
  getBlogRevision,
  listBlogAssets,
  listBlogPosts,
  listBlogRevisions,
  previewBlogPost,
  publishBlogPost,
  restoreBlogRevision,
  unpublishBlogPost,
  updateBlogPost,
  uploadBlogAsset,
} from '@/lib/api/blog';
import type {
  BlogAsset,
  BlogPostSaveResponse,
  BlogPostSummary,
  BlogPostUpdateRequest,
  BlogPreviewResponse,
  BlogPublishResponse,
  BlogRevision,
} from '@/types/blog-admin';

export const BLOG_POSTS_QUERY_KEY = ['blog-posts'] as const;

export const blogPostKey = (id: string) => ['blog-posts', id] as const;
export const blogAssetsKey = (id: string) => ['blog-posts', id, 'assets'] as const;
export const blogRevisionsKey = (id: string) => ['blog-posts', id, 'revisions'] as const;

export function useBlogPostsQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<BlogPostSummary[], Error>({
    queryKey: BLOG_POSTS_QUERY_KEY,
    queryFn: () => listBlogPosts(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

export function useBlogPostQuery(id: string | null, enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<BlogPostSaveResponse, Error>({
    queryKey: blogPostKey(id ?? ''),
    queryFn: () => getBlogPost(id!, getToken),
    enabled: enabled && !!id && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

/*
 * There was a `useBlogCategoriesQuery` here, fetching the categories other posts
 * had used so the editor could suggest them. The vocabulary is closed now and
 * lives in `components/blog/categories.ts`, which the editor reads directly —
 * asking the server which categories exist is asking a question with a constant
 * answer. The endpoint remains for other clients.
 */

export function useBlogAssetsQuery(id: string | null, enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<BlogAsset[], Error>({
    queryKey: blogAssetsKey(id ?? ''),
    queryFn: () => listBlogAssets(id!, getToken),
    enabled: enabled && !!id && isLoaded && !!isSignedIn,
    // Asset URLs are short-lived presigned links, so they are refetched rather
    // than held: a stale one renders a broken image in the preview.
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useBlogRevisionsQuery(id: string | null, enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<BlogRevision[], Error>({
    queryKey: blogRevisionsKey(id ?? ''),
    queryFn: () => listBlogRevisions(id!, getToken),
    enabled: enabled && !!id && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

export function useCreateBlogPost() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPostSaveResponse, Error, { title: string; author?: string }>({
    mutationFn: (body) => createBlogPost(body, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_QUERY_KEY });
    },
  });
}

export function useUpdateBlogPost(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPostSaveResponse, Error, BlogPostUpdateRequest>({
    mutationFn: (body) => updateBlogPost(id, body, getToken),
    onSuccess: (data) => {
      // The response already carries the saved row and its diagnostics, so the
      // cache is written rather than invalidated — a refetch would only ask the
      // server to repeat what it just said.
      queryClient.setQueryData(blogPostKey(id), data);
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_QUERY_KEY });
    },
  });
}

export function useDeleteBlogPost() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteBlogPost(id, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_QUERY_KEY });
    },
  });
}

export function usePreviewBlogPost(id: string) {
  const { getToken } = useAuth();

  return useMutation<BlogPreviewResponse, Error, BlogPostUpdateRequest>({
    mutationFn: (body) => previewBlogPost(id, body, getToken),
  });
}

export function usePublishBlogPost(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPublishResponse, Error, void>({
    mutationFn: () => publishBlogPost(id, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKey(id) });
      queryClient.invalidateQueries({ queryKey: blogRevisionsKey(id) });
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_QUERY_KEY });
    },
  });
}

export function useUnpublishBlogPost(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPublishResponse, Error, void>({
    mutationFn: () => unpublishBlogPost(id, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKey(id) });
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_QUERY_KEY });
    },
  });
}

export function useUploadBlogAsset(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogAsset, Error, File>({
    mutationFn: (file) => uploadBlogAsset(id, file, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogAssetsKey(id) });
    },
  });
}

export function useBlogRevision(id: string) {
  const { getToken } = useAuth();

  return useMutation<BlogRevision, Error, string>({
    mutationFn: (revisionId) => getBlogRevision(id, revisionId, getToken),
  });
}

export function useRestoreBlogRevision(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BlogPostSaveResponse, Error, string>({
    mutationFn: (revisionId) => restoreBlogRevision(id, revisionId, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(blogPostKey(id), data);
    },
  });
}

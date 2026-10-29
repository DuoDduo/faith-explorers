import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from './client'
import type {
  Category,
  Comment,
  ContactInput,
  Message,
  Page,
  PostDetail,
  PostQuery,
  PostSummary,
} from './types'

export function usePosts(query: PostQuery) {
  return useQuery({
    queryKey: ['posts', query],
    queryFn: () => api<Page<PostSummary>>('/posts', { params: { ...query } }),
    placeholderData: keepPreviousData,
  })
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => api<PostDetail>(`/posts/${encodeURIComponent(slug)}`),
  })
}

export function usePostComments(slug: string) {
  return useQuery({
    queryKey: ['post', slug, 'comments'],
    queryFn: () => api<Comment[]>(`/posts/${encodeURIComponent(slug)}/comments`),
  })
}

/** Counts one view per article visit (not per refetch). */
export function useRecordView(slug: string) {
  useEffect(() => {
    api(`/posts/${encodeURIComponent(slug)}/views`, { method: 'POST' }).catch(() => {})
  }, [slug])
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/categories'),
    staleTime: 5 * 60_000,
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => api<Category>(`/categories/${encodeURIComponent(slug)}`),
  })
}

export function useLatestComments(limit = 4) {
  return useQuery({
    queryKey: ['comments', 'latest', limit],
    queryFn: () => api<Comment[]>('/comments/latest', { params: { limit } }),
  })
}

export function useContact() {
  return useMutation({
    mutationFn: (input: ContactInput) => api<Message>('/contact', { json: input }),
  })
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (email: string) => api<Message>('/newsletter/subscribe', { json: { email } }),
  })
}

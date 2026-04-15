import { Request, Response } from 'express';

export interface PaginationResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export function createPaginationResult<T>(
  items: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginationResult<T> {
  return {
    items,
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

export function setPaginationLinks(
  request: Request,
  response: Response,
  page: number,
  limit: number,
  totalItems: number,
) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const links: string[] = [];

  if (page > 1) {
    links.push(`<${buildPageUrl(request, page - 1, limit)}>; rel="prev"`);
  }

  if (page < totalPages) {
    links.push(`<${buildPageUrl(request, page + 1, limit)}>; rel="next"`);
  }

  if (links.length > 0) {
    response.setHeader('Link', links.join(', '));
  }
}

function buildPageUrl(request: Request, page: number, limit: number) {
  const url = new URL(
    `${request.protocol}://${request.get('host')}${request.originalUrl}`,
  );
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

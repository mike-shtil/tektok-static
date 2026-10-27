import data from "./comments.json";

export type Comment = {
  id: number;
  author: string;
  date: string;
  html: string;
  replies: Comment[];
};

const comments = data as Record<string, Comment[]>;

export function commentsFor(slug: string): Comment[] {
  return comments[slug] ?? [];
}

export function commentCount(list: Comment[]): number {
  return list.reduce((total, comment) => total + 1 + commentCount(comment.replies), 0);
}

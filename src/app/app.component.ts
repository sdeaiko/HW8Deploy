import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
  showComments: boolean;
}

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  posts: Post[] = [];
  comments: Record<number, Comment[]> = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchPosts().subscribe(
      posts => {
        this.posts = posts;
        this.fetchCommentsForPosts(posts).subscribe(
          results => {
            results.forEach(([postId, comments]) => {
              this.comments[postId] = comments;
            });
          },
          error => {
            console.error('Failed to fetch comments:', error);
          }
        );
      },
      error => {
        console.error('Failed to fetch posts:', error);
      }
    );
  }

  private fetchPosts() {
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts').pipe(
      catchError(error => {
        console.error('Failed to fetch posts:', error);
        return of([]);
      })
    );
  }

  private fetchCommentsForPosts(posts: Post[]) {
    const requests = posts.map(post =>
      this.http.get<Comment[]>(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`).pipe(
        catchError(error => {
          console.error(`Failed to fetch comments for post ${post.id}:`, error);
          return of([]);
        }),
        map(comments => [post.id, comments] as const)
      )
    );
    return forkJoin(requests);
  }

  toggleComments(post: Post) {
    post.showComments = !post.showComments;
  }

}


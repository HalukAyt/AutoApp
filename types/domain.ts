export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  imageUrl?: string;
  monthlyExpenseTotal?: number;
  inspectionAppointmentDate?: string | null;
}

export interface ProfilePost {
  id: number;
  content: string;
  postPhoto: string | null;
  likesCount: number;
  commentsCount: number;
  time: string;
}

export interface UserRoute {
  id: number;
  title: string;
  detail: string;
  duration: number;
  distance: number;
}

export interface UserProfile {
  name: string;
  lastName?: string;
  username: string;
  phoneNumber?: string;
  email?: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  followerCount: number;
  followingCount: number;
  garage: Vehicle[];
  posts: ProfilePost[];
  routes: UserRoute[];
}

export interface FeedPost {
  id: number;
  content: string;
  postPhoto: string | null;
  likesCount: number;
  commentsCount: number;
  time: string;
  authorName: string;
  authorUsername: string;
  authorProfilePhoto: string | null;
  likedByMe: boolean;
}

export interface PostCommentContent {
  content: string;
  authorUsername: string;
  authorProfilePhoto: string | null;
}

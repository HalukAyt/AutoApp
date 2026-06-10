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
  startPoint?: string | null;
  endPoint?: string | null;
  startLatitude?: number | null;
  startLongitude?: number | null;
  endLatitude?: number | null;
  endLongitude?: number | null;
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


export interface AutoEvent {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  location: string;
  eventDate: string;
  clubId?: number | null;
  clubName?: string | null;
  creatorName: string;
  attendeeCount: number;
  joinedByMe: boolean;
  createdByMe: boolean;
  clubEvent: boolean;
  canManage: boolean;
}

export interface Club {
  id: number;
  name: string;
  description?: string | null;
  managerName: string;
  managerUsername: string;
  memberCount: number;
  eventCount: number;
  routeCount: number;
  member: boolean;
  manager: boolean;
}
export interface Story {
  id: number;
  imageUrl: string;
  caption?: string | null;
  musicTitle?: string | null;
  musicArtist?: string | null;
  musicUrl?: string | null;
  locationName?: string | null;
  showTimestamp: boolean;
  authorName: string;
  authorUsername: string;
  authorProfilePhoto: string | null;
  createdAt: string;
  createdByMe: boolean;
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

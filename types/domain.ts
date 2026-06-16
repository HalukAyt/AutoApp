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
  routeDate?: string | null;
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
  userName?: string;
  phoneNumber?: string;
  email?: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  followerCount: number;
  followingCount: number;
  followedByMe?: boolean;
  ownProfile?: boolean;
  garage: Vehicle[];
  posts: ProfilePost[];
  routes: UserRoute[];
}

export interface ProfileConnection {
  id: number;
  name: string;
  username: string;
  profilePhoto: string | null;
  followedByMe?: boolean;
  ownProfile?: boolean;
}

export interface DirectConversation {
  otherUserId: number;
  otherName: string;
  otherUsername: string;
  otherProfilePhoto: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface DirectMessage {
  id: number;
  content: string;
  createdAt: string;
  senderName: string;
  senderUsername: string;
  senderProfilePhoto: string | null;
  recipientName: string;
  recipientUsername: string;
  sentByMe: boolean;
  read: boolean;
}


export interface AutoEvent {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  location: string;
  eventDate: string;
  eventTime?: string | null;
  clubId?: number | null;
  clubName?: string | null;
  creatorName: string;
  attendeeCount: number;
  attendees?: EventAttendee[];
  joinedByMe: boolean;
  createdByMe: boolean;
  clubEvent: boolean;
  canManage: boolean;
}

export interface EventAttendee {
  id: number;
  name: string;
  username: string;
  profilePhoto: string | null;
}

export interface Club {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  managerName: string;
  managerUsername: string;
  memberCount: number;
  eventCount: number;
  routeCount: number;
  members?: ClubMember[] | null;
  member: boolean;
  manager: boolean;
}

export interface ClubMember {
  id: number;
  name: string;
  username: string;
  profilePhoto: string | null;
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
  authorName?: string | null;
  authorUsername: string;
  authorProfilePhoto: string | null;
}

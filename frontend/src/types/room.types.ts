export interface Room {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  owner: string;
  createdAt: string;
}

export interface RoomMembership {
  _id: string;
  room: string;
  user: { _id: string; name: string; email: string };
  status: "pending" | "approved" | "rejected";
}

export interface RoomMember {
  _id: string;
  user: { _id: string; name: string; email: string };
}
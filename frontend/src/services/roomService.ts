import axios from "axios";
import type { Room, RoomMember, RoomMembership } from "../types/room.types";

export const createRoom = async(data:{
    name:string;
    description?:string;
    isPublic:boolean;
}):Promise<Room>=>{
    const res = await axios.post("/api/rooms",data);
    return res.data.rooms ;
};


export const fetchPublicRooms = async (): Promise<Room[]> => {
  const res = await axios.get("/api/rooms/public");
  return res.data.rooms;
};

export const fetchMyRooms = async():Promise<Room[]>=>{
    const res = await axios.get("api/rooms/mine");
    return res.data.rooms ;
}

export const fetchRoomById = async (
  id: string
): Promise<{ room: Room; myStatus: "pending" | "approved" | "rejected" | null }> => {
  const res = await axios.get(`/api/rooms/${id}`);
  return { room: res.data.room, myStatus: res.data.myStatus };
};

export const joinRoom = async (id: string): Promise<void> => {
  await axios.post(`/api/rooms/${id}/join`);
};

export const fetchPendingRequests = async (roomId: string): Promise<RoomMembership[]> => {
  const res = await axios.get(`/api/rooms/${roomId}/requests`);
  return res.data.requests;
};

export const respondToRequest = async (
  roomId: string,
  membershipId: string,
  action: "approve" | "reject"
): Promise<void> => {
  await axios.patch(`/api/rooms/${roomId}/requests/${membershipId}`, { action });
};

export const searchRooms = async (query: string): Promise<Room[]> => {
  const res = await axios.get("/api/rooms/search", { params: { q: query } });
  return res.data.rooms;
};

export const fetchRoomMembers=async(roomId: string):Promise<RoomMember[]>=>{
  const res = await axios.get(`/api/rooms/${roomId}/members`);
  return res.data.members;
};
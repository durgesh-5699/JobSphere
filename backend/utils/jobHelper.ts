import Job from "../models/jobModel.ts";
import Room from "../models/roomModel.ts";
import RoomMembership from "../models/roomMembershipModel.ts";

const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url.trim());
    return `${parsed.origin}${parsed.pathname}`.toLowerCase().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase();
  }
};

export const getAccessibleRoomIds = async (userId: string) => {
  const publicRooms = await Room.find({ isPublic: true }).select("_id");
  const myApprovedMemberships = await RoomMembership.find({
    user: userId,
    status: "approved",
  }).select("room");

  return [
    ...publicRooms.map((r:any) => r._id),
    ...myApprovedMemberships.map((m) => m.room),
  ];
};

export const getDedupedAccessibleJobs = async (userId: string, extraFilter: any = {}) => {
  const accessibleRoomIds = await getAccessibleRoomIds(userId);

  const filter = { room: { $in: accessibleRoomIds }, ...extraFilter };

  const jobs = await Job.find(filter)
    .populate("room", "name")
    .sort({ createdAt: -1 });

  const groups = new Map<string, { canonical: any; roomNames: string[]; latestDate: Date }>();

  for (const job of jobs) {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}|${normalizeUrl(job.applyLink)}`;

    if (!groups.has(key)) {
      groups.set(key, {
        canonical: job,
        roomNames: [(job.room as any).name],
        latestDate: job.createdAt as any,
      });
    } else {
      const group = groups.get(key)!;
      group.roomNames.push((job.room as any).name);
      if (job.createdAt > group.latestDate) {
        group.canonical = job;
        group.latestDate = job.createdAt as any;
      }
    }
  }

  return Array.from(groups.values())
    .map((g) => ({
      ...g.canonical.toObject(),
      postedInRooms: g.roomNames,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
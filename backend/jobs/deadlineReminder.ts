import cron from "node-cron";
import Job from "../models/jobModel.ts";
import Application from "../models/applicationModel.ts"
import Notification from "../models/notificationModel.ts";

export const runDeadlineReminderCheck =async()=>{
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2*24*60*60*1000);
    const upcomingJobs = await Job.find({
      deadline: { $gte: now, $lte: twoDaysFromNow },
    });

    for (const job of upcomingJobs) {
      const applications = await Application.find({ job: job._id });

      const notifications = applications.map((app) => ({
        user: app.user,
        type: "deadline_reminder" as const,
        title: "Deadline approaching!",
        message: `"${job.title}" at ${job.company} closes soon — don't miss it`,
        link: `/jobs/${job._id}`,
      }));

      if (notifications.length > 0) {
        for (const notif of notifications) {
          const alreadySent = await Notification.findOne({
            user: notif.user,
            type: "deadline_reminder",
            message: notif.message,
            createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
          });
          if (!alreadySent) {
            await Notification.create(notif);
          }
        }
      }
    }

  } catch (err) {
    console.error("Deadline reminder job failed:", err);
  }
};

export const startDeadlineReminderCron=()=>{
  cron.schedule("0 9 * * *", runDeadlineReminderCheck);
};

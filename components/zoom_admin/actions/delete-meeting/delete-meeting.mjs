import zoomAdmin from "../../zoom_admin.app.mjs";
import get from "lodash/get.js";
import { axios } from "@pipedream/platform";

export default {
  name: "Delete meeting",
  description: "Delete a meeting. [See the docs here](https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingdelete)",
  key: "zoom-admin-action-delete-meeting",
  version: "0.0.14",
  type: "action",
  props: {
    zoomAdmin,
    meeting: {
      propDefinition: [
        zoomAdmin,
        "meeting",
      ],
    },
    occurrenceId: {
      propDefinition: [
        zoomAdmin,
        "occurrenceId",
        ({ meeting }) => ({
          meeting,
        }),
      ],
      description: "The [meeting occurrence ID](https://support.zoom.us/hc/en-us/articles/214973206-Scheduling-Recurring-Meetings). If you send this param, just the occurrence will be deleted. Otherwise, the entire meeting will be deleted",
    },
    scheduleForReminder: {
      type: "boolean",
      label: "Schedule for Reminder",
      description: "If `true`, notify host and alternative host about the meeting cancellation via email. If `false`, do not send any email notification",
      optional: true,
    },
    cancelMeetingReminder: {
      type: "boolean",
      label: "Cancel Meeting Reminder",
      description: "If `true`, notify registrants about the meeting cancellation via email. If `false`, do not send any email notification to meeting registrants.",
      optional: true,
    },
  },
  async run ({ $ }) {
    const res = await axios($, this.zoomAdmin._getAxiosParams({
      method: "DELETE",
      path: `/meetings/${get(this.meeting, "value", this.meeting)}`,
      params: {
        occurrence_id: this.occurrenceId,
        schedule_for_reminder: this.scheduleForReminder,
        cancel_meeting_reminder: this.cancelMeetingReminder,
      },
    }));

    if (this.occurrenceId) {
      $.export("$summary", `The occurrence "${this.occurrenceId}" related to the meeting "${get(this.meeting, "label", this.meeting)}" was successfully deleted`);

    } else {
      $.export("$summary", `The meeting "${get(this.meeting, "label", this.meeting)}" was successfully deleted`);
    }

    return res;
  },
};
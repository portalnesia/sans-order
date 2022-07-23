import type { Strapi } from "@strapi/strapi"
import minutesCronJob from "./minutes"

const cronTasks = {
  minutesJob: {
    task:minutesCronJob,
    options:{
      rule:'*/5 * * * *',
      tz:'Asia/Jakarta'
    }
  }
}
export default cronTasks
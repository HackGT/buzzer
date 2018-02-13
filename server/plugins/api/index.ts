import { GenericNotifier } from './GenericNotifier'
import LiveSite from "./LiveSite"
import Slack from "./Slack"

export const mediaAPI: { [medium: string]: GenericNotifier } = {
  "LIVE_SITE": new LiveSite(),
  "SLACK": new Slack()
}

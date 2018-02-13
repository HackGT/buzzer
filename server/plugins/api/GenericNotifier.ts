import { GenericConfig } from "./GenericConfig"
import { APIReturn } from "./APIReturn"


export interface GenericNotifier {
    sendMessage<T extends GenericConfig>(config: T) : APIReturn
    TAG: string
}
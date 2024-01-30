import RouteI from "../route"
import ControllerI from "../controller"

export default interface AppI {
  routes: RouteI[]
  createRoute: (url: string, controller: Required<ControllerI>) => void
  // createRoute: (url: string, method: string, callback: () => void) => void
  run: () => void
}

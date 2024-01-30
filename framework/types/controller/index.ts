import RouteMethods from "../route/methods";

type ControllerI = {
  [key in RouteMethods]?: () => string;
}

export default ControllerI;
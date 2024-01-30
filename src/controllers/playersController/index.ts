import ControllerI from "../../../framework/types/controller";

function playersController(): ControllerI {
  function get() {
    return JSON.stringify({ message: 'books' }, null, 4)
  }
  function post() {
    return JSON.stringify({ message: 'no post' }, null, 4)
  }
  return {
    get,
    post
  }
}

export default playersController;

export default interface RouteI {
  url: string
  method: string
  callback: () => void
}

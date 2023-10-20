declare namespace Lucia {
  // TODO kind of hacky
  type Auth = import('./middleware/2.auth').Lucia
  interface DatabaseUserAttributes {
    username: string
  }
  interface DatabaseSessionAttributes {}
}

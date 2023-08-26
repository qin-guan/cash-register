declare namespace Lucia {
  // TODO kind of hacky
  type Auth = import('./middleware/2.auth').Lucia
	type DatabaseUserAttributes = {
		username: string;
	};
	type DatabaseSessionAttributes = {};
}

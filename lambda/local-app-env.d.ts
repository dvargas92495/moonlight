declare module "@cypress/code-coverage/middleware/express" {
  import { Express } from "express";
  const wrapper: (app: Express) => void;
  export default wrapper;
}

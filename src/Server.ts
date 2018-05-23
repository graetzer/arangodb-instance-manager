import express = require("express");
import {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express-serve-static-core";
import InstanceManager from "./InstanceManager.js";

const asyncMiddleware = (fn: RequestHandler): any => (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default class Server {
  port: number;
  app: express.Express;
  im: InstanceManager;

  constructor(port?: number) {
    this.app = express();
    this.im = new InstanceManager();
    this.port = port || 9000;

    const router = express.Router();
    this.app.use(router);

    router.get("/", (_req: Request, res: Response): any => {
      res.send("Hello World");
    });

    router.post(
      "/cluster",
      asyncMiddleware(async (req: Request, res: Response): Promise<any> => {
        console.error("AAAAAAAAAAAAAH");
        const query = req.query;
        const options = req.body ? req.body.options : {};
        const endpoint = await this.im.startCluster(
          query.numAgents | 1,
          query.numCoordinators | 3,
          query.numDbServeres | 2,
          options
        );
        res.send(endpoint);
        res.status(200);
      })
    );

    router.delete("/", (_req: Request, res: Response): any => {
      this.im.cleanup();
      res.status(200);
    });
  }

  start(): void {
    this.app.listen(this.port, () =>
      console.log(`ArangoDB Instance Manager listen on port ${this.port}`)
    );
  }
}
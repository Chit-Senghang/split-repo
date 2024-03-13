import { EmployeeProto } from '../proto';

let userId;
let requestData;
export class RequestContext {
  public readonly id: number;

  public request: Request;

  public response: Response;

  public positionLevel: EmployeeProto.PositionLevelDto;

  constructor(request: Request, response: Response) {
    this.id = Math.random();
    this.request = request;
    this.response = response;
    userId = request.headers['x-consumer-custom-id'];
    requestData = { request };
  }

  public static currentRequestContext(): RequestContext {
    return requestData;
  }

  public static currentUser(): number {
    return userId;
  }
}

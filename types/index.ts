export interface TokenPayload {
  schoolId: string;
  branchId?: string;
  schoolName: string;
  userId?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  body: {
    schoolId?: string;
    branchId?: string;
    [key: string]: any;
  } & Request["body"];
}

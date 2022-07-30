import jwt,{SignOptions} from 'jsonwebtoken'

export function issueJwt(payload: Record<string,any>, jwtOptions?: SignOptions) {
  jwtOptions = {
    subject:'backend-services',
    issuer:'portalnesia.com',
    ...jwtOptions
  }
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    jwtOptions
  );
}
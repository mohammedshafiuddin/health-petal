

export const jwtSecret: string = process.env.JWT_SECRET as string

export const defaultRoleName = 'gen_user';

export const encodedJwtSecret = new TextEncoder().encode(jwtSecret)

export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID as string

export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string

export const awsBucketName = process.env.AWS_PICS_BUCKET_NAME as string

export const awsRegion = process.env.AWS_REGION as string


export const expoAccessToken = process.env.EXPO_ACCESS_TOKEN as string;

// export const otpSenderAuthToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTM5OENEMkJDRTM0MjQ4OCIsImlhdCI6MTc0Nzg0MTEwMywiZXhwIjoxOTA1NTIxMTAzfQ.IV64ofVKjcwveIanxu_P2XlACtPeA9sJQ74uM53osDeyUXsFv0rwkCl6NNBIX93s_wnh4MKITLbcF_ClwmFQ0A'

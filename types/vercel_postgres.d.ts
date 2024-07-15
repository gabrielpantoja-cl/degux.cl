// types/vercel_postgres.d.ts:
declare module '@vercel/postgres' {
    export function sql(...args: any[]): any;
}

declare module 'auth' {
    export const handlers: {
        GET: (req: Request) => Response | Promise<Response>;
        POST: (req: Request) => Response | Promise<Response>;
    };
}
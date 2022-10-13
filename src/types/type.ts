import { PrismaClient } from "@prisma/client"
import { ISODateString } from "next-auth"

interface GraphQlContext {
    session: Session | null
    prisma: PrismaClient
}

interface CreateUserResponse {
    success?: Boolean
    error?: String
}

interface Session {
    user: User
    expires: ISODateString
}

interface User {
    id: string
    username: string
    image: string
    email: string
    name: string
}

export type {
    GraphQlContext,
    CreateUserResponse,
    Session,
    User,
}
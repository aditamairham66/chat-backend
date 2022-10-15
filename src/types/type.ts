import { Prisma, PrismaClient } from "@prisma/client"
import { PubSub } from "graphql-subscriptions"
import { Context } from "graphql-ws/lib/server"
import { ISODateString } from "next-auth"
import { conversationPopulated } from "../graphql/resolvers/conversation"

interface GraphQlContext {
    session: Session | null
    prisma: PrismaClient
    pubsub?: PubSub
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

type ConversationPopulated = Prisma.ConversationGetPayload<{
    include: typeof conversationPopulated
}>

interface SubscriptionContext extends Context {
    connectionParams: {
        session?: Session
    }
}

export type {
    GraphQlContext,
    CreateUserResponse,
    Session,
    User,
    ConversationPopulated,
    SubscriptionContext,
}
import { Prisma } from "@prisma/client";
import { ApolloError } from "apollo-server-core";
import { ConversationPopulated, GraphQlContext } from "../../types/type"

const resolvers = {
    Query: {
        conversations: async (
            _: any, 
            __: any, 
            context: GraphQlContext
        ): Promise<Array<ConversationPopulated>> => {
            const { session, prisma } = context

            if (!session?.user) {
                throw new ApolloError('Not Authorized')
            }

            const {
                user: {
                    id: userId
                }
            } = session

            try {
                const getChat = await prisma.conversation.findMany({
                    // where: {
                    //     conversationParticipant: {
                    //         some: {
                    //             userID: {
                    //                 equals: userId
                    //             }
                    //         }
                    //     }
                    // },
                    include: conversationPopulated
                })

                return getChat.filter((row) => !!row.conversationParticipant.find((user) => user.userID === userId))
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createConversation: async (
            _: any, 
            args: { usersList: string[] }, 
            context: GraphQlContext 
        ): Promise<{ conversationId: string }> => {
            const { usersList } = args
            const { session, prisma } = context

            if (!session?.user) {
                throw new ApolloError('Not Authorized')
            }

            const {
                user: {
                    id: userId
                }
            } = session

            try {
                const createChat = await prisma.conversation.create({
                    data: {
                        conversationParticipant: {
                            createMany: {
                                data: usersList.map((row) => ({
                                    userID: row,
                                    isRead: row === userId
                                }))
                            }
                        }
                    },
                    include: conversationPopulated
                })

                return {
                    conversationId: createChat.id
                }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
}

export default resolvers

export const userPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
        select: {
            id: true,
            username: true,
        }
    }
})

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
    sender: {
        select: {
            id: true,
            username: true,
        }
    }
})

export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
    conversationParticipant: {
        include: userPopulated
    },
    lastMessage: {
        include: messagePopulated
    }
})
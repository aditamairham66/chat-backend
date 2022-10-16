import { Prisma } from "@prisma/client";
import { ApolloError } from "apollo-server-core";
import { withFilter } from "graphql-subscriptions";
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
                    //         none: {
                    //             userID: {
                    //                 equals: userId
                    //             }
                    //         }
                    //     }
                    // },
                    include: conversationPopulated
                })

                return getChat.filter((row) => !!row.conversationParticipant.find((user) => user.userID === userId))
                // return getChat
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
            const { session, prisma, pubsub } = context

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

                pubsub?.publish("CONVERSATION_CREATE", {
                    conversationCreated: createChat
                })

                return {
                    conversationId: createChat.id
                }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Subscription: {
        conversationCreated: {
            subscribe: withFilter(
                ( 
                    _: any, 
                    __: any, 
                    context: GraphQlContext 
                ) => {
                    const { pubsub } = context
    
                    return pubsub!.asyncIterator(['CONVERSATION_CREATE'])
                },
                ( 
                    payload: ConversationCreatedSubscribeProps, 
                    _, 
                    context: GraphQlContext 
                ) => {
                    const { session } = context
                    const {
                        conversationCreated: {
                            conversationParticipant: participants
                        }
                    } = payload

                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    const isChatParticipant = !!participants.find(
                        (row) => row.userID === session?.user?.id
                    )
                    return isChatParticipant
                },
            ),
        },
    },
}

export default resolvers

export interface ConversationCreatedSubscribeProps {
    conversationCreated: ConversationPopulated
}

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